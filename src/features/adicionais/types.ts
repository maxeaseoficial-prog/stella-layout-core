export type StatusAdicional = "ativo" | "inativo";

export type TipoAdicional = "acessorio" | "material" | "acabamento" | "personalizacao";

export type CategoriaAdicional =
  | "botao"
  | "ziper"
  | "cordao"
  | "bolso"
  | "gola"
  | "punho"
  | "punho_reforcado"
  | "tecido_dry_fit"
  | "tecido_oxford"
  | "tecido_brim"
  | "refletivo"
  | "elastico"
  | "acabamento_especial"
  | "bordado"
  | "estampa"
  | "sublimacao"
  | "outro";

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

export const LABEL_CATEGORIA_ADICIONAL: Record<CategoriaAdicional, string> = {
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

export const CATEGORIAS_ADICIONAL: CategoriaAdicional[] = [
  "botao",
  "ziper",
  "cordao",
  "bolso",
  "gola",
  "punho",
  "punho_reforcado",
  "tecido_dry_fit",
  "tecido_oxford",
  "tecido_brim",
  "refletivo",
  "elastico",
  "acabamento_especial",
  "bordado",
  "estampa",
  "sublimacao",
  "outro",
];

/** Sugestão de tipo para cada categoria — usado como default no formulário. */
export const TIPO_PADRAO_POR_CATEGORIA: Record<CategoriaAdicional, TipoAdicional> = {
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

export interface Adicional {
  id: string;
  nome: string;
  tipo: TipoAdicional;
  categoria: CategoriaAdicional;
  valor: number;
  descricao?: string;
  imagem?: string; // data URL
  status: StatusAdicional;
  criadoEm: string;
  atualizadoEm: string;
}

export type AdicionalInput = Omit<Adicional, "id" | "criadoEm" | "atualizadoEm">;
