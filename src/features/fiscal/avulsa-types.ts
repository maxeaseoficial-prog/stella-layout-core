import type { NotaFiscalPedido } from "./types";

export interface NfeAvulsaItem {
  id: string;
  produtoId?: string; // Presente se selecionado do catálogo
  descricao: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  desconto: number;
  ncm: string;
  descricaoFiscal?: string;
  classificacaoFiscalId?: string; // ID da categoria_fiscal selecionada
}

export interface NfeAvulsa {
  id: string;
  clienteId?: string; // Se selecionado do cadastro
  destinatario: {
    nome: string;
    documento: string; // CPF ou CNPJ
    email?: string;
    cep?: string;
    logradouro?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
  };
  itens: NfeAvulsaItem[];
  subtotal: number;
  desconto: number;
  frete: number;
  outrasDespesas: number;
  total: number;
  movimentarEstoque: boolean;
  notaFiscal?: NotaFiscalPedido;
  criadaEm: string;
  atualizadaEm: string;
}
