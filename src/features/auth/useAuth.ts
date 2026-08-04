import { useSyncExternalStore } from "react";


import { supabase } from "@/integrations/supabase/client";
import type { Capacidades, ModuloRota, Papel } from "./permissions";
import { capacidadesDe, ROTAS_PERMITIDAS } from "./permissions";

/**
 * Autenticação real via Supabase Auth. Mantém a MESMA superfície pública
 * (`useAuth`, `login`, `logout`, `usuarioAtual`, `trocarSenhaObrigatoria`,
 * `CONTA_TESTE`) para não obrigar refatorações em consumidores.
 *
 * Regras:
 *  - Login por e-mail OU pelo apelido cadastrado (ex.: "matriz" →
 *    matriz@stella.com.br). O mapeamento é fixo para os usuários
 *    semeados; contas criadas via Configurações → Usuários usam
 *    o e-mail direto.
 *  - O papel do usuário vem da tabela `empresa_usuarios`.
 *  - `stella:auth` no localStorage é preenchido a partir da sessão do
 *    Supabase para que os componentes continuem lendo síncrono.
 */

const STORAGE_KEY = "stella:auth";
const EVENT_NAME = "stella:auth:updated";
const TENANT_ID_DEFAULT = "11111111-1111-1111-1111-111111111111";

export const CONTA_TESTE = {
  email: "administrador@gmail.com",
  senha: "adm123",
  usuarioMatriz: "matriz",
  senhaMatriz: "matriz123",
} as const;

const PAPEL_LABEL: Record<Papel, string> = {
  administrador: "Administrador",
  operador_matriz: "Operador Matriz",
  caixa: "Caixa",
};

const APELIDOS_EMAIL: Record<string, string> = {
  administrador: "administrador@gmail.com",
  matriz: "matriz@stella.com.br",
};

export interface AuthUser {
  id: string;
  email: string;
  nome: string;
  papel: Papel;
  papelLabel: string;
  foto?: string;
  permissoesAbas: ModuloRota[];
  logadoEm: string;
  precisaTrocarSenha: boolean;
}

interface AuthState {
  user: AuthUser | null;
}

function isBrowser() {
  return typeof window !== "undefined";
}
function ler(): AuthState {
  if (!isBrowser()) return { user: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null };
    return JSON.parse(raw) as AuthState;
  } catch {
    return { user: null };
  }
}
function escrever(state: AuthState) {
  if (!isBrowser()) return;
  if (state.user) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  window.dispatchEvent(new Event(EVENT_NAME));
}

let snapshotCache: AuthState = { user: null };
let snapshotKey = "__init__";
function getStableSnapshot(): AuthState {
  const next = ler();
  const key = JSON.stringify(next);
  if (key !== snapshotKey) {
    snapshotCache = next;
    snapshotKey = key;
  }
  return snapshotCache;
}
const EMPTY_SNAPSHOT: AuthState = { user: null };

function identificadorParaEmail(id: string): string {
  const trimmed = id.trim();
  if (trimmed.includes("@")) return trimmed.toLowerCase();
  const key = trimmed.toLowerCase();
  return APELIDOS_EMAIL[key] ?? key;
}

async function papelEPermissoesDoUsuario(userId: string): Promise<{ papel: Papel; permissoes: ModuloRota[] | null; foto?: string }> {
  const { data } = await supabase
    .from("empresa_usuarios")
    .select("papel, permissoes, foto")
    .eq("user_id", userId)
    .maybeSingle();
  const papel = ((data?.papel as Papel | undefined) ?? "administrador") as Papel;
  const permissoes = data?.permissoes as ModuloRota[] | null;
  const foto = data?.foto as string | undefined;
  return { papel, permissoes, foto };
}

async function sincronizarSessao() {
  const { data } = await supabase.auth.getUser();
  const u = data.user;
  if (!u) {
    escrever({ user: null });
    return;
  }
  const { papel, permissoes, foto } = await papelEPermissoesDoUsuario(u.id);
  const meta = (u.user_metadata ?? {}) as {
    nome?: string;
    usuario?: string;
    papel?: Papel;
    permissoes?: ModuloRota[];
    foto?: string;
  };
  const nome = meta.nome ?? (u.email?.split("@")[0] ?? "Usuário");
  const authUser: AuthUser = {
    id: u.id,
    email: u.email ?? "",
    nome,
    papel,
    papelLabel: PAPEL_LABEL[papel],
    foto: foto || meta.foto,
    permissoesAbas: permissoes || meta.permissoes || ROTAS_PERMITIDAS[papel],
    logadoEm: new Date().toISOString(),
    precisaTrocarSenha: false,
  };
  escrever({ user: authUser });
}

// Assina onAuthStateChange uma única vez, no boot do módulo (client-side)
if (isBrowser()) {
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "INITIAL_SESSION") {
      void sincronizarSessao();
    } else if (event === "SIGNED_OUT") {
      escrever({ user: null });
    }
  });
}

export function useAuth(): {
  user: AuthUser | null;
  isAuthenticated: boolean;
  papel: Papel | null;
  capacidades: Capacidades;
  permissoesAbas: ModuloRota[];
} {
  const state = useSyncExternalStore<AuthState>(
    (cb) => {
      if (!isBrowser()) return () => {};
      const handler = () => cb();
      window.addEventListener(EVENT_NAME, handler);
      window.addEventListener("storage", handler);
      return () => {
        window.removeEventListener(EVENT_NAME, handler);
        window.removeEventListener("storage", handler);
      };
    },
    getStableSnapshot,
    () => EMPTY_SNAPSHOT,
  );
  const papel = state.user?.papel ?? null;
  // Fallback para as rotas padrão se as permissões customizadas não existirem (usuários antigos/migração)
  const permissoesAbas = (state.user as any)?.permissoesAbas ?? (papel ? ROTAS_PERMITIDAS[papel] : []);

  return {
    user: state.user,
    isAuthenticated: !!state.user,
    papel,
    capacidades: capacidadesDe(papel ?? "administrador"),
    permissoesAbas,
  };
}

export function usuarioAtual(): AuthUser | null {
  return ler().user;
}

export async function login(
  identificador: string,
  senha: string,
): Promise<{ ok: boolean; erro?: string; precisaTrocarSenha?: boolean }> {
  const email = identificadorParaEmail(identificador);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });
  if (error || !data.user) {
    return { ok: false, erro: "Usuário ou senha incorretos." };
  }
  await sincronizarSessao();
  return { ok: true, precisaTrocarSenha: false };
}

export async function logout() {
  await supabase.auth.signOut();
  escrever({ user: null });
}

export async function trocarSenhaObrigatoria(
  novaSenha: string,
): Promise<{ ok: boolean; erro?: string }> {
  const { error } = await supabase.auth.updateUser({ password: novaSenha });
  if (error) return { ok: false, erro: error.message };
  const atual = usuarioAtual();
  if (atual) escrever({ user: { ...atual, precisaTrocarSenha: false } });
  return { ok: true };
}

export function _debugListarUsuarios() {
  return [];
}

export const TENANT_ID = TENANT_ID_DEFAULT;
