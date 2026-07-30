import type { FormaPagamento, Movimentacao } from "./types";
import {
  carregarMovimentacoes,
  notificarCaixaAtualizado,
  salvarMovimentacoes,
} from "./storage";

export interface EntradaPedidoParams {
  pedidoId: string;
  pedidoNumero: string;
  pagamentoId: string;
  valor: number;
  forma: FormaPagamento;
  data: string; // ISO date (YYYY-MM-DD)
  observacoes?: string;
}

interface PedidoParaMigracao {
  id: string;
  numero: string;
  pagamentos?: Array<{
    id: string;
    valor: number;
    forma: FormaPagamento;
    data: string;
    observacoes?: string;
  }>;
}

/**
 * ID determinístico derivado do pagamento. Garante idempotência: o mesmo
 * recebimento nunca gera duas entradas no Caixa, mesmo com a migração
 * rodando em mais de um dispositivo (o upsert do sync resolve o conflito).
 */
function idMovimentacaoPagamento(pagamentoId: string) {
  return `caixa-pag-${pagamentoId}`;
}

function construirEntrada(params: EntradaPedidoParams): Movimentacao {
  const agora = new Date().toISOString();
  return {
    id: idMovimentacaoPagamento(params.pagamentoId),
    tipo: "entrada",
    categoria: "venda",
    descricao: `Recebimento do pedido ${params.pedidoNumero}`,
    valor: params.valor,
    formaPagamento: params.forma,
    data: params.data,
    observacoes: params.observacoes,
    origem: "pedido",
    status: "confirmada",
    referenciaId: params.pedidoId,
    criadoEm: agora,
    atualizadoEm: agora,
  };
}

/**
 * Registra no Caixa a entrada correspondente a um recebimento de pedido
 * (parcial ou total). Idempotente: se a movimentação já existir, não duplica.
 *
 * Escreve direto no storage — a camada de sincronização intercepta o
 * setItem e replica para o banco multi-tenant automaticamente.
 */
export function registrarEntradaPedido(params: EntradaPedidoParams) {
  const movimentacoes = carregarMovimentacoes();
  const id = idMovimentacaoPagamento(params.pagamentoId);
  if (movimentacoes.some((m) => m.id === id)) return;
  salvarMovimentacoes([construirEntrada(params), ...movimentacoes]);
  notificarCaixaAtualizado();
}

/**
 * Migração idempotente: percorre os pedidos e cria no Caixa as entradas
 * de recebimentos registrados antes de a integração existir (inclusive
 * pagamentos parciais).
 */
export function migrarPagamentosParaCaixa(pedidos: PedidoParaMigracao[]) {
  const movimentacoes = carregarMovimentacoes();
  const existentes = new Set(movimentacoes.map((m) => m.id));
  const novas: Movimentacao[] = [];

  for (const pedido of pedidos) {
    for (const pag of pedido.pagamentos ?? []) {
      const id = idMovimentacaoPagamento(pag.id);
      if (existentes.has(id)) continue;
      existentes.add(id);
      novas.push(
        construirEntrada({
          pedidoId: pedido.id,
          pedidoNumero: pedido.numero,
          pagamentoId: pag.id,
          valor: pag.valor,
          forma: pag.forma,
          data: pag.data,
          observacoes: pag.observacoes,
        }),
      );
    }
  }

  if (novas.length === 0) return;
  salvarMovimentacoes([...novas, ...movimentacoes]);
  notificarCaixaAtualizado();
}
