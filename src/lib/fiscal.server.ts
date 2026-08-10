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
  AmbienteApiSpedy,
  AmbienteFiscalNfe,
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
  if (!userId) {
    console.error("[Fiscal Server] AUTH_STAGE_ADMIN_FAILED: No userId provided.");
    throw new Error("AUTH_STAGE_ADMIN_FAILED");
  }
  
  // Confirmação de igualdade entre projeto Supabase do client e do server
  const clientRef = "wjshquqnkzkbubgigxvh"; // Extraído do VITE_SUPABASE_URL
  const serverRef = process.env.SUPABASE_URL?.split('//')[1]?.split('.')[0];
  console.log(`[Fiscal Server] PROJECT_SYNC_CHECK: client=${clientRef}, server=${serverRef}, match=${clientRef === serverRef}`);

  const { data, error } = await supabase
    .from("empresa_usuarios")
    .select("papel")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[Fiscal Server] Erro ao validar permissões do usuário:", error);
    throw new Error("Falha ao validar permissões de acesso.");
  }

  if ((data?.papel as string | undefined) !== "administrador") {
    console.warn(`[Fiscal Server] Acesso negado: Usuário ${userId} tentou operação fiscal com papel ${data?.papel}`);
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

/** Salva os dados da NF-e no banco de dados persistente. */
export async function persistirNfeNoBanco(
  supabase: Supabase,
  nota: NotaFiscalPedido,
  tipo: "pedido" | "avulsa",
  payloadEnvio?: any,
  resumoDestinatario?: any,
  clienteId?: string | null,
  pedidoId?: string | null,
) {
  // Use the provided supabase client (already authenticated in middleware)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("AUTH_STAGE_PERSISTENCE_FAILED: Usuário não autenticado no servidor.");

  const { data: empUser } = await supabase
    .from("empresa_usuarios")
    .select("empresa_id")
    .eq("user_id", user.id)
    .single();
  
  if (!empUser) throw new Error("Tenant não encontrado para o usuário.");

  const record = {
    tenant_id: empUser.empresa_id,
    cliente_id: clienteId || null,
    pedido_id: pedidoId || null,
    tipo_emissao: tipo,
    spedy_id: nota.spedyId,
    ambiente: nota.ambiente,
    status: nota.status,
    numero: nota.numero,
    serie: nota.serie,
    chave_acesso: nota.chaveAcesso,
    protocolo: nota.protocolo,
    valor_total: nota.valor,
    data_emissao: nota.emitidaEm,
    data_autorizacao: nota.autorizadaEm,
    external_id: nota.integrationId,
    mensagem_sefaz: nota.processingDetail?.message,
    payload_envio: payloadEnvio,
    resumo_destinatario: resumoDestinatario,
    updated_at: new Date().toISOString()
  };

  // Se o spedy_id for nulo (falha na API), não tentamos upsert
  if (!record.spedy_id) {
    console.error("[Fiscal Server] FISCAL_PERSISTENCE_SKIPPED: spedy_id is null.");
    return;
  }

  const { error } = await supabase
    .from("notas_fiscais")
    .upsert(record, { onConflict: "tenant_id,spedy_id" });

  if (error) {
    console.error("[Fiscal Server] FISCAL_PERSISTENCE_ERROR:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      table: "notas_fiscais",
      operation: "upsert",
      tenant_id: record.tenant_id,
      spedy_id: record.spedy_id
    });
    throw new Error("Falha ao salvar os dados da NF-e no banco.");
  }

  // Se for pedido, também sincroniza com a tabela de pedidos para retrocompatibilidade
  if (tipo === "pedido" && pedidoId) {
    const { data: pData } = await supabase.from("pedidos").select("data").eq("id", pedidoId).single();
    if (pData) {
      const p = pData.data as any;
      p.notaFiscal = nota;
      await supabase.from("pedidos").update({ data: p }).eq("id", pedidoId);
    }
  }
}

// ---------------------------------------------------------------------------
// Config / validações
// ---------------------------------------------------------------------------

