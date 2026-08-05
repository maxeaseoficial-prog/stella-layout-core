/**
 * Lógica server-side da integração fiscal (NF-e via API Spedy).
 * Toda comunicação com a Spedy acontece AQUI — a API key nunca sai do servidor.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { getClienteNome, type Cliente } from "@/features/clientes/types";
import type { FormaPagamentoPedido, Pedido } from "@/features/pedidos/types";
import { mergeFiscalConfig } from "@/features/fiscal/defaults";
import { SPEDY_BASE_URLS } from "@/features/fiscal/spedy";
import type {
  AmbienteSpedy,
  FiscalConfig,
  NotaFiscalPedido,
  StatusNfe,
  TributacaoPadrao,
} from "@/features/fiscal/types";

type Supabase = SupabaseClient<Database>;

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

export function apenasDigitos(s?: string | null): string {
  return (s ?? "").replace(/\D/g, "");
}

// ---------------------------------------------------------------------------
// Acesso ao banco
// ---------------------------------------------------------------------------

/** Somente administradores podem usar a integração fiscal (emissão, teste, cancelamento). */
export async function assertAdminFiscal(supabase: Supabase, userId: string) {
  const { data } = await supabase
    .from("empresa_usuarios")
    .select("papel")
    .eq("user_id", userId)
    .maybeSingle();
  if ((data?.papel as string | undefined) !== "administrador") {
    throw new Error("Apenas administradores podem usar a integração fiscal.");
  }
}

export async function carregarFiscalConfigServer(
  supabase: Supabase,
): Promise<FiscalConfig> {
  const { data, error } = await supabase
    .from("configuracoes_fiscais")
    .select("data")
    .limit(1)
    .maybeSingle();
  if (error) throw new Error("Falha ao carregar as configurações fiscais.");
  return mergeFiscalConfig(data?.data ?? null);
}

export async function carregarPedidoServer(
  supabase: Supabase,
  pedidoId: string,
): Promise<Pedido | null> {
  const { data, error } = await supabase
    .from("pedidos")
    .select("data")
    .eq("id", pedidoId)
    .maybeSingle();
  if (error) throw new Error("Falha ao carregar o pedido.");
  return (data?.data as unknown as Pedido | undefined) ?? null;
}

export async function carregarClienteServer(
  supabase: Supabase,
  clienteId: string,
): Promise<Cliente | null> {
  const { data } = await supabase
    .from("clientes")
    .select("data")
    .eq("id", clienteId)
    .maybeSingle();
  return (data?.data as unknown as Cliente | undefined) ?? null;
}

// ---------------------------------------------------------------------------
// Config / validações
// ---------------------------------------------------------------------------

export function apiKeyParaAmbiente(
  config: FiscalConfig,
  ambiente: AmbienteSpedy,
): string {
  // A Spedy emite uma única chave por conta. Ela fica salva como segredo
  // de servidor (SPEDY_API_KEY) e nunca aparece no código nem no banco.
  // Fallback: chaves legadas salvas na configuração fiscal.
  const envKey = process.env["SPEDY_API_KEY"]?.trim();
  if (envKey) return envKey;
  return (ambiente === "sandbox" ? config.apiKeySandbox : config.apiKeyProducao).trim();
}

export function validarConfigFiscal(config: FiscalConfig): string | null {
  if (!apiKeyParaAmbiente(config, config.ambiente)) {
    return "A API Key da Spedy não está configurada. Peça ao administrador para salvar a chave no cofre de segredos do sistema.";
  }
  if (apenasDigitos(config.tributacao.ncm).length !== 8) {
    return "Informe um NCM válido (8 dígitos) na tributação padrão (Configurações → Fiscal).";
  }
  return null;
}

export function validarPedidoParaNfe(pedido: Pedido): string | null {
  if (pedido.statusFinanceiro === "cancelado") {
    return "Pedido cancelado não pode gerar NF-e.";
  }
  if (pedido.itens.length === 0) {
    return "O pedido não possui itens.";
  }
  const temPendencia = pedido.itens.some((it) =>
    (it.adicionais ?? []).some((a) => a.pendencia),
  );
  if (temPendencia) {
    return "Existem adicionais pendentes de orçamento. Resolva as pendências antes de emitir a NF-e.";
  }
  if (!(pedido.total > 0)) {
    return "O total do pedido precisa ser maior que zero para emitir a NF-e.";
  }
  return null;
}

// ---------------------------------------------------------------------------
// HTTP Spedy
// ---------------------------------------------------------------------------

