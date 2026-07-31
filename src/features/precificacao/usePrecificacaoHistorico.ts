import { useCallback, useMemo, useSyncExternalStore } from "react";

import { novoId } from "@/features/clientes";

import { carregarHistorico, salvarHistorico } from "./storage";
import type { CalculoSalvo } from "./types";

/**
 * Store singleton do histórico de cálculos de precificação.
 * Sincronizado entre usuários via camada tenantSync
 * (chave mapeada em `src/features/sync/tableMap.ts`).
 */

const EVENTO = "stella:precificacao:updated";

let cache: CalculoSalvo[] | null = null;
const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== "undefined";
}

function getSnapshot(): CalculoSalvo[] {
  if (cache === null) cache = carregarHistorico();
  return cache;
}

function setHistorico(next: CalculoSalvo[]) {
  cache = next;
  salvarHistorico(next);
  listeners.forEach((l) => l());
  if (isBrowser()) window.dispatchEvent(new CustomEvent(EVENTO));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onEvt = () => {
    cache = carregarHistorico();
    listener();
  };
  if (isBrowser()) window.addEventListener(EVENTO, onEvt);
  return () => {
    listeners.delete(listener);
    if (isBrowser()) window.removeEventListener(EVENTO, onEvt);
  };
}

const EMPTY: CalculoSalvo[] = [];
function getServerSnapshot(): CalculoSalvo[] {
  return EMPTY;
}

export function usePrecificacaoHistorico() {
  const historico = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const adicionar = useCallback(
    (registro: Omit<CalculoSalvo, "id" | "criadoEm">): CalculoSalvo => {
      const novo: CalculoSalvo = {
        ...registro,
        id: novoId(),
        criadoEm: new Date().toISOString(),
      };
      setHistorico([novo, ...getSnapshot()]);
      return novo;
    },
    [],
  );

  const remover = useCallback((id: string) => {
    setHistorico(getSnapshot().filter((c) => c.id !== id));
  }, []);

  const limpar = useCallback(() => {
    setHistorico([]);
  }, []);

  return useMemo(
    () => ({ historico, adicionar, remover, limpar }),
    [historico, adicionar, remover, limpar],
  );
}
