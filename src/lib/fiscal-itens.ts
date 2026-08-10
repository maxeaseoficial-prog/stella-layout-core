/**
 * Lógica pura (sem dependências de servidor) para montagem e conferência dos
 * valores comerciais e tributáveis dos itens da NF-e.
 *
 * Regra SEFAZ 630: vProd deve ser igual a qTrib × vUnTrib (e a qCom × vUnCom).
 * Este módulo é a única fonte de verdade desses cálculos e é coberto por testes.
 */

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

export interface EntradaItemFiscal {
  quantidade: number;
  valorUnitario: number;
  unidade?: string;
  /** Total já definido (ex.: rateio do total do pedido). Se ausente, é calculado. */
  totalForcado?: number;
}

export interface ValoresItemFiscal {
  unit: string;
  quantity: number;
  unitAmount: number;
  totalAmount: number;
  unitTax: string;
  quantityTax: number;
  unitTaxAmount: number;
}

/**
 * Calcula os valores comerciais e tributáveis coerentes de um item.
 * Se o arredondamento em 2 casas divergir do total em >= 0,01, o valor
 * unitário passa a usar 6 casas para que quantity × unitAmount === totalAmount.
 */
export function calcularValoresItemFiscal(entrada: EntradaItemFiscal): ValoresItemFiscal {
  const unidade = entrada.unidade || "UN";
  const quantidade = Number(entrada.quantidade);
  let valorUnitario = Number(entrada.valorUnitario);

  const total =
    typeof entrada.totalForcado === "number"
      ? round2(entrada.totalForcado)
      : round2(quantidade * valorUnitario);

  if (quantidade > 0 && Math.abs(round2(quantidade * valorUnitario) - total) >= 0.01) {
    valorUnitario = round6(total / quantidade);
  }

  return {
    unit: unidade,
    quantity: quantidade,
    unitAmount: valorUnitario,
    totalAmount: total,
    unitTax: unidade,
    quantityTax: quantidade,
    unitTaxAmount: valorUnitario,
  };
}

export interface DiagnosticoItemFiscal {
  description?: string;
  unit: string;
  quantity: number;
  unitAmount: number;
  totalAmount: number;
  unitTax: string;
  quantityTax: number;
  unitTaxAmount: number;
  totalComercialCalculado: number;
  totalTributavelCalculado: number;
  divergenciaComercial: number;
  divergenciaTributavel: number;
  ok: boolean;
}

/** Tolerância aceita pela NF-e para diferenças de arredondamento. */
export const TOLERANCIA_NFE = 0.01;

export function diagnosticarItensFiscais(
  items: Array<Partial<DiagnosticoItemFiscal> & ValoresItemFiscal>,
): DiagnosticoItemFiscal[] {
  return items.map((i) => {
    const totalComercialCalculado = round2(i.quantity * i.unitAmount);
    const totalTributavelCalculado = round2(i.quantityTax * i.unitTaxAmount);
    const divergenciaComercial = round2(Math.abs(totalComercialCalculado - i.totalAmount));
    const divergenciaTributavel = round2(Math.abs(totalTributavelCalculado - i.totalAmount));
    return {
      description: i.description,
      unit: i.unit,
      quantity: i.quantity,
      unitAmount: i.unitAmount,
      totalAmount: i.totalAmount,
      unitTax: i.unitTax,
      quantityTax: i.quantityTax,
      unitTaxAmount: i.unitTaxAmount,
      totalComercialCalculado,
      totalTributavelCalculado,
      divergenciaComercial,
      divergenciaTributavel,
      ok: divergenciaComercial < TOLERANCIA_NFE && divergenciaTributavel < TOLERANCIA_NFE,
    };
  });
}
