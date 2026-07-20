import type { Cliente } from "./types";

const STORAGE_KEY = "stella.clientes.v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function carregarClientes(): Cliente[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Cliente[];
  } catch {
    return [];
  }
}

export function salvarClientes(clientes: Cliente[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes));
  } catch (err) {
    console.error("Falha ao persistir clientes:", err);
  }
}
