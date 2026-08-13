import { describe, it, expect } from 'vitest';
import { SpedyReceiverSchema } from './preflight.server';

describe('SpedyReceiverSchema Validation', () => {
  const baseReceiver = {
    name: "Cliente Teste",
    federalTaxNumber: "12345678000199",
    address: {
      street: "Rua Teste",
      number: "123",
      district: "Bairro",
      postalCode: "12345678",
      city: {
        name: "Sao Paulo",
        state: "SP"
      }
    }
  };

  it('deve validar contribuinte (1) com IE válida', () => {
    const data = {
      ...baseReceiver,
      indicatorStateTaxNumber: 1,
      stateTaxNumber: "123456789"
    };
    const result = SpedyReceiverSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('deve falhar contribuinte (1) sem IE', () => {
    const data = {
      ...baseReceiver,
      indicatorStateTaxNumber: 1,
      stateTaxNumber: ""
    };
    const result = SpedyReceiverSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Inscrição Estadual é obrigatória");
    }
  });

  it('deve validar isento (2) com IE "ISENTO"', () => {
    const data = {
      ...baseReceiver,
      indicatorStateTaxNumber: 2,
      stateTaxNumber: "ISENTO"
    };
    const result = SpedyReceiverSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('deve falhar isento (2) sem o literal "ISENTO"', () => {
    const data = {
      ...baseReceiver,
      indicatorStateTaxNumber: 2,
      stateTaxNumber: "123"
    };
    const result = SpedyReceiverSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('deve validar não contribuinte (9) sem IE', () => {
    const data = {
      ...baseReceiver,
      indicatorStateTaxNumber: 9,
      stateTaxNumber: undefined
    };
    const result = SpedyReceiverSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('deve falhar não contribuinte (9) com IE preenchida', () => {
    const data = {
      ...baseReceiver,
      indicatorStateTaxNumber: 9,
      stateTaxNumber: "12345"
    };
    const result = SpedyReceiverSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
