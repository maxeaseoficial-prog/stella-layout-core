import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  FechamentoCaixa,
  Movimentacao,
  MovimentacaoInput,
} from "./types";
import {
  CAIXA_EVENT,
  carregarFechamentos,
  carregarMovimentacoes,
  notificarCaixaAtualizado,
  salvarFechamentos,
  salvarMovimentacoes,
} from "./storage";
import { hojeISO, novoId } from "./utils";

export function useCaixa() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [fechamentos, setFechamentos] = useState<FechamentoCaixa[]>([]);
  const [hidratado, setHidratado] = useState(false);

  /** Espelho síncrono do estado — evita ler valores obsoletos em mutações. */
  const movRef = useRef<Movimentacao[]>([]);
  const fecRef = useRef<FechamentoCaixa[]>([]);

  const aplicarMovimentacoes = useCallback((lista: Movimentacao[]) => {
    movRef.current = lista;
    setMovimentacoes(lista);
  }, []);

  const aplicarFechamentos = useCallback((lista: FechamentoCaixa[]) => {
    fecRef.current = lista;
    setFechamentos(lista);
  }, []);

  useEffect(() => {
    aplicarMovimentacoes(carregarMovimentacoes());
    aplicarFechamentos(carregarFechamentos());
    setHidratado(true);

    function onUpdate() {
      aplicarMovimentacoes(carregarMovimentacoes());
      aplicarFechamentos(carregarFechamentos());
    }
    window.addEventListener(CAIXA_EVENT, onUpdate);
    return () => window.removeEventListener(CAIXA_EVENT, onUpdate);
  }, [aplicarMovimentacoes, aplicarFechamentos]);

  /**
   * Regra única de escrita: PERSISTE primeiro, depois atualiza o estado
   * React e só então notifica os demais componentes. Assim o listener
   * do CAIXA_EVENT nunca recarrega dados antigos do storage.
   */
  const commitMovimentacoes = useCallback(
    (proximas: Movimentacao[]): boolean => {
      const ok = salvarMovimentacoes(proximas);
      if (!ok) return false;
      aplicarMovimentacoes(proximas);
      notificarCaixaAtualizado();
      return true;
    },
    [aplicarMovimentacoes],
  );

  const criar = useCallback(
    (entrada: MovimentacaoInput): Movimentacao | null => {
      const agora = new Date().toISOString();
      const nova: Movimentacao = {
        ...entrada,
        id: novoId(),
        criadoEm: agora,
        atualizadoEm: agora,
      };
      const ok = commitMovimentacoes([nova, ...movRef.current]);
      return ok ? nova : null;
    },
    [commitMovimentacoes],
  );

  const atualizar = useCallback(
    (id: string, entrada: MovimentacaoInput): boolean =>
      commitMovimentacoes(
        movRef.current.map((m) =>
          m.id === id
            ? {
                ...entrada,
                id: m.id,
                criadoEm: m.criadoEm,
                atualizadoEm: new Date().toISOString(),
              }
            : m,
        ),
      ),
    [commitMovimentacoes],
  );

  const excluir = useCallback(
    (id: string): boolean =>
      commitMovimentacoes(movRef.current.filter((m) => m.id !== id)),
    [commitMovimentacoes],
  );

  /** Exclusão em massa: uma única gravação, um único evento. */
  const excluirVarios = useCallback(
    (ids: string[] | Set<string>): boolean => {
      const idsSet = ids instanceof Set ? ids : new Set(ids);
      if (idsSet.size === 0) return true;
      return commitMovimentacoes(
        movRef.current.filter((m) => !idsSet.has(m.id)),
      );
    },
    [commitMovimentacoes],
  );

  const fecharDia = useCallback(
    (opts?: { data?: string; saldoInicial?: number }) => {
      const dia = opts?.data ?? hojeISO();
      const saldoInicial = opts?.saldoInicial ?? 0;
      const doDia = movRef.current.filter(
        (m) => m.data === dia && m.status !== "cancelada",
      );
      const entradas = doDia
        .filter((m) => m.tipo === "entrada")
        .reduce((s, m) => s + m.valor, 0);
      const saidas = doDia
        .filter((m) => m.tipo === "saida")
        .reduce((s, m) => s + m.valor, 0);
      const fechamento: FechamentoCaixa = {
        id: novoId(),
        data: dia,
        saldoInicial,
        entradas,
        saidas,
        saldoFinal: saldoInicial + entradas - saidas,
        totalMovimentacoes: doDia.length,
        fechadoEm: new Date().toISOString(),
      };
      const proximos = [fechamento, ...fecRef.current];
      if (salvarFechamentos(proximos)) {
        aplicarFechamentos(proximos);
        notificarCaixaAtualizado();
      }
      return fechamento;
    },
    [aplicarFechamentos],
  );

  const totais = useMemo(() => {
    const ativas = movimentacoes.filter((m) => m.status !== "cancelada");
    const entradas = ativas
      .filter((m) => m.tipo === "entrada")
      .reduce((s, m) => s + m.valor, 0);
    const saidas = ativas
      .filter((m) => m.tipo === "saida")
      .reduce((s, m) => s + m.valor, 0);
    return {
      entradas,
      saidas,
      saldo: entradas - saidas,
      resultado: entradas - saidas,
    };
  }, [movimentacoes]);

  return {
    movimentacoes,
    fechamentos,
    hidratado,
    totais,
    criar,
    atualizar,
    excluir,
    excluirVarios,
    fecharDia,
  };
}
