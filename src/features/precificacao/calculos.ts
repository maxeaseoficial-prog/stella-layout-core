import type { PrecificacaoEntrada, PrecificacaoResultado } from "./types";

/** Valores iniciais exibidos ao abrir a tela (espelham a planilha atual). */
export const ENTRADA_PADRAO: PrecificacaoEntrada = {
  taxaCartaoPct: 2.5,
  taxaCartaoModo: "percentual",
  impostoModo: "percentual",
  impostos: 6,
  lucroPct: 30,
  lucroModo: "percentual",
  reinvestimentoPct: 5,
  reinvestimentoModo: "percentual",
  materiaPrima: 0,
  tempoProducaoHoras: 1,
  maoDeObra: 0,
  outrosCustos: 0,
  frete: 0,
  despesasExtras: 0,
};

function round2(v: number): number {
  return Math.round((v + Number.EPSILON) * 100) / 100;
}

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const PCT = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export function brl(v: number): string {
  return BRL.format(Number.isFinite(v) ? v : 0);
}

export function pct(v: number): string {
  return `${PCT.format(Number.isFinite(v) ? v : 0)}%`;
}

export function parseNumero(txt: string): number {
  const n = Number(String(txt).replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/**
 * Preço "por dentro": os percentuais incidem sobre o preço de venda.
 *   Preço = Custo / (1 − (impostos + taxa + lucro + reinvestimento)/100)
 */
export function calcularPrecificacao(e: PrecificacaoEntrada): PrecificacaoResultado {
  const custoProducao = round2(
    e.materiaPrima + e.maoDeObra + e.outrosCustos + e.frete + e.despesasExtras,
  );

  // Tratamento de valores fixos vs percentuais
  const impostoValorFixo = e.impostoModo === "valor" ? e.impostos : 0;
  const impostoPct = e.impostoModo === "percentual" ? e.impostos : 0;

  const taxaCartaoValorFixo = e.taxaCartaoModo === "valor" ? e.taxaCartaoPct : 0;
  const taxaCartaoPct = e.taxaCartaoModo === "percentual" ? e.taxaCartaoPct : 0;

  const lucroValorFixo = e.lucroModo === "valor" ? e.lucroPct : 0;
  const lucroPct = e.lucroModo === "percentual" ? e.lucroPct : 0;

  const reinvestimentoValorFixo = e.reinvestimentoModo === "valor" ? e.reinvestimentoPct : 0;
  const reinvestimentoPct = e.reinvestimentoModo === "percentual" ? e.reinvestimentoPct : 0;

  // Custo base + todos os valores fixos
  const custoTotalFixo = custoProducao + impostoValorFixo + taxaCartaoValorFixo + lucroValorFixo + reinvestimentoValorFixo;

  // Soma de todos os percentuais incidentes sobre o preço final
  const somaPercentuais = impostoPct + taxaCartaoPct + lucroPct + reinvestimentoPct;
  
  const valido = somaPercentuais < 100 && custoTotalFixo > 0;
  const precoVenda = valido ? custoTotalFixo / (1 - somaPercentuais / 100) : 0;

  const valorImpostos = e.impostoModo === "valor" ? e.impostos : (precoVenda * impostoPct) / 100;
  const valorTaxaCartao = e.taxaCartaoModo === "valor" ? e.taxaCartaoPct : (precoVenda * taxaCartaoPct) / 100;
  const valorLucro = e.lucroModo === "valor" ? e.lucroPct : (precoVenda * lucroPct) / 100;
  const valorReinvestimento = e.reinvestimentoModo === "valor" ? e.reinvestimentoPct : (precoVenda * reinvestimentoPct) / 100;
  
  const sobra = precoVenda - valorImpostos - valorTaxaCartao - custoProducao;

  return {
    custoProducao,
    somaPercentuais,
    precoVenda: round2(precoVenda),
    valorImpostos: round2(valorImpostos),
    valorTaxaCartao: round2(valorTaxaCartao),
    valorLucro: round2(valorLucro),
    valorReinvestimento: round2(valorReinvestimento),
    sobra: round2(Math.max(sobra, 0)),
    margemLiquidaPct: precoVenda > 0 ? (sobra / precoVenda) * 100 : 0,
    lucroSobrePrecoPct: precoVenda > 0 ? (valorLucro / precoVenda) * 100 : 0,
    markup: custoProducao > 0 ? precoVenda / custoProducao : 0,
    valido,
  };
}
