/**
 * Persiste apenas o conjunto de IDs de notificações já vistas/lidas pelo
 * usuário atual. As notificações em si são derivadas em tempo real a partir
 * dos stores de Pedidos e Estoque — não precisamos armazená-las.
 *
 * IMPORTANTE: o `Set` retornado por `carregarLidas` é memoizado por `userId`.
 * A mesma referência é devolvida enquanto o conteúdo não muda. Isso é
 * essencial para hooks baseados em `useSyncExternalStore`, que comparam
 * snapshots por identidade (`Object.is`) e disparariam loop infinito de
 * renderização se recebessem um `Set` novo a cada leitura.
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

const EMPTY: ReadonlySet<string> = new Set<string>();
const cache = new Map<string, Set<string>>();

function lerDoStorage(userId: string): Set<string> {
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

function mesmoConteudo(a: Set<string>, b: Set<string>): boolean {
  if (a === b) return true;
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

export function carregarLidas(userId: string): Set<string> {
  if (!isBrowser()) return EMPTY as Set<string>;
  const cacheado = cache.get(userId);
  if (cacheado) return cacheado;
  const inicial = lerDoStorage(userId);
  cache.set(userId, inicial);
  return inicial;
}

/**
 * Substitui o conjunto de lidas por uma NOVA referência (imutável do ponto
 * de vista dos consumidores). Só notifica se o conteúdo realmente mudou.
 */
export function salvarLidas(userId: string, lidas: Set<string>) {
  if (!isBrowser()) return;
  const atual = cache.get(userId) ?? lerDoStorage(userId);
  if (mesmoConteudo(atual, lidas)) {
    // Nada mudou — mantém a referência antiga para não invalidar snapshots.
    cache.set(userId, atual);
    return;
  }
  const novo = new Set(lidas);
  cache.set(userId, novo);
  try {
    window.localStorage.setItem(
      chave(userId),
      JSON.stringify({ lidas: Array.from(novo) } satisfies Estado),
    );
  } catch (err) {
    console.error("Falha ao persistir notificações:", err);
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function subscribeLidas(cb: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = (ev: Event) => {
    // Invalida cache de outras abas quando o `storage` event dispara.
    if (ev.type === "storage") {
      const se = ev as StorageEvent;
      if (se.key) {
        for (const uid of cache.keys()) {
          if (chave(uid) === se.key) {
            cache.set(uid, lerDoStorage(uid));
          }
        }
      } else {
        cache.clear();
      }
    }
    cb();
  };
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}
