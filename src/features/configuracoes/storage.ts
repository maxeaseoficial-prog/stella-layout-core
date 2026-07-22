import type { Categoria, ConfiguracoesState, FormaPagamento } from "./types";
import { configuracoesIniciais } from "./defaults";

const STORAGE_KEY = "stella.configuracoes.v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizarOrdem<T extends { ordem?: number }>(lista: T[]): (T & { ordem: number })[] {
  return lista
    .map((item, i) => ({ ...item, ordem: typeof item.ordem === "number" ? item.ordem : i }))
    .sort((a, b) => a.ordem - b.ordem)
    .map((item, i) => ({ ...item, ordem: i }));
}

function normalizarCategoriasSalvas(salvas: Categoria[] | undefined, base: Categoria[]): Categoria[] {
  if (!salvas) return base;
  // Agrupa por escopo e normaliza ordem dentro de cada escopo.
  const escopos = new Set(salvas.map((c) => c.escopo));
  const resultado: Categoria[] = [];
  escopos.forEach((escopo) => {
    const doEscopo = salvas.filter((c) => c.escopo === escopo);
    resultado.push(...normalizarOrdem(doEscopo));
  });
  return resultado;
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
      empresa: {
        ...base.empresa,
        ...(parsed.empresa ?? {}),
        endereco: { ...base.empresa.endereco, ...(parsed.empresa?.endereco ?? {}) },
      },
      preferencias: { ...base.preferencias, ...(parsed.preferencias ?? {}) },
      numeracao: { ...base.numeracao, ...(parsed.numeracao ?? {}) },
      aparencia: { ...base.aparencia, ...(parsed.aparencia ?? {}) },
      // Respeita a lista salva pelo usuário: nada é re-injetado.
      // Se o usuário nunca personalizou, usa o seed inicial.
      categorias: parsed.categorias
        ? normalizarCategoriasSalvas(parsed.categorias as Categoria[], base.categorias)
        : base.categorias,
      formasPagamento: parsed.formasPagamento
        ? normalizarOrdem(parsed.formasPagamento as FormaPagamento[])
        : base.formasPagamento,
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
