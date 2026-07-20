import { useCallback, useMemo, useSyncExternalStore } from "react";

import { novoId } from "@/features/clientes";

import type { Arquivo, ArquivoInput, TipoArquivo } from "./types";
import { ARQUIVOS_EVENT, carregarArquivos, salvarArquivos } from "./storage";

/**
 * Store singleton de arquivos (logos, matrizes, artes).
 *
 * Fonte única de verdade compartilhada por Clientes, Pedidos e Produção.
 * Cada arquivo possui ID único e clienteId; nunca duplicado.
 */

let cache: Arquivo[] | null = null;
const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== "undefined";
}

function getSnapshot(): Arquivo[] {
  if (cache === null) cache = carregarArquivos();
  return cache;
}

function setArquivos(next: Arquivo[]) {
  cache = next;
  salvarArquivos(next);
  listeners.forEach((l) => l());
  if (isBrowser()) window.dispatchEvent(new CustomEvent(ARQUIVOS_EVENT));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onEvt = () => {
    cache = carregarArquivos();
    listener();
  };
  if (isBrowser()) window.addEventListener(ARQUIVOS_EVENT, onEvt);
  return () => {
    listeners.delete(listener);
    if (isBrowser()) window.removeEventListener(ARQUIVOS_EVENT, onEvt);
  };
}

const EMPTY: Arquivo[] = [];
function getServerSnapshot(): Arquivo[] {
  return EMPTY;
}

export function useArquivos() {
  const arquivos = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hidratado = isBrowser();

  const criar = useCallback((entrada: ArquivoInput): Arquivo => {
    const agora = new Date().toISOString();
    const novo: Arquivo = {
      ...entrada,
      id: novoId(),
      criadoEm: agora,
      atualizadoEm: agora,
    };
    setArquivos([novo, ...getSnapshot()]);
    return novo;
  }, []);

  const atualizar = useCallback((id: string, entrada: ArquivoInput) => {
    setArquivos(
      getSnapshot().map((a) =>
        a.id === id
          ? { ...entrada, id: a.id, criadoEm: a.criadoEm, atualizadoEm: new Date().toISOString() }
          : a,
      ),
    );
  }, []);

  const excluir = useCallback((id: string) => {
    setArquivos(getSnapshot().filter((a) => a.id !== id));
  }, []);

  const alternarStatus = useCallback((id: string) => {
    setArquivos(
      getSnapshot().map((a) =>
        a.id === id
          ? {
              ...a,
              status: a.status === "ativo" ? "arquivado" : "ativo",
              atualizadoEm: new Date().toISOString(),
            }
          : a,
      ),
    );
  }, []);

  const buscarPorId = useCallback(
    (id: string) => arquivos.find((a) => a.id === id),
    [arquivos],
  );

  const porCliente = useCallback(
    (clienteId: string) => arquivos.filter((a) => a.clienteId === clienteId),
    [arquivos],
  );

  const stats = useMemo(() => {
    const clientesComArquivos = new Set(arquivos.map((a) => a.clienteId)).size;
    const logos = arquivos.filter((a) => a.tipo === "logo").length;
    const matrizes = arquivos.filter((a) => a.tipo === "matriz").length;
    const outros = arquivos.filter(
      (a) => a.tipo !== "logo" && a.tipo !== "matriz",
    ).length;
    return { clientesComArquivos, logos, matrizes, outros, total: arquivos.length };
  }, [arquivos]);

  return useMemo(
    () => ({
      arquivos,
      hidratado,
      stats,
      criar,
      atualizar,
      excluir,
      alternarStatus,
      buscarPorId,
      porCliente,
    }),
    [arquivos, hidratado, stats, criar, atualizar, excluir, alternarStatus, buscarPorId, porCliente],
  );
}

export function filtrarArquivos(
  arquivos: Arquivo[],
  opcoes: {
    termo?: string;
    tipo?: TipoArquivo | "todos";
    clienteId?: string;
    nomeCliente?: (id: string) => string;
  },
): Arquivo[] {
  const t = (opcoes.termo ?? "").trim().toLowerCase();
  return arquivos.filter((a) => {
    if (opcoes.clienteId && a.clienteId !== opcoes.clienteId) return false;
    if (opcoes.tipo && opcoes.tipo !== "todos" && a.tipo !== opcoes.tipo) return false;
    if (!t) return true;
    const nomeCli = opcoes.nomeCliente?.(a.clienteId).toLowerCase() ?? "";
    return (
      a.nome.toLowerCase().includes(t) ||
      a.arquivoNome.toLowerCase().includes(t) ||
      nomeCli.includes(t)
    );
  });
}
