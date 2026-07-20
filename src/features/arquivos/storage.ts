import type { Arquivo } from "./types";

const STORAGE_KEY = "stella.arquivos.v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function carregarArquivos(): Arquivo[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Arquivo[]) : [];
  } catch {
    return [];
  }
}

export function salvarArquivos(v: Arquivo[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch (err) {
    console.error("Falha ao persistir arquivos:", err);
  }
}

export const ARQUIVOS_EVENT = "stella:arquivos:updated";
