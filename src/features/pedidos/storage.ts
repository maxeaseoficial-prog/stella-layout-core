import type { Pedido } from "./types";
import { hidratarPedido } from "./utils";

const KEY = "stella.pedidos.v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function carregarPedidos(): Pedido[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as Pedido[]).map(hidratarPedido);
  } catch {
    return [];
  }
}

export function salvarPedidos(pedidos: Pedido[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(pedidos));
  } catch (err) {
    console.error("Falha ao persistir pedidos:", err);
  }
}

export const PEDIDOS_EVENT = "stella:pedidos:updated";
export function notificarPedidosAtualizado() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(PEDIDOS_EVENT));
}
