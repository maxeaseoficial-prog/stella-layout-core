export type TipoArquivo =
  | "logo"
  | "matriz"
  | "arte"
  | "pdf"
  | "documento"
  | "outro";

export type FinalidadeArquivo =
  | "bordado_frente"
  | "bordado_costas"
  | "manga"
  | "bone"
  | "estampa_frente"
  | "estampa_costas"
  | "arte_aprovacao"
  | "logo_institucional"
  | "outro";

export type StatusArquivo = "ativo" | "arquivado";

export interface Arquivo {
  id: string;
  clienteId: string;
  tipo: TipoArquivo;
  finalidade?: FinalidadeArquivo;
  nome: string;
  descricao?: string;
  status: StatusArquivo;
  // Especificações
  tamanho?: string;
  cor?: string;
  numeroCor?: string;
  // Arquivo
  arquivoNome: string;
  extensao: string;
  mime: string;
  tamanho: number;
  dataUrl: string;
  // datas
  criadoEm: string;
  atualizadoEm: string;
}

export type ArquivoInput = Omit<Arquivo, "id" | "criadoEm" | "atualizadoEm">;

export const LABEL_TIPO_ARQUIVO: Record<TipoArquivo, string> = {
  logo: "Logo",
  matriz: "Matriz de Bordado",
  arte: "Arte",
  pdf: "PDF",
  documento: "Documento",
  outro: "Outro",
};

export const LABEL_FINALIDADE: Record<FinalidadeArquivo, string> = {
  bordado_frente: "Bordado frente",
  bordado_costas: "Bordado costas",
  manga: "Manga",
  bone: "Boné",
  estampa_frente: "Estampa frente",
  estampa_costas: "Estampa costas",
  arte_aprovacao: "Arte de aprovação",
  logo_institucional: "Logo institucional",
  outro: "Outro",
};

/** Extensões técnicas de bordado / vetor / documento aceitas além de imagens/PDF. */
export const EXTENSOES_ACEITAS = [
  "png",
  "jpg",
  "jpeg",
  "svg",
  "pdf",
  "dst",
  "pes",
  "emb",
  "cdr",
  "ai",
] as const;

export const EXTENSOES_IMAGEM = ["png", "jpg", "jpeg", "svg"];

export function isImagem(ext: string): boolean {
  return EXTENSOES_IMAGEM.includes(ext.toLowerCase());
}
