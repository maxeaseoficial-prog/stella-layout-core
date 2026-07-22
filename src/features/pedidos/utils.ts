import type { PendenciaAdicional } from "@/features/adicionais/types";

import type {
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
    (s, a) => s + (isAdicionalPendente(a) ? 0 : a.valor || 0),
    0,
  );
}

export function calcularSubtotalItem(item: ItemPedido): number {
  return item.quantidade * (item.valorUnitario + somaAdicionaisItem(item));
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
    case "em_orcamento":
      return "border-border bg-muted text-muted-foreground";
    case "pendente_orcamento":
    case "pendente_orcamento_estampa":
    case "pendente_orcamento_matriz":
      return "border-amber-400 bg-amber-100 text-amber-900";
    case "aguardando_orcamento_matriz":
      return "border-orange-300 bg-orange-100 text-orange-800";
    case "orcamento_matriz_realizado":
      return "border-orange-300 bg-orange-50 text-orange-700";
    case "aguardando_aprovacao":
      return "border-amber-300 bg-amber-100 text-amber-800";
    case "producao_matriz":
      return "border-fuchsia-300 bg-fuchsia-100 text-fuchsia-800";
    case "matriz_concluida":
      return "border-emerald-300 bg-emerald-100 text-emerald-800";
    case "producao":
      return "border-blue-300 bg-blue-100 text-blue-800";
    case "bordado":
      return "border-purple-300 bg-purple-100 text-purple-800";
    case "costura":
      return "border-indigo-300 bg-indigo-100 text-indigo-800";
    case "finalizado":
      return "border-teal-300 bg-teal-100 text-teal-800";
    case "entregue":
      return "border-success/40 bg-success/10 text-success";
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
