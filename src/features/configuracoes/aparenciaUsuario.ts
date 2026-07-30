import { useCallback, useSyncExternalStore } from "react";

import { usuarioAtual } from "@/features/auth/useAuth";
import { carregar } from "./storage";
import { configuracoesIniciais } from "./defaults";
import type { Aparencia } from "./types";

/**
 * Aparência (tema claro/escuro + cor principal) POR USUÁRIO.
 *
 * Diferente das demais configurações — compartilhadas pela empresa via
 * sincronização multi-tenant — a aparência é uma preferência individual:
 * fica apenas no localStorage do navegador, namespacada pelo id do
 * usuário logado, e NUNCA entra na sincronização (a chave não consta no
 * mapeamento do tenantSync).
 */

const EVENT = "stella:aparencia:updated";
const AUTH_EVENT = "stella:auth:updated";
const CONFIG_EVENT = "stella:configuracoes:updated";
const KEY_PREFIX = "stella.aparencia.";

function isBrowser() {
  return typeof window !== "undefined";
}

function chaveDo(userId: string | null): string {
  return `${KEY_PREFIX}${userId ?? "anon"}.v1`;
}

function userIdAtual(): string | null {
  return usuarioAtual()?.id ?? null;
}

export function carregarAparenciaUsuario(userId: string | null): Aparencia {
  const padrao = configuracoesIniciais().aparencia;
  if (!isBrowser()) return padrao;
  try {
    const raw = window.localStorage.getItem(chaveDo(userId));
    if (raw) return { ...padrao, ...(JSON.parse(raw) as Partial<Aparencia>) };
    // Migração: quem já tinha personalizado a aparência compartilhada
    // começa com ela como ponto de partida individual.
    return { ...padrao, ...carregar().aparencia };
  } catch {
    return padrao;
  }
}

export function salvarAparenciaUsuario(userId: string | null, aparencia: Aparencia): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(chaveDo(userId), JSON.stringify(aparencia));
  } catch (err) {
    console.error("Falha ao persistir aparência do usuário:", err);
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

// ----- snapshot estável (evita loop do useSyncExternalStore) -----
const PADRAO = configuracoesIniciais().aparencia;
let cacheKey = "__init__";
let cacheValue: Aparencia = PADRAO;

function getSnapshot(): Aparencia {
  const userId = userIdAtual();
  const raw = window.localStorage.getItem(chaveDo(userId)) ?? "";
  // Sem valor individual salvo, o snapshot depende da aparência
  // compartilhada (fallback de migração) — incluí-la na chave garante
  // re-leitura se ela mudar.
  const fallback = raw ? "" : JSON.stringify(carregar().aparencia);
  const key = `${userId ?? "anon"}|${raw}|${fallback}`;
  if (key !== cacheKey) {
    cacheKey = key;
    cacheValue = carregarAparenciaUsuario(userId);
  }
  return cacheValue;
}

function getServerSnapshot(): Aparencia {
  return PADRAO;
}

function subscribe(listener: () => void) {
  if (!isBrowser()) return () => {};
  window.addEventListener(EVENT, listener);
  window.addEventListener(AUTH_EVENT, listener); // troca de usuário re-lê
  window.addEventListener(CONFIG_EVENT, listener); // fallback de migração
  window.addEventListener("storage", listener); // outras abas
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener(AUTH_EVENT, listener);
    window.removeEventListener(CONFIG_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function useAparenciaUsuario(): {
  aparencia: Aparencia;
  salvarAparencia: (aparencia: Aparencia) => void;
} {
  const aparencia = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const salvarAparencia = useCallback((next: Aparencia) => {
    salvarAparenciaUsuario(userIdAtual(), next);
  }, []);
  return { aparencia, salvarAparencia };
}
