export type StatusProduto = "ativo" | "inativo";

export type CategoriaProduto =
  | "camiseta"
  | "polo"
  | "jaqueta"
  | "calca"
  | "bermuda"
  | "moletom"
  | "jaleco"
  | "avental"
  | "bone"
  | "outro";

export const LABEL_CATEGORIA_PRODUTO: Record<CategoriaProduto, string> = {
  camiseta: "Camiseta",
  polo: "Polo",
  jaqueta: "Jaqueta",
  calca: "Calça",
  bermuda: "Bermuda",
  moletom: "Moletom",
  jaleco: "Jaleco",
  avental: "Avental",
  bone: "Boné",
  outro: "Outro",
};

export const CATEGORIAS_PRODUTO: CategoriaProduto[] = [
  "camiseta",
  "polo",
  "jaqueta",
  "calca",
  "bermuda",
  "moletom",
  "jaleco",
  "avental",
  "bone",
  "outro",
];

export interface PersonalizacoesPermitidas {
  bordado: boolean;
  estampa: boolean;
  sublimacao: boolean;
}

export interface Produto {
  id: string;
  nome: string;
  sku?: string;
  categoria: CategoriaProduto;
  precoBase: number;
  personalizacoes: PersonalizacoesPermitidas;
  descricao?: string;
  observacoesInternas?: string;
  imagem?: string; // data URL
  status: StatusProduto;
  criadoEm: string;
  atualizadoEm: string;
}

export type ProdutoInput = Omit<Produto, "id" | "criadoEm" | "atualizadoEm">;

export const PERSONALIZACOES_VAZIAS: PersonalizacoesPermitidas = {
  bordado: false,
  estampa: false,
  sublimacao: false,
};