export class SpedyError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function extrairMensagemErro(status: number, body: unknown): string {
  if (status === 403) {
    return "Chave de API inválida ou sem permissão para o ambiente selecionado. Verifique a chave em Configurações → Fiscal.";
  }
  if (status === 429) {
    return "Limite de requisições da API atingido. Aguarde um instante e tente novamente.";
  }
  const errors = (body as { errors?: Array<{ message?: string }> | null } | null)
    ?.errors;
  if (Array.isArray(errors)) {
    const msgs = errors.map((e) => e?.message).filter(Boolean) as string[];
    if (msgs.length > 0) return msgs.join("; ");
  }
  return `Erro ${status} ao comunicar com a API da Spedy.`;
}

export async function spedyFetch(
  apiKey: string,
  ambiente: AmbienteSpedy,
  path: string,
  init?: RequestInit,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const res = await fetch(`${SPEDY_BASE_URLS[ambiente]}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  if (!res.ok) throw new SpedyError(res.status, extrairMensagemErro(res.status, body));
  return body;
}

// ---------------------------------------------------------------------------
// Montagem do payload da NF-e (modo completo /v1/product-invoices)
// ---------------------------------------------------------------------------

const MAPA_PAGAMENTO_SPEDY: Record<FormaPagamentoPedido, string> = {
  pix: "pix",
  dinheiro: "cash",
  cartao_credito: "creditCard",
  cartao_debito: "debitCard",
  transferencia: "bankTransfer",
  boleto: "billetBank",
};

function montarImpostos(t: TributacaoPadrao) {
  return (base: number) => {
    if (t.regime === "simplesNacional") {
      // Exemplo A da documentação: CSOSN 400 + PIS/COFINS CST 07.
      return {
        icms: { origin: 0, csosn: t.csosn },
        pis: { cst: t.pisCst },
        cofins: { cst: t.cofinsCst },
      };
    }
    // Exemplo B da documentação: CST 00 + alíquotas; valores calculados
    // são enviados explicitamente (a doc permite informar rate ou valor).
    return {
      icms: {
        origin: 0,
        cst: t.icmsCst,
        baseTaxModality: 3,
        baseTax: base,
        baseTaxReduction: 0,
        rate: t.icmsAliquota,
        amount: round2((base * t.icmsAliquota) / 100),
      },
      pis: {
        cst: t.pisCst,
        baseTax: base,
        rate: round6(t.pisAliquota / 100),
        amount: round2((base * t.pisAliquota) / 100),
      },
      cofins: {
        cst: t.cofinsCst,
        baseTax: base,
        rate: round6(t.cofinsAliquota / 100),
        amount: round2((base * t.cofinsAliquota) / 100),
      },
    };
  };
}

interface ItemBruto {
  id: string; // ID original do item para correlação
  code: string;
  description: string;
  quantity: number;
  unitAmount: number;
  totalAmount: number;
  ncm?: string;
}

export function montarPayloadNfe(
  pedido: Pedido,
  cliente: Cliente | null,
  config: FiscalConfig,
): Record<string, unknown> {
  const t = config.tributacao;
  const ufEmitente = config.empresa.estado.trim().toUpperCase();
  const ufDestino = (cliente?.estado ?? "").trim().toUpperCase();
  const interestadual = !!ufDestino && !!ufEmitente && ufDestino !== ufEmitente;
  const destination = interestadual ? "interstate" : "internal";
  const cfop = interestadual ? t.cfopInterestadual : t.cfopInterno;

  // 1) Itens "brutos": produtos + adicionais já orçados (matriz/logo entra
  //    como item próprio com descrição referenciando o produto).
  const brutos: ItemBruto[] = [];
  for (const it of pedido.itens) {
    brutos.push({
      code: (it.produtoId ?? it.id).slice(0, 60),
      description: it.tamanho
        ? `${it.produto} (Tam: ${it.tamanho})`
        : it.produto,
      quantity: it.quantidade,
      unitAmount: it.valorUnitario,
      totalAmount: round2(it.quantidade * it.valorUnitario),
      ncm: (it as any).ncm, // O snapshot do item pode conter o NCM
    });
    for (const a of it.adicionais ?? []) {
      if (a.pendencia) continue;
      const qtd = a.unico ? 1 : it.quantidade;
      brutos.push({
        id: a.id,
        code: (a.adicionalId ?? a.id).slice(0, 60),
        description: `${a.nome} — ${it.produto}`,
        quantity: qtd,
        unitAmount: a.valor,
        totalAmount: round2(qtd * a.valor),
      });
    }
  }

  // 2) A soma dos totalAmount precisa ser exatamente o total da nota.
  //    Quando há desconto/frete no pedido, rateia a diferença
  //    proporcionalmente ao valor de cada item (último item absorve o
  //    arredondamento de centavos).
  const somaBruta = round2(brutos.reduce((s, i) => s + i.totalAmount, 0));
  const totalPedido = round2(pedido.total);
  let ajustados = brutos;
  if (brutos.length > 0 && somaBruta > 0 && Math.abs(totalPedido - somaBruta) >= 0.01) {
    const fator = totalPedido / somaBruta;
    let acumulado = 0;
    ajustados = brutos.map((i, idx) => {
      let total: number;
      if (idx === brutos.length - 1) {
        total = round2(totalPedido - acumulado);
      } else {
        total = round2(i.totalAmount * fator);
        acumulado = round2(acumulado + total);
      }
      return { ...i, totalAmount: total, unitAmount: round6(total / i.quantity) };
    });
  }

  const ncmPadrao = apenasDigitos(t.ncm);
  const taxes = montarImpostos(t);

  const items = ajustados.map((i) => {
    // Busca o NCM no snapshot do item do pedido
    const itemOriginal = pedido.itens.find(it => it.id === i.id);
    const ncmItem = apenasDigitos(itemOriginal?.ncm) || ncmPadrao;

    return {
      code: i.code,
      description: i.description,
      ncm: ncmItem,
      cfop,
      unit: "UN",
      quantity: i.quantity,
      unitAmount: i.unitAmount,
      totalAmount: i.totalAmount,
      unitTax: "UN",
      quantityTax: i.quantity,
      unitTaxAmount: i.unitAmount,
      makeupTotal: true,
      taxes: taxes(i.totalAmount),
    };
  });

  const total: Record<string, number> = {
    invoiceAmount: totalPedido,
    productAmount: totalPedido,
  };
  if (t.regime === "regimeNormal") {
    total.icmsBaseTax = totalPedido;
    total.icmsAmount = round2(items.reduce((s, i) => s + (i.taxes.icms as { amount: number }).amount, 0));
    total.pisAmount = round2(items.reduce((s, i) => s + (i.taxes.pis as { amount: number }).amount, 0));
    total.cofinsAmount = round2(items.reduce((s, i) => s + (i.taxes.cofins as { amount: number }).amount, 0));
  }

  // Pagamentos: quando os recebimentos do pedido fecham o total, espelha as
  // formas reais; caso contrário envia uma única entrada com o total da nota
  // (a NF-e precisa do pagamento compatível com o valor total).
  const somaPagamentos = round2(pedido.pagamentos.reduce((s, p) => s + p.valor, 0));
  const payments =
    pedido.pagamentos.length > 0 && Math.abs(somaPagamentos - totalPedido) < 0.01
      ? pedido.pagamentos.map((p) => ({
          method: MAPA_PAGAMENTO_SPEDY[p.forma] ?? "other",
          amount: round2(p.valor),
        }))
      : [
          {
            method:
              pedido.pagamentos.length > 0
                ? (MAPA_PAGAMENTO_SPEDY[pedido.pagamentos[0].forma] ?? "other")
                : "other",
            amount: totalPedido,
          },
        ];

  // Destinatário: documento apenas números; cidade por nome + UF (a Spedy
  // resolve o município). Campos ausentes são validados pela própria Spedy,
  // que devolve a mensagem exata do erro.
  const receiver: Record<string, unknown> = {
    name: cliente ? getClienteNome(cliente) : "Consumidor Final",
  };
  const doc = apenasDigitos(
    cliente?.tipo === "empresa" ? cliente.cnpj : cliente?.cpf,
  );
  if (doc) receiver.federalTaxNumber = doc;
  if (cliente?.email) receiver.email = cliente.email;
  if (cliente?.cidade && cliente?.estado) {
    receiver.address = {
      ...(cliente.endereco ? { street: cliente.endereco } : {}),
      city: {
        name: cliente.cidade,
        state: cliente.estado.trim().toUpperCase(),
      },
    };
  }

  return {
    isFinalCustomer: true,
    operationType: "outgoing",
    destination,
    presenceType: "presence",
    operationNature: "Venda de Mercadoria",
    sendEmailToCustomer: false,
    // Idempotência: retry/duplo clique atualiza a mesma nota em vez de
    // criar outra; rejeitada é corrigida reenviando o mesmo integrationId.
    integrationId: pedido.id.slice(0, 36),
    receiver,
    items,
    payments,
    total,
  };
}

// ---------------------------------------------------------------------------
// Conversão da resposta da Spedy para o registro persistido no pedido
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function notaFiscalDeResposta(
  res: any,
  ambiente: AmbienteSpedy,
  integrationId: string,
): NotaFiscalPedido {
  return {
    spedyId: String(res?.id ?? ""),
    ambiente,
    integrationId: String(res?.integrationId ?? integrationId),
    status: (res?.status ?? "enqueued") as StatusNfe,
    numero: res?.number ?? null,
    serie: res?.series ?? null,
    chaveAcesso: res?.accessKey ?? null,
    protocolo: res?.authorization?.protocol ?? null,
    emitidaEm: res?.issuedOn ?? null,
    autorizadaEm: res?.authorization?.date ?? null,
    valor: typeof res?.amount === "number" ? res.amount : null,
    processingDetail: res?.processingDetail ?? null,
    erro: null,
    atualizadoEm: new Date().toISOString(),
  };
}
