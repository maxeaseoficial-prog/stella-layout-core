import { CATEGORIAS_ADICIONAL, LABEL_CATEGORIA_ADICIONAL } from "@/features/adicionais/types";
import type { Categoria, ConfiguracoesState, FormaPagamento, Usuario } from "./types";

function id(prefix: string, i: number) {
  return `${prefix}-${i}`;
}

const nowISO = () => new Date().toISOString();

const CATEGORIAS_INICIAIS_PRODUTO = [
  "Camiseta",
  "Polo",
  "Jaleco",
  "Jaqueta",
  "Boné",
  "Outro",
];

const CATEGORIAS_INICIAIS_ESTOQUE = [
  "Tecidos",
  "Linhas",
  "Botões",
  "Zíperes",
  "Cordões",
  "Etiquetas",
  "Embalagens",
];

const CATEGORIAS_INICIAIS_ADICIONAL = CATEGORIAS_ADICIONAL.map(
  (c) => LABEL_CATEGORIA_ADICIONAL[c],
);

const FORMAS_INICIAIS = [
  "PIX",
  "Dinheiro",
  "Cartão Crédito",
  "Cartão Débito",
  "Transferência",
  "Boleto",
];

export function categoriasIniciais(): Categoria[] {
  const criadoEm = nowISO();
  const lista: Categoria[] = [];
  CATEGORIAS_INICIAIS_PRODUTO.forEach((nome, i) =>
    lista.push({ id: id("cat-prod", i), escopo: "produto", nome, ordem: i, criadoEm }),
  );
  CATEGORIAS_INICIAIS_ESTOQUE.forEach((nome, i) =>
    lista.push({ id: id("cat-est", i), escopo: "estoque", nome, ordem: i, criadoEm }),
  );
  CATEGORIAS_INICIAIS_ADICIONAL.forEach((nome, i) =>
    lista.push({ id: id("cat-adi", i), escopo: "adicional", nome, ordem: i, criadoEm }),
  );
  return lista;
}

export function formasPagamentoIniciais(): FormaPagamento[] {
  const criadoEm = nowISO();
  return FORMAS_INICIAIS.map((nome, i) => ({
    id: id("fp", i),
    nome,
    ativo: true,
    ordem: i,
    criadoEm,
  }));
}

export function usuariosIniciais(): Usuario[] {
  return [
    {
      id: "usr-admin",
      nome: "Administrador",
      email: "",
      papel: "administrador",
      ativo: true,
    },
  ];
}

export function configuracoesIniciais(): ConfiguracoesState {
  return {
    empresa: {
      logo: undefined,
      nome: "",
      nomeFantasia: "Stella Espaço dos Uniformes",
      cnpj: "",
      inscricaoEstadual: "",
      telefone: "",
      whatsapp: "",
      email: "",
      site: "",
      instagram: "",
      endereco: {
        cep: "",
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
      },
    },
    preferencias: {
      moeda: "BRL",
      idioma: "pt-BR",
      formatoData: "DD/MM/AAAA",
      formatoHora: "24h",
    },
    numeracao: {
      pedido: { proximo: 1, digitos: 6, prefixo: "" },
      orcamento: { proximo: 1, digitos: 6, prefixo: "" },
      notaFiscal: { proximo: 1, digitos: 6, prefixo: "" },
    },
    categorias: categoriasIniciais(),
    formasPagamento: formasPagamentoIniciais(),
    usuarios: usuariosIniciais(),
    aparencia: {
      tema: "claro",
      corPrincipal: "#EC4899",
    },
  };
}

export const SISTEMA_INFO = {
  nome: "Stella ERP",
  versao: "1.0.0",
  dataVersao: "2026-07-20",
  desenvolvedora: {
    nome: "MaxEase",
    site: "https://maxease.com.br",
    contato: "contato@maxease.com.br",
  },
};
