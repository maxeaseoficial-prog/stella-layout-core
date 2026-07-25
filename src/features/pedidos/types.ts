import type { ClienteArquivo } from "@/features/clientes";
import type { PendenciaAdicional } from "@/features/adicionais/types";

export type { PendenciaAdicional };

export type TipoPersonalizacao =
  | "bordado"
  | "estampa"
  | "silk"
  | "sublimacao"
  | "outro";

export type PosicaoPersonalizacao =
  | "peito_esquerdo"
  | "peito_direito"
  | "manga"
  | "costas"
  | "bone"
  | "outro";

export interface Personalizacao {
  id: string;
  tipo: TipoPersonalizacao;
  posicao: PosicaoPersonalizacao;
  medidas?: string;
  observacoes?: string;
}

export interface ItemAdicional {
  /** ID da instância dentro do item de pedido. */
  id: string;
  /** ID do adicional no catálogo (undefined em pedidos legados). */
  adicionalId?: string;
  /** Snapshot do nome do adicional no momento do pedido. */
  nome: string;
  /** Snapshot do valor do adicional. Por padrão somado por unidade do produto. */
  valor: number;
  /**
   * Quando definido, o adicional entra no pedido sem valor calculado e o
   * pedido fica marcado como "orçamento pendente" até que o valor seja
   * informado na seção "Orçamentos Pendentes".
   */
  pendencia?: PendenciaAdicional;
  /**
   * Quando true, o valor é cobrado uma única vez por item (não multiplica
   * pela quantidade). Usado em custos avulsos como matriz de bordado /
   * estampa — adicionais originados de uma pendência são únicos por padrão.
   */
  unico?: boolean;
}

export interface ItemPedido {
  id: string;
  /** ID do produto no catálogo (undefined em pedidos legados). */
  produtoId?: string;
  /** Snapshot do nome do produto no momento do pedido. */
  produto: string;
  quantidade: number;
  valorUnitario: number;
  personalizacoes: Personalizacao[];
  /** Adicionais aplicados ao item (opcional em pedidos legados). */
  adicionais?: ItemAdicional[];
  /**
   * Arquivos (logos, matrizes, artes) vinculados especificamente a este
   * produto. Substitui o antigo `pedido.arquivos` — os PDFs de Produção e
   * Orçamento passam a exibir somente os arquivos do próprio item.
   */
  arquivos?: ClienteArquivo[];
  /** Observações específicas deste produto no pedido. */
  observacoes?: string;
}


export type FormaPagamentoPedido =
  | "pix"
  | "dinheiro"
  | "cartao_credito"
  | "cartao_debito"
  | "transferencia"
  | "boleto";

export interface Pagamento {
  id: string;
  valor: number;
  forma: FormaPagamentoPedido;
  data: string; // ISO date
  observacoes?: string;
  criadoEm: string;
}

export type StatusProducao =
  | "em_orcamento"
  | "pendente_orcamento"
  | "pendente_orcamento_estampa"
  | "pendente_orcamento_matriz"
  | "aguardando_orcamento_matriz"
  | "orcamento_matriz_realizado"
  | "aguardando_aprovacao"
  | "orcamento_aprovado"
  | "producao_matriz"
  | "matriz_concluida"
  | "producao"
  | "bordado"
  | "costura"
  | "finalizado"
  | "entregue"
  | "cancelado";

export type StatusFinanceiro =
  | "aguardando_pagamento"
  | "parcialmente_pago"
  | "pago"
  | "cancelado";

export type OrigemHistorico =
  | "criacao"
  | "edicao"
  | "status_producao"
  | "status_financeiro"
  | "pagamento"
  | "orcamento_pendente"
  | "envio_orcamento"
  | "ordem_producao"
  | "cancelamento";


export interface HistoricoEntrada {
  id: string;
  data: string; // ISO timestamp
  tipo: OrigemHistorico;
  descricao: string;
  usuario?: string;
}

export type EtapaKanban =
  | "em_elaboracao"
  | "pendencias_orcamento"
  | "aguardando_aprovacao"
  | "em_producao"
  | "finalizado"
  | "entregue";

export type PedidoBadge =
  | "prioridade_alta"
  | "retirada"
  | "transportadora"
  | "nota_fiscal";

export interface Pedido {
  id: string;
  numero: string; // PED-2026-000001
  clienteId: string;
  itens: ItemPedido[];
  arquivos: ClienteArquivo[];
  subtotal: number;
  desconto: number;
  frete: number;
  total: number;
  totalPago: number;
  statusProducao: StatusProducao;
  statusFinanceiro: StatusFinanceiro;
  /** Coluna atual do Kanban. Derivada automaticamente por ações. */
  etapa: EtapaKanban;
  /** Badges livres (nota fiscal, prioridade, retirada, etc.). */
  badges?: PedidoBadge[];
  previsaoEntrega?: string; // ISO date
  observacoes?: string;
  pagamentos: Pagamento[];
  historico: HistoricoEntrada[];
  criadoEm: string;
  atualizadoEm: string;
}

