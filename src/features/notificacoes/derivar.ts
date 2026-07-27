import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  BadgeCheck,
  Cog,
  PackageMinus,
  PackagePlus,
} from "lucide-react";

import type { Papel } from "@/features/auth/permissions";
import type { ItemEstoque, MovimentacaoEstoque } from "@/features/estoque/types";
import { SIGLA_UNIDADE } from "@/features/estoque/types";
import type { Pedido } from "@/features/pedidos/types";
import { formatarMoeda, pendenciasDoPedido } from "@/features/pedidos/utils";
import type { Cliente } from "@/features/clientes/types";
import { getClienteNome } from "@/features/clientes/utils";

import type { Notificacao } from "./types";

interface Fontes {
  papel: Papel;
  itens: ItemEstoque[];
  movs: MovimentacaoEstoque[];
  pedidos: Pedido[];
  clientes: Cliente[];
  /** Timestamp de corte: só considera eventos criados depois disso. */
  desde?: string;
}

/** Limite máximo de movimentações listadas para não explodir a UI. */
const LIMITE_MOVIMENTACOES = 15;

function nomeCliente(clientes: Cliente[], id: string): string {
  const c = clientes.find((x) => x.id === id);
  return c ? getClienteNome(c) : "Cliente removido";
}

export function derivarNotificacoes(f: Fontes): Notificacao[] {
  const desde = f.desde ?? "";

  if (f.papel === "operador_matriz") {
    return derivarOperadorMatriz(f);
  }
  return derivarAdministrador(f, desde);
}

function derivarAdministrador(f: Fontes, desde: string): Notificacao[] {
  const lista: Notificacao[] = [];

  // Movimentações recentes de estoque (mais novas primeiro)
  const movsOrdenadas = [...f.movs]
    .filter((m) => !desde || m.criadoEm > desde)
    .sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1))
    .slice(0, LIMITE_MOVIMENTACOES);

  for (const m of movsOrdenadas) {
    const item = f.itens.find((i) => i.id === m.itemId);
    const nome = item?.nome ?? "Item removido";
    const unidade = item ? SIGLA_UNIDADE[item.unidade] : "un";
    const isEntrada = m.tipo === "entrada";
    lista.push({
      id: `mov:${m.id}`,
      papelAlvo: "administrador",
      tipo: "estoque_movimentacao",
      titulo: isEntrada ? "Entrada de estoque" : "Saída de estoque",
      descricao: `${nome} — ${m.quantidade} ${unidade}`,
      rota: "/estoque",
      criadoEm: m.criadoEm,
      icon: isEntrada ? PackagePlus : PackageMinus,
    });
  }

  // Estoque baixo / sem estoque
  for (const i of f.itens) {
    if (i.status !== "ativo") continue;
    if (i.quantidade <= 0) {
      lista.push({
        id: `estoque-sem:${i.id}`,
        papelAlvo: "administrador",
        tipo: "estoque_baixo",
        titulo: "Sem estoque",
        descricao: `${i.nome} está zerado.`,
        rota: "/estoque",
        criadoEm: i.atualizadoEm,
        icon: AlertTriangle,
      });
    } else if (i.quantidade <= i.estoqueMinimo && i.estoqueMinimo > 0) {
      lista.push({
        id: `estoque-baixo:${i.id}`,
        papelAlvo: "administrador",
        tipo: "estoque_baixo",
        titulo: "Estoque baixo",
        descricao: `${i.nome} está em ${i.quantidade} ${SIGLA_UNIDADE[i.unidade]} (mín. ${i.estoqueMinimo}).`,
        rota: "/estoque",
        criadoEm: i.atualizadoEm,
        icon: ArrowDownCircle,
      });
    } else if (
      typeof i.estoqueMaximo === "number" &&
      i.estoqueMaximo > 0 &&
      i.quantidade >= i.estoqueMaximo
    ) {
      lista.push({
        id: `estoque-alto:${i.id}`,
        papelAlvo: "administrador",
        tipo: "estoque_alto",
        titulo: "Estoque alto",
        descricao: `${i.nome} atingiu ${i.quantidade} ${SIGLA_UNIDADE[i.unidade]} (máx. ${i.estoqueMaximo}).`,
        rota: "/estoque",
        criadoEm: i.atualizadoEm,
        icon: ArrowUpCircle,
      });
    }
  }

  // Pedidos pagos e em produção
  for (const p of f.pedidos) {
    if (p.statusFinanceiro === "cancelado") continue;
    const cliente = nomeCliente(f.clientes, p.clienteId);

    if (p.statusFinanceiro === "pago") {
      lista.push({
        id: `pedido-pago:${p.id}`,
        papelAlvo: "administrador",
        tipo: "pedido_pago",
        titulo: `Pedido ${p.numero} pago`,
        descricao: `${cliente} — ${formatarMoeda(p.total)}`,
        rota: "/pedidos",
        search: { highlight: p.id },
        criadoEm: p.atualizadoEm ?? p.criadoEm,
        icon: BadgeCheck,
      });
    }
    if (p.etapa === "em_producao") {
      lista.push({
        id: `pedido-producao:${p.id}`,
        papelAlvo: "administrador",
        tipo: "pedido_em_producao",
        titulo: `Pedido ${p.numero} em produção`,
        descricao: `${cliente} — acompanhe o andamento.`,
        rota: "/pedidos",
        search: { highlight: p.id },
        criadoEm: p.atualizadoEm ?? p.criadoEm,
        icon: Cog,
      });
    }
  }

  return lista.sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));
}

function derivarOperadorMatriz(f: Fontes): Notificacao[] {
  const lista: Notificacao[] = [];

  for (const p of f.pedidos) {
    if (p.statusFinanceiro === "cancelado") continue;
    const pendencias = pendenciasDoPedido(p.itens);
    const temMatriz = pendencias.some((x) => x === "matriz" || x === "matriz_estampa");
    if (!temMatriz) continue;
    const cliente = nomeCliente(f.clientes, p.clienteId);
    lista.push({
      id: `pendencia-matriz:${p.id}`,
      papelAlvo: "operador_matriz",
      tipo: "pedido_pendente_orcamento_matriz",
      titulo: `Orçamento de matriz pendente`,
      descricao: `Pedido ${p.numero} — ${cliente}`,
      rota: "/pedidos",
      search: { highlight: "pendencias_matriz", pedido: p.id },
      criadoEm: p.atualizadoEm ?? p.criadoEm,
      icon: AlertTriangle,
    });
  }

  return lista.sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));
}
