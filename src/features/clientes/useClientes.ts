import { useCallback, useMemo, useSyncExternalStore } from "react";

import type { Cliente, ClienteInput } from "./types";
import { getClienteNome, getClienteResponsavel } from "./types";
import { carregarClientes, salvarClientes } from "./storage";
import { novoId } from "./utils";

/**
 * Store singleton dos clientes.
 *
 * Fonte única de verdade compartilhada por TODO o sistema (Pedidos, Caixa,
 * Dashboard, futuras telas). Qualquer criação/edição/exclusão emite para
 * todos os assinantes automaticamente — não existem listas paralelas.
 */

const CLIENTES_EVENT = "stella:clientes:updated";

let cache: Cliente[] | null = null;
const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== "undefined";
}

function getSnapshot(): Cliente[] {
  if (cache === null) cache = carregarClientes();
  return cache;
}

function setClientes(next: Cliente[]) {
  cache = next;
  salvarClientes(next);
  listeners.forEach((l) => l());
  if (isBrowser()) window.dispatchEvent(new CustomEvent(CLIENTES_EVENT));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = () => {
    cache = carregarClientes();
    listener();
  };
  if (isBrowser()) window.addEventListener(CLIENTES_EVENT, onStorage);
  return () => {
    listeners.delete(listener);
    if (isBrowser()) window.removeEventListener(CLIENTES_EVENT, onStorage);
  };
}

const EMPTY: Cliente[] = [];
function getServerSnapshot(): Cliente[] {
  return EMPTY;
}

function normalizar(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}
function digitos(s: string): string {
  return s.replace(/\D/g, "");
}

/** Procura um cliente existente com os mesmos dados-chave. */
export function encontrarDuplicado(
  entrada: ClienteInput,
  lista: Cliente[],
  ignorarId?: string,
): Cliente | undefined {
  if (entrada.tipo === "pessoa_fisica") {
    const e = entrada as Extract<ClienteInput, { tipo: "pessoa_fisica" }>;
    const nome = normalizar(e.nome);
    const tel = digitos(e.telefone);
    return lista.find(
      (c) =>
        c.id !== ignorarId &&
        c.tipo === "pessoa_fisica" &&
        normalizar(c.nome) === nome &&
        digitos(c.telefone) === tel,
    );
  }
  const e = entrada as Extract<ClienteInput, { tipo: "empresa" }>;
  const nomeEmp = normalizar(e.nomeEmpresa);
  const resp = normalizar(e.responsavel);
  return lista.find(
    (c) =>
      c.id !== ignorarId &&
      c.tipo === "empresa" &&
      normalizar(c.nomeEmpresa) === nomeEmp &&
      normalizar(c.responsavel) === resp,
  );
}

export type ResultadoCriacao =
  | { ok: true; cliente: Cliente; duplicado: false }
  | { ok: false; cliente: Cliente; duplicado: true };

export function useClientes() {
  const clientes = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hidratado = isBrowser();

  const criar = useCallback((entrada: ClienteInput): ResultadoCriacao => {
    const atual = getSnapshot();
    const existente = encontrarDuplicado(entrada, atual);
    if (existente) {
      return { ok: false, cliente: existente, duplicado: true };
    }
    const agora = new Date().toISOString();
    const novo = {
      ...entrada,
      id: novoId(),
      status: entrada.status ?? "ativo",
      arquivos: entrada.arquivos ?? [],
      criadoEm: agora,
      atualizadoEm: agora,
    } as Cliente;
    setClientes([novo, ...atual]);
    return { ok: true, cliente: novo, duplicado: false };
  }, []);

  const atualizar = useCallback((id: string, entrada: ClienteInput) => {
    const atual = getSnapshot();
    setClientes(
      atual.map((c) =>
        c.id === id
          ? ({
              ...entrada,
              id: c.id,
              status: entrada.status ?? c.status,
              arquivos: entrada.arquivos ?? c.arquivos,
              criadoEm: c.criadoEm,
              atualizadoEm: new Date().toISOString(),
            } as Cliente)
          : c,
      ),
    );
  }, []);

  const excluir = useCallback((id: string) => {
    setClientes(getSnapshot().filter((c) => c.id !== id));
  }, []);

  const buscarPorId = useCallback(
    (id: string) => clientes.find((c) => c.id === id),
    [clientes],
  );

  const filtrar = useCallback(
    (termo: string) => {
      const t = termo.trim().toLowerCase();
      if (!t) return clientes;
      const tDig = t.replace(/\D/g, "");
      return clientes.filter((c) => {
        const nome = getClienteNome(c).toLowerCase();
        const resp = (getClienteResponsavel(c) ?? "").toLowerCase();
        const tel = c.telefone.replace(/\D/g, "");
        const empresa = c.tipo === "empresa" ? c.nomeEmpresa.toLowerCase() : "";
        return (
          nome.includes(t) ||
          resp.includes(t) ||
          empresa.includes(t) ||
          (tDig.length > 0 && tel.includes(tDig))
        );
      });
    },
    [clientes],
  );

  return useMemo(
    () => ({ clientes, hidratado, criar, atualizar, excluir, buscarPorId, filtrar }),
    [clientes, hidratado, criar, atualizar, excluir, buscarPorId, filtrar],
  );
}
