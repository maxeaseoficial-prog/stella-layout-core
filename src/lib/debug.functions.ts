import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAuthMiddleware } from "./auth-middleware";
import { assertAdminFiscal } from "./fiscal.server";


export const getBuildInfo = createServerFn({ method: "GET" })
  .handler(async () => {
    return {
      commitSha: "f8b2c4e9",
      buildTimestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "production",
      serverMarker: "PERSISTENCE-V1-f8b2c4e9"
    };
  });

/**
 * Recupera os dados de uma nota fiscal rejeitada para diagnóstico.
 */
export const diagnosticarNfeRejeitada = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({ 
    spedyId: z.string().optional(),
    integrationId: z.string().optional(),
    filtrarRejeicao232: z.boolean().optional()
  }).parse(data))
  .handler(async ({ data: input, context }) => {
    await assertAdminFiscal(context.supabase, context.userId);

    let query = context.supabase
      .from("notas_fiscais")
      .select("*")
      .order("updated_at", { ascending: false });

    if (input.spedyId) {
      query = query.eq("spedy_id", input.spedyId);
    } else if (input.integrationId) {
      query = query.eq("external_id", input.integrationId);
    } else if (input.filtrarRejeicao232) {
      query = query.eq("status", "rejected").ilike("mensagem_sefaz", "%232%");
    } else {
      query = query.eq("status", "rejected");
    }

    const { data, error } = await query.limit(1).maybeSingle();

    if (error) throw error;
    if (!data) return { ok: false, mensagem: "Nenhuma nota rejeitada encontrada." };

    return {
      ok: true,
      spedyId: data.spedy_id,
      integrationId: data.external_id,
      numero: data.numero,
      serie: data.serie,
      mensagemSefaz: data.mensagem_sefaz,
      payload: data.payload_envio,
      resumoDestinatario: data.resumo_destinatario,
      dataRejeicao: data.updated_at
    };
  });
