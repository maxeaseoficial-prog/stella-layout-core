import { useSyncExternalStore } from "react";
import { ROTAS_PERMITIDAS } from "@/features/auth/permissions";
import { carregarUsuarios, salvarUsuarios, USUARIOS_EVENT } from "./storage";
import type { HistoricoUsuario, NovoUsuarioInput, Usuario } from "./types";

function nowIso() {
  return new Date().toISOString();
}

function uid() {
  return `usr_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/** Contas semente criadas automaticamente na primeira leitura. */
const SEED: Usuario[] = [
  {
    id: "seed_admin",
    nome: "Administrador",
    usuario: "administrador",
    email: "administrador@gmail.com",
    papel: "administrador",
    senha: "adm123",
    status: "ativo",
    precisaTrocarSenha: false,
    criadoEm: nowIso(),
    atualizadoEm: nowIso(),
    historico: [
      { id: uid(), data: nowIso(), acao: "criado", responsavel: "Sistema" },
    ],
    padrao: true,
    permissoesAbas: ROTAS_PERMITIDAS["administrador"],
  },
  {
    id: "seed_matriz",
    nome: "Operador Matriz",
    usuario: "matriz",
    email: "matriz@stella.com.br",
    papel: "operador_matriz",
    senha: "matriz123",
    status: "ativo",
    precisaTrocarSenha: false,
    criadoEm: nowIso(),
    atualizadoEm: nowIso(),
    historico: [
      { id: uid(), data: nowIso(), acao: "criado", responsavel: "Sistema" },
    ],
    padrao: true,
    permissoesAbas: ROTAS_PERMITIDAS["operador_matriz"],
  },
];

let seeded = false;
function garantirSeed(): Usuario[] {
  const atuais = carregarUsuarios();
  if (atuais.length === 0 && !seeded) {
    seeded = true;
    salvarUsuarios(SEED);
    return SEED;
  }
  return atuais;
}

function emitir() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(USUARIOS_EVENT));
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(USUARIOS_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(USUARIOS_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

let cache: Usuario[] = [];
let cacheKey = "";
function getSnapshot(): Usuario[] {
  const next = garantirSeed();
  const key = JSON.stringify(next);
  if (key !== cacheKey) {
    cache = next;
    cacheKey = key;
  }
  return cache;
}
const EMPTY: Usuario[] = [];
function getServerSnapshot(): Usuario[] {
  return EMPTY;
}

function commit(lista: Usuario[]) {
  salvarUsuarios(lista);
  emitir();
}

function addHistorico(u: Usuario, entry: Omit<HistoricoUsuario, "id" | "data">): Usuario {
  return {
    ...u,
    historico: [
      { id: uid(), data: nowIso(), ...entry },
      ...u.historico,
    ],
  };
}

/** Leitura sem hook (fora de componentes React). */
export function listarUsuarios(): Usuario[] {
  return garantirSeed();
}

export function encontrarPorCredencial(identificador: string, senha: string): Usuario | null {
  const id = identificador.trim().toLowerCase();
  const lista = garantirSeed();
  const u = lista.find(
    (x) =>
      (x.usuario.toLowerCase() === id || x.email.toLowerCase() === id) &&
      x.senha === senha,
  );
  if (u && !u.permissoesAbas) {
    u.permissoesAbas = ROTAS_PERMITIDAS[u.papel];
  }
  return u ?? null;
}

export function registrarAcesso(usuarioId: string) {
  const lista = garantirSeed();
  const nova = lista.map((u) =>
    u.id === usuarioId ? { ...u, ultimoAcesso: nowIso() } : u,
  );
  commit(nova);
}

export async function criarUsuario(input: NovoUsuarioInput, responsavel: string): Promise<{ ok: boolean; erro?: string; id?: string }> {
  const lista = garantirSeed();
  const usernameNorm = input.usuario.trim().toLowerCase();
  const emailNorm = input.email.trim().toLowerCase();
  
  if (!usernameNorm) return { ok: false, erro: "Informe o nome de usuário." };
  if (!input.nome.trim()) return { ok: false, erro: "Informe o nome completo." };
  if (!emailNorm) return { ok: false, erro: "Informe o e-mail." };
  if (!input.senha) return { ok: false, erro: "Informe a senha temporária." };

  if (lista.some((u) => u.usuario.toLowerCase() === usernameNorm)) {
    return { ok: false, erro: "Já existe um usuário com este nome na lista local." };
  }
  if (lista.some((u) => u.email.toLowerCase() === emailNorm)) {
    return { ok: false, erro: "Já existe um usuário com este e-mail na lista local." };
  }

  // 1. Criar no Supabase Auth e vincular no servidor
  const { criarUsuarioSistema } = await import("@/lib/usuarios.functions");
  const result = await criarUsuarioSistema({
    data: {
      nome: input.nome.trim(),
      usuario: usernameNorm,
      email: emailNorm,
      senha: input.senha,
      papel: input.papel,
      permissoesAbas: input.permissoesAbas || ROTAS_PERMITIDAS[input.papel],
      status: input.status,
    }
  });

  if (!result.ok) {
    return { ok: false, erro: result.erro };
  }

  const novo: Usuario = {
    ...input,
    usuario: usernameNorm,
    email: input.email.trim(),
    id: result.userId || uid(),
    criadoEm: nowIso(),
    atualizadoEm: nowIso(),
    historico: [
      { id: uid(), data: nowIso(), acao: "criado", responsavel },
    ],
  };
  commit([novo, ...lista]);
  return { ok: true, id: novo.id };
}

export async function atualizarUsuario(
  id: string,
  patch: Partial<Omit<Usuario, "id" | "criadoEm" | "historico">>,
  responsavel: string,
): Promise<{ ok: boolean; erro?: string }> {
  const lista = garantirSeed();
  const alvo = lista.find((u) => u.id === id);
  if (!alvo) return { ok: false, erro: "Usuário não encontrado." };
  
  // Se for uma conta semente ou tiver um ID de UUID, tentar atualizar no servidor
  const isRealUser = id.length > 20 || id.includes("-");

  if (isRealUser) {
    const { atualizarUsuarioSistema } = await import("@/lib/usuarios.functions");
    const sync = await atualizarUsuarioSistema({
      data: {
        userId: id,
        nome: patch.nome ?? alvo.nome,
        usuario: patch.usuario ?? alvo.usuario,
        email: patch.email ?? alvo.email,
        papel: patch.papel ?? alvo.papel,
        permissoes: patch.permissoesAbas ?? alvo.permissoesAbas ?? ROTAS_PERMITIDAS[patch.papel ?? alvo.papel],
        status: patch.status ?? alvo.status,
      }
    });
    if (!sync.ok) return sync;
  }

  if (patch.usuario) {
    const novoNome = patch.usuario.trim().toLowerCase();
    if (lista.some((u) => u.id !== id && u.usuario.toLowerCase() === novoNome)) {
      return { ok: false, erro: "Já existe um usuário com este nome." };
    }
    patch.usuario = novoNome;
  }
  if (patch.email) {
    const novoEmail = patch.email.trim().toLowerCase();
    if (lista.some((u) => u.id !== id && u.email.toLowerCase() === novoEmail)) {
      return { ok: false, erro: "Já existe um usuário com este e-mail." };
    }
    patch.email = patch.email.trim();
  }

  const nova = lista.map((u) => {
    if (u.id !== id) return u;
    const atualizado: Usuario = { ...u, ...patch, atualizadoEm: nowIso() };
    return addHistorico(atualizado, { acao: "editado", responsavel });
  });
  commit(nova);
  return { ok: true };
}

export function alternarStatus(id: string, status: "ativo" | "inativo", responsavel: string) {
  const lista = garantirSeed();
  const nova = lista.map((u) => {
    if (u.id !== id) return u;
    const atualizado: Usuario = { ...u, status, atualizadoEm: nowIso() };
    return addHistorico(atualizado, {
      acao: status === "ativo" ? "ativado" : "desativado",
      responsavel,
    });
  });
  commit(nova);
}

/** Redefinição administrativa da senha (local e Supabase). */
export async function redefinirSenha(
  id: string,
  novaSenha: string,
  exigirTroca: boolean,
  responsavel: string,
): Promise<{ ok: boolean; erro?: string }> {
  if (!novaSenha) return { ok: false, erro: "Informe a nova senha." };
  
  const lista = garantirSeed();
  const uAlvo = lista.find(x => x.id === id);
  
  if (uAlvo) {
    const { redefinirSenhaSistema } = await import("@/lib/usuarios.functions");
    const result = await redefinirSenhaSistema({ data: { email: uAlvo.email, novaSenha } });
    
    if (!result.ok) {
      return { ok: false, erro: result.erro };
    }
  }

  const nova = lista.map((u) => {
    if (u.id !== id) return u;
    const atualizado: Usuario = {
      ...u,
      senha: novaSenha,
      precisaTrocarSenha: exigirTroca,
      atualizadoEm: nowIso(),
    };
    return addHistorico(atualizado, { acao: "senha_redefinida", responsavel });
  });
  commit(nova);
  return { ok: true };
}

/** Troca de senha realizada pelo próprio usuário (primeiro acesso). */
export function trocarPropriaSenha(id: string, novaSenha: string): { ok: boolean; erro?: string } {
  if (!novaSenha || novaSenha.length < 4) {
    return { ok: false, erro: "A nova senha deve ter pelo menos 4 caracteres." };
  }
  const lista = garantirSeed();
  const alvo = lista.find((u) => u.id === id);
  if (!alvo) return { ok: false, erro: "Usuário não encontrado." };
  const nova = lista.map((u) => {
    if (u.id !== id) return u;
    const atualizado: Usuario = {
      ...u,
      senha: novaSenha,
      precisaTrocarSenha: false,
      atualizadoEm: nowIso(),
    };
    return addHistorico(atualizado, {
      acao: "senha_alterada",
      responsavel: u.nome,
    });
  });
  commit(nova);
  return { ok: true };
}

export function excluirUsuario(id: string, _responsavel: string): { ok: boolean; erro?: string } {
  const lista = garantirSeed();
  const alvo = lista.find((u) => u.id === id);
  if (!alvo) return { ok: false, erro: "Usuário não encontrado." };
  if (alvo.padrao) return { ok: false, erro: "Não é possível excluir contas padrão do sistema." };
  commit(lista.filter((u) => u.id !== id));
  return { ok: true };
}

export function useUsuarios() {
  const usuarios = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  
  const sincronizar = async (u: Usuario, senha?: string) => {
    const { sincronizarUsuarioLocal } = await import("@/lib/usuarios.functions");
    const result = await sincronizarUsuarioLocal({
      data: {
        email: u.email,
        nome: u.nome,
        usuario: u.usuario,
        papel: u.papel,
        permissoes: u.permissoesAbas || ROTAS_PERMITIDAS[u.papel],
        senhaTemporaria: senha
      }
    });

    if (result.ok) {
      // Atualizar o ID local se mudou (migração para UUID)
      const lista = listarUsuarios();
      const nova = lista.map(item => item.email === u.email ? { ...item, id: result.userId! } : item);
      commit(nova);
      return { ok: true };
    }
    return result;
  };

  return { 
    usuarios: usuarios.map(u => ({ ...u, padrao: u.padrao ?? false })),
    sincronizar
  };
}
