import { useCallback, useMemo, useSyncExternalStore } from "react";

import { novoId } from "@/features/clientes";

import type { Produto, ProdutoInput } from "./types";
import { carregarProdutos, salvarProdutos } from "./storage";

/**
 * Store singleton dos produtos — fonte única de verdade compartilhada por
 * TODO o sistema (Catálogo, Pedidos, futuros módulos).
 */

const PRODUTOS_EVENT = "stella:produtos:updated";

let cache: Produto[] | null = null;
const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== "undefined";
}

function getSnapshot(): Produto[] {
  if (cache === null) cache = carregarProdutos();
  return cache;
}

function setProdutos(next: Produto[]) {
  cache = next;
  salvarProdutos(next);
  listeners.forEach((l) => l());
  if (isBrowser()) window.dispatchEvent(new CustomEvent(PRODUTOS_EVENT));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onEvt = () => {
    cache = carregarProdutos();
    listener();
  };
  if (isBrowser()) window.addEventListener(PRODUTOS_EVENT, onEvt);
  return () => {
    listeners.delete(listener);
    if (isBrowser()) window.removeEventListener(PRODUTOS_EVENT, onEvt);
  };
}

const EMPTY: Produto[] = [];
function getServerSnapshot(): Produto[] {
  return EMPTY;
}

function normalizar(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function useProdutos() {
  const produtos = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hidratado = isBrowser();

  const criar = useCallback((entrada: ProdutoInput): Produto => {
    const agora = new Date().toISOString();
    const novo: Produto = {
      ...entrada,
      id: novoId(),
      criadoEm: agora,
      atualizadoEm: agora,
    };
    setProdutos([novo, ...getSnapshot()]);
    return novo;
  }, []);

  const atualizar = useCallback((id: string, entrada: ProdutoInput) => {
    setProdutos(
      getSnapshot().map((p) =>
        p.id === id
          ? { ...entrada, id: p.id, criadoEm: p.criadoEm, atualizadoEm: new Date().toISOString() }
          : p,
      ),
    );
  }, []);

  /** Exclusão lógica: marca como inativo. Pedidos antigos preservam snapshot. */
  const excluir = useCallback((id: string) => {
    setProdutos(
      getSnapshot().map((p) =>
        p.id === id
          ? { ...p, status: "inativo", atualizadoEm: new Date().toISOString() }
          : p,
      ),
    );
  }, []);

  /** Exclusão permanente: remove o registro do armazenamento. */
  const remover = useCallback((id: string) => {
    setProdutos(getSnapshot().filter((p) => p.id !== id));
  }, []);

  const buscarPorId = useCallback(
    (id: string) => produtos.find((p) => p.id === id),
    [produtos],
  );

  const filtrar = useCallback(
    (termo: string) => {
      const t = normalizar(termo);
      if (!t) return produtos;
      return produtos.filter(
        (p) =>
          normalizar(p.nome).includes(t) ||
          normalizar(p.sku ?? "").includes(t) ||
          normalizar(p.categoria).includes(t),
      );
    },
    [produtos],
  );

  const ativos = useMemo(() => produtos.filter((p) => p.status === "ativo"), [produtos]);

  return useMemo(
    () => ({ produtos, ativos, hidratado, criar, atualizar, excluir, buscarPorId, filtrar }),
    [produtos, ativos, hidratado, criar, atualizar, excluir, buscarPorId, filtrar],
  );
}
