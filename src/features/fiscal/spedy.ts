import type { AmbienteApiSpedy, NotaFiscalPedido } from "./types";

/** Base URLs oficiais da API Spedy (seguro para o client — sem segredos). */
export const SPEDY_BASE_URLS: Record<AmbienteApiSpedy, string> = {
  sandbox: "https://sandbox-api.spedy.com.br/v1",
  producao: "https://api.spedy.com.br/v1",
};

export const LABEL_AMBIENTE_SPEDY: Record<AmbienteApiSpedy, string> = {
  sandbox: "Sandbox de desenvolvedor",
  producao: "Conta principal",
};

/**
 * Downloads de DANFE (PDF) e XML não exigem X-Api-Key — podem ser abertos
 * diretamente no navegador.
 */
export function urlDanfePdf(
  nota: Pick<NotaFiscalPedido, "ambiente" | "spedyId">,
): string {
  return `${SPEDY_BASE_URLS[nota.ambiente]}/product-invoices/${nota.spedyId}/pdf`;
}

export function urlXmlNfe(
  nota: Pick<NotaFiscalPedido, "ambiente" | "spedyId">,
): string {
  return `${SPEDY_BASE_URLS[nota.ambiente]}/product-invoices/${nota.spedyId}/xml`;
}
