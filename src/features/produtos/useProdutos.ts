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
      // 1. Preferir o mais antigo (criadoEm)
      const dateA = new Date(a.criadoEm || 0).getTime();
      const dateB = new Date(b.criadoEm || 0).getTime();
      if (dateA !== dateB) return dateA - dateB;
      
      // 3. Fallback para ID
      return a.id.localeCompare(b.id);
    })[0];
  });
}

const BACKUP_KEY = "stella.produtos.backup.before-dedupe";
const STORAGE_KEY = "stella.produtos.v1";

export function useProdutos() {
  const produtos = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hidratado = isBrowser();

  // Limpeza de campos fiscais e deduplicação automática
  useEffect(() => {
    if (!hidratado) return;

    const atuais = getSnapshot();
    
    // 1. Limpeza de campos removidos (normatização de dados antigos)
    let houveMudanca = false;
    const limposCampos = atuais.map(p => {
      if ('categoriaFiscalId' in p || 'ncm' in p || 'descricaoFiscal' in p) {
        houveMudanca = true;
        const { categoriaFiscalId, ncm, descricaoFiscal, ...pLimpo } = p as any;
        return pLimpo as Produto;
      }
      return p;
    });

    // 2. Deduplicação por SKU
    const limposDedupe = deduplicarProdutosPorSku(limposCampos);
    if (limposDedupe.length !== limposCampos.length) houveMudanca = true;

    if (houveMudanca) {
      console.log(`[Manutenção] Limpando dados fiscais e duplicados...`);
      
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw && !localStorage.getItem(BACKUP_KEY)) {
        localStorage.setItem(BACKUP_KEY, raw);
        console.log(`[Manutenção] Backup criado com sucesso.`);
      }

      setProdutos(limposDedupe);
    }
  }, [hidratado]);

  // Seed automático apenas se realmente estiver vazio após deduplicação
  useEffect(() => {
    if (hidratado && produtos.length === 0) {
      const novasSementes = (PRODUTOS_SEED as any[]).map(seed => ({
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
        throw new Error(`Já existe um produto cadastrado com este SKU: ${entrada.sku}`);
      }
    }

    const agora = new Date().toISOString();
    const novo: Produto = {
      ...(entrada as any),
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
        throw new Error(`Este SKU já está sendo utilizado por outro produto: ${entrada.sku}`);
      }
    }

    setProdutos(
      snapshots.map((p) =>
        p.id === id
          ? { ...(entrada as any), id: p.id, criadoEm: p.criadoEm, atualizadoEm: new Date().toISOString() }
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
    
    const existentes = getSnapshot();
    const skusExistentes = new Set(existentes.map(p => normalizarSku(p.sku)));
    
    // Filtra do seed apenas os SKUs que realmente não existem
    const apenasNovos = (PRODUTOS_SEED as any[])
      .filter(seed => !skusExistentes.has(normalizarSku(seed.sku)))
      .map((seed) => ({
        ...seed,
        id: novoId(),
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      })) as Produto[];
    
    if (apenasNovos.length > 0) {
      setProdutos([...existentes, ...apenasNovos]);
      return apenasNovos.length;
    }
    return 0;
  }, [hidratado]);

  /** Função de manutenção para limpar duplicidades históricas */
  const deduplicar = useCallback(() => {
    if (!hidratado) return;
    const atuais = getSnapshot();
    const limpos = deduplicarProdutosPorSku(atuais);
    if (limpos.length !== atuais.length) {
      setProdutos(limpos);
      return atuais.length - limpos.length;
    }
    return 0;
  }, [hidratado]);

  return useMemo(
    () => ({ 
      produtos, 
      ativos, 
      hidratado, 
      criar, 
      atualizar, 
      excluir, 
      remover, 
      buscarPorId, 
      filtrar, 
      sincronizar,
      deduplicar 
    }),
    [produtos, ativos, hidratado, criar, atualizar, excluir, remover, buscarPorId, filtrar, sincronizar, deduplicar],
  );
}
