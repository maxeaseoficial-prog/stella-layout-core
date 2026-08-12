import { useSyncExternalStore, useEffect } from "react";
import { ROTAS_PERMITIDAS } from "@/features/auth/permissions";
import { carregarUsuarios, salvarUsuarios, USUARIOS_EVENT } from "./storage";
import type { HistoricoUsuario, NovoUsuarioInput, Usuario, AtualizarUsuarioInput } from "./types";


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
  // Se existem usuários reais, não precisamos do seed
  const hasRealUsers = atuais.some(u => u.id.includes("-") || u.id.length > 20);
  
  if (atuais.length === 0 && !seeded && !hasRealUsers) {
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

export function encontrarPorCredencial(_identificador: string, _senha: string): Usuario | null {
  // A autenticação agora é feita exclusivamente via Supabase Auth no servidor.
  // Esta função não deve mais ser usada para verificar senhas locais.
  return null;
}

export function registrarAcesso(usuarioId: string) {
  const lista = garantirSeed();
  const nova = lista.map((u) =>
    u.id === usuarioId ? { ...u, ultimoAcesso: nowIso() } : u,
  );
  commit(nova);
}

export async function criarUsuario(input: NovoUsuarioInput, responsavel: string): Promise<{ ok: boolean; erro?: string; id?: string }> {

  const lista = listarUsuarios(); // Use current list
  const usernameNorm = input.usuario.trim().toLowerCase();
  const emailNorm = input.email.trim().toLowerCase();
  
  if (!usernameNorm) return { ok: false, erro: "Informe o nome de usuário." };
  if (!input.nome.trim()) return { ok: false, erro: "Informe o nome completo." };
  if (!emailNorm) return { ok: false, erro: "Informe o e-mail." };
  if (!input.senha) return { ok: false, erro: "Informe a senha temporária." };

  if (lista.some((u) => u.usuario.toLowerCase() === usernameNorm)) {
    return { ok: false, erro: "Já existe um usuário com este nome na Stella." };
  }
  if (lista.some((u) => u.email.toLowerCase() === emailNorm)) {
    return { ok: false, erro: "Já existe um usuário com este e-mail na Stella." };
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

  const { senha: _senha, ...dadosSemSenha } = input;
  const novo: Usuario = {
    ...dadosSemSenha,
    usuario: usernameNorm,
    email: emailNorm,
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
  patch: AtualizarUsuarioInput,
  responsavel: string,
): Promise<{ ok: boolean; erro?: string }> {

  const lista = garantirSeed();
  const alvo = lista.find((u) => u.id === id);
  if (!alvo) return { ok: false, erro: "Usuário não encontrado." };
  
  let syncResult;
  try {
    const { atualizarUsuarioSistema } = await import("@/lib/usuarios.functions");
    syncResult = await atualizarUsuarioSistema({
      data: {
        userId: id,
        nome: patch.nome ?? alvo.nome,
        usuario: patch.usuario ?? alvo.usuario,
        email: patch.email ?? alvo.email,
        papel: patch.papel ?? alvo.papel,
        permissoes: patch.permissoesAbas ?? alvo.permissoesAbas ?? (ROTAS_PERMITIDAS[patch.papel ?? alvo.papel] || []),
        status: patch.status ?? alvo.status,
        novaSenha: (patch as any).novaSenha,
      }
    });
  } catch (err: any) {
    console.error("Erro ao chamar atualizarUsuarioSistema:", err);
    return { ok: false, erro: "Falha na comunicação com o servidor: " + err.message };
  }

  if (!syncResult.ok) {
    console.warn("atualizarUsuarioSistema retornou erro:", syncResult);
    return syncResult;
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
    const { novaSenha: _ns, ...patchSemSenha } = patch as any;
    const atualizado: Usuario = { ...u, ...patchSemSenha, atualizadoEm: nowIso() };
    return addHistorico(atualizado, { acao: "editado", responsavel });
  });

  commit(nova);
  return { ok: true };
}

export async function alternarStatus(id: string, status: "ativo" | "inativo", responsavel: string): Promise<{ ok: boolean; erro?: string }> {
  // Tentar sempre no servidor primeiro se for UUID
  const isUUID = id.includes("-") || id.length > 20;
  
  if (isUUID) {
    const { alternarStatusSistema } = await import("@/lib/usuarios.functions");
    const result = await alternarStatusSistema({ data: { userId: id, status } });
    if (!result.ok) return { ok: false, erro: result.erro };
  }


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
  return { ok: true };
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
      precisaTrocarSenha: exigirTroca,
      atualizadoEm: nowIso(),
    };
    return addHistorico(atualizado, { acao: "senha_redefinida", responsavel });
  });

  commit(nova);
  return { ok: true };
}

/** Troca de senha realizada pelo próprio usuário (primeiro acesso). */
export async function trocarPropriaSenha(id: string, novaSenha: string): Promise<{ ok: boolean; erro?: string }> {
  if (!novaSenha || novaSenha.length < 6) {
    return { ok: false, erro: "A nova senha deve ter pelo menos 6 caracteres." };
  }

  const lista = garantirSeed();
  const alvo = lista.find((u) => u.id === id);
  if (!alvo) return { ok: false, erro: "Usuário não encontrado." };
  const { trocarSenhaObrigatoria } = await import("@/features/auth/useAuth");
  const result = await trocarSenhaObrigatoria(novaSenha);
  if (!result.ok) return result;

  const nova = lista.map((u) => {
    if (u.id !== id) return u;
    const atualizado: Usuario = {
      ...u,
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
  
  // Limpar cache local se o servidor tiver dados reais
  useEffect(() => {
    const list = carregarUsuarios();
    const hasLegacySeed = list.some(u => u.id.startsWith("seed_"));
    const hasRealUsers = list.some(u => u.id.includes("-") || u.id.length > 20);
    
    if (hasLegacySeed && hasRealUsers) {
      // Se já temos usuários reais, removemos os seeds para evitar confusão visual
      const clean = list.filter(u => !u.id.startsWith("seed_"));
      commit(clean);
    }
  }, []);

  
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
      const nova = lista.map(item => item.email === u.email ? { ...item, id: (result as any).userId! } : item);
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
