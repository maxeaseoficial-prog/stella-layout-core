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
  notaFiscalDeResposta,
  persistirNfeNoBanco
} from "./fiscal.server";

export const emitirNfeAvulsa = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({
    id: z.string(),
    destinatario: z.object({
      id: z.string().optional(),
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
      id: z.string(),
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
    console.log("[emitirNfeAvulsa] AUTH_STAGE_HANDLER_REACHED", { userId: context.userId });

    if (!context.supabase) throw new Error("AUTH_CONTEXT_MISSING_SUPABASE");
    if (!context.userId) throw new Error("AUTH_CONTEXT_MISSING_USER_ID");

    await assertAdminFiscal(context.supabase, context.userId);

    const config = await carregarFiscalConfigServer(context.supabase);
    const erroConfig = await validarConfigFiscal(context.supabase, config);
    if (erroConfig) return { ok: false as const, mensagem: erroConfig };

    const payload = montarPayloadNfeAvulsa(data, config);
    try {
      const res = await spedyFetch(
        await apiKeyParaAmbiente(context.supabase, config, config.ambiente),
        config.ambiente,
        "/product-invoices",
        { method: "POST", body: JSON.stringify(payload) },
      );
      
      const nota = notaFiscalDeResposta(res, config.ambiente, data.id.slice(0, 36));
      
      // Persistência imediata
      await persistirNfeNoBanco(
        context.supabase,
        nota,
        "avulsa",
        payload,
        data.destinatario,
        data.destinatario.id,
        null
      );

      return { ok: true as const, nota };
    } catch (e) {
      return { ok: false as const, mensagem: e instanceof Error ? e.message : "Falha ao emitir a NF-e Avulsa." };
    }
  });

export const consultarStatusNfe = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({ spedyId: z.string(), ambiente: z.enum(["sandbox", "producao"]) }).parse(data))
  .handler(async ({ data, context }) => {
    if (!context.supabase) throw new Error("AUTH_CONTEXT_MISSING_SUPABASE");
    await assertAdminFiscal(context.supabase, context.userId);
    
    const config = await carregarFiscalConfigServer(context.supabase);
    const apiKey = await apiKeyParaAmbiente(context.supabase, config, data.ambiente);
    
    try {
      const res = await spedyFetch(apiKey, data.ambiente, `/product-invoices/${data.spedyId}`);
      const nota = notaFiscalDeResposta(res, data.ambiente, res.integrationId || "");
      
      // Atualiza persistência
      await persistirNfeNoBanco(
        context.supabase,
        nota,
        "avulsa", // Simplificação, persistirNfeNoBanco lida com upsert por spedy_id
        null,
        null,
        null,
        null
      );
      
      return { ok: true as const, nota };
    } catch (e) {
      return { ok: false as const, mensagem: e instanceof Error ? e.message : "Falha ao consultar status." };
    }
  });
