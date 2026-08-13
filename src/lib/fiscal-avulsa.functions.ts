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
import { diagnosticarItensFiscais, type DiagnosticoItemFiscal } from "./fiscal-itens";

export const emitirNfeAvulsa = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({
    id: z.string(),
    destinatario: z.object({
      id: z.string().optional(),
      nome: z.string(),
      documento: z.string(),
      indicadorIe: z.enum(["contribuinte", "isento", "nao_contribuinte"]),
      inscricaoEstadual: z.string().optional(),
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

    // Validação Síncrona Bloqueante do Payload Final (Receiver) para Avulsa
    const validationSpedy = SpedyReceiverSchema.safeParse(payload.receiver);
    if (!validationSpedy.success) {
      const errorPaths = validationSpedy.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
      return { 
        ok: false as const, 
        mensagem: `Payload do destinatário da NF-e Avulsa incompatível com o contrato Spedy: ${errorPaths}` 
      };
    }

    const apiKeyInfo = await apiKeyParaAmbiente(context.supabase, config, config.ambienteApi);

    try {
      const res = await spedyFetch(
        apiKeyInfo,
        config.ambienteApi,
        "/product-invoices",
        { method: "POST", body: JSON.stringify(payload) },
      );
      
      const nota = notaFiscalDeResposta(res, config.ambienteApi, data.id.slice(0, 36));
      
      try {
        await persistirNfeNoBanco(
          context.supabase,
          nota,
          "avulsa",
          payload,
          data.destinatario,
          data.destinatario.id,
          null
        );
      } catch (persistError) {
        console.error("[Fiscal Functions] FISCAL_REMOTE_CREATED_LOCAL_PERSIST_FAILED (Avulsa):", {
          spedyId: nota.spedyId,
          integrationId: nota.integrationId,
          status: nota.status,
          userId: context.userId
        });
      }

      return { ok: true as const, nota };
    } catch (e) {
      return { ok: false as const, mensagem: e instanceof Error ? e.message : "Falha ao emitir a NF-e Avulsa." };
    }
  });

/**
 * Pré-visualiza o payload da NF-e Avulsa sem transmitir nada à API fiscal.
 * Retorna o payload montado e o diagnóstico numérico dos itens (comercial x tributável).
 */
export const previewPayloadNfeAvulsa = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({
    id: z.string(),
    destinatario: z.object({
      id: z.string().optional(),
      nome: z.string(),
      documento: z.string(),
      indicadorIe: z.enum(["contribuinte", "isento", "nao_contribuinte"]),
      inscricaoEstadual: z.string().optional(),
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
    if (!context.supabase) throw new Error("AUTH_CONTEXT_MISSING_SUPABASE");
    await assertAdminFiscal(context.supabase, context.userId);

    const config = await carregarFiscalConfigServer(context.supabase);
    const erroConfig = await validarConfigFiscal(context.supabase, config);
    if (erroConfig) return { ok: false as const, mensagem: erroConfig };

    try {
      const payload = montarPayloadNfeAvulsa(data, config) as any;
      const diagnosticos = diagnosticarItensFiscais(payload.items ?? []);
      const somaItens =
        Math.round(
          (payload.items ?? []).reduce((s: number, i: any) => s + i.totalAmount, 0) * 100,
        ) / 100;

      return {
        ok: true as const,
        payload,
        diagnosticos,
        resumo: {
          ambienteFiscal: config.ambienteFiscal,
          totalNota: data.total,
          somaItens,
          totalConfere: Math.abs(somaItens - data.total) < 0.01,
          itensComDivergencia: diagnosticos.filter((d: DiagnosticoItemFiscal) => !d.ok).length,
        },
      };
    } catch (e) {
      return { ok: false as const, mensagem: e instanceof Error ? e.message : "Falha ao montar o payload." };
    }
  });

export const consultarStatusNfe = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({ spedyId: z.string(), ambiente: z.enum(["sandbox", "producao"] as const) }).parse(data))
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
