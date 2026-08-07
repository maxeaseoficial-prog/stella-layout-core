import { NfeAvulsa } from "./avulsa-types";

const KEY = "stella.nfe_avulsas.v1";

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function carregarNfeAvulsas(): NfeAvulsa[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as NfeAvulsa[];
  } catch {
    return [];
  }
}

export function salvarNfeAvulsas(notas: NfeAvulsa[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(notas));
  } catch (err) {
    console.error("Falha ao persistir notas avulsas:", err);
  }
}

export const NFE_AVULSA_EVENT = "stella:nfe_avulsa:updated";
export function notificarNfeAvulsaAtualizado() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(NFE_AVULSA_EVENT));
}
