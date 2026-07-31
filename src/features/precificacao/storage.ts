import type { CalculoSalvo } from "./types";

const STORAGE_KEY = "stella.precificacao.historico.v1";
const LIMITE = 50;

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function carregarHistorico(): CalculoSalvo[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CalculoSalvo[];
  } catch {
    return [];
  }
}

export function salvarHistorico(itens: CalculoSalvo[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(itens.slice(0, LIMITE)));
  } catch (err) {
    console.error("Falha ao persistir histórico de precificação:", err);
  }
}
