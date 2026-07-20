import type { ItemEstoque, MovimentacaoEstoque } from "./types";

const KEY_ITENS = "stella.estoque.itens.v1";
const KEY_MOV = "stella.estoque.movimentacoes.v1";

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

function escrever<T>(chave: string, valor: T[]) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
  } catch (err) {
    console.error(`Falha ao persistir ${chave}:`, err);
  }
}

export const carregarItensEstoque = () => ler<ItemEstoque>(KEY_ITENS);
export const salvarItensEstoque = (v: ItemEstoque[]) => escrever(KEY_ITENS, v);

export const carregarMovimentacoesEstoque = () => ler<MovimentacaoEstoque>(KEY_MOV);
export const salvarMovimentacoesEstoque = (v: MovimentacaoEstoque[]) => escrever(KEY_MOV, v);

export const ESTOQUE_EVENT = "stella:estoque:updated";
