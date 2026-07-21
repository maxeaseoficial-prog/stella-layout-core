import type { ClienteArquivo } from "@/features/clientes";

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
  /** Snapshot do valor unitário do adicional (somado ao produto). */
  valor: number;
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
  | "aguardando_orcamento_matriz"
  | "orcamento_matriz_realizado"
  | "aguardando_aprovacao"
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
  | "cancelamento";

export interface HistoricoEntrada {
  id: string;
  data: string; // ISO timestamp
  tipo: OrigemHistorico;
  descricao: string;
  usuario?: string;
}

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
  previsaoEntrega?: string; // ISO date
  observacoes?: string;
  pagamentos: Pagamento[];
  historico: HistoricoEntrada[];
  criadoEm: string;
  atualizadoEm: string;
}

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
> & {
  statusProducao?: StatusProducao;
  statusFinanceiro?: StatusFinanceiro;
};

export const LABEL_STATUS_PRODUCAO: Record<StatusProducao, string> = {
  em_orcamento: "Em orçamento",
  aguardando_orcamento_matriz: "Aguardando orçamento matriz",
  aguardando_aprovacao: "Aguardando aprovação",
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
  "aguardando_orcamento_matriz",
  "aguardando_aprovacao",
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
