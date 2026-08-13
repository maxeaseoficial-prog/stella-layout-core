
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAuthMiddleware } from "@/lib/auth-middleware";
import { 
  carregarPedidoServer, 
  carregarClienteServer, 
  carregarFiscalConfigServer, 
  montarPayloadNfe,
  assertAdminFiscal
} from "@/lib/fiscal.server";

export const previewNfePedido = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({ pedidoId: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdminFiscal(context.supabase, context.userId);
    
    const pedido = await carregarPedidoServer(context.supabase, data.pedidoId);
    if (!pedido) throw new Error("Pedido não encontrado.");

    const cliente = await carregarClienteServer(context.supabase, pedido.clienteId);
    const config = await carregarFiscalConfigServer(context.supabase);
    
    const payload = montarPayloadNfe(pedido, cliente, config);

    return {
      payload
    };
  });
