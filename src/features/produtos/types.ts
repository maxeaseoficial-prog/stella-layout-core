export type StatusProduto = "ativo" | "inativo";

/**
 * Categoria do produto — string livre.
 * As opções disponíveis são gerenciadas em Configurações → Categorias (escopo "produto").
 * Mantemos o mapa de labels legado para exibir corretamente registros antigos
 * que salvaram uma chave enum (ex.: "camiseta").
 */
export type CategoriaProduto = string;

export const LABEL_CATEGORIA_PRODUTO: Record<string, string> = {
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

/** Exibe o label da categoria (compatível com chaves legadas). */
export function labelCategoriaProduto(cat: string): string {
  return LABEL_CATEGORIA_PRODUTO[cat] ?? cat;
}

export interface PersonalizacoesPermitidas {
  bordado: boolean;
  estampa: boolean;
  sublimacao: boolean;
}

export interface VariacaoTamanho {
  tamanho: string;
  precoAVista: number;
  precoCreditoAVista: number;
  precoCreditoParcelado: number;
}

export interface Produto {
  id: string;
  nome: string;
  sku?: string;
  categoriaFiscalId?: string;
  ncm?: string;
  descricaoFiscal?: string;
  categoria: CategoriaProduto;
  precoBase: number;
  variacoesTamanhos?: VariacaoTamanho[];
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
