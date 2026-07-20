import type { Adicional } from "./types";

const STORAGE_KEY = "stella.adicionais.v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function carregarAdicionais(): Adicional[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Adicional[];
  } catch {
    return [];
  }
}

export function salvarAdicionais(adicionais: Adicional[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(adicionais));
  } catch (err) {
    console.error("Falha ao persistir adicionais:", err);
  }
}
