import type { PrecificacaoEntrada, PrecificacaoResultado } from "./types";

/** Valores iniciais exibidos ao abrir a tela (espelham a planilha atual). */
export const ENTRADA_PADRAO: PrecificacaoEntrada = {
  taxaCartaoPct: 2.5,
  impostoModo: "percentual",
  impostos: 6,
  lucroPct: 30,
  reinvestimentoPct: 5,
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

  // Se o imposto for valor fixo, ele soma ao custo. Se for %, entra na fórmula do divisor.
  const custoComImpostoFixo = e.impostoModo === "valor" ? custoProducao + e.impostos : custoProducao;
  const impostosPct = e.impostoModo === "percentual" ? e.impostos : 0;

  const somaPercentuais = impostosPct + e.taxaCartaoPct + e.lucroPct + e.reinvestimentoPct;
  const valido = somaPercentuais < 100 && custoComImpostoFixo > 0;
  const precoVenda = valido ? custoComImpostoFixo / (1 - somaPercentuais / 100) : 0;

  const valorImpostos =
    e.impostoModo === "valor" ? e.impostos : (precoVenda * impostosPct) / 100;
  const valorTaxaCartao = (precoVenda * e.taxaCartaoPct) / 100;
  const valorLucro = (precoVenda * e.lucroPct) / 100;
  const valorReinvestimento = (precoVenda * e.reinvestimentoPct) / 100;
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
