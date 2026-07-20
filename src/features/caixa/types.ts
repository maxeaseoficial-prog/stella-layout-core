export type TipoMovimentacao = "entrada" | "saida";

export type FormaPagamento =
  | "dinheiro"
  | "pix"
  | "cartao_credito"
  | "cartao_debito"
  | "transferencia"
  | "boleto";

export type OrigemMovimentacao =
  | "manual"
  | "pedido"
  | "nota_fiscal"
  | "estoque"
  | "sistema";

export type StatusMovimentacao = "confirmada" | "pendente" | "cancelada";

export type CategoriaEntrada =
  | "venda"
  | "recebimento"
  | "adiantamento"
  | "outro";

export type CategoriaSaida =
  | "compra_material"
  | "fornecedor"
  | "energia"
  | "agua"
  | "internet"
  | "salarios"
  | "aluguel"
  | "transporte"
  | "manutencao"
  | "retirada"
  | "impostos"
  | "outros";

export type CategoriaMovimentacao = CategoriaEntrada | CategoriaSaida;

export interface Movimentacao {
  id: string;
  tipo: TipoMovimentacao;
  categoria: CategoriaMovimentacao;
  descricao: string;
  valor: number;
  formaPagamento: FormaPagamento;
  data: string; // ISO date (YYYY-MM-DD)
  observacoes?: string;
  origem: OrigemMovimentacao;
  status: StatusMovimentacao;
  /** Referência externa opcional para integrações futuras (pedidoId, nfId, etc.) */
  referenciaId?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export type MovimentacaoInput = Omit<
  Movimentacao,
  "id" | "criadoEm" | "atualizadoEm"
>;

export interface FechamentoCaixa {
  id: string;
  data: string; // ISO date do dia fechado
  saldoInicial: number;
  entradas: number;
  saidas: number;
  saldoFinal: number;
  totalMovimentacoes: number;
  fechadoEm: string;
}

export const LABEL_CATEGORIA: Record<CategoriaMovimentacao, string> = {
  venda: "Venda",
  recebimento: "Recebimento",
  adiantamento: "Adiantamento",
  outro: "Outro",
  compra_material: "Compra de material",
  fornecedor: "Fornecedor",
  energia: "Energia",
  agua: "Água",
  internet: "Internet",
  salarios: "Salários",
  aluguel: "Aluguel",
  transporte: "Transporte",
  manutencao: "Manutenção",
  retirada: "Retirada",
  impostos: "Impostos",
  outros: "Outros",
};

export const LABEL_FORMA_PAGAMENTO: Record<FormaPagamento, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  cartao_credito: "Cartão Crédito",
  cartao_debito: "Cartão Débito",
  transferencia: "Transferência",
  boleto: "Boleto",
};

export const LABEL_ORIGEM: Record<OrigemMovimentacao, string> = {
  manual: "Manual",
  pedido: "Pedido",
  nota_fiscal: "Nota Fiscal",
  estoque: "Estoque",
  sistema: "Sistema",
};

export const LABEL_STATUS: Record<StatusMovimentacao, string> = {
  confirmada: "Confirmada",
  pendente: "Pendente",
  cancelada: "Cancelada",
};

export const CATEGORIAS_ENTRADA: CategoriaEntrada[] = [
  "venda",
  "recebimento",
  "adiantamento",
  "outro",
];

export const CATEGORIAS_SAIDA: CategoriaSaida[] = [
  "compra_material",
  "fornecedor",
  "energia",
  "agua",
  "internet",
  "salarios",
  "aluguel",
  "transporte",
  "manutencao",
  "retirada",
  "impostos",
  "outros",
];

export const FORMAS_PAGAMENTO: FormaPagamento[] = [
  "dinheiro",
  "pix",
  "cartao_credito",
  "cartao_debito",
  "transferencia",
  "boleto",
];
