import { useSyncExternalStore } from "react";

/**
 * Autenticação mock (localStorage) para fase de testes.
 * Conta padrão: administrador@gmail.com / adm123
 */

const STORAGE_KEY = "stella:auth";
const EVENT_NAME = "stella:auth:updated";

export const CONTA_TESTE = {
  email: "administrador@gmail.com",
  senha: "adm123",
  nome: "Administrador",
  papel: "Administrador",
} as const;

export interface AuthUser {
  email: string;
  nome: string;
  papel: string;
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

export function useAuth() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    user: state.user,
    isAuthenticated: !!state.user,
  };
}

export function login(email: string, senha: string): { ok: boolean; erro?: string } {
  const emailLimpo = email.trim().toLowerCase();
  if (
    emailLimpo === CONTA_TESTE.email.toLowerCase() &&
    senha === CONTA_TESTE.senha
  ) {
    escrever({
      user: {
        email: CONTA_TESTE.email,
        nome: CONTA_TESTE.nome,
        papel: CONTA_TESTE.papel,
        logadoEm: new Date().toISOString(),
      },
    });
    return { ok: true };
  }
  return { ok: false, erro: "E-mail ou senha incorretos." };
}

export function logout() {
  escrever({ user: null });
}
