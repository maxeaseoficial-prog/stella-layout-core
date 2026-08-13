import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAuthMiddleware } from "./auth-middleware";
import { 
  assertAdminFiscal, 
  carregarFiscalConfigServer, 
  apiKeyParaAmbiente, 
  spedyFetch,
  notaFiscalDeResposta
} from "./fiscal.server";

export const executarTesteSandboxReal = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .handler(async ({ context }) => {
    await assertAdminFiscal(context.supabase, context.userId);
    const config = await carregarFiscalConfigServer(context.supabase);
    
    // FORÇAR AMBIENTE SANDBOX para este teste
    const ambiente = "sandbox";
    const apiKeyInfo = await apiKeyParaAmbiente(context.supabase, config, ambiente);
    
    if (!apiKeyInfo.key) {
      return { ok: false as const, mensagem: "Chave Sandbox não configurada." };
    }

    const integrationId = `TEST-SANDBOX-${Date.now()}`;
    
    const payload = {
      isFinalCustomer: true,
      operationType: "outgoing",
      destination: "internal",
      presenceType: "presence",
      operationNature: "Venda de Mercadoria (Teste Sandbox)",
      integrationId,
      receiver: {
        name: "NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL",
        federalTaxNumber: "00000000000191", // CNPJ Genérico Homologação
        stateTaxNumber: "123456789", // IE Genérica (ajustar se necessário para UF SP)
        indicatorStateTaxNumber: 1, // Contribuinte
        address: {
          street: "Rua de Teste Sandbox",
          number: "100",
          district: "Bairro Industrial",
          postalCode: "01001000",
          city: { name: "Sao Paulo", state: "SP" }
        }
      },
      items: [{
        code: "TEST001",
        description: "PRODUTO TESTE SANDBOX",
        ncm: "62034200", // Calças de algodão
        cfop: "5102",
        unit: "UN",
        quantity: 1,
        unitAmount: 10.00,
        totalAmount: 10.00,
        unitTax: "UN",
        quantityTax: 1,
        unitTaxAmount: 10.00,
        makeupTotal: true,
        taxes: {
          icms: { origin: 0, csosn: "102" },
          pis: { cst: "07" },
          cofins: { cst: "07" }
        }
      }],
      payments: [{ method: "cash", amount: 10.00 }],
      total: { invoiceAmount: 10.00, productAmount: 10.00 }
    };

    try {
      const res = await spedyFetch(apiKeyInfo, ambiente, "/product-invoices", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      
      return { 
        ok: true as const, 
        spedyId: res.id,
        integrationId,
        statusInicial: res.status,
        mensagem: "Payload enviado com sucesso ao Sandbox."
      };
    } catch (e) {
      return { ok: false as const, mensagem: e instanceof Error ? e.message : "Erro desconhecido no Sandbox." };
    }
  });

export const consultarResultadoSandbox = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({ spedyId: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdminFiscal(context.supabase, context.userId);
    const config = await carregarFiscalConfigServer(context.supabase);
    const apiKeyInfo = await apiKeyParaAmbiente(context.supabase, config, "sandbox");

    try {
      const res = await spedyFetch(apiKeyInfo, "sandbox", `/product-invoices/${data.spedyId}`);
      return { ok: true as const, nota: notaFiscalDeResposta(res, "sandbox", res.integrationId) };
    } catch (e) {
      return { ok: false as const, mensagem: e instanceof Error ? e.message : "Erro na consulta sandbox." };
    }
  });
