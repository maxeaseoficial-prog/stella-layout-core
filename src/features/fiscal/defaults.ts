import type { FiscalConfig } from "./types";

/**
 * Padrões seguem o "Exemplo A" da documentação oficial da Spedy:
 * Simples Nacional, CSOSN 400 (tributada pelo Simples sem crédito),
 * PIS/COFINS CST 07 (isento), CFOP 5102 (interna) / 6102 (interestadual).
 * Devem ser confirmados com a contabilidade da empresa.
 */
export function fiscalConfigInicial(): FiscalConfig {
  return {
    empresa: {
      razaoSocial: "",
      nomeFantasia: "",
      cnpj: "",
      inscricaoEstadual: "",
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
    },
    ambienteApi: "producao",
    ambienteFiscal: "homologacao",
    apiKeySandbox: "",
    apiKeyProducao: "",
    tributacao: {
      regime: "simplesNacional",
      ncm: "",
      cfopInterno: 5102,
      cfopInterestadual: 6102,
      csosn: 400,
      icmsCst: 0,
      icmsAliquota: 18,
      pisCst: 7,
      pisAliquota: 0.65,
      cofinsCst: 7,
      cofinsAliquota: 3,
    },
    liberacaoPedido: "producao",
  };
}


/** Mescla o registro salvo com os defaults para tolerar versões antigas. */
export function mergeFiscalConfig(raw: unknown): FiscalConfig {
  const base = fiscalConfigInicial();
  const p = (raw ?? {}) as Partial<FiscalConfig>;
  return {
    ...base,
    ...p,
    apiKeySandbox: "", // Força vazio no frontend
    apiKeyProducao: "", // Força vazio no frontend
    empresa: { ...base.empresa, ...(p.empresa ?? {}) },
    tributacao: { ...base.tributacao, ...(p.tributacao ?? {}) },
  };
}
