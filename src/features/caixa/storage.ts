import type { FechamentoCaixa, Movimentacao } from "./types";

const KEY_MOV = "stella.caixa.movimentacoes.v1";
const KEY_FEC = "stella.caixa.fechamentos.v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function ler<T>(chave: string): T[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(chave);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/** Retorna true somente se a gravação foi efetivamente concluída. */
function escrever<T>(chave: string, valor: T[]): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch (err) {
    console.error(`Falha ao persistir ${chave}:`, err);
    return false;
  }
}

export const carregarMovimentacoes = () => ler<Movimentacao>(KEY_MOV);
export const salvarMovimentacoes = (v: Movimentacao[]) => escrever(KEY_MOV, v);

export const carregarFechamentos = () => ler<FechamentoCaixa>(KEY_FEC);
export const salvarFechamentos = (v: FechamentoCaixa[]) => escrever(KEY_FEC, v);

/** Evento global para reatividade cross-componentes (Dashboard, etc.). */
export const CAIXA_EVENT = "stella:caixa:updated";
export function notificarCaixaAtualizado() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(CAIXA_EVENT));
}
