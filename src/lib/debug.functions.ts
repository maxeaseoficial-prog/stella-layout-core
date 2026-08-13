import { createServerFn } from "@tanstack/react-start";
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
export const diagnosticarNfeRejeitada = createServerFn({ method: "GET" })
  .middleware([supabaseAuthMiddleware])
  .handler(async ({ context }) => {
    await assertAdminFiscal(context.supabase, context.userId);

    const { data, error } = await context.supabase
      .from("notas_fiscais")
      .select("*")
      .eq("status", "rejected")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

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
