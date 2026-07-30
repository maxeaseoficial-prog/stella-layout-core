import { useEffect, useRef } from "react";

import type { Notificacao } from "./types";
import { tocarSomNotificacao } from "./som";

/** Janela de "novidade": só toca para eventos criados/atualizados há pouco. */
const JANELA_NOVIDADE_MS = 5 * 60 * 1000;

/**
 * Toca um som quando surge uma notificação nova e não lida.
 *
 * - Ignora a primeira carga (F5 não dispara som para pendências antigas);
 * - Só toca para notificações recentes (criadas/atualizadas há menos de 5 min),
 *   o que também evita disparo quando os dados terminam de hidratar;
 * - Toca no máximo uma vez por notificação.
 */
export function useSomNotificacao(itens: Notificacao[], lidas: Set<string>) {
  const inicializadoRef = useRef(false);
  const conhecidosRef = useRef<Set<string>>(new Set());
  const tocadosRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const naoLidas = itens.filter((n) => !lidas.has(n.id));

    if (!inicializadoRef.current) {
      inicializadoRef.current = true;
      for (const n of naoLidas) conhecidosRef.current.add(n.id);
      return;
    }

    const agora = Date.now();
    const novos = naoLidas.filter((n) => {
      if (conhecidosRef.current.has(n.id) || tocadosRef.current.has(n.id)) {
        return false;
      }
      const criado = new Date(n.criadoEm).getTime();
      return Number.isFinite(criado) && agora - criado <= JANELA_NOVIDADE_MS;
    });

    for (const n of naoLidas) conhecidosRef.current.add(n.id);

    if (novos.length > 0) {
      for (const n of novos) tocadosRef.current.add(n.id);
      tocarSomNotificacao();
    }
  }, [itens, lidas]);
}
