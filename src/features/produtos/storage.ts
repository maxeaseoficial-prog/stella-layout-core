import type { Produto } from "./types";

const STORAGE_KEY = "stella.produtos.v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function carregarProdutos(): Produto[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Produto[];
  } catch {
    return [];
  }
}

export function salvarProdutos(produtos: Produto[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(produtos));
  } catch (err) {
    console.error("Falha ao persistir produtos:", err);
  }
}
