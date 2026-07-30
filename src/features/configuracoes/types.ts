export interface EnderecoEmpresa {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface DadosEmpresa {
  logo?: string; // data URL
  nome: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  telefone: string;
  whatsapp: string;
  email: string;
  site: string;
  instagram: string;
  endereco: EnderecoEmpresa;
}

export type Moeda = "BRL" | "USD" | "EUR";
export type Idioma = "pt-BR" | "en-US" | "es";
export type FormatoData = "DD/MM/AAAA" | "MM/DD/AAAA" | "AAAA-MM-DD";
export type FormatoHora = "24h" | "12h";

export interface Preferencias {
  moeda: Moeda;
  idioma: Idioma;
  formatoData: FormatoData;
  formatoHora: FormatoHora;
}

export type TipoNumeracao = "pedido" | "orcamento" | "notaFiscal";

export interface ConfigNumeracao {
  proximo: number;
  digitos: number; // ex.: 6 → 000001
  prefixo: string;
}

export type NumeracaoMap = Record<TipoNumeracao, ConfigNumeracao>;

export type EscopoCategoria = "produto" | "estoque" | "adicional" | "tamanho";

export interface Categoria {
  id: string;
  escopo: EscopoCategoria;
  nome: string;
  ordem: number;
  criadoEm: string;
}

export interface FormaPagamento {
  id: string;
  nome: string;
  ativo: boolean;
  ordem: number;
  criadoEm: string;
}

export type PapelUsuario =
  | "administrador"
  | "operador_matriz"
  | "financeiro"
  | "producao"
  | "vendas";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
  ativo: boolean;
}

export type Tema = "claro" | "escuro";

export interface Aparencia {
  tema: Tema;
  corPrincipal: string; // hex
}

export interface ConfiguracoesState {
  empresa: DadosEmpresa;
  preferencias: Preferencias;
  numeracao: NumeracaoMap;
  categorias: Categoria[];
  formasPagamento: FormaPagamento[];
  usuarios: Usuario[];
  aparencia: Aparencia;
}

export const LABEL_PAPEL: Record<PapelUsuario, string> = {
  administrador: "Administrador",
  operador_matriz: "Operador Matriz",
  financeiro: "Financeiro",
  producao: "Produção",
  vendas: "Vendas",
};

export const LABEL_ESCOPO: Record<EscopoCategoria, string> = {
  produto: "Produtos",
  estoque: "Estoque",
  adicional: "Adicionais",
  tamanho: "Tamanhos",
};

export const LABEL_TIPO_NUMERACAO: Record<TipoNumeracao, string> = {
  pedido: "Pedidos",
  orcamento: "Orçamentos",
  notaFiscal: "Nota Fiscal",
};
