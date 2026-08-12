import { useCallback, useMemo, useSyncExternalStore, useEffect } from "react";

import { novoId } from "@/features/clientes";

import type { Produto, ProdutoInput } from "./types";
import { carregarProdutos, salvarProdutos } from "./storage";
import { PRODUTOS_SEED } from "./data/produto-seed-new";

/**
 * Store singleton dos produtos — fonte única de verdade compartilhada por
 * TODO o sistema (Catálogo, Pedidos, futuros módulos).
 */

const PRODUTOS_EVENT = "stella:produtos:updated";

let cache: Produto[] | null = null;
const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== "undefined";
}

function getSnapshot(): Produto[] {
  if (cache === null) cache = carregarProdutos();
  return cache;
}

function setProdutos(next: Produto[]) {
  cache = next;
  salvarProdutos(next);
  listeners.forEach((l) => l());
  if (isBrowser()) window.dispatchEvent(new CustomEvent(PRODUTOS_EVENT));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onEvt = () => {
    cache = carregarProdutos();
    listener();
  };
  if (isBrowser()) window.addEventListener(PRODUTOS_EVENT, onEvt);
  return () => {
    listeners.delete(listener);
    if (isBrowser()) window.removeEventListener(PRODUTOS_EVENT, onEvt);
  };
}

const EMPTY: Produto[] = [];
function getServerSnapshot(): Produto[] {
  return EMPTY;
}

function normalizar(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

const normalizarSku = (sku?: string) => (sku ?? "").trim().toUpperCase();

export function deduplicarProdutosPorSku(produtos: Produto[]): Produto[] {
  const grouped: Record<string, Produto[]> = {};
  
  produtos.forEach(p => {
    const sku = p.sku ? normalizarSku(p.sku) : `NO-SKU-${p.id}`;
    if (!grouped[sku]) grouped[sku] = [];
    grouped[sku].push(p);
  });

  return Object.values(grouped).map(items => {
    if (items.length <= 1) return items[0];
    
    // Regra de preservação determinística
    return [...items].sort((a, b) => {
      // 1. Preferir o que tem categoria fiscal
      if (a.categoriaFiscalId && !b.categoriaFiscalId) return -1;
      if (!a.categoriaFiscalId && b.categoriaFiscalId) return 1;
      
      // 2. Preferir o mais antigo (criadoEm)
      const dateA = new Date(a.criadoEm || 0).getTime();
      const dateB = new Date(b.criadoEm || 0).getTime();
      if (dateA !== dateB) return dateA - dateB;
      
      // 3. Fallback para ID
      return a.id.localeCompare(b.id);
    })[0];
  });
}

export function useProdutos() {
  const produtos = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hidratado = isBrowser();

  // Seed automático para demonstração/teste se a lista estiver vazia
  useEffect(() => {
    if (hidratado && produtos.length === 0) {
      const novasSementes = PRODUTOS_SEED.map(seed => ({
        ...seed,
        id: novoId(),
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      }));
      setProdutos(novasSementes);
    }
  }, [hidratado, produtos.length]);

  const criar = useCallback((entrada: ProdutoInput): Produto => {
    const snapshots = getSnapshot();
    const skuNovo = normalizarSku(entrada.sku);
    
    // Impedir duplicidade na criação se o SKU for informado
    if (entrada.sku) {
      const existente = snapshots.find(p => normalizarSku(p.sku) === skuNovo);
      if (existente) {
        console.warn(`Tentativa de criar produto duplicado com SKU: ${entrada.sku}`);
        return existente;
      }
    }

    const agora = new Date().toISOString();
    const novo: Produto = {
      ...entrada,
      id: novoId(),
      criadoEm: agora,
      atualizadoEm: agora,
    };
    setProdutos([novo, ...snapshots]);
    return novo;
  }, []);

  const atualizar = useCallback((id: string, entrada: ProdutoInput) => {
    const snapshots = getSnapshot();
    const skuNovo = normalizarSku(entrada.sku);

    // Impedir alteração de SKU para um que já pertença a OUTRO produto
    if (entrada.sku) {
      const conflito = snapshots.find(p => p.id !== id && normalizarSku(p.sku) === skuNovo);
      if (conflito) {
        console.warn(`Tentativa de alterar SKU para um já existente: ${entrada.sku}`);
        // Mantém o SKU original se houver conflito
        const original = snapshots.find(p => p.id === id);
        entrada.sku = original?.sku || entrada.sku;
      }
    }

    setProdutos(
      snapshots.map((p) =>
        p.id === id
          ? { ...entrada, id: p.id, criadoEm: p.criadoEm, atualizadoEm: new Date().toISOString() }
          : p,
      ),
    );
  }, []);

  /** Exclusão lógica: marca como inativo. Pedidos antigos preservam snapshot. */
  const excluir = useCallback((id: string) => {
    setProdutos(
      getSnapshot().map((p) =>
        p.id === id
          ? { ...p, status: "inativo", atualizadoEm: new Date().toISOString() }
          : p,
      ),
    );
  }, []);

  /** Exclusão permanente: remove o registro do armazenamento. */
  const remover = useCallback((id: string) => {
    setProdutos(getSnapshot().filter((p) => p.id !== id));
  }, []);

  const buscarPorId = useCallback(
    (id: string) => produtos.find((p) => p.id === id),
    [produtos],
  );

  const filtrar = useCallback(
    (termo: string) => {
      const t = normalizar(termo);
      if (!t) return produtos;
      return produtos.filter(
        (p) =>
          normalizar(p.nome).includes(t) ||
          normalizar(p.sku ?? "").includes(t) ||
          normalizar(p.categoria).includes(t),
      );
    },
    [produtos],
  );

  const ativos = useMemo(() => produtos.filter((p) => p.status === "ativo"), [produtos]);

  const sincronizar = useCallback(() => {
    if (!hidratado) return;
    const novasSementes = PRODUTOS_SEED.map((seed) => ({
      ...seed,
      id: novoId(),
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    }));
    
    const existentes = getSnapshot();
    const skusExistentes = new Set(existentes.map(p => p.sku));
    
    // Filtra para adicionar apenas o que não existe por SKU
    const apenasNovos = novasSementes.filter(p => !skusExistentes.has(p.sku));
    
    if (apenasNovos.length > 0) {
      setProdutos([...existentes, ...apenasNovos]);
      return apenasNovos.length;
    }
    return 0;
  }, [hidratado]);

  return useMemo(
    () => ({ produtos, ativos, hidratado, criar, atualizar, excluir, remover, buscarPorId, filtrar, sincronizar }),
    [produtos, ativos, hidratado, criar, atualizar, excluir, remover, buscarPorId, filtrar, sincronizar],
  );
}