export const ETAPAS_KANBAN: EtapaKanban[] = [
  "em_elaboracao",
  "pendencias_orcamento",
  "aguardando_aprovacao",
  "em_producao",
  "finalizado",
  "entregue",
];

export const LABEL_ETAPA_KANBAN: Record<EtapaKanban, string> = {
  em_elaboracao: "Em Elaboração",
  pendencias_orcamento: "Pendências de Orçamento",
  aguardando_aprovacao: "Aguardando Aprovação",
  em_producao: "Em Produção",
  finalizado: "Finalizado",
  entregue: "Entregue",
};

export const ICONE_ETAPA_KANBAN: Record<EtapaKanban, string> = {
  em_elaboracao: "✏️",
  pendencias_orcamento: "🟠",
  aguardando_aprovacao: "🟡",
  em_producao: "🔵",
  finalizado: "🟢",
  entregue: "⚫",
};

export const LABEL_BADGE: Record<PedidoBadge, string> = {
  prioridade_alta: "Prioridade Alta",
  retirada: "Retirada",
  transportadora: "Transportadora",
  nota_fiscal: "Nota Fiscal",
};

export type PedidoInput = Omit<
  Pedido,
  | "id"
  | "numero"
  | "subtotal"
  | "total"
  | "totalPago"
  | "pagamentos"
  | "historico"
  | "criadoEm"
  | "atualizadoEm"
  | "statusProducao"
  | "statusFinanceiro"
  | "etapa"
> & {
  statusProducao?: StatusProducao;
  statusFinanceiro?: StatusFinanceiro;
  etapa?: EtapaKanban;
};

export const LABEL_STATUS_PRODUCAO: Record<StatusProducao, string> = {
  em_orcamento: "Em orçamento",
  pendente_orcamento: "Pendente de Orçamento",
  pendente_orcamento_estampa: "Pendente de Orçamento de Estampa",
  pendente_orcamento_matriz: "Pendente de Orçamento de Matriz",
  aguardando_orcamento_matriz: "Aguardando orçamento da matriz",
  orcamento_matriz_realizado: "Orçamento da matriz realizado",
  aguardando_aprovacao: "Aguardando aprovação",
  orcamento_aprovado: "Orçamento aprovado",
  producao_matriz: "Produção da matriz",
  matriz_concluida: "Matriz concluída",
  producao: "Em produção",
  bordado: "Bordado",
  costura: "Costura",
  finalizado: "Finalizado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const LABEL_STATUS_FINANCEIRO: Record<StatusFinanceiro, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  parcialmente_pago: "Parcialmente pago",
  pago: "Pago",
  cancelado: "Cancelado",
};

export const LABEL_TIPO_PERSONALIZACAO: Record<TipoPersonalizacao, string> = {
  bordado: "Bordado",
  estampa: "Estampa",
  silk: "Silk",
  sublimacao: "Sublimação",
  outro: "Outro",
};

export const LABEL_POSICAO_PERSONALIZACAO: Record<PosicaoPersonalizacao, string> = {
  peito_esquerdo: "Peito esquerdo",
  peito_direito: "Peito direito",
  manga: "Manga",
  costas: "Costas",
  bone: "Boné",
  outro: "Outro",
};

export const LABEL_FORMA_PAGAMENTO_PEDIDO: Record<FormaPagamentoPedido, string> = {
  pix: "PIX",
  dinheiro: "Dinheiro",
  cartao_credito: "Cartão Crédito",
  cartao_debito: "Cartão Débito",
  transferencia: "Transferência",
  boleto: "Boleto",
};

export const STATUS_PRODUCAO_LISTA: StatusProducao[] = [
  "em_orcamento",
  "pendente_orcamento",
  "pendente_orcamento_estampa",
  "pendente_orcamento_matriz",
  "aguardando_orcamento_matriz",
  "orcamento_matriz_realizado",
  "aguardando_aprovacao",
  "orcamento_aprovado",
  "producao_matriz",
  "matriz_concluida",
  "producao",
  "bordado",
  "costura",
  "finalizado",
  "entregue",
  "cancelado",
];

export const STATUS_FINANCEIRO_LISTA: StatusFinanceiro[] = [
  "aguardando_pagamento",
  "parcialmente_pago",
  "pago",
  "cancelado",
];

export const FORMAS_PAGAMENTO_PEDIDO: FormaPagamentoPedido[] = [
  "pix",
  "dinheiro",
  "cartao_credito",
  "cartao_debito",
  "transferencia",
  "boleto",
];

export const TIPOS_PERSONALIZACAO: TipoPersonalizacao[] = [
  "bordado",
  "estampa",
  "silk",
  "sublimacao",
  "outro",
];

export const POSICOES_PERSONALIZACAO: PosicaoPersonalizacao[] = [
  "peito_esquerdo",
  "peito_direito",
  "manga",
  "costas",
  "bone",
  "outro",
];
