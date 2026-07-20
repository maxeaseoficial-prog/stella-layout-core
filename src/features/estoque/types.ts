export type StatusItemEstoque = "ativo" | "inativo";

export type CategoriaEstoque =
  | "tecido"
  | "linha"
  | "botao"
  | "ziper"
  | "cordao"
  | "elastico"
  | "etiqueta"
  | "embalagem"
  | "aviamento"
  | "outro";

export const CATEGORIAS_ESTOQUE: CategoriaEstoque[] = [
  "tecido",
  "linha",
  "botao",
  "ziper",
  "cordao",
  "elastico",
  "etiqueta",
  "embalagem",
  "aviamento",
  "outro",
];

export const LABEL_CATEGORIA_ESTOQUE: Record<CategoriaEstoque, string> = {
  tecido: "Tecido",
  linha: "Linha",
  botao: "Botão",
  ziper: "Zíper",
  cordao: "Cordão",
  elastico: "Elástico",
  etiqueta: "Etiqueta",
  embalagem: "Embalagem",
  aviamento: "Aviamento",
  outro: "Outro",
};

export type UnidadeMedida =
  | "unidade"
  | "metro"
  | "quilograma"
  | "caixa"
  | "pacote"
  | "rolo"
  | "par"
  | "litro";

export const UNIDADES_MEDIDA: UnidadeMedida[] = [
  "unidade",
  "metro",
  "quilograma",
  "caixa",
  "pacote",
  "rolo",
  "par",
  "litro",
];

export const LABEL_UNIDADE: Record<UnidadeMedida, string> = {
  unidade: "Unidade",
  metro: "Metro",
  quilograma: "Quilograma",
  caixa: "Caixa",
  pacote: "Pacote",
  rolo: "Rolo",
  par: "Par",
  litro: "Litro",
};

export const SIGLA_UNIDADE: Record<UnidadeMedida, string> = {
  unidade: "un",
  metro: "m",
  quilograma: "kg",
  caixa: "cx",
  pacote: "pct",
  rolo: "rl",
  par: "par",
  litro: "L",
};

export type TipoMovimentacao = "entrada" | "saida";

export interface MovimentacaoEstoque {
  id: string;
  itemId: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  data: string; // ISO date (YYYY-MM-DD)
  observacoes?: string;
  criadoEm: string; // ISO datetime
  /** Origem — preparação para futura baixa automática via Produção. */
  origem?: "manual" | "producao" | "pedido";
  referenciaId?: string;
}

export interface ItemEstoque {
  id: string;
  nome: string;
  categoria: CategoriaEstoque;
  imagem?: string;
  descricao?: string;
  fornecedor?: string;
  unidade: UnidadeMedida;
  quantidade: number;
  estoqueMinimo: number;
  precoCompra: number;
  precoVenda?: number;
  status: StatusItemEstoque;
  criadoEm: string;
  atualizadoEm: string;
}

export type ItemEstoqueInput = Omit<ItemEstoque, "id" | "criadoEm" | "atualizadoEm">;
