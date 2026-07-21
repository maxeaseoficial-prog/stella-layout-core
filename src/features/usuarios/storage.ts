import type { Usuario } from "./types";

const STORAGE_KEY = "stella.usuarios.v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function carregarUsuarios(): Usuario[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Usuario[];
  } catch {
    return [];
  }
}

export function salvarUsuarios(usuarios: Usuario[]) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
  } catch (err) {
    console.error("Falha ao persistir usuários:", err);
  }
}

export const USUARIOS_EVENT = "stella:usuarios:updated";
