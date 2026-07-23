import type { PendenciaAdicional } from "@/features/adicionais/types";

import type {
  EtapaKanban,
  ItemAdicional,
  ItemPedido,
  Pedido,
  StatusFinanceiro,
  StatusProducao,
} from "./types";

export function novoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function hojeISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function inicioMesISO(base = new Date()): string {
  const d = new Date(base.getFullYear(), base.getMonth(), 1);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatarDataBR(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("T")[0].split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function formatarDataHoraBR(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR");
}

export function parseValorInput(valor: string): number {
  const limpo = valor.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(limpo);
  return Number.isFinite(n) ? n : 0;
}

export function isAdicionalPendente(a: ItemAdicional): boolean {
  return !!a.pendencia;
}

export function somaAdicionaisItem(item: ItemPedido): number {
  return (item.adicionais ?? []).reduce(
    (s, a) => s + (isAdicionalPendente(a) || a.unico ? 0 : a.valor || 0),
    0,
  );
}

/** Soma dos adicionais cobrados uma única vez por item (não multiplicam por qtd). */
export function somaAdicionaisUnicosItem(item: ItemPedido): number {
  return (item.adicionais ?? []).reduce(
    (s, a) => s + (!isAdicionalPendente(a) && a.unico ? a.valor || 0 : 0),
    0,
  );
}

export function calcularSubtotalItem(item: ItemPedido): number {
  return (
    item.quantidade * (item.valorUnitario + somaAdicionaisItem(item)) +
    somaAdicionaisUnicosItem(item)
  );
}

export function calcularSubtotal(itens: ItemPedido[]): number {
  return itens.reduce((s, i) => s + calcularSubtotalItem(i), 0);
}

export function calcularTotal(
  subtotal: number,
  desconto: number,
  frete: number,
): number {
  return Math.max(0, subtotal - desconto + frete);
}

export function possuiBordado(itens: ItemPedido[]): boolean {
  return itens.some((i) => i.personalizacoes.some((p) => p.tipo === "bordado"));
}

export function pendenciasDoPedido(itens: ItemPedido[]): PendenciaAdicional[] {
  const set = new Set<PendenciaAdicional>();
  for (const it of itens) {
    for (const a of it.adicionais ?? []) {
      if (a.pendencia) set.add(a.pendencia);
    }
  }
  return Array.from(set);
}

export function statusPendenciaAgregado(
  pendencias: PendenciaAdicional[],
): StatusProducao | null {
  if (pendencias.length === 0) return null;
  if (pendencias.length > 1) return "pendente_orcamento";
  const p = pendencias[0];
  if (p === "estampa") return "pendente_orcamento_estampa";
  if (p === "matriz") return "pendente_orcamento_matriz";
  return "pendente_orcamento";
}

export function pedidoTemPendencia(pedido: Pedido | { itens: ItemPedido[] }): boolean {
  return pendenciasDoPedido(pedido.itens).length > 0;
}

export function statusProducaoInicial(itens: ItemPedido[]): StatusProducao {
  const pendencia = statusPendenciaAgregado(pendenciasDoPedido(itens));
  if (pendencia) return pendencia;
  return possuiBordado(itens) ? "aguardando_orcamento_matriz" : "em_orcamento";
}

export function statusFinanceiroCalculado(
  total: number,
  totalPago: number,
  atualCancelado: boolean,
): StatusFinanceiro {
  if (atualCancelado) return "cancelado";
  if (totalPago <= 0) return "aguardando_pagamento";
  if (totalPago + 0.001 < total) return "parcialmente_pago";
  return "pago";
}

const CONTADOR_KEY = "stella.pedidos.contador.v1";

export function gerarNumeroPedido(): string {
  const ano = new Date().getFullYear();
  if (typeof window === "undefined") {
    return `PED-${ano}-000001`;
  }
  try {
    const raw = window.localStorage.getItem(CONTADOR_KEY);
    const dados = raw ? (JSON.parse(raw) as { ano: number; seq: number }) : null;
    const proximo = dados && dados.ano === ano ? dados.seq + 1 : 1;
    window.localStorage.setItem(
      CONTADOR_KEY,
      JSON.stringify({ ano, seq: proximo }),
    );
    return `PED-${ano}-${String(proximo).padStart(6, "0")}`;
  } catch {
    return `PED-${ano}-${String(Date.now()).slice(-6)}`;
  }
}

export function corStatusProducao(status: StatusProducao): string {
  switch (status) {
    // 🔴 Vermelho — pendências de orçamento bloqueiam o pedido
    case "pendente_orcamento":
    case "pendente_orcamento_estampa":
    case "pendente_orcamento_matriz":
      return "border-red-300 bg-red-100 text-red-800";
    // 🟡 Amarelo — pedidos aguardando ação/aprovação
    case "em_orcamento":
    case "aguardando_orcamento_matriz":
    case "orcamento_matriz_realizado":
    case "aguardando_aprovacao":
      return "border-amber-300 bg-amber-100 text-amber-900";
    // 🔵 Azul — em produção
    case "producao_matriz":
    case "producao":
    case "bordado":
    case "costura":
      return "border-blue-300 bg-blue-100 text-blue-800";
    // 🟢 Verde — orçamento aprovado / concluído / entregue
    case "orcamento_aprovado":
    case "matriz_concluida":
    case "finalizado":
    case "entregue":
      return "border-emerald-300 bg-emerald-100 text-emerald-800";
    case "cancelado":
      return "border-destructive/40 bg-destructive/10 text-destructive";
  }
}

export function corStatusFinanceiro(status: StatusFinanceiro): string {
  switch (status) {
    case "aguardando_pagamento":
      return "border-amber-300 bg-amber-100 text-amber-800";
    case "parcialmente_pago":
      return "border-orange-300 bg-orange-100 text-orange-800";
    case "pago":
      return "border-success/40 bg-success/10 text-success";
    case "cancelado":
      return "border-destructive/40 bg-destructive/10 text-destructive";
  }
}

export function totalItensPedido(pedido: Pedido): number {
  return pedido.itens.reduce((s, i) => s + i.quantidade, 0);
}

/**
 * Deriva a coluna do Kanban a partir do estado atual do pedido.
 * Regras:
 * - Cancelado → mantém (não entra no Kanban ativo).
 * - Se existe adicional com pendência → pendencias_orcamento.
 * - statusProducao entregue → entregue.
 * - statusProducao finalizado → finalizado.
 * - statusProducao em produção/matriz/costura/bordado/orçamento aprovado → em_producao.
 * - aguardando_aprovacao → aguardando_aprovacao.
 * - restantes → em_elaboracao.
 */
export function calcularEtapa(
  pedido: Pick<Pedido, "statusProducao" | "statusFinanceiro" | "itens">,
): EtapaKanban {
  if (pedido.statusFinanceiro === "cancelado") return "em_elaboracao";
  if (pendenciasDoPedido(pedido.itens).length > 0) return "pendencias_orcamento";
  switch (pedido.statusProducao) {
    case "entregue":
      return "entregue";
    case "finalizado":
      return "finalizado";
    case "orcamento_aprovado":
    case "producao_matriz":
    case "matriz_concluida":
    case "producao":
    case "bordado":
    case "costura":
      return "em_producao";
    case "aguardando_aprovacao":
      return "aguardando_aprovacao";
    default:
      return "em_elaboracao";
  }
}

export function corEtapaKanban(etapa: EtapaKanban): string {
  switch (etapa) {
    case "em_elaboracao":
      return "border-slate-300 bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-200";
    case "pendencias_orcamento":
      return "border-orange-300 bg-orange-100 text-orange-900 dark:bg-orange-950/40 dark:text-orange-200";
    case "aguardando_aprovacao":
      return "border-amber-300 bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200";
    case "em_producao":
      return "border-blue-300 bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200";
    case "finalizado":
      return "border-emerald-300 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200";
    case "entregue":
      return "border-zinc-400 bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100";
  }
}

/** Garante que um pedido carregado do storage tenha o campo `etapa`. */
export function hidratarPedido(p: Pedido): Pedido {
  if (p.etapa) return p;
  return { ...p, etapa: calcularEtapa(p) };
}
