import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  HistoricoEntrada,
  Pagamento,
  Pedido,
  PedidoInput,
  StatusProducao,
} from "./types";
import {
  carregarPedidos,
  notificarPedidosAtualizado,
  PEDIDOS_EVENT,
  salvarPedidos,
} from "./storage";
import {
  calcularSubtotal,
  calcularTotal,
  gerarNumeroPedido,
  novoId,
  statusFinanceiroCalculado,
  statusProducaoInicial,
} from "./utils";

function novaEntradaHistorico(
  tipo: HistoricoEntrada["tipo"],
  descricao: string,
): HistoricoEntrada {
  return {
    id: novoId(),
    data: new Date().toISOString(),
    tipo,
    descricao,
  };
}

export function usePedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    setPedidos(carregarPedidos());
    setHidratado(true);
    function onUpdate() {
      setPedidos(carregarPedidos());
    }
    window.addEventListener(PEDIDOS_EVENT, onUpdate);
    return () => window.removeEventListener(PEDIDOS_EVENT, onUpdate);
  }, []);

  useEffect(() => {
    if (hidratado) salvarPedidos(pedidos);
  }, [pedidos, hidratado]);

  const criar = useCallback((entrada: PedidoInput): Pedido => {
    const agora = new Date().toISOString();
    const subtotal = calcularSubtotal(entrada.itens);
    const total = calcularTotal(subtotal, entrada.desconto, entrada.frete);
    const statusProducao =
      entrada.statusProducao ?? statusProducaoInicial(entrada.itens);
    const novo: Pedido = {
      id: novoId(),
      numero: gerarNumeroPedido(),
      clienteId: entrada.clienteId,
      itens: entrada.itens,
      arquivos: entrada.arquivos,
      subtotal,
      desconto: entrada.desconto,
      frete: entrada.frete,
      total,
      totalPago: 0,
      statusProducao,
      statusFinanceiro: entrada.statusFinanceiro ?? "aguardando_pagamento",
      previsaoEntrega: entrada.previsaoEntrega,
      observacoes: entrada.observacoes,
      pagamentos: [],
      historico: [
        novaEntradaHistorico(
          "criacao",
          `Pedido criado com ${entrada.itens.length} item(ns).`,
        ),
      ],
      criadoEm: agora,
      atualizadoEm: agora,
    };
    setPedidos((atual) => [novo, ...atual]);
    notificarPedidosAtualizado();
    return novo;
  }, []);

  const atualizar = useCallback((id: string, entrada: PedidoInput) => {
    setPedidos((atual) =>
      atual.map((p) => {
        if (p.id !== id) return p;
        const subtotal = calcularSubtotal(entrada.itens);
        const total = calcularTotal(subtotal, entrada.desconto, entrada.frete);
        const statusFinanceiro = statusFinanceiroCalculado(
          total,
          p.totalPago,
          p.statusFinanceiro === "cancelado",
        );
        return {
          ...p,
          clienteId: entrada.clienteId,
          itens: entrada.itens,
          arquivos: entrada.arquivos,
          subtotal,
          desconto: entrada.desconto,
          frete: entrada.frete,
          total,
          statusFinanceiro,
          previsaoEntrega: entrada.previsaoEntrega,
          observacoes: entrada.observacoes,
          atualizadoEm: new Date().toISOString(),
          historico: [
            novaEntradaHistorico("edicao", "Pedido editado."),
            ...p.historico,
          ],
        };
      }),
    );
    notificarPedidosAtualizado();
  }, []);

  const excluir = useCallback((id: string) => {
    setPedidos((atual) => atual.filter((p) => p.id !== id));
    notificarPedidosAtualizado();
  }, []);

  const alterarStatusProducao = useCallback(
    (id: string, status: StatusProducao) => {
      setPedidos((atual) =>
        atual.map((p) =>
          p.id === id
            ? {
                ...p,
                statusProducao: status,
                atualizadoEm: new Date().toISOString(),
                historico: [
                  novaEntradaHistorico(
                    "status_producao",
                    `Status de produção alterado para ${status}.`,
                  ),
                  ...p.historico,
                ],
              }
            : p,
        ),
      );
      notificarPedidosAtualizado();
    },
    [],
  );

  const registrarPagamento = useCallback(
    (id: string, dados: Omit<Pagamento, "id" | "criadoEm">) => {
      setPedidos((atual) =>
        atual.map((p) => {
          if (p.id !== id) return p;
          const pagamento: Pagamento = {
            ...dados,
            id: novoId(),
            criadoEm: new Date().toISOString(),
          };
          const totalPago = p.totalPago + pagamento.valor;
          const statusFinanceiro = statusFinanceiroCalculado(
            p.total,
            totalPago,
            p.statusFinanceiro === "cancelado",
          );
          return {
            ...p,
            totalPago,
            pagamentos: [pagamento, ...p.pagamentos],
            statusFinanceiro,
            atualizadoEm: new Date().toISOString(),
            historico: [
              novaEntradaHistorico(
                "pagamento",
                `Pagamento de R$ ${pagamento.valor
                  .toFixed(2)
                  .replace(".", ",")} recebido via ${pagamento.forma}.`,
              ),
              ...p.historico,
            ],
          };
        }),
      );
      notificarPedidosAtualizado();

      // ARQUITETURA — integração futura com o Caixa:
      // Quando statusFinanceiro passar para "pago", gerar automaticamente
      // uma movimentação de entrada no módulo Caixa referenciando o pedidoId.
      // A estrutura já está preparada em Movimentacao.origem = "pedido"
      // e Movimentacao.referenciaId = pedido.id.
    },
    [],
  );

  const cancelar = useCallback((id: string) => {
    setPedidos((atual) =>
      atual.map((p) =>
        p.id === id
          ? {
              ...p,
              statusProducao: "cancelado",
              statusFinanceiro: "cancelado",
              atualizadoEm: new Date().toISOString(),
              historico: [
                novaEntradaHistorico("cancelamento", "Pedido cancelado."),
                ...p.historico,
              ],
            }
          : p,
      ),
    );
    notificarPedidosAtualizado();
  }, []);

  const buscarPorId = useCallback(
    (id: string) => pedidos.find((p) => p.id === id),
    [pedidos],
  );

  const totais = useMemo(() => {
    const ativos = pedidos.filter((p) => p.statusFinanceiro !== "cancelado");
    return {
      totalPedidos: pedidos.length,
      pendentes: ativos.filter((p) =>
        ["em_orcamento", "aguardando_orcamento_matriz", "aguardando_aprovacao"].includes(
          p.statusProducao,
        ),
      ).length,
      producao: ativos.filter((p) =>
        ["producao", "bordado", "costura"].includes(p.statusProducao),
      ).length,
      entregues: ativos.filter((p) => p.statusProducao === "entregue").length,
      pagos: ativos.filter((p) => p.statusFinanceiro === "pago").length,
      faturamento: ativos.reduce((s, p) => s + p.total, 0),
      recebido: ativos.reduce((s, p) => s + p.totalPago, 0),
    };
  }, [pedidos]);

  return {
    pedidos,
    hidratado,
    totais,
    criar,
    atualizar,
    excluir,
    alterarStatusProducao,
    registrarPagamento,
    cancelar,
    buscarPorId,
  };
}
