import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAuthMiddleware } from "./auth-middleware";
import { 
  assertAdminFiscal, 
  carregarFiscalConfigServer, 
  validarConfigFiscal, 
  montarPayloadNfeAvulsa, 
  spedyFetch, 
  apiKeyParaAmbiente, 
  notaFiscalDeResposta 
} from "./fiscal.server";

export const emitirNfeAvulsa = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({
    id: z.string(),
    destinatario: z.object({
      nome: z.string(),
      documento: z.string(),
      email: z.string().optional(),
      cep: z.string().optional(),
      logradouro: z.string().optional(),
      numero: z.string().optional(),
      bairro: z.string().optional(),
      complemento: z.string().optional(),
      cidade: z.string().optional(),
      estado: z.string().optional(),
    }),
    itens: z.array(z.object({
      descricao: z.string(),
      quantidade: z.number(),
      unidade: z.string(),
      valorUnitario: z.number(),
      ncm: z.string(),
    })),
    total: z.number(),
    desconto: z.number(),
    frete: z.number(),
    outrasDespesas: z.number(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    console.log("[NF-E BUILD] AUTH-V3", "557aee41");
    console.log("[Fiscal Avulsa] HANDLER:", {
      contextSupabaseExists: !!context.supabase,
      contextUserId: context.userId,
    });

    if (!context.supabase) {
      throw new Error("AUTH_CONTEXT_MISSING_SUPABASE");
    }
    if (!context.userId) {
      throw new Error("AUTH_CONTEXT_MISSING_USER_ID");
    }

    await assertAdminFiscal(context.supabase, context.userId);

    const config = await carregarFiscalConfigServer(context.supabase);
    const erroConfig = validarConfigFiscal(config);
    if (erroConfig) return { ok: false as const, mensagem: erroConfig };

    console.log("[Fiscal] Payload Destinatário:", JSON.stringify(data.destinatario, null, 2));

    const payload = montarPayloadNfeAvulsa(data, config);
    try {
      const res = await spedyFetch(
        apiKeyParaAmbiente(config, config.ambiente),
        config.ambiente,
        "/product-invoices",
        { method: "POST", body: JSON.stringify(payload) },
      );
      return {
        ok: true as const,
        nota: notaFiscalDeResposta(res, config.ambiente, data.id.slice(0, 36)),
      };
    } catch (e) {
      return { ok: false as const, mensagem: e instanceof Error ? e.message : "Falha ao emitir a NF-e Avulsa." };
    }
  });
