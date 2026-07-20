import type { Fornecedor } from "./types";

const STORAGE_KEY = "stella.fornecedores.v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function carregarFornecedores(): Fornecedor[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Fornecedor[]) : [];
  } catch {
    return [];
  }
}

export function salvarFornecedores(v: Fornecedor[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch (err) {
    console.error("Falha ao persistir fornecedores:", err);
  }
}

export const FORNECEDORES_EVENT = "stella:fornecedores:updated";
