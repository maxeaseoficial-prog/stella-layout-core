import { SpedyReceiverSchema } from "./preflight.server";

const mockBase = {
  name: "Teste",
  federalTaxNumber: "12345678000100",
  address: {
    street: "Rua X",
    number: "123",
    district: "Bairro",
    postalCode: "12345678",
    city: { name: "Cidade", state: "SP" }
  }
};

console.log("Teste 1: PJ Contribuinte com IE");
const t1 = SpedyReceiverSchema.safeParse({
  ...mockBase,
  stateTaxNumber: "123456789",
  indicatorStateTaxNumber: 1
});
console.log("T1 Success:", t1.success);

console.log("Teste 2: Indicador Inválido (3)");
const t2 = SpedyReceiverSchema.safeParse({
  ...mockBase,
  indicatorStateTaxNumber: 3
});
console.log("T2 Success (esperado false):", t2.success);

console.log("Teste 3: Isento (Indicador 2)");
const t3 = SpedyReceiverSchema.safeParse({
  ...mockBase,
  indicatorStateTaxNumber: 2
});
console.log("T3 Success:", t3.success);

console.log("Teste 4: Não Contribuinte (Indicador 9)");
const t4 = SpedyReceiverSchema.safeParse({
  ...mockBase,
  indicatorStateTaxNumber: 9
});
console.log("T4 Success:", t4.success);
