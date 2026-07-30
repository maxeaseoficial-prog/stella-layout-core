/**
 * Tipos da integração fiscal (NF-e via API Spedy).
 * Não importa nada de pedidos/clientes para evitar ciclos de módulos —
 * os tipos do pedido referenciam `NotaFiscalPedido` daqui.
 */

export type AmbienteSpedy = "sandbox" | "producao";

export type RegimeTributarioFiscal = "simplesNacional" | "regimeNormal";

/** Dados fiscais da empresa emitente (espelham o cadastro no backoffice da Spedy). */
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

/**
 * Tributação padrão aplicada a TODOS os itens da NF-e.
 * Não inventamos regras próprias: os valores seguem os exemplos oficiais
 * da documentação da Spedy (Simples Nacional CSOSN 400 / Regime Normal CST 00)
 * e podem ser ajustados conforme orientação da contabilidade.
 */
export interface TributacaoPadrao {
  regime: RegimeTributarioFiscal;
  /** NCM padrão dos itens (8 dígitos, com ou sem máscara). */
  ncm: string;
  /** CFOP para operação interna (mesmo estado). Ex.: 5102. */
  cfopInterno: number;
  /** CFOP para operação interestadual. Ex.: 6102. */
  cfopInterestadual: number;
  /** Simples Nacional: CSOSN do ICMS (400 = tributada pelo Simples sem crédito). */
  csosn: number;
  /** Regime Normal: CST do ICMS (0 = tributada integralmente). */
  icmsCst: number;
  /** Regime Normal: alíquota de ICMS em % (ex.: 18). */
  icmsAliquota: number;
  /** CST do PIS (SN: 7 = isento; RN: 1 = alíquota básica). */
  pisCst: number;
  /** Regime Normal: alíquota de PIS em % (ex.: 0.65). */
  pisAliquota: number;
  /** CST da COFINS (SN: 7 = isento; RN: 1 = alíquota básica). */
  cofinsCst: number;
  /** Regime Normal: alíquota de COFINS em % (ex.: 3). */
  cofinsAliquota: number;
}

export interface TesteConexaoFiscal {
  em: string; // ISO timestamp
  ok: boolean;
  mensagem: string;
}

export interface FiscalConfig {
  empresa: EmpresaFiscal;
  ambiente: AmbienteSpedy;
  apiKeySandbox: string;
  apiKeyProducao: string;
  tributacao: TributacaoPadrao;
  ultimoTeste?: TesteConexaoFiscal;
}

/**
 * Status da nota conforme enum InvoiceStatus da Spedy.
 * A ausência de `notaFiscal` no pedido significa "Não emitida".
 */
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

/** Retorno da Spedy persistido no pedido (banco). */
export interface NotaFiscalPedido {
  /** UUID da nota na Spedy — usado em GET/DELETE/pdf/xml. */
  spedyId: string;
  ambiente: AmbienteSpedy;
  /** ID do pedido enviado como integrationId (idempotência). */
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
  /** Última falha de validação/comunicação (400/403) para exibição. */
  erro?: string | null;
  atualizadoEm: string;
}

/** Estados finais — o polling para quando o status entra nesta lista. */
export const STATUS_NFE_FINAIS: StatusNfe[] = [
  "authorized",
  "rejected",
  "canceled",
  "denied",
  "disabled",
  "removed",
];

/** Estados intermediários — a nota ainda está sendo processada. */
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
