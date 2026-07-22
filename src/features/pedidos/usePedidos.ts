import { useCallback, useEffect, useMemo, useState } from "react";

import { usuarioAtual } from "@/features/auth/useAuth";

import type {
  HistoricoEntrada,
  Pagamento,
  Pedido,
  PedidoInput,
  StatusProducao,
} from "./types";
import { LABEL_STATUS_PRODUCAO } from "./types";
import {
  carregarPedidos,
  notificarPedidosAtualizado,
  PEDIDOS_EVENT,
  salvarPedidos,
} from "./storage";
import {
  calcularEtapa,
  calcularSubtotal,
  calcularTotal,
  gerarNumeroPedido,
  novoId,
  pendenciasDoPedido,
  statusFinanceiroCalculado,
  statusPendenciaAgregado,
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
    usuario: usuarioAtual()?.nome,
  };
}

/**
 * Persiste imediatamente no localStorage e notifica os demais consumidores.
 * IMPORTANTE: salvar precisa acontecer ANTES do dispatch do evento, senão
 * outros hooks (ou o próprio) recarregam a versão antiga do storage e
 * sobrescrevem a mutação em andamento.
 */
function commit(
  setPedidos: React.Dispatch<React.SetStateAction<Pedido[]>>,
  updater: (atual: Pedido[]) => Pedido[],
) {
  setPedidos((atual) => {
    const proximo = updater(atual);
    salvarPedidos(proximo);
    notificarPedidosAtualizado();
    return proximo;
  });
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
      etapa: "em_elaboracao",
      badges: entrada.badges,
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
    novo.etapa = calcularEtapa(novo);
    commit(setPedidos, (atual) => [novo, ...atual]);
    return novo;
  }, []);

  const atualizar = useCallback((id: string, entrada: PedidoInput) => {
    commit(setPedidos, (atual) =>
      atual.map((p) => {
        if (p.id !== id) return p;
        const subtotal = calcularSubtotal(entrada.itens);
        const total = calcularTotal(subtotal, entrada.desconto, entrada.frete);
        const statusFinanceiro = statusFinanceiroCalculado(
          total,
          p.totalPago,
          p.statusFinanceiro === "cancelado",
        );
        // Recalcula status de pendência de orçamento conforme os adicionais atuais.
        const pendenciaStatus = statusPendenciaAgregado(
          pendenciasDoPedido(entrada.itens),
        );
        const statusProducao =
          p.statusFinanceiro === "cancelado"
            ? p.statusProducao
            : pendenciaStatus ?? p.statusProducao;
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
          statusProducao,
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
  }, []);

  /**
   * Preenche o valor de um adicional que estava pendente de orçamento.
   * Se após o preenchimento não houver mais pendências, o status do pedido
   * passa automaticamente para "aguardando_aprovacao".
   */
  const atualizarOrcamentoPendente = useCallback(
    (pedidoId: string, itemId: string, adicionalItemId: string, valor: number) => {
      commit(setPedidos, (atual) =>
        atual.map((p) => {
          if (p.id !== pedidoId) return p;
          let nomeAdicional = "";
          const itens = p.itens.map((it) => {
            if (it.id !== itemId) return it;
            const adicionais = (it.adicionais ?? []).map((a) => {
              if (a.id !== adicionalItemId) return a;
              nomeAdicional = a.nome;
              return { ...a, valor, pendencia: undefined };
            });
            return { ...it, adicionais };
          });
          const subtotal = calcularSubtotal(itens);
          const total = calcularTotal(subtotal, p.desconto, p.frete);
          const statusFinanceiro = statusFinanceiroCalculado(
            total,
            p.totalPago,
            p.statusFinanceiro === "cancelado",
          );
          const restante = statusPendenciaAgregado(pendenciasDoPedido(itens));
          const statusProducao =
            p.statusFinanceiro === "cancelado"
              ? p.statusProducao
              : restante ?? "aguardando_aprovacao";
          const valorFmt = valor.toFixed(2).replace(".", ",");
          return {
            ...p,
            itens,
            subtotal,
            total,
            statusFinanceiro,
            statusProducao,
            atualizadoEm: new Date().toISOString(),
            historico: [
              novaEntradaHistorico(
                "orcamento_pendente",
                `Orçamento informado para "${nomeAdicional}": R$ ${valorFmt}.`,
              ),
              ...p.historico,
            ],
          };
        }),
      );
    },
    [],
  );


  const excluir = useCallback((id: string) => {
    commit(setPedidos, (atual) => atual.filter((p) => p.id !== id));
  }, []);

  const alterarStatusProducao = useCallback(
    (id: string, status: StatusProducao) => {
      commit(setPedidos, (atual) =>
        atual.map((p) => {
          if (p.id !== id) return p;
          return {
            ...p,
            statusProducao: status,
            atualizadoEm: new Date().toISOString(),
            historico: [
              novaEntradaHistorico(
                "status_producao",
                `Status alterado para "${LABEL_STATUS_PRODUCAO[status]}".`,
              ),
              ...p.historico,
            ],
          };
        }),
      );
    },
    [],
  );

  const aprovarPedido = useCallback((id: string) => {
    commit(setPedidos, (atual) =>
      atual.map((p) => {
        if (p.id !== id) return p;
        if (p.statusProducao !== "aguardando_aprovacao") return p;
        return {
          ...p,
          statusProducao: "orcamento_aprovado",
          atualizadoEm: new Date().toISOString(),
          historico: [
            novaEntradaHistorico("status_producao", "Pedido aprovado."),
            ...p.historico,
          ],
        };
      }),
    );
  }, []);

  const registrarPagamento = useCallback(
    (id: string, dados: Omit<Pagamento, "id" | "criadoEm">) => {
      commit(setPedidos, (atual) =>
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

      // ARQUITETURA — integração futura com o Caixa:
      // Quando statusFinanceiro passar para "pago", gerar automaticamente
      // uma movimentação de entrada no módulo Caixa referenciando o pedidoId.
    },
    [],
  );

  const cancelar = useCallback((id: string) => {
    commit(setPedidos, (atual) =>
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
  }, []);

  const registrarEnvioOrcamento = useCallback(
    (
      id: string,
      dados: { nomeArquivo: string; numeroWhatsapp: string },
    ) => {
      commit(setPedidos, (atual) =>
        atual.map((p) =>
          p.id === id
            ? {
                ...p,
                atualizadoEm: new Date().toISOString(),
                historico: [
                  novaEntradaHistorico(
                    "envio_orcamento",
                    `Orçamento enviado via WhatsApp (${dados.numeroWhatsapp}) — arquivo: ${dados.nomeArquivo}.`,
                  ),
                  ...p.historico,
                ],
              }
            : p,
        ),
      );
    },
    [],
  );

  const registrarOrdemProducao = useCallback(
    (id: string, dados: { nomeArquivo: string }) => {
      commit(setPedidos, (atual) =>
        atual.map((p) =>
          p.id === id
            ? {
                ...p,
                atualizadoEm: new Date().toISOString(),
                historico: [
                  novaEntradaHistorico(
                    "ordem_producao",
                    `Ordem de Produção gerada — arquivo: ${dados.nomeArquivo}.`,
                  ),
                  ...p.historico,
                ],
              }
            : p,
        ),
      );
    },
    [],
  );



  const buscarPorId = useCallback(
    (id: string) => pedidos.find((p) => p.id === id),
    [pedidos],
  );

  const totais = useMemo(() => {
    const ativos = pedidos.filter((p) => p.statusFinanceiro !== "cancelado");
    return {
      totalPedidos: pedidos.length,
      pendentes: ativos.filter((p) =>
        [
          "em_orcamento",
          "aguardando_orcamento_matriz",
          "orcamento_matriz_realizado",
          "aguardando_aprovacao",
        ].includes(p.statusProducao),
      ).length,
      producao: ativos.filter((p) =>
        ["producao_matriz", "producao", "bordado", "costura"].includes(
          p.statusProducao,
        ),
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
    atualizarOrcamentoPendente,
    excluir,
    alterarStatusProducao,
    aprovarPedido,
    registrarPagamento,
    registrarEnvioOrcamento,
    registrarOrdemProducao,
    cancelar,
    buscarPorId,
  };
}

