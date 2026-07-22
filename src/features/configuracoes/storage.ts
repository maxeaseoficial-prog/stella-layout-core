import type { Categoria, ConfiguracoesState } from "./types";
import { configuracoesIniciais } from "./defaults";

function mesclarCategorias(base: Categoria[], salvas?: Categoria[]): Categoria[] {
  if (!salvas) return base;
  const chave = (c: Categoria) => `${c.escopo}::${c.nome.trim().toLowerCase()}`;
  const existentes = new Set(salvas.map(chave));
  const faltantes = base.filter((c) => !existentes.has(chave(c)));
  return [...salvas, ...faltantes];
}

const STORAGE_KEY = "stella.configuracoes.v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function carregar(): ConfiguracoesState {
  if (!isBrowser()) return configuracoesIniciais();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return configuracoesIniciais();
    const parsed = JSON.parse(raw) as Partial<ConfiguracoesState>;
    const base = configuracoesIniciais();
    return {
      ...base,
      ...parsed,
      empresa: { ...base.empresa, ...(parsed.empresa ?? {}), endereco: { ...base.empresa.endereco, ...(parsed.empresa?.endereco ?? {}) } },
      preferencias: { ...base.preferencias, ...(parsed.preferencias ?? {}) },
      numeracao: { ...base.numeracao, ...(parsed.numeracao ?? {}) },
      aparencia: { ...base.aparencia, ...(parsed.aparencia ?? {}) },
      categorias: mesclarCategorias(base.categorias, parsed.categorias),
      formasPagamento: parsed.formasPagamento ?? base.formasPagamento,
      usuarios: parsed.usuarios ?? base.usuarios,
    };
  } catch {
    return configuracoesIniciais();
  }
}

export function salvar(state: ConfiguracoesState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Falha ao persistir configurações:", err);
  }
}
