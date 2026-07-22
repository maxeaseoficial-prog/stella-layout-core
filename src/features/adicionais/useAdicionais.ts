import { useCallback, useMemo, useSyncExternalStore } from "react";

import { novoId } from "@/features/clientes";

import type { Adicional, AdicionalInput } from "./types";
import { carregarAdicionais, salvarAdicionais } from "./storage";

/**
 * Store singleton dos adicionais — fonte única de verdade compartilhada por
 * todo o sistema (Catálogo de adicionais, Pedidos, futuros módulos).
 */

const ADICIONAIS_EVENT = "stella:adicionais:updated";

let cache: Adicional[] | null = null;
const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== "undefined";
}

function getSnapshot(): Adicional[] {
  if (cache === null) cache = carregarAdicionais();
  return cache;
}

function setAdicionais(next: Adicional[]) {
  cache = next;
  salvarAdicionais(next);
  listeners.forEach((l) => l());
  if (isBrowser()) window.dispatchEvent(new CustomEvent(ADICIONAIS_EVENT));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onEvt = () => {
    cache = carregarAdicionais();
    listener();
  };
  if (isBrowser()) window.addEventListener(ADICIONAIS_EVENT, onEvt);
  return () => {
    listeners.delete(listener);
    if (isBrowser()) window.removeEventListener(ADICIONAIS_EVENT, onEvt);
  };
}

const EMPTY: Adicional[] = [];
function getServerSnapshot(): Adicional[] {
  return EMPTY;
}

function normalizar(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function useAdicionais() {
  const adicionais = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hidratado = isBrowser();

  const criar = useCallback((entrada: AdicionalInput): Adicional => {
    const agora = new Date().toISOString();
    const novo: Adicional = {
      ...entrada,
      id: novoId(),
      criadoEm: agora,
      atualizadoEm: agora,
    };
    setAdicionais([novo, ...getSnapshot()]);
    return novo;
  }, []);

  const atualizar = useCallback((id: string, entrada: AdicionalInput) => {
    setAdicionais(
      getSnapshot().map((a) =>
        a.id === id
          ? { ...entrada, id: a.id, criadoEm: a.criadoEm, atualizadoEm: new Date().toISOString() }
          : a,
      ),
    );
  }, []);

  /** Exclusão lógica: marca como inativo. */
  const excluir = useCallback((id: string) => {
    setAdicionais(
      getSnapshot().map((a) =>
        a.id === id
          ? { ...a, status: "inativo", atualizadoEm: new Date().toISOString() }
          : a,
      ),
    );
  }, []);

  /** Exclusão permanente: remove o registro do armazenamento. */
  const remover = useCallback((id: string) => {
    setAdicionais(getSnapshot().filter((a) => a.id !== id));
  }, []);

  const buscarPorId = useCallback(
    (id: string) => adicionais.find((a) => a.id === id),
    [adicionais],
  );

  const filtrar = useCallback(
    (termo: string) => {
      const t = normalizar(termo);
      if (!t) return adicionais;
      return adicionais.filter(
        (a) =>
          normalizar(a.nome).includes(t) ||
          normalizar(a.categoria).includes(t) ||
          normalizar(a.tipo).includes(t),
      );
    },
    [adicionais],
  );

  const ativos = useMemo(
    () => adicionais.filter((a) => a.status === "ativo"),
    [adicionais],
  );

  return useMemo(
    () => ({ adicionais, ativos, hidratado, criar, atualizar, excluir, buscarPorId, filtrar }),
    [adicionais, ativos, hidratado, criar, atualizar, excluir, buscarPorId, filtrar],
  );
}
