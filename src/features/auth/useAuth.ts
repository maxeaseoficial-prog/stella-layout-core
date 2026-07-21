import { useSyncExternalStore } from "react";

import type { Capacidades, Papel } from "./permissions";
import { capacidadesDe } from "./permissions";

/**
 * Autenticação mock (localStorage) para fase de testes.
 *
 * Contas padrão:
 *  - Administrador:  administrador@gmail.com / adm123
 *  - Operador Matriz: matriz / matriz123
 */

const STORAGE_KEY = "stella:auth";
const EVENT_NAME = "stella:auth:updated";

interface ContaMock {
  identificadores: string[]; // e-mails ou usernames aceitos (lowercase)
  senha: string;
  nome: string;
  email: string;
  papel: Papel;
  papelLabel: string;
}

const CONTAS: ContaMock[] = [
  {
    identificadores: ["administrador@gmail.com", "administrador"],
    senha: "adm123",
    nome: "Administrador",
    email: "administrador@gmail.com",
    papel: "administrador",
    papelLabel: "Administrador",
  },
  {
    identificadores: ["matriz", "matriz@stella.com.br"],
    senha: "matriz123",
    nome: "Operador Matriz",
    email: "matriz@stella.com.br",
    papel: "operador_matriz",
    papelLabel: "Operador Matriz",
  },
];

export const CONTA_TESTE = {
  email: "administrador@gmail.com",
  senha: "adm123",
  usuarioMatriz: "matriz",
  senhaMatriz: "matriz123",
} as const;

export interface AuthUser {
  email: string;
  nome: string;
  papel: Papel;
  papelLabel: string;
  logadoEm: string;
}

interface AuthState {
  user: AuthUser | null;
}

function ler(): AuthState {
  if (typeof window === "undefined") return { user: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null };
    const parsed = JSON.parse(raw) as AuthState;
    return { user: parsed.user ?? null };
  } catch {
    return { user: null };
  }
}

function escrever(state: AuthState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(EVENT_NAME));
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}

let cache: AuthState = ler();
let cacheKey = "";
function getSnapshot(): AuthState {
  const next = ler();
  const key = JSON.stringify(next);
  if (key !== cacheKey) {
    cache = next;
    cacheKey = key;
  }
  return cache;
}
function getServerSnapshot(): AuthState {
  return { user: null };
}

export function useAuth(): {
  user: AuthUser | null;
  isAuthenticated: boolean;
  papel: Papel | null;
  capacidades: Capacidades;
} {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const papel = state.user?.papel ?? null;
  return {
    user: state.user,
    isAuthenticated: !!state.user,
    papel,
    capacidades: capacidadesDe(papel ?? "administrador"),
  };
}

/** Lê o usuário atual fora de componentes React (helpers/store). */
export function usuarioAtual(): AuthUser | null {
  return ler().user;
}

export function login(
  identificador: string,
  senha: string,
): { ok: boolean; erro?: string } {
  const idLimpo = identificador.trim().toLowerCase();
  const conta = CONTAS.find(
    (c) => c.identificadores.includes(idLimpo) && c.senha === senha,
  );
  if (!conta) {
    return { ok: false, erro: "Usuário ou senha incorretos." };
  }
  escrever({
    user: {
      email: conta.email,
      nome: conta.nome,
      papel: conta.papel,
      papelLabel: conta.papelLabel,
      logadoEm: new Date().toISOString(),
    },
  });
  return { ok: true };
}

export function logout() {
  escrever({ user: null });
}