export async function carregarSegredoFiscalServer(supabase: Supabase): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: empUser } = await supabase
    .from("empresa_usuarios")
    .select("empresa_id")
    .eq("user_id", user.id)
    .single();
  
  if (!empUser) return null;

  const { data } = await supabase
    .from("segredos_fiscais")
    .select("chave_api")
    .eq("tenant_id", empUser.empresa_id)
    .maybeSingle();
  
  return data?.chave_api ?? null;
}

export async function salvarSegredoFiscalServer(supabase: Supabase, chave: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado.");

  const { data: empUser } = await supabase
    .from("empresa_usuarios")
    .select("empresa_id")
    .eq("user_id", user.id)
    .single();
  
  if (!empUser) throw new Error("Tenant não encontrado.");

  const { error } = await supabase
    .from("segredos_fiscais")
    .upsert(
      { tenant_id: empUser.empresa_id, chave_api: chave, updated_at: new Date().toISOString() },
      { onConflict: "tenant_id" }
    );

  if (error) throw new Error("Falha ao salvar segredo fiscal.");
}

export async function removerSegredoFiscalServer(supabase: Supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado.");

  const { data: empUser } = await supabase
    .from("empresa_usuarios")
    .select("empresa_id")
    .eq("user_id", user.id)
    .single();
  
  if (!empUser) throw new Error("Tenant não encontrado.");

  const { error } = await supabase
    .from("segredos_fiscais")
    .delete()
    .eq("tenant_id", empUser.empresa_id);

  if (error) throw new Error("Falha ao remover segredo fiscal.");
}

export async function apiKeyParaAmbiente(
  supabase: Supabase,
  config: FiscalConfig,
  ambiente: AmbienteApiSpedy,
): Promise<{ key: string; source: string }> {
  // A chave agora é única e vem da tabela de segredos
  const chaveDb = await carregarSegredoFiscalServer(supabase);
  if (chaveDb) return { key: chaveDb, source: "DATABASE" };

  // Fallback para ENV (legado/suporte)
  const sandboxEnv = process.env["SPEDY_API_KEY_SANDBOX"]?.trim();
  const producaoEnv = process.env["SPEDY_API_KEY_PRODUCAO"]?.trim();

  if (ambiente === "sandbox") {
    if (sandboxEnv) return { key: sandboxEnv, source: "ENV_SANDBOX" };
    return { key: config.apiKeySandbox?.trim() || "", source: "CONFIG_SANDBOX" };
  } else {
    if (producaoEnv) return { key: producaoEnv, source: "ENV_PRODUCAO" };
    return { key: config.apiKeyProducao?.trim() || "", source: "CONFIG_PRODUCAO" };
  }
}

export async function validarConfigFiscal(supabase: Supabase, config: FiscalConfig): Promise<string | null> {
  const apiKeyInfo = await apiKeyParaAmbiente(supabase, config, config.ambienteApi);
  if (!apiKeyInfo.key) {
    return "A API Key da Spedy não está configurada. Peça ao administrador para salvar a chave no cofre de segredos do sistema.";
  }
  const ncmPadrao = apenasDigitos(config.tributacao.ncm);
  if (ncmPadrao.length > 0 && ncmPadrao.length !== 8) {
    return "O NCM da tributação padrão (Configurações → Fiscal) deve ter exatamente 8 dígitos.";
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
  const errors = (body as { errors?: Array<{ message?: string, code?: string }> | null } | null)
    ?.errors;
  if (Array.isArray(errors)) {
    const msgs = errors.map((e) => `${e?.code ? `(${e.code}) ` : ""}${e?.message}`).filter(Boolean) as string[];
    if (msgs.length > 0) return msgs.join("; ");
  }
  return `Erro ${status} ao comunicar com a API da Spedy.`;
}

export async function spedyFetch(
  apiKeyInfo: { key: string; source: string },
  ambiente: AmbienteApiSpedy,
  path: string,
  init?: RequestInit,
): Promise<any> {
  const url = `${SPEDY_BASE_URLS[ambiente]}${path}`;
  const apiKeyFingerprint = apiKeyInfo.key ? `sha256:present...` : 'none';
  
  console.log("[Fiscal Server] API_FISCAL_DIAGNOSTICS:", {
    API_FISCAL_ENVIRONMENT: ambiente,
    API_FISCAL_BASE_URL: SPEDY_BASE_URLS[ambiente],
    API_FISCAL_KEY_PRESENT: !!apiKeyInfo.key,
    path
  });

  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKeyInfo.key,
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }

  if (!response.ok) {
    const errorMsg = extrairMensagemErro(response.status, body);
    console.error(`[Fiscal API Error] API_FISCAL_HTTP_STATUS: ${response.status}`, {
      url,
      method: init?.method || "GET",
      API_FISCAL_RESPONSE_BODY: body,
    });
    
    throw new SpedyError(response.status, errorMsg);
  }

  return body;
}

