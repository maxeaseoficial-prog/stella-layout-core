
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAuthMiddleware } from "@/lib/auth-middleware";
import { 
  carregarClienteServer, 
  assertAdminFiscal 
} from "@/lib/fiscal.server";
import { validarDestinatarioNfe } from "@/features/fiscal/utils/preflight.server";

export const getFiscalPreflight = createServerFn({ method: "GET" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({ clienteId: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdminFiscal(context.supabase, context.userId);
    
    const cliente = await carregarClienteServer(context.supabase, data.clienteId);
    
    const validation = validarDestinatarioNfe(cliente);
    
    if (!validation.ok) {
        return {
            ok: false,
            prontoParaEmitir: false,
            erros: validation.erros
        };
    }

    return {
      ok: true,
      ...validation.cliente,
      prontoParaEmitir: validation.prontoParaEmitir,
      erros: validation.erros
    };
  });
