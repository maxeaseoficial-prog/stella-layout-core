/**
 * Tipos do módulo Formação de Preço.
 *
 * Substitui a planilha de precificação: todos os percentuais incidem
 * sobre o preço de venda (modelo "por dentro", igual à planilha).
 */

export interface PrecificacaoEntrada {
  /** Taxa de cartão. */
  taxaCartaoPct: number;
  /** Modo da taxa de cartão. */
  taxaCartaoModo: "percentual" | "valor";
  /** Modo do imposto: percentual (%) ou valor fixo (R$). */
  impostoModo: "percentual" | "valor";
  /** Valor ou percentual de impostos. */
  impostos: number;
  /** Lucro desejado. */
  lucroPct: number;
  /** Modo do lucro. */
  lucroModo: "percentual" | "valor";
  /** Reinvestimento. */
  reinvestimentoPct: number;
  /** Modo do reinvestimento. */
  reinvestimentoModo: "percentual" | "valor";
  /** Matéria-prima (R$). */
  materiaPrima: number;
  /** Tempo de produção (horas) — informativo. */
  tempoProducaoHoras: number;
  /** Custo da mão de obra (R$). */
  maoDeObra: number;
  /** Outros custos (R$). */
  outrosCustos: number;
  /** Frete (R$). */
  frete: number;
  /** Despesas extras (R$). */
  despesasExtras: number;
}

export interface PrecificacaoResultado {
  /** Soma de todos os custos diretos (R$). */
  custoProducao: number;
  /** Soma dos percentuais (impostos + taxa + lucro + reinvestimento). */
  somaPercentuais: number;
  /** Preço de venda sugerido (R$). */
  precoVenda: number;
  /** Valor dos impostos embutidos no preço (R$). */
  valorImpostos: number;
  /** Valor da taxa de cartão embutida no preço (R$). */
  valorTaxaCartao: number;
  /** Valor do lucro embutido no preço (R$). */
  valorLucro: number;
  /** Valor do reinvestimento embutido no preço (R$). */
  valorReinvestimento: number;
  /** Sobra após custos e taxas: lucro + reinvestimento (R$). */
  sobra: number;
  /** Margem líquida sobre o preço de venda (%). */
  margemLiquidaPct: number;
  /** Lucro sobre o preço de venda (%). */
  lucroSobrePrecoPct: number;
  /** Markup aplicado sobre o custo (multiplicador). */
  markup: number;
  /** false quando os percentuais somam ≥ 100% ou não há custo. */
  valido: boolean;
}

export interface HistoricoPrecoProduto {
  data: string; // ISO
  precoAnterior: number;
  precoNovo: number;
  origem: "formacao_preco";
  adminNome: string;
}

export interface CalculoSalvo {
  id: string;
  criadoEm: string; // ISO
  adminNome: string;
  tipo: "calculo" | "aplicacao_produto";
  entrada: PrecificacaoEntrada;
  resultado: PrecificacaoResultado;
  produtoAplicado?: {
    id: string;
    nome: string;
    precoAnterior: number;
  };
}
