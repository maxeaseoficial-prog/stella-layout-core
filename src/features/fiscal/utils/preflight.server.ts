
import type { Cliente } from "@/features/clientes/types";
import { getClienteNome } from "@/features/clientes/types";

export interface FiscalValidationResult {
  ok: boolean;
  prontoParaEmitir: boolean;
  erros: string[];
  cliente?: {
    id: string;
    nome: string;
    tipo: string;
    federalTaxNumber: string;
    indicadorIe: string;
    inscricaoEstadual: string | null;
    uf: string;
    cidade: string;
    cep?: string;
    logradouro?: string;
    numero?: string;
  };
}

export function validarDestinatarioNfe(cliente: Cliente | null): FiscalValidationResult {
  if (!cliente) {
    return {
      ok: false,
      prontoParaEmitir: false,
      erros: ["Cliente não encontrado no servidor."]
    };
  }

  const erros: string[] = [];
  const isEmpresa = cliente.tipo === "empresa";
  const federalTaxNumber = isEmpresa ? (cliente as any).cnpj : (cliente as any).cpf;
  const indicadorIe = isEmpresa ? (cliente as any).indicadorIe : "nao_contribuinte";
  const ie = isEmpresa ? (cliente as any).inscricaoEstadual : null;
  const ieNumerica = (ie || "").replace(/\D/g, "");

  if (!federalTaxNumber) {
    erros.push(`${isEmpresa ? "CNPJ" : "CPF"} não informado no cadastro.`);
  }
  
  if (isEmpresa && !indicadorIe) {
    erros.push("Indicador de Inscrição Estadual não definido. Atualize o cadastro.");
  }

  if (indicadorIe === "contribuinte" && !ieNumerica) {
    erros.push("Inscrição Estadual obrigatória para contribuinte.");
  }

  if (!cliente.cidade || !cliente.estado) {
    erros.push("Endereço (Cidade/UF) incompleto.");
  }

  if (!cliente.logradouro || !cliente.numero || !cliente.cep) {
      erros.push("Endereço (Logradouro/Número/CEP) incompleto.");
  }

  return {
    ok: true,
    prontoParaEmitir: erros.length === 0,
    erros,
    cliente: {
      id: cliente.id,
      nome: getClienteNome(cliente),
      tipo: cliente.tipo,
      federalTaxNumber: federalTaxNumber || "",
      indicadorIe,
      inscricaoEstadual: ie,
      uf: cliente.estado || "",
      cidade: cliente.cidade || "",
      cep: cliente.cep,
      logradouro: cliente.logradouro,
      numero: cliente.numero
    }
  };
}
