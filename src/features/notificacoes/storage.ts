/**
 * Persiste apenas o conjunto de IDs de notificações já vistas/lidas pelo
 * usuário atual. As notificações em si são derivadas em tempo real a partir
 * dos stores de Pedidos e Estoque — não precisamos armazená-las.
 */

const EVENT_NAME = "stella:notificacoes:updated";

function isBrowser() {
  return typeof window !== "undefined";
}

function chave(userId: string) {
  return `stella.notificacoes.${userId}.v1`;
}

interface Estado {
  lidas: string[];
}

export function carregarLidas(userId: string): Set<string> {
  if (!isBrowser()) return new Set();
  try {
    const raw = window.localStorage.getItem(chave(userId));
    if (!raw) return new Set();
    const p = JSON.parse(raw) as Estado;
    return new Set(Array.isArray(p.lidas) ? p.lidas : []);
  } catch {
    return new Set();
  }
}

export function salvarLidas(userId: string, lidas: Set<string>) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(
      chave(userId),
      JSON.stringify({ lidas: Array.from(lidas) } satisfies Estado),
    );
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch (err) {
    console.error("Falha ao persistir notificações:", err);
  }
}

export function subscribeLidas(cb: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}