// ---------------------------------------------------------------------------
// Montagem do payload da NF-e
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
      return {
        icms: { origin: 0, csosn: t.csosn },
        pis: { cst: t.pisCst },
        cofins: { cst: t.cofinsCst },
      };
    }
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

export function montarPayloadNfe(
  pedido: Pedido,
  cliente: Cliente | null,
  config: FiscalConfig,
): Record<string, unknown> {
  const t = config.tributacao;
  const isHomologacao = config.ambienteFiscal === "homologacao";
  const ufEmitente = config.empresa.estado.trim().toUpperCase();
  const ufDestino = (cliente?.estado ?? "").trim().toUpperCase();
  const interestadual = !!ufDestino && !!ufEmitente && ufDestino !== ufEmitente;
  const destination = interestadual ? "interstate" : "internal";
  const cfop = interestadual ? t.cfopInterestadual : t.cfopInterno;

  const brutos: any[] = [];
  for (const it of pedido.itens) {
    brutos.push({
      id: it.id,
      code: (it.produtoId ?? it.id).slice(0, 60),
      description: it.tamanho ? `${it.produto} (Tam: ${it.tamanho})` : it.produto,
      quantity: it.quantidade,
      unitAmount: it.valorUnitario,
      totalAmount: round2(it.quantidade * it.valorUnitario),
      ncm: it.ncm,
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
        ncm: it.ncm,
      });
    }
  }

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

  const ncmPadrao = apenasDigitos(config.tributacao.ncm);
  const taxes = montarImpostos(t);

  const items = ajustados.map((i) => {
    const ncmItem = apenasDigitos(i.ncm) || ncmPadrao;
    
    if (ncmItem.length !== 8) {
      throw new Error(`O produto "${i.description}" não possui um NCM válido de 8 dígitos cadastrado.`);
    }

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

  const payments = [
    {
      method: pedido.pagamentos.length > 0 ? (MAPA_PAGAMENTO_SPEDY[pedido.pagamentos[0].forma] ?? "other") : "other",
      amount: totalPedido,
    }
  ];

  const receiver: Record<string, unknown> = {
    name: cliente ? getClienteNome(cliente) : "Consumidor Final",
  };
  const doc = apenasDigitos(cliente?.tipo === "empresa" ? cliente.cnpj : cliente?.cpf);
  if (doc) receiver.federalTaxNumber = doc;
  if (cliente?.cidade && cliente?.estado) {
    receiver.address = {
      street: cliente.logradouro || "",
      number: cliente.numero || "",
      district: cliente.bairro || "",
      complement: cliente.complemento || "",
      postalCode: apenasDigitos(cliente.cep),
      city: { name: cliente.cidade, state: cliente.estado.trim().toUpperCase() },
    };
  }

  return {
    isFinalCustomer: true,
    operationType: "outgoing",
    destination,
    presenceType: "presence",
    operationNature: "Venda de Mercadoria",
    sendEmailToCustomer: false,
    integrationId: pedido.id.slice(0, 36),
    receiver,
    items,
    payments,
    total,
  };
}

export function montarPayloadNfeAvulsa(
  avulsa: any,
  config: FiscalConfig
): Record<string, unknown> {
  const t = config.tributacao;
  const ufEmitente = (config.empresa.estado || "").trim().toUpperCase();
  const ufDestino = (avulsa.destinatario.estado || "").trim().toUpperCase();
  const interestadual = !!ufDestino && !!ufEmitente && ufDestino !== ufEmitente;
  const destination = interestadual ? "interstate" : "internal";
  const cfop = interestadual ? t.cfopInterestadual : t.cfopInterno;
  const ncmPadrao = apenasDigitos(t.ncm);
  const taxes = montarImpostos(t);

  const items = avulsa.itens.map((i: any) => {
    const ncmItem = apenasDigitos(i.ncm) || ncmPadrao;

    if (ncmItem.length !== 8) {
      throw new Error(`O produto "${i.descricao}" não possui um NCM válido de 8 dígitos.`);
    }

    // Coerência obrigatória (rejeição SEFAZ 630): vProd = qCom × vUnCom = qTrib × vUnTrib
    const valores = calcularValoresItemFiscal({
      quantidade: Number(i.quantidade),
      valorUnitario: Number(i.valorUnitario),
      unidade: i.unidade || "UN",
    });

    return {
      code: "AVULSO",
      description: i.descricao,
      ncm: ncmItem,
      cfop,
      ...valores,
      makeupTotal: true,
      taxes: taxes(valores.totalAmount),
    };
  });

  // Diagnóstico numérico (sem dados sensíveis)
  console.log(
    "NFE_ITEM_TOTAL_DIAGNOSTICS",
    JSON.stringify(diagnosticarItensFiscais(items as any)),
  );



  return {
    isFinalCustomer: true,
    operationType: "outgoing",
    destination,
    presenceType: "presence",
    operationNature: "Venda de Mercadoria",
    integrationId: avulsa.id.slice(0, 36),
    receiver: {
      name: avulsa.destinatario.nome,
      federalTaxNumber: apenasDigitos(avulsa.destinatario.documento),
      email: avulsa.destinatario.email,
      address: {
        street: avulsa.destinatario.logradouro || "",
        number: avulsa.destinatario.numero || "",
        district: avulsa.destinatario.bairro || "",
        complement: avulsa.destinatario.complemento || "",
        postalCode: apenasDigitos(avulsa.destinatario.cep),
        city: {
          name: avulsa.destinatario.cidade || "",
          state: ufDestino
        }
      }
    },
    items,
    payments: [{ method: "other", amount: avulsa.total }],
    total: {
      invoiceAmount: avulsa.total,
      productAmount: avulsa.total
    }
  };
}

export function notaFiscalDeResposta(
  res: any,
  ambiente: AmbienteApiSpedy,
  integrationId: string,
): NotaFiscalPedido {
  const detail = res?.processingDetail || {};
  const status = (res?.status ?? "enqueued") as StatusNfe;
  
  // Se estiver rejeitada, extrai as mensagens de erro detalhadas da API
  let erroSefaz = detail.message;
  if (status === "rejected" && Array.isArray(res?.errors) && res.errors.length > 0) {
    const errorMsgs = res.errors
      .map((e: any) => `${e.code ? `[${e.code}] ` : ""}${e.message}`)
      .join(" | ");
    erroSefaz = errorMsgs || erroSefaz;
  }

  return {
    spedyId: String(res?.id ?? ""),
    ambiente,
    integrationId: String(res?.integrationId ?? integrationId),
    status,
    numero: res?.number ?? null,
    serie: res?.series ?? null,
    chaveAcesso: res?.accessKey ?? null,
    protocolo: res?.authorization?.protocol ?? null,
    emitidaEm: res?.issuedOn ?? null,
    autorizadaEm: res?.authorization?.date ?? null,
    valor: typeof res?.amount === "number" ? res.amount : null,
    processingDetail: {
      status: detail.status,
      message: erroSefaz,
      code: detail.code
    },
    erro: null,
    atualizadoEm: new Date().toISOString(),
  };
}
