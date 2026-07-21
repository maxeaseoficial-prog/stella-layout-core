import { useSyncExternalStore } from "react";

import type { Capacidades, Papel } from "./permissions";
import { capacidadesDe } from "./permissions";
import {
  encontrarPorCredencial,
  listarUsuarios,
  registrarAcesso,
  trocarPropriaSenha,
} from "@/features/usuarios/useUsuarios";

/**
 * Autenticação mock (localStorage). As contas ficam agora armazenadas no
 * módulo Usuários (`stella.usuarios.v1`) e podem ser gerenciadas pelo
 * Administrador. Contas padrão semeadas:
 *  - Administrador:  administrador@gmail.com / adm123 (usuário: administrador)
 *  - Operador Matriz: matriz / matriz123
 */

const STORAGE_KEY = "stella:auth";
const EVENT_NAME = "stella:auth:updated";

export const CONTA_TESTE = {
  email: "administrador@gmail.com",
  senha: "adm123",
  usuarioMatriz: "matriz",
  senhaMatriz: "matriz123",
} as const;

const PAPEL_LABEL: Record<Papel, string> = {
  administrador: "Administrador",
  operador_matriz: "Operador Matriz",
};

export interface AuthUser {
  id: string;
  email: string;
  nome: string;
  papel: Papel;
  papelLabel: string;
  logadoEm: string;
  precisaTrocarSenha: boolean;
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
const EMPTY_AUTH: AuthState = { user: null };
function getServerSnapshot(): AuthState {
  return EMPTY_AUTH;
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

export function usuarioAtual(): AuthUser | null {
  return ler().user;
}

export function login(
  identificador: string,
  senha: string,
): { ok: boolean; erro?: string; precisaTrocarSenha?: boolean } {
  const conta = encontrarPorCredencial(identificador, senha);
  if (!conta) return { ok: false, erro: "Usuário ou senha incorretos." };
  if (conta.status === "inativo") {
    return { ok: false, erro: "Este usuário está inativo. Contate o administrador." };
  }
  const authUser: AuthUser = {
    id: conta.id,
    email: conta.email,
    nome: conta.nome,
    papel: conta.papel,
    papelLabel: PAPEL_LABEL[conta.papel],
    logadoEm: new Date().toISOString(),
    precisaTrocarSenha: conta.precisaTrocarSenha,
  };
  escrever({ user: authUser });
  registrarAcesso(conta.id);
  return { ok: true, precisaTrocarSenha: conta.precisaTrocarSenha };
}

export function logout() {
  escrever({ user: null });
}

/** Troca de senha durante o primeiro acesso. */
export function trocarSenhaObrigatoria(novaSenha: string): { ok: boolean; erro?: string } {
  const atual = usuarioAtual();
  if (!atual) return { ok: false, erro: "Sessão inválida." };
  const res = trocarPropriaSenha(atual.id, novaSenha);
  if (!res.ok) return res;
  escrever({ user: { ...atual, precisaTrocarSenha: false } });
  return { ok: true };
}

/** Utilitário exportado (evita import direto do módulo de usuários). */
export function _debugListarUsuarios() {
  return listarUsuarios();
}
