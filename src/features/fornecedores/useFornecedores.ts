import { useCallback, useMemo, useSyncExternalStore } from "react";

import { novoId } from "@/features/clientes";

import type { Fornecedor, FornecedorInput } from "./types";
import {
  FORNECEDORES_EVENT,
  carregarFornecedores,
  salvarFornecedores,
} from "./storage";

let cache: Fornecedor[] | null = null;
const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== "undefined";
}

function getSnapshot(): Fornecedor[] {
  if (cache === null) cache = carregarFornecedores();
  return cache;
}

function setForn(next: Fornecedor[]) {
  cache = next;
  salvarFornecedores(next);
  listeners.forEach((l) => l());
  if (isBrowser()) window.dispatchEvent(new CustomEvent(FORNECEDORES_EVENT));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onEvt = () => {
    cache = carregarFornecedores();
    listener();
  };
  if (isBrowser()) window.addEventListener(FORNECEDORES_EVENT, onEvt);
  return () => {
    listeners.delete(listener);
    if (isBrowser()) window.removeEventListener(FORNECEDORES_EVENT, onEvt);
  };
}

const EMPTY: Fornecedor[] = [];
function getServerSnapshot(): Fornecedor[] {
  return EMPTY;
}

function normalizar(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function useFornecedores() {
  const fornecedores = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hidratado = isBrowser();

  const criar = useCallback((entrada: FornecedorInput): Fornecedor => {
    const agora = new Date().toISOString();
    const novo: Fornecedor = {
      ...entrada,
      id: novoId(),
      criadoEm: agora,
      atualizadoEm: agora,
    };
    setForn([novo, ...getSnapshot()]);
    return novo;
  }, []);

  const atualizar = useCallback((id: string, entrada: FornecedorInput) => {
    setForn(
      getSnapshot().map((f) =>
        f.id === id
          ? { ...entrada, id: f.id, criadoEm: f.criadoEm, atualizadoEm: new Date().toISOString() }
          : f,
      ),
    );
  }, []);

  const alternarStatus = useCallback((id: string) => {
    setForn(
      getSnapshot().map((f) =>
        f.id === id
          ? {
              ...f,
              status: f.status === "ativo" ? "inativo" : "ativo",
              atualizadoEm: new Date().toISOString(),
            }
          : f,
      ),
    );
  }, []);

  const buscarPorId = useCallback(
    (id: string) => fornecedores.find((f) => f.id === id),
    [fornecedores],
  );

  const filtrar = useCallback(
    (termo: string) => {
      const t = normalizar(termo);
      if (!t) return fornecedores;
      return fornecedores.filter(
        (f) =>
          normalizar(f.empresa).includes(t) ||
          normalizar(f.representante).includes(t) ||
          normalizar(f.telefone).includes(t) ||
          normalizar(f.endereco?.cidade ?? "").includes(t),
      );
    },
    [fornecedores],
  );

  const ativos = useMemo(
    () => fornecedores.filter((f) => f.status === "ativo"),
    [fornecedores],
  );

  return useMemo(
    () => ({
      fornecedores,
      ativos,
      hidratado,
      criar,
      atualizar,
      alternarStatus,
      buscarPorId,
      filtrar,
    }),
    [fornecedores, ativos, hidratado, criar, atualizar, alternarStatus, buscarPorId, filtrar],
  );
}
