export type StatusAdicional = "ativo" | "inativo";

export type TipoAdicional = "acessorio" | "material" | "acabamento" | "personalizacao";

/**
 * Categoria do adicional — string livre.
 * As opções são gerenciadas em Configurações → Categorias (escopo "adicional").
 */
export type CategoriaAdicional = string;

export const LABEL_TIPO_ADICIONAL: Record<TipoAdicional, string> = {
  acessorio: "Acessório",
  material: "Material",
  acabamento: "Acabamento",
  personalizacao: "Personalização",
};

export const TIPOS_ADICIONAL: TipoAdicional[] = [
  "acessorio",
  "material",
  "acabamento",
  "personalizacao",
];

export const LABEL_CATEGORIA_ADICIONAL: Record<string, string> = {
  botao: "Botão",
  ziper: "Zíper",
  cordao: "Cordão",
  bolso: "Bolso",
  gola: "Gola especial",
  punho: "Punho",
  punho_reforcado: "Punho reforçado",
  tecido_dry_fit: "Tecido Dry Fit",
  tecido_oxford: "Tecido Oxford",
  tecido_brim: "Tecido Brim",
  refletivo: "Refletivo",
  elastico: "Elástico",
  acabamento_especial: "Acabamento especial",
  bordado: "Bordado",
  estampa: "Estampa",
  sublimacao: "Sublimação",
  outro: "Outro",
};

export function labelCategoriaAdicional(cat: string): string {
  return LABEL_CATEGORIA_ADICIONAL[cat] ?? cat;
}

/** Sugestão de tipo para cada categoria legada — usado como default no formulário. */
export const TIPO_PADRAO_POR_CATEGORIA: Record<string, TipoAdicional> = {
  botao: "acessorio",
  ziper: "acessorio",
  cordao: "acessorio",
  bolso: "acessorio",
  gola: "acabamento",
  punho: "acabamento",
  punho_reforcado: "acabamento",
  acabamento_especial: "acabamento",
  tecido_dry_fit: "material",
  tecido_oxford: "material",
  tecido_brim: "material",
  refletivo: "material",
  elastico: "material",
  bordado: "personalizacao",
  estampa: "personalizacao",
  sublimacao: "personalizacao",
  outro: "acessorio",
};

export type PendenciaAdicional = "orcamento" | "estampa" | "matriz";

export const LABEL_PENDENCIA_ADICIONAL: Record<PendenciaAdicional, string> = {
  orcamento: "Pendente de Orçamento",
  estampa: "Pendente de Orçamento de Estampa",
  matriz: "Pendente de Orçamento de Matriz",
};

export const PENDENCIAS_ADICIONAL: PendenciaAdicional[] = [
  "orcamento",
  "estampa",
  "matriz",
];

export interface Adicional {
  id: string;
  nome: string;
  tipo: TipoAdicional;
  categoria: CategoriaAdicional;
  valor: number;
  /**
   * Quando definido, o adicional não possui valor fixo — o valor será informado
   * na criação do pedido via seção "Orçamentos Pendentes".
   */
  pendencia?: PendenciaAdicional;
  descricao?: string;
  imagem?: string; // data URL
  status: StatusAdicional;
  criadoEm: string;
  atualizadoEm: string;
}

export type AdicionalInput = Omit<Adicional, "id" | "criadoEm" | "atualizadoEm">;
