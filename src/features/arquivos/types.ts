export type TipoArquivo =
  | "logo"
  | "matriz"
  | "arte"
  | "pdf"
  | "documento"
  | "outro";

/**
 * @deprecated Substituído por `TipoAplicacao` + `PosicaoAplicacao`.
 * Mantido para compatibilidade com registros já persistidos no localStorage.
 */
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

export type TipoAplicacao =
  | "bordado"
  | "estampa"
  | "silk_screen"
  | "dtf"
  | "sublimacao"
  | "patch"
  | "etiqueta"
  | "logo_institucional"
  | "arte_aprovacao"
  | "mockup"
  | "layout_producao"
  | "vetorizacao"
  | "matriz_bordado"
  | "arquivo_corte"
  | "outro";

export const LABEL_TIPO_APLICACAO: Record<TipoAplicacao, string> = {
  bordado: "Bordado",
  estampa: "Estampa",
  silk_screen: "Silk Screen",
  dtf: "DTF",
  sublimacao: "Sublimação",
  patch: "Patch",
  etiqueta: "Etiqueta",
  logo_institucional: "Logo institucional",
  arte_aprovacao: "Arte de aprovação",
  mockup: "Mockup",
  layout_producao: "Layout de produção",
  vetorizacao: "Vetorização",
  matriz_bordado: "Matriz de bordado",
  arquivo_corte: "Arquivo para corte",
  outro: "Outro",
};

export type GrupoPosicao =
  | "frente"
  | "costas"
  | "mangas"
  | "gola"
  | "punhos"
  | "bone"
  | "laterais"
  | "calcas"
  | "geral";

export const LABEL_GRUPO_POSICAO: Record<GrupoPosicao, string> = {
  frente: "Frente",
  costas: "Costas",
  mangas: "Mangas",
  gola: "Gola",
  punhos: "Punhos",
  bone: "Boné",
  laterais: "Laterais",
  calcas: "Calças",
  geral: "Geral",
};

export interface PosicaoOpcao {
  id: string;
  label: string;
  grupo: GrupoPosicao;
}

export const POSICOES_APLICACAO: PosicaoOpcao[] = [
  // Frente
  { id: "peito_esquerdo", label: "Peito esquerdo", grupo: "frente" },
  { id: "peito_direito", label: "Peito direito", grupo: "frente" },
  { id: "centro_peito", label: "Centro do peito", grupo: "frente" },
  { id: "acima_bolso_esq", label: "Acima do bolso esquerdo", grupo: "frente" },
  { id: "acima_bolso_dir", label: "Acima do bolso direito", grupo: "frente" },
  { id: "bolso_esquerdo", label: "Bolso esquerdo", grupo: "frente" },
  { id: "bolso_direito", label: "Bolso direito", grupo: "frente" },
  { id: "barra_frontal", label: "Barra frontal", grupo: "frente" },
  // Costas
  { id: "costas_superior", label: "Costas superior", grupo: "costas" },
  { id: "costas_central", label: "Costas central", grupo: "costas" },
  { id: "costas_inferior", label: "Costas inferior", grupo: "costas" },
  { id: "barra_traseira", label: "Barra traseira", grupo: "costas" },
  // Mangas
  { id: "manga_esquerda", label: "Manga esquerda", grupo: "mangas" },
  { id: "manga_direita", label: "Manga direita", grupo: "mangas" },
  // Gola
  { id: "gola_frontal", label: "Gola frontal", grupo: "gola" },
  { id: "gola_traseira", label: "Gola traseira", grupo: "gola" },
  // Punhos
  { id: "punho_esquerdo", label: "Punho esquerdo", grupo: "punhos" },
  { id: "punho_direito", label: "Punho direito", grupo: "punhos" },
  // Boné
  { id: "bone_frente", label: "Frente (boné)", grupo: "bone" },
  { id: "bone_lateral_esq", label: "Lateral esquerda (boné)", grupo: "bone" },
  { id: "bone_lateral_dir", label: "Lateral direita (boné)", grupo: "bone" },
  { id: "bone_traseira", label: "Parte traseira (boné)", grupo: "bone" },
  // Laterais
  { id: "lateral_esquerda", label: "Lateral esquerda", grupo: "laterais" },
  { id: "lateral_direita", label: "Lateral direita", grupo: "laterais" },
  // Calças
  { id: "perna_esquerda", label: "Perna esquerda", grupo: "calcas" },
  { id: "perna_direita", label: "Perna direita", grupo: "calcas" },
  // Geral
  { id: "uniforme_completo", label: "Uniforme completo", grupo: "geral" },
  { id: "frente_completa", label: "Frente completa", grupo: "geral" },
  { id: "costas_completas", label: "Costas completas", grupo: "geral" },
  { id: "outro_local", label: "Outro local", grupo: "geral" },
];

/**
 * Grupos de posição habilitados para cada tipo de aplicação.
 * Aplicações de vestuário liberam todos os grupos de peça;
 * aplicações "documentais" (mockup, vetorização etc.) ficam só em Geral.
 */
const GRUPOS_VESTUARIO: GrupoPosicao[] = [
  "frente",
  "costas",
  "mangas",
  "gola",
  "punhos",
  "laterais",
  "calcas",
  "geral",
];

export const GRUPOS_POR_TIPO_APLICACAO: Record<TipoAplicacao, GrupoPosicao[]> = {
  bordado: [...GRUPOS_VESTUARIO, "bone"],
  estampa: GRUPOS_VESTUARIO,
  silk_screen: GRUPOS_VESTUARIO,
  dtf: GRUPOS_VESTUARIO,
  sublimacao: GRUPOS_VESTUARIO,
  patch: [...GRUPOS_VESTUARIO, "bone"],
  etiqueta: ["gola", "punhos", "laterais", "geral"],
  logo_institucional: ["frente", "costas", "bone", "geral"],
  arte_aprovacao: ["geral"],
  mockup: ["geral"],
  layout_producao: ["geral"],
  vetorizacao: ["geral"],
  matriz_bordado: ["geral"],
  arquivo_corte: ["geral"],
  outro: ["geral"],
};

export function posicoesParaTipo(tipo: TipoAplicacao): PosicaoOpcao[] {
  const grupos = new Set(GRUPOS_POR_TIPO_APLICACAO[tipo] ?? ["geral"]);
  return POSICOES_APLICACAO.filter((p) => grupos.has(p.grupo));
}

export function labelPosicao(id: string | undefined | null): string {
  if (!id) return "";
  return POSICOES_APLICACAO.find((p) => p.id === id)?.label ?? id;
}

export interface CorAplicacao {
  nome: string;
  numero: string;
}

export interface Arquivo {
  id: string;
  clienteId: string;
  tipo: TipoArquivo;
  /** @deprecated legado — usar `tipoAplicacao` + `posicaoAplicacao`. */
  finalidade?: FinalidadeArquivo;
  // Aplicação (hierárquica)
  tipoAplicacao?: TipoAplicacao;
  posicaoAplicacao?: string;
  descricaoAplicacao?: string;
  nome: string;
  descricao?: string;
  status: StatusArquivo;
  // Especificações
  /** @deprecated substituído por larguraCm/alturaCm */
  tamanhoPeca?: string;
  larguraCm?: number;
  alturaCm?: number;
  /** @deprecated substituído por `cores` */
  cor?: string;
  /** @deprecated substituído por `cores` */
  numeroCor?: string;
  cores?: CorAplicacao[];
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

/** @deprecated Mantido para renderizar registros antigos que ainda usam `finalidade`. */
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
