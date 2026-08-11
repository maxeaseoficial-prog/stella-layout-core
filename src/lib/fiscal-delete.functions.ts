import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAuthMiddleware } from "./auth-middleware";
import { assertAdminFiscal } from "./fiscal.server";

/**
 * Exclui fisicamente um registro de nota fiscal do banco de dados (tabela notas_fiscais).
 * IMPORTANTE: Isso não cancela a nota na SEFAZ/Spedy, apenas remove o registro local.
 */
export const excluirRegistroNotaFiscal = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    if (!context.supabase) throw new Error("AUTH_CONTEXT_MISSING_SUPABASE");
    await assertAdminFiscal(context.supabase, context.userId);

    const { error } = await context.supabase
      .from("notas_fiscais")
      .delete()
      .eq("id", data.id);

    if (error) throw error;
    return { ok: true };
  });

/**
 * Limpa o status fiscal de um pedido (remove o objeto notaFiscal no JSON do pedido).
 */
export const limparStatusFiscalPedido = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({ pedidoId: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    // Como os pedidos estão no localStorage (multi-tenant simulado),
    // esta função no servidor servirá para quando migramos para o banco.
    // Por enquanto, o cliente fará isso via commit no usePedidos.
    return { ok: true };
  });
