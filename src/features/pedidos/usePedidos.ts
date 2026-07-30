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
  migrarPagamentosParaCaixa,
  registrarEntradaPedido,
} from "@/features/caixa/integracaoPedidos";

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
    function recarregar() {
      const lista = carregarPedidos();
      setPedidos(lista);
      // Garante que todo recebimento registrado (inclusive parcial e os
      // lançados antes desta integração) tenha uma entrada no Caixa.
      migrarPagamentosParaCaixa(lista);
    }
    recarregar();
    setHidratado(true);
    window.addEventListener(PEDIDOS_EVENT, recarregar);
    return () => window.removeEventListener(PEDIDOS_EVENT, recarregar);
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
        // Editar um pedido: se houver pendências, volta para o status agregado
        // de pendência; caso contrário fica em "Aguardando Aprovação"
        // (orçamento pronto). Preserva estados finais/cancelado.
        const preservar =
          p.statusFinanceiro === "cancelado" ||
          p.statusProducao === "finalizado" ||
          p.statusProducao === "entregue";
        const statusProducao = preservar
          ? p.statusProducao
          : pendenciaStatus ?? "aguardando_aprovacao";
        const atualizado: Pedido = {
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
        atualizado.etapa = calcularEtapa(atualizado);
        return atualizado;
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
          // Enquanto houver pendências, mantém o status agregado (pendente_*).
          // Quando a última pendência é resolvida, o pedido avança direto para
          // "Aguardando Aprovação" — só sai dessa etapa quando o usuário
          // clicar em "Aprovar Pedido".
          const statusProducao =
            p.statusFinanceiro === "cancelado"
              ? p.statusProducao
              : restante ?? "aguardando_aprovacao";

          const valorFmt = valor.toFixed(2).replace(".", ",");
          const atualizado: Pedido = {
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
          atualizado.etapa = calcularEtapa(atualizado);
          return atualizado;
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
          const atualizado: Pedido = {
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
          atualizado.etapa = calcularEtapa(atualizado);
          return atualizado;
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
        const atualizado: Pedido = {
          ...p,
          statusProducao: "orcamento_aprovado",
          atualizadoEm: new Date().toISOString(),
          historico: [
            novaEntradaHistorico("status_producao", "Pedido aprovado."),
            ...p.historico,
          ],
        };
        atualizado.etapa = calcularEtapa(atualizado);
        return atualizado;
      }),
    );
  }, []);

  const finalizarProducao = useCallback((id: string) => {
    commit(setPedidos, (atual) =>
      atual.map((p) => {
        if (p.id !== id) return p;
        const atualizado: Pedido = {
          ...p,
          statusProducao: "finalizado",
          atualizadoEm: new Date().toISOString(),
          historico: [
            novaEntradaHistorico("status_producao", "Produção finalizada."),
            ...p.historico,
          ],
        };
        atualizado.etapa = calcularEtapa(atualizado);
        return atualizado;
      }),
    );
  }, []);

  const marcarEntregue = useCallback((id: string) => {
    commit(setPedidos, (atual) =>
      atual.map((p) => {
        if (p.id !== id) return p;
        const atualizado: Pedido = {
          ...p,
          statusProducao: "entregue",
          atualizadoEm: new Date().toISOString(),
          historico: [
            novaEntradaHistorico("status_producao", "Pedido marcado como entregue."),
            ...p.historico,
          ],
        };
        atualizado.etapa = calcularEtapa(atualizado);
        return atualizado;
      }),
    );
  }, []);

  const registrarPagamento = useCallback(
    (id: string, dados: Omit<Pagamento, "id" | "criadoEm">) => {
      // Criado fora do updater para o ID ser estável (StrictMode pode
      // reexecutar o updater) e reutilizável na entrada do Caixa.
      const pagamento: Pagamento = {
        ...dados,
        id: novoId(),
        criadoEm: new Date().toISOString(),
      };
      let numeroPedido: string | undefined;
      commit(setPedidos, (atual) =>
        atual.map((p) => {
          if (p.id !== id) return p;
          numeroPedido = p.numero;
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

      // Integração com o Caixa: todo recebimento (parcial ou total) vira
      // uma movimentação de ENTRADA vinculada ao pedido.
      if (numeroPedido) {
        registrarEntradaPedido({
          pedidoId: id,
          pedidoNumero: numeroPedido,
          pagamentoId: pagamento.id,
          valor: pagamento.valor,
          forma: pagamento.forma,
          data: pagamento.data,
          observacoes: pagamento.observacoes,
        });
      }
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
        atual.map((p) => {
          if (p.id !== id) return p;
          // Envio do orçamento move automaticamente para "aguardando aprovação"
          // quando não há mais pendências e o pedido ainda não avançou.
          const semPendencias = pendenciasDoPedido(p.itens).length === 0;
          const podeAvancar =
            semPendencias &&
            p.statusFinanceiro !== "cancelado" &&
            (p.statusProducao === "em_orcamento" ||
              p.statusProducao === "aguardando_orcamento_matriz" ||
              p.statusProducao === "orcamento_matriz_realizado");
          const atualizado: Pedido = {
            ...p,
            statusProducao: podeAvancar ? "aguardando_aprovacao" : p.statusProducao,
            atualizadoEm: new Date().toISOString(),
            historico: [
              novaEntradaHistorico(
                "envio_orcamento",
                `Orçamento enviado via WhatsApp (${dados.numeroWhatsapp}) — arquivo: ${dados.nomeArquivo}.`,
              ),
              ...p.historico,
            ],
          };
          atualizado.etapa = calcularEtapa(atualizado);
          return atualizado;
        }),
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
    const porEtapa = {
      em_elaboracao: 0,
      pendencias_orcamento: 0,
      aguardando_aprovacao: 0,
      em_producao: 0,
      finalizado: 0,
      entregue: 0,
    };
    for (const p of ativos) porEtapa[p.etapa] = (porEtapa[p.etapa] ?? 0) + 1;
    return {
      totalPedidos: pedidos.length,
      porEtapa,
      pendentes: porEtapa.em_elaboracao + porEtapa.pendencias_orcamento + porEtapa.aguardando_aprovacao,
      producao: porEtapa.em_producao,
      finalizados: porEtapa.finalizado,
      entregues: porEtapa.entregue,
      emAberto: ativos.filter((p) => p.statusFinanceiro === "aguardando_pagamento").length,
      parcialmentePagos: ativos.filter((p) => p.statusFinanceiro === "parcialmente_pago").length,
      pagos: ativos.filter((p) => p.statusFinanceiro === "pago").length,
      faturamento: ativos.reduce((s, p) => s + p.total, 0),
      recebido: ativos.reduce((s, p) => s + p.totalPago, 0),
      saldoReceber: ativos.reduce(
        (s, p) => s + Math.max(0, p.total - p.totalPago),
        0,
      ),
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
    finalizarProducao,
    marcarEntregue,
    registrarPagamento,
    registrarEnvioOrcamento,
    registrarOrdemProducao,
    cancelar,
    buscarPorId,
  };
}

