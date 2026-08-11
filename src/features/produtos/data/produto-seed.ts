import { ProdutoInput } from "../types";

export const PRODUTO_SEED_CAMISETA: ProdutoInput = {
  nome: "Camiseta Estampada",
  sku: "CAM-EST-001",
  categoria: "camiseta",
  precoBase: 22.50,
  status: "ativo",
  // Vinculando à classificação fiscal 023 (Camiseta diversa estampada de algodão)
  categoriaFiscalId: "023", 
  ncm: "6109.10.00",
  descricaoFiscal: "Camiseta diversa estampada de algodão",
  personalizacoes: {
    bordado: false,
    estampa: true,
    sublimacao: false
  },
  variacoesTamanhos: [
    { tamanho: "02", precoAVista: 22.50, precoCreditoAVista: 23.90, precoCreditoParcelado: 26.50 },
    { tamanho: "04", precoAVista: 25.50, precoCreditoAVista: 26.90, precoCreditoParcelado: 29.50 },
    { tamanho: "06", precoAVista: 28.50, precoCreditoAVista: 29.90, precoCreditoParcelado: 31.50 },
    { tamanho: "08", precoAVista: 30.50, precoCreditoAVista: 31.90, precoCreditoParcelado: 34.50 },
    { tamanho: "10", precoAVista: 32.50, precoCreditoAVista: 33.90, precoCreditoParcelado: 36.50 },
    { tamanho: "12", precoAVista: 34.50, precoCreditoAVista: 35.90, precoCreditoParcelado: 38.50 },
    { tamanho: "14", precoAVista: 36.50, precoCreditoAVista: 37.90, precoCreditoParcelado: 40.50 },
    { tamanho: "16", precoAVista: 38.50, precoCreditoAVista: 39.90, precoCreditoParcelado: 42.50 },
    { tamanho: "P", precoAVista: 40.50, precoCreditoAVista: 41.90, precoCreditoParcelado: 44.50 },
    { tamanho: "M", precoAVista: 42.50, precoCreditoAVista: 43.90, precoCreditoParcelado: 46.50 },
    { tamanho: "G", precoAVista: 44.50, precoCreditoAVista: 45.90, precoCreditoParcelado: 48.50 },
    { tamanho: "GG", precoAVista: 46.50, precoCreditoAVista: 47.90, precoCreditoParcelado: 50.50 },
    { tamanho: "XGG", precoAVista: 48.50, precoCreditoAVista: 49.90, precoCreditoParcelado: 52.50 }
  ]
};
