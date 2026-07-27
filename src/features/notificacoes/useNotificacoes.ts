import { useCallback, useMemo, useSyncExternalStore } from "react";

import { useAuth } from "@/features/auth/useAuth";
import { useEstoque } from "@/features/estoque/useEstoque";
import { usePedidos } from "@/features/pedidos/usePedidos";
import { useClientes } from "@/features/clientes/useClientes";

import { derivarNotificacoes } from "./derivar";
import { carregarLidas, salvarLidas, subscribeLidas } from "./storage";
import type { Notificacao } from "./types";

interface Retorno {
  itens: Notificacao[];
  naoLidas: number;
  lidas: Set<string>;
  marcarLida: (id: string) => void;
  marcarTodas: () => void;
  limpar: () => void;
}

const EMPTY = new Set<string>();

function useLidas(userId: string | null): Set<string> {
  return useSyncExternalStore(
    subscribeLidas,
    useCallback(() => (userId ? carregarLidas(userId) : EMPTY), [userId]),
    () => EMPTY,
  );
}

export function useNotificacoes(): Retorno {
  const { user, papel } = useAuth();
  const { itens: itensEstoque, movs } = useEstoque();
  const { pedidos } = usePedidos();
  const { clientes } = useClientes();

  const lidas = useLidas(user?.id ?? null);

  const itens = useMemo(() => {
    if (!papel) return [];
    return derivarNotificacoes({
      papel,
      itens: itensEstoque,
      movs,
      pedidos,
      clientes,
    });
  }, [papel, itensEstoque, movs, pedidos, clientes]);

  const naoLidas = useMemo(
    () => itens.reduce((acc, n) => (lidas.has(n.id) ? acc : acc + 1), 0),
    [itens, lidas],
  );

  const marcarLida = useCallback(
    (id: string) => {
      if (!user) return;
      const atual = carregarLidas(user.id);
      if (atual.has(id)) return;
      atual.add(id);
      salvarLidas(user.id, atual);
    },
    [user],
  );

  const marcarTodas = useCallback(() => {
    if (!user) return;
    const atual = carregarLidas(user.id);
    for (const n of itens) atual.add(n.id);
    salvarLidas(user.id, atual);
  }, [user, itens]);

  const limpar = useCallback(() => {
    if (!user) return;
    // Marca tudo como lido — equivalente a "limpar".
    marcarTodas();
  }, [user, marcarTodas]);

  return { itens, naoLidas, lidas, marcarLida, marcarTodas, limpar };
}
