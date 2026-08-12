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
    const apiKeyInfo = await apiKeyParaAmbiente(context.supabase, config, config.ambienteApi);
    
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
      await spedyFetch(apiKeyInfo, config.ambienteApi, "/product-invoices?page=1&pageSize=1");
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
    const erroConfig = await validarConfigFiscal(context.supabase, config);
    if (erroConfig) return { ok: false as const, mensagem: erroConfig };

    const pedido = await carregarPedidoServer(context.supabase, data.pedidoId);
    if (!pedido) return { ok: false as const, mensagem: "Pedido não encontrado." };
    const erroPedido = validarPedidoParaNfe(pedido);
    if (erroPedido) return { ok: false as const, mensagem: erroPedido };

    const cliente = await carregarClienteServer(context.supabase, pedido.clienteId);
    
    console.log("[Fiscal] Payload Destinatário (Pedido):", JSON.stringify({
      id: cliente?.id,
      nome: cliente ? getClienteNome(cliente) : "Não encontrado",
      tipo: cliente?.tipo,
      cnpjPresente: !!cliente?.tipo && cliente.tipo === 'empresa' && !!cliente.cnpj,
      iePresente: !!cliente?.tipo && cliente.tipo === 'empresa' && !!cliente.inscricaoEstadual,
      ieDigitos: cliente?.tipo === 'empresa' ? cliente.inscricaoEstadual?.length ?? 0 : 0,
      indicadorIe: cliente?.tipo === 'empresa' ? (cliente as any).indicadorIe : 'N/A',
      cidade: cliente?.cidade,
      estado: cliente?.estado
    }, null, 2));


    const payload = montarPayloadNfe(pedido, cliente, config);
    const apiKeyInfo = await apiKeyParaAmbiente(context.supabase, config, config.ambienteApi);
    
    try {
      const res = await spedyFetch(
        apiKeyInfo,
        config.ambienteApi,
        "/product-invoices",
        { method: "POST", body: JSON.stringify(payload) },
      );
      
      const nota = notaFiscalDeResposta(res, config.ambienteApi, pedido.id.slice(0, 36));
      
      try {
        await persistirNfeNoBanco(
          context.supabase,
          nota,
          "pedido",
          payload,
          cliente,
          cliente?.id,
          pedido.id
        );
      } catch (persistError) {
        console.error("[Fiscal Functions] FISCAL_REMOTE_CREATED_LOCAL_PERSIST_FAILED:", {
          spedyId: nota.spedyId,
          integrationId: nota.integrationId,
          status: nota.status,
          userId: context.userId
        });
        // Não jogamos o erro para o usuário não achar que falhou a emissão (que deu certo na Spedy)
      }

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
  .inputValidator((data) => z.object({ pedidoId: z.string().optional(), spedyId: z.string().optional(), integrationId: z.string().optional() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdminFiscal(context.supabase, context.userId);
    const config = await carregarFiscalConfigServer(context.supabase);
    
    let spedyId = data.spedyId;
    let integrationId = data.integrationId;
    let ambiente = config.ambienteApi;
    let pedidoId = data.pedidoId;

    if (pedidoId && !spedyId) {
      const pedido = await carregarPedidoServer(context.supabase, pedidoId);
      const nota = pedido?.notaFiscal;
      spedyId = nota?.spedyId;
      integrationId = nota?.integrationId;
      ambiente = nota?.ambiente || config.ambienteApi;
    }

    if (!spedyId && !integrationId) {
      return { ok: false as const, mensagem: "Identificador da NF-e não fornecido." };
    }

    try {
      const apiKeyInfo = await apiKeyParaAmbiente(context.supabase, config, ambiente);
      
      // Se tivermos apenas o integrationId, precisamos listar para achar o ID
      if (!spedyId && integrationId) {
        const listRes = await spedyFetch(apiKeyInfo, ambiente, `/product-invoices?integrationId=${integrationId}`);
        if (listRes?.data?.length > 0) {
          spedyId = listRes.data[0].id;
        }
      }

      if (!spedyId) return { ok: false as const, mensagem: "NF-e não localizada na API." };

      const res = await spedyFetch(
        apiKeyInfo,
        ambiente,
        `/product-invoices/${spedyId}`,
      );
      
      const nota = notaFiscalDeResposta(res, ambiente, integrationId || "");
      
      // Sincroniza com o banco local
      try {
        await persistirNfeNoBanco(
          context.supabase,
          nota,
          pedidoId ? "pedido" : "avulsa",
          null,
          null,
          null,
          pedidoId
        );
      } catch (e) {
        console.error("[Fiscal Functions] Sync error during consultation:", e);
      }

      return {
        ok: true as const,
        nota,
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
    const apiKeyInfo = await apiKeyParaAmbiente(context.supabase, config, nota.ambiente);
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
      const apiKeyInfo = await apiKeyParaAmbiente(context.supabase, config, nota.ambiente);
      const res = await spedyFetch(
        apiKeyInfo,
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

export const carregarSegredoFiscal = createServerFn({ method: "GET" })
  .middleware([supabaseAuthMiddleware])
  .handler(async ({ context }) => {
    const { carregarSegredoFiscalServer, assertAdminFiscal } = await import("./fiscal.server");
    await assertAdminFiscal(context.supabase, context.userId);
    const chave = await carregarSegredoFiscalServer(context.supabase);
    if (!chave) return { configurada: false };
    // Retorna apenas os últimos 4 caracteres para identificação parcial
    return { 
      configurada: true, 
      parcial: `••••••••${chave.slice(-4)}` 
    };
  });

export const salvarSegredoFiscal = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({ chave: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    const { salvarSegredoFiscalServer, assertAdminFiscal } = await import("./fiscal.server");
    await assertAdminFiscal(context.supabase, context.userId);
    await salvarSegredoFiscalServer(context.supabase, data.chave);
    return { ok: true };
  });

export const removerSegredoFiscal = createServerFn({ method: "POST" })
  .middleware([supabaseAuthMiddleware])
  .handler(async ({ context }) => {
    const { removerSegredoFiscalServer, assertAdminFiscal } = await import("./fiscal.server");
    await assertAdminFiscal(context.supabase, context.userId);
    await removerSegredoFiscalServer(context.supabase);
    return { ok: true };
  });
