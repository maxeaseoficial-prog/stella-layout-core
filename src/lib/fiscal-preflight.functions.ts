import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAuthMiddleware } from "@/lib/auth-middleware";
import { carregarClienteServer, assertAdminFiscal } from "@/lib/fiscal.server";
import { getClienteNome } from "@/features/clientes/types";

export const getFiscalPreflight = createServerFn({ method: "GET" })
  .middleware([supabaseAuthMiddleware])
  .inputValidator((data) => z.object({ clienteId: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdminFiscal(context.supabase, context.userId);
    
    const cliente = await carregarClienteServer(context.supabase, data.clienteId);
    
    if (!cliente) {
      return {
        ok: false,
        prontoParaEmitir: false,
        erros: ["Cliente não encontrado no servidor."]
      };
    }

    const erros: string[] = [];
    const isEmpresa = cliente.tipo === "empresa";
    const cnpj = isEmpresa ? (cliente as any).cnpj : null;
    const indicadorIe = isEmpresa ? (cliente as any).indicadorIe : "nao_contribuinte";
    const ie = isEmpresa ? (cliente as any).inscricaoEstadual : null;
    const ieNumerica = (ie || "").replace(/\D/g, "");

    if (isEmpresa && !cnpj) erros.push("CNPJ não informado no cadastro.");
    
    if (isEmpresa && !indicadorIe) {
      erros.push("Indicador de Inscrição Estadual não definido. Atualize o cadastro.");
    }

    if (indicadorIe === "contribuinte" && !ieNumerica) {
      erros.push("Inscrição Estadual obrigatória para contribuinte.");
    }

    if (!cliente.cidade || !cliente.estado) {
      erros.push("Endereço (Cidade/UF) incompleto.");
    }

    return {
      ok: true,
      clienteEncontrado: true,
      nome: getClienteNome(cliente),
      tipo: cliente.tipo,
      federalTaxNumber: isEmpresa ? cnpj : (cliente as any).cpf,
      indicadorIe,
      inscricaoEstadual: ie,
      uf: cliente.estado,
      prontoParaEmitir: erros.length === 0,
      erros
    };
  });
