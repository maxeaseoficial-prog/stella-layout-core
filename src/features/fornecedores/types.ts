export type StatusFornecedor = "ativo" | "inativo";

export type CategoriaFornecedor =
  | "tecidos"
  | "linhas"
  | "botoes"
  | "zipers"
  | "cordoes"
  | "etiquetas"
  | "embalagens"
  | "aviamentos"
  | "maquinas"
  | "equipamentos"
  | "outro";

export const CATEGORIAS_FORNECEDOR: CategoriaFornecedor[] = [
  "tecidos",
  "linhas",
  "botoes",
  "zipers",
  "cordoes",
  "etiquetas",
  "embalagens",
  "aviamentos",
  "maquinas",
  "equipamentos",
  "outro",
];

export const LABEL_CATEGORIA_FORNECEDOR: Record<CategoriaFornecedor, string> = {
  tecidos: "Tecidos",
  linhas: "Linhas",
  botoes: "Botões",
  zipers: "Zíperes",
  cordoes: "Cordões",
  etiquetas: "Etiquetas",
  embalagens: "Embalagens",
  aviamentos: "Aviamentos",
  maquinas: "Máquinas",
  equipamentos: "Equipamentos",
  outro: "Outro",
};

export const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
] as const;

export interface EnderecoFornecedor {
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export interface Fornecedor {
  id: string;
  empresa: string;
  representante: string;
  telefone: string;
  dataCadastro: string; // YYYY-MM-DD
  cnpj?: string;
  inscricaoEstadual?: string;
  email?: string;
  site?: string;
  instagram?: string;
  endereco: EnderecoFornecedor;
  categorias: CategoriaFornecedor[];
  logo?: string; // data URL
  observacoes?: string;
  /** Prazo médio de entrega (dias) — preparação para módulo de compras. */
  prazoMedioEntregaDias?: number;
  status: StatusFornecedor;
  criadoEm: string;
  atualizadoEm: string;
}

export type FornecedorInput = Omit<Fornecedor, "id" | "criadoEm" | "atualizadoEm">;

export const ENDERECO_VAZIO: EnderecoFornecedor = {};
