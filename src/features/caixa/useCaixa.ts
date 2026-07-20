import { useCallback, useEffect, useMemo, useState } from "react";

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

  useEffect(() => {
    setMovimentacoes(carregarMovimentacoes());
    setFechamentos(carregarFechamentos());
    setHidratado(true);

    function onUpdate() {
      setMovimentacoes(carregarMovimentacoes());
      setFechamentos(carregarFechamentos());
    }
    window.addEventListener(CAIXA_EVENT, onUpdate);
    return () => window.removeEventListener(CAIXA_EVENT, onUpdate);
  }, []);

  useEffect(() => {
    if (hidratado) salvarMovimentacoes(movimentacoes);
  }, [movimentacoes, hidratado]);

  useEffect(() => {
    if (hidratado) salvarFechamentos(fechamentos);
  }, [fechamentos, hidratado]);

  const criar = useCallback((entrada: MovimentacaoInput): Movimentacao => {
    const agora = new Date().toISOString();
    const nova: Movimentacao = {
      ...entrada,
      id: novoId(),
      criadoEm: agora,
      atualizadoEm: agora,
    };
    setMovimentacoes((atual) => [nova, ...atual]);
    notificarCaixaAtualizado();
    return nova;
  }, []);

  const atualizar = useCallback((id: string, entrada: MovimentacaoInput) => {
    setMovimentacoes((atual) =>
      atual.map((m) =>
        m.id === id
          ? {
              ...entrada,
              id: m.id,
              criadoEm: m.criadoEm,
              atualizadoEm: new Date().toISOString(),
            }
          : m,
      ),
    );
    notificarCaixaAtualizado();
  }, []);

  const excluir = useCallback((id: string) => {
    setMovimentacoes((atual) => atual.filter((m) => m.id !== id));
    notificarCaixaAtualizado();
  }, []);

  const fecharDia = useCallback(
    (opts?: { data?: string; saldoInicial?: number }) => {
      const dia = opts?.data ?? hojeISO();
      const saldoInicial = opts?.saldoInicial ?? 0;
      const doDia = movimentacoes.filter(
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
      setFechamentos((atual) => [fechamento, ...atual]);
      notificarCaixaAtualizado();
      return fechamento;
    },
    [movimentacoes],
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
    fecharDia,
  };
}
