/**
 * Server functions da integração fiscal (NF-e via Spedy).
 * Wrappers finos — toda a lógica vive em fiscal.server.ts.
 * Todas exigem usuário autenticado com perfil Administrador.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { supabaseAuthMiddleware } from "./auth-middleware";

import { getClienteNome } from "@/features/clientes/types";
import {
  apiKeyParaAmbiente,
  assertAdminFiscal,
  carregarClienteServer,
  carregarFiscalConfigServer,
  carregarPedidoServer,
  montarPayloadNfe,
  notaFiscalDeResposta,
  persistirNfeNoBanco,
  spedyFetch,
  SpedyError,
  validarConfigFiscal,
  validarPedidoParaNfe,
} from "./fiscal.server";


function mensagemDe(e: unknown, fallback: string): string {
  return e instanceof Error ? e.message : fallback;
}

export const testarConexaoFiscal = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .handler(async ({ context }) => {
    console.log("[Fiscal Functions] TEST_CONNECTION_CLIENT_REACHED");
    console.log("[Fiscal Functions] TEST_CONNECTION_MIDDLEWARE_RECEIVED");
    console.log("[Fiscal Functions] TEST_CONNECTION_USER_ID=" + context.userId);
    
    await assertAdminFiscal(context.supabase, context.userId);
    console.log("[Fiscal Functions] TEST_CONNECTION_ADMIN_VALIDATED");

    const config = await carregarFiscalConfigServer(context.supabase);
    const apiKeyInfo = apiKeyParaAmbiente(config, config.ambiente);
    
    if (!apiKeyInfo.key) {
      return {
        ok: false as const,
        mensagem:
          "A API Key da Spedy não está configurada no cofre de segredos do sistema.",
      };
    }
    
    try {
      console.log("[Fiscal Functions] TEST_CONNECTION_SPEDY_CALL_REACHED");
      // Listagem paginada mínima — valida a chave sem criar nada.
      await spedyFetch(apiKeyInfo, config.ambiente, "/product-invoices?page=1&pageSize=1");
      return { ok: true as const, mensagem: "Conexão estabelecida com sucesso com a API da Spedy." };
    } catch (e) {
      console.error("[Fiscal Functions] Spedy Connection Error:", e);
      const msg = e instanceof SpedyError 
        ? `Erro Spedy (${e.status}): ${e.message}` 
        : mensagemDe(e, "Falha ao conectar com a Spedy.");
      return { ok: false as const, mensagem: msg };
    }
  });

export const emitirNfePedido = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({ pedidoId: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    console.log("[Fiscal Pedido] Emitindo NF-e:", {
      userId: context.userId,
      pedidoId: data.pedidoId
    });
    await assertAdminFiscal(context.supabase, context.userId);

    const config = await carregarFiscalConfigServer(context.supabase);
    const erroConfig = validarConfigFiscal(config);
    if (erroConfig) return { ok: false as const, mensagem: erroConfig };

    const pedido = await carregarPedidoServer(context.supabase, data.pedidoId);
    if (!pedido) return { ok: false as const, mensagem: "Pedido não encontrado." };
    const erroPedido = validarPedidoParaNfe(pedido);
    if (erroPedido) return { ok: false as const, mensagem: erroPedido };

    const cliente = await carregarClienteServer(context.supabase, pedido.clienteId);
    
    console.log("[Fiscal] Payload Destinatário (Pedido):", JSON.stringify({
      id: cliente?.id,
      nome: cliente ? getClienteNome(cliente) : "Não encontrado",
      cep: cliente?.cep,
      logradouro: cliente?.logradouro,
      numero: cliente?.numero,
      bairro: cliente?.bairro,
      cidade: cliente?.cidade,
      estado: cliente?.estado
    }, null, 2));

    const payload = montarPayloadNfe(pedido, cliente, config);
    try {
      const res = await spedyFetch(
        apiKeyParaAmbiente(config, config.ambiente),
        config.ambiente,
        "/product-invoices",
        { method: "POST", body: JSON.stringify(payload) },
      );
      const nota = notaFiscalDeResposta(res, config.ambiente, pedido.id.slice(0, 36));
      
      // Persistência no banco
      await persistirNfeNoBanco(
        context.supabase,
        nota,
        "pedido",
        payload,
        cliente,
        cliente?.id,
        pedido.id
      );

      return {
        ok: true as const,
        nota,
      };
    } catch (e) {
      return { ok: false as const, mensagem: mensagemDe(e, "Falha ao emitir a NF-e.") };
    }

  });

export const consultarNfePedido = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({ pedidoId: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdminFiscal(context.supabase, context.userId);
    const config = await carregarFiscalConfigServer(context.supabase);
    const pedido = await carregarPedidoServer(context.supabase, data.pedidoId);
    const nota = pedido?.notaFiscal;
    if (!nota?.spedyId) {
      return { ok: false as const, mensagem: "Este pedido ainda não possui NF-e emitida." };
    }
    try {
      const res = await spedyFetch(
        apiKeyParaAmbiente(config, nota.ambiente),
        nota.ambiente,
        `/product-invoices/${nota.spedyId}`,
      );
      return {
        ok: true as const,
        nota: notaFiscalDeResposta(res, nota.ambiente, nota.integrationId),
      };
    } catch (e) {
      return { ok: false as const, mensagem: mensagemDe(e, "Falha ao consultar a NF-e.") };
    }
  });

export const cancelarNfePedido = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) =>
    z
      .object({
        pedidoId: z.string().min(1),
        justificativa: z
          .string()
          .min(15, "A justificativa deve ter no mínimo 15 caracteres."),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdminFiscal(context.supabase, context.userId);
    const config = await carregarFiscalConfigServer(context.supabase);
    const pedido = await carregarPedidoServer(context.supabase, data.pedidoId);
    const nota = pedido?.notaFiscal;
    if (!nota?.spedyId) {
      return { ok: false as const, mensagem: "Este pedido ainda não possui NF-e emitida." };
    }
    const apiKeyInfo = apiKeyParaAmbiente(config, nota.ambiente);
    try {
      const res = await spedyFetch(apiKeyInfo, nota.ambiente, `/product-invoices/${nota.spedyId}`, {
        method: "DELETE",
        body: JSON.stringify({ justification: data.justificativa.trim() }),
      });
      if (res?.success !== true) {
        return { ok: false as const, mensagem: "A Spedy não confirmou o cancelamento da nota." };
      }
    } catch (e) {
      return { ok: false as const, mensagem: mensagemDe(e, "Falha ao cancelar a NF-e.") };
    }
    // Cancelamento também é processado — consulta o status atualizado.
    try {
      const atual = await spedyFetch(apiKeyInfo, nota.ambiente, `/product-invoices/${nota.spedyId}`);
      return {
        ok: true as const,
        nota: notaFiscalDeResposta(atual, nota.ambiente, nota.integrationId),
      };
    } catch {
      return {
        ok: true as const,
        nota: { ...nota, erro: null, atualizadoEm: new Date().toISOString() },
      };
    }
  });

export const reenviarDanfePedido = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({ pedidoId: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdminFiscal(context.supabase, context.userId);
    const config = await carregarFiscalConfigServer(context.supabase);
    const pedido = await carregarPedidoServer(context.supabase, data.pedidoId);
    const nota = pedido?.notaFiscal;
    if (!nota?.spedyId) {
      return { ok: false as const, mensagem: "Este pedido ainda não possui NF-e emitida." };
    }
    try {
      const res = await spedyFetch(
        apiKeyParaAmbiente(config, nota.ambiente),
        nota.ambiente,
        `/product-invoices/${nota.spedyId}/resend-email`,
        { method: "POST" },
      );
      if (res?.success !== true) {
        return { ok: false as const, mensagem: "A Spedy não confirmou o reenvio do e-mail." };
      }
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, mensagem: mensagemDe(e, "Falha ao reenviar o DANFE por e-mail.") };
    }
  });
