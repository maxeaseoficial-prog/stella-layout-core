import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAuthMiddleware } from "./auth-middleware";
import { assertAdminFiscal } from "./fiscal.server";

export const getNotasEmitidas = createServerFn({ method: "GET" })
  .middleware([supabaseAuthMiddleware])
  .handler(async ({ context }) => {
    if (!context.supabase) throw new Error("AUTH_CONTEXT_MISSING_SUPABASE");
    await assertAdminFiscal(context.supabase, context.userId);

    const { data, error } = await context.supabase
      .from("notas_fiscais")
      .select("*")
      .eq("status", "authorized")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  });

export const getNotaPorSpedyId = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({ spedyId: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    if (!context.supabase) throw new Error("AUTH_CONTEXT_MISSING_SUPABASE");
    await assertAdminFiscal(context.supabase, context.userId);

    const { data: nota, error } = await context.supabase
      .from("notas_fiscais")
      .select("*")
      .eq("spedy_id", data.spedyId)
      .maybeSingle();

    if (error) throw error;
    return nota;
  });
