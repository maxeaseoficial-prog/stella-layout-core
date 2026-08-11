/**
 * Tipos da integração fiscal (NF-e via API Spedy).
 */
export type AmbienteApiSpedy = "sandbox" | "producao";
export type AmbienteFiscalNfe = "homologacao" | "producao";
export type RegimeTributarioFiscal = "simplesNacional" | "regimeNormal";

export interface CategoriaFiscal {
  id?: string;
  codigo: string;
  nome_amigavel: string;
  ncm: string | null;
  vigencia: string | null;
  observacao: string | null;
  ativo: boolean;
  tipo: "mercadoria" | "servico";
  tenant_id?: string;
}

export interface EmpresaFiscal {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string; // UF (ex.: "SP")
}

export interface TributacaoPadrao {
  regime: RegimeTributarioFiscal;
  ncm: string;
  cfopInterno: number;
  cfopInterestadual: number;
  csosn: number;
  icmsCst: number;
  icmsAliquota: number;
  pisCst: number;
  pisAliquota: number;
  cofinsCst: number;
  cofinsAliquota: number;
}

export interface TesteConexaoFiscal {
  em: string; // ISO timestamp
  ok: boolean;
  mensagem: string;
}

export interface FiscalConfig {
  empresa: EmpresaFiscal;
  ambienteApi: AmbienteApiSpedy;
  ambienteFiscal: AmbienteFiscalNfe;
  apiKeySandbox: string; // Legado
  apiKeyProducao: string; // Legado
  tributacao: TributacaoPadrao;
  ultimoTeste?: TesteConexaoFiscal;
  liberacaoPedido: "producao" | "finalizado";
}

export type StatusNfe =
  | "created"
  | "enqueued"
  | "received"
  | "authorized"
  | "inContingent"
  | "rejected"
  | "canceled"
  | "denied"
  | "disabled"
  | "removed";

export interface NfeProcessingDetail {
  status?: string;
  message?: string | null;
  code?: string | null;
}

export interface NotaFiscalPedido {
  spedyId: string;
  ambiente: AmbienteApiSpedy;
  integrationId: string;
  status: StatusNfe;
  numero?: number | null;
  serie?: string | null;
  chaveAcesso?: string | null;
  protocolo?: string | null;
  emitidaEm?: string | null;
  autorizadaEm?: string | null;
  valor?: number | null;
  processingDetail?: NfeProcessingDetail | null;
  erro?: string | null;
  atualizadoEm: string;
}

export const STATUS_NFE_FINAIS: StatusNfe[] = [
  "authorized",
  "rejected",
  "canceled",
  "denied",
  "disabled",
  "removed",
];

export const STATUS_NFE_PROCESSANDO: StatusNfe[] = [
  "created",
  "enqueued",
  "received",
  "inContingent",
];

export const LABEL_STATUS_NFE: Record<StatusNfe, string> = {
  created: "Processando",
  enqueued: "Processando",
  received: "Processando",
  authorized: "Autorizada",
  inContingent: "Em contingência",
  rejected: "Rejeitada",
  canceled: "Cancelada",
  denied: "Denegada",
  disabled: "Inutilizada",
  removed: "Removida",
};
