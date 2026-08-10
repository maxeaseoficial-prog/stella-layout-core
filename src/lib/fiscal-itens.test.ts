import { describe, expect, it } from "vitest";
import {
  calcularValoresItemFiscal,
  diagnosticarItensFiscais,
  round2,
} from "./fiscal-itens";

describe("calcularValoresItemFiscal", () => {
  it("envia unitTax, quantityTax e unitTaxAmount coerentes", () => {
    const item = calcularValoresItemFiscal({ quantidade: 1, valorUnitario: 40, unidade: "UN" });
    expect(item).toEqual({
      unit: "UN",
      quantity: 1,
      unitAmount: 40,
      totalAmount: 40,
      unitTax: "UN",
      quantityTax: 1,
      unitTaxAmount: 40,
    });
  });

  it("mantém vProd = qCom × vUnCom = qTrib × vUnTrib", () => {
    const item = calcularValoresItemFiscal({ quantidade: 3, valorUnitario: 12.35 });
    expect(round2(item.quantity * item.unitAmount)).toBe(item.totalAmount);
    expect(round2(item.quantityTax * item.unitTaxAmount)).toBe(item.totalAmount);
  });

  it("usa 6 casas no unitário quando o total rateado diverge", () => {
    const item = calcularValoresItemFiscal({
      quantidade: 3,
      valorUnitario: 10,
      totalForcado: 33.33,
    });
    expect(item.unitAmount).toBe(11.11);
    expect(item.unitTaxAmount).toBe(item.unitAmount);
    expect(round2(item.quantity * item.unitAmount)).toBe(33.33);
  });

  it("preserva a unidade também na base tributável", () => {
    const item = calcularValoresItemFiscal({ quantidade: 2, valorUnitario: 5, unidade: "PC" });
    expect(item.unit).toBe("PC");
    expect(item.unitTax).toBe("PC");
  });

  it("não divide por zero quando a quantidade é zero", () => {
    const item = calcularValoresItemFiscal({ quantidade: 0, valorUnitario: 10 });
    expect(Number.isFinite(item.unitAmount)).toBe(true);
    expect(item.totalAmount).toBe(0);
  });
});

describe("diagnosticarItensFiscais", () => {
  it("aprova itens coerentes", () => {
    const [d] = diagnosticarItensFiscais([
      calcularValoresItemFiscal({ quantidade: 7, valorUnitario: 3.19 }),
    ]);
    expect(d.ok).toBe(true);
    expect(d.divergenciaComercial).toBe(0);
    expect(d.divergenciaTributavel).toBe(0);
  });

  it("reprova item com base tributável divergente (cenário da rejeição 630)", () => {
    const [d] = diagnosticarItensFiscais([
      {
        unit: "UN",
        quantity: 1,
        unitAmount: 40,
        totalAmount: 40,
        unitTax: "UN",
        quantityTax: 1,
        unitTaxAmount: 35,
      },
    ]);
    expect(d.ok).toBe(false);
    expect(d.divergenciaTributavel).toBe(5);
  });
});
