import { useCallback, useMemo, useSyncExternalStore } from "react";

import { novoId } from "@/features/clientes";

import type {
  ItemEstoque,
  ItemEstoqueInput,
  MovimentacaoEstoque,
  TipoMovimentacao,
} from "./types";
import {
  ESTOQUE_EVENT,
  carregarItensEstoque,
  carregarMovimentacoesEstoque,
  salvarItensEstoque,
  salvarMovimentacoesEstoque,
} from "./storage";

interface State {
  itens: ItemEstoque[];
  movs: MovimentacaoEstoque[];
}

let cache: State | null = null;
const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== "undefined";
}

function getSnapshot(): State {
  if (cache === null) {
    cache = {
      itens: carregarItensEstoque(),
      movs: carregarMovimentacoesEstoque(),
    };
  }
  return cache;
}

function commit(next: State, persist: { itens?: boolean; movs?: boolean } = {}) {
  cache = next;
  if (persist.itens) salvarItensEstoque(next.itens);
  if (persist.movs) salvarMovimentacoesEstoque(next.movs);
  listeners.forEach((l) => l());
  if (isBrowser()) window.dispatchEvent(new CustomEvent(ESTOQUE_EVENT));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onEvt = () => {
    cache = {
      itens: carregarItensEstoque(),
      movs: carregarMovimentacoesEstoque(),
    };
    listener();
  };
  if (isBrowser()) window.addEventListener(ESTOQUE_EVENT, onEvt);
  return () => {
    listeners.delete(listener);
    if (isBrowser()) window.removeEventListener(ESTOQUE_EVENT, onEvt);
  };
}

const EMPTY: State = { itens: [], movs: [] };
function getServerSnapshot(): State {
  return EMPTY;
}

function normalizar(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function useEstoque() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hidratado = isBrowser();

  const criar = useCallback((entrada: ItemEstoqueInput): ItemEstoque => {
    const agora = new Date().toISOString();
    const novo: ItemEstoque = {
      ...entrada,
      id: novoId(),
      criadoEm: agora,
      atualizadoEm: agora,
    };
    const snap = getSnapshot();
    commit({ ...snap, itens: [novo, ...snap.itens] }, { itens: true });
    return novo;
  }, []);

  const atualizar = useCallback((id: string, entrada: ItemEstoqueInput) => {
    const snap = getSnapshot();
    commit(
      {
        ...snap,
        itens: snap.itens.map((i) =>
          i.id === id
            ? {
                ...entrada,
                id: i.id,
                criadoEm: i.criadoEm,
                atualizadoEm: new Date().toISOString(),
              }
            : i,
        ),
      },
      { itens: true },
    );
  }, []);

  const excluir = useCallback((id: string) => {
    const snap = getSnapshot();
    commit(
      {
        ...snap,
        itens: snap.itens.map((i) =>
          i.id === id
            ? { ...i, status: "inativo", atualizadoEm: new Date().toISOString() }
            : i,
        ),
      },
      { itens: true },
    );
  }, []);

  const removerPermanente = useCallback((id: string) => {
    const snap = getSnapshot();
    commit(
      {
        itens: snap.itens.filter((i) => i.id !== id),
        movs: snap.movs.filter((m) => m.itemId !== id),
      },
      { itens: true, movs: true },
    );
  }, []);

  const podeRemover = useCallback(
    (id: string) => {
      const item = state.itens.find((i) => i.id === id);
      if (!item) return false;
      if (item.status !== "inativo") return false;
      const temMov = state.movs.some((m) => m.itemId === id);
      return !temMov;
    },
    [state.itens, state.movs],
  );


  const movimentar = useCallback(
    (input: {
      itemId: string;
      tipo: TipoMovimentacao;
      quantidade: number;
      data: string;
      observacoes?: string;
    }): { ok: boolean; erro?: string } => {
      const snap = getSnapshot();
      const item = snap.itens.find((i) => i.id === input.itemId);
      if (!item) return { ok: false, erro: "Item não encontrado." };
      if (input.quantidade <= 0)
        return { ok: false, erro: "Informe uma quantidade maior que zero." };
      const nova = input.tipo === "entrada"
        ? item.quantidade + input.quantidade
        : item.quantidade - input.quantidade;
      if (nova < 0)
        return { ok: false, erro: "Quantidade em estoque insuficiente para essa saída." };

      const agora = new Date().toISOString();
      const mov: MovimentacaoEstoque = {
        id: novoId(),
        itemId: input.itemId,
        tipo: input.tipo,
        quantidade: input.quantidade,
        data: input.data,
        observacoes: input.observacoes?.trim() || undefined,
        criadoEm: agora,
        origem: "manual",
      };
      commit(
        {
          itens: snap.itens.map((i) =>
            i.id === input.itemId
              ? { ...i, quantidade: nova, atualizadoEm: agora }
              : i,
          ),
          movs: [mov, ...snap.movs],
        },
        { itens: true, movs: true },
      );
      return { ok: true };
    },
    [],
  );

  const historicoDoItem = useCallback(
    (itemId: string) =>
      state.movs
        .filter((m) => m.itemId === itemId)
        .sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1)),
    [state.movs],
  );

  const filtrar = useCallback(
    (termo: string) => {
      const t = normalizar(termo);
      if (!t) return state.itens;
      return state.itens.filter(
        (i) =>
          normalizar(i.nome).includes(t) ||
          normalizar(i.categoria).includes(t) ||
          normalizar(i.fornecedor ?? "").includes(t),
      );
    },
    [state.itens],
  );

  const stats = useMemo(() => {
    const ativos = state.itens.filter((i) => i.status === "ativo");
    const total = ativos.length;
    let baixo = 0;
    let sem = 0;
    let valor = 0;
    for (const i of ativos) {
      if (i.quantidade <= 0) sem++;
      else if (i.quantidade <= i.estoqueMinimo) baixo++;
      valor += i.quantidade * (i.precoCompra || 0);
    }
    return { total, baixo, sem, valor };
  }, [state.itens]);

  return useMemo(
    () => ({
      itens: state.itens,
      movs: state.movs,
      hidratado,
      stats,
      criar,
      atualizar,
      excluir,
      removerPermanente,
      podeRemover,
      movimentar,
      historicoDoItem,
      filtrar,
    }),
    [state.itens, state.movs, hidratado, stats, criar, atualizar, excluir, removerPermanente, podeRemover, movimentar, historicoDoItem, filtrar],
  );
}

