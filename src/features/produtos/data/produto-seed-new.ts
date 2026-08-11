import { ProdutoInput } from "../types";

export const PRODUTOS_SEED: ProdutoInput[] = [
  {
    nome: "Camiseta Estampada Longa",
    sku: "CAM-EST-LNG-001",
    categoria: "camiseta",
    precoBase: 25.50,
    status: "ativo",
    categoriaFiscalId: "023",
    ncm: "6109.10.00",
    descricaoFiscal: "Camiseta diversa estampada de algodão",
    variacoesTamanhos: [
      { tamanho: "02", precoAVista: 25.50, precoCreditoAVista: 26.90, precoCreditoParcelado: 29.50 },
      { tamanho: "04", precoAVista: 28.50, precoCreditoAVista: 29.90, precoCreditoParcelado: 31.50 },
      { tamanho: "06", precoAVista: 31.50, precoCreditoAVista: 32.90, precoCreditoParcelado: 35.50 },
      { tamanho: "08", precoAVista: 33.50, precoCreditoAVista: 34.90, precoCreditoParcelado: 37.50 },
      { tamanho: "10", precoAVista: 35.50, precoCreditoAVista: 36.90, precoCreditoParcelado: 39.50 },
      { tamanho: "12", precoAVista: 37.50, precoCreditoAVista: 38.90, precoCreditoParcelado: 41.50 },
      { tamanho: "14", precoAVista: 39.50, precoCreditoAVista: 40.90, precoCreditoParcelado: 43.50 },
      { tamanho: "16", precoAVista: 41.50, precoCreditoAVista: 42.90, precoCreditoParcelado: 45.50 },
      { tamanho: "P", precoAVista: 43.50, precoCreditoAVista: 44.90, precoCreditoParcelado: 47.50 },
      { tamanho: "M", precoAVista: 45.50, precoCreditoAVista: 46.90, precoCreditoParcelado: 49.50 },
      { tamanho: "G", precoAVista: 47.50, precoCreditoAVista: 48.90, precoCreditoParcelado: 51.50 },
      { tamanho: "GG", precoAVista: 49.50, precoCreditoAVista: 50.90, precoCreditoParcelado: 53.50 },
      { tamanho: "XGG", precoAVista: 51.50, precoCreditoAVista: 52.90, precoCreditoParcelado: 55.50 }
    ]
  },
  {
    nome: "Camiseta Bordada",
    sku: "CAM-BOR-001",
    categoria: "camiseta",
    precoBase: 28.00,
    status: "ativo",
    categoriaFiscalId: "023",
    ncm: "6109.10.00",
    descricaoFiscal: "Camiseta diversa estampada de algodão",
    variacoesTamanhos: [
      { tamanho: "02", precoAVista: 28.00, precoCreditoAVista: 29.50, precoCreditoParcelado: 30.50 },
      { tamanho: "04", precoAVista: 30.00, precoCreditoAVista: 31.50, precoCreditoParcelado: 33.50 },
      { tamanho: "06", precoAVista: 32.00, precoCreditoAVista: 33.50, precoCreditoParcelado: 37.50 },
      { tamanho: "08", precoAVista: 34.00, precoCreditoAVista: 35.50, precoCreditoParcelado: 39.50 },
      { tamanho: "10", precoAVista: 36.00, precoCreditoAVista: 37.50, precoCreditoParcelado: 41.50 },
      { tamanho: "12", precoAVista: 38.00, precoCreditoAVista: 39.50, precoCreditoParcelado: 42.50 },
      { tamanho: "14", precoAVista: 40.00, precoCreditoAVista: 41.50, precoCreditoParcelado: 45.50 },
      { tamanho: "16", precoAVista: 42.00, precoCreditoAVista: 43.50, precoCreditoParcelado: 47.50 },
      { tamanho: "P", precoAVista: 44.00, precoCreditoAVista: 45.50, precoCreditoParcelado: 49.50 },
      { tamanho: "M", precoAVista: 46.00, precoCreditoAVista: 47.50, precoCreditoParcelado: 51.50 },
      { tamanho: "G", precoAVista: 48.00, precoCreditoAVista: 49.50, precoCreditoParcelado: 53.50 },
      { tamanho: "GG", precoAVista: 50.00, precoCreditoAVista: 51.50, precoCreditoParcelado: 55.50 },
      { tamanho: "XGG", precoAVista: 52.00, precoCreditoAVista: 53.50, precoCreditoParcelado: 57.50 }
    ]
  },
  {
    nome: "Camiseta Bordada Longa",
    sku: "CAM-BOR-LNG-001",
    categoria: "camiseta",
    precoBase: 31.50,
    status: "ativo",
    categoriaFiscalId: "023",
    ncm: "6109.10.00",
    descricaoFiscal: "Camiseta diversa estampada de algodão",
    variacoesTamanhos: [
      { tamanho: "02", precoAVista: 31.50, precoCreditoAVista: 32.90, precoCreditoParcelado: 34.50 },
      { tamanho: "04", precoAVista: 33.50, precoCreditoAVista: 34.90, precoCreditoParcelado: 37.50 },
      { tamanho: "06", precoAVista: 35.50, precoCreditoAVista: 36.90, precoCreditoParcelado: 39.50 },
      { tamanho: "08", precoAVista: 37.50, precoCreditoAVista: 38.90, precoCreditoParcelado: 41.50 },
      { tamanho: "10", precoAVista: 39.50, precoCreditoAVista: 40.90, precoCreditoParcelado: 43.50 },
      { tamanho: "12", precoAVista: 41.50, precoCreditoAVista: 42.90, precoCreditoParcelado: 45.50 },
      { tamanho: "14", precoAVista: 43.50, precoCreditoAVista: 44.90, precoCreditoParcelado: 47.50 },
      { tamanho: "16", precoAVista: 45.50, precoCreditoAVista: 46.90, precoCreditoParcelado: 49.50 },
      { tamanho: "P", precoAVista: 47.50, precoCreditoAVista: 48.90, precoCreditoParcelado: 51.50 },
      { tamanho: "M", precoAVista: 49.50, precoCreditoAVista: 50.90, precoCreditoParcelado: 53.50 },
      { tamanho: "G", precoAVista: 51.50, precoCreditoAVista: 52.90, precoCreditoParcelado: 55.50 },
      { tamanho: "GG", precoAVista: 53.50, precoCreditoAVista: 54.90, precoCreditoParcelado: 57.50 },
      { tamanho: "XGG", precoAVista: 55.50, precoCreditoAVista: 56.90, precoCreditoParcelado: 59.50 }
    ]
  },
  {
    nome: "Moletom",
    sku: "MOL-001",
    categoria: "moletom",
    precoBase: 64.50,
    status: "ativo",
    categoriaFiscalId: "023",
    ncm: "6109.10.00",
    descricaoFiscal: "Camiseta diversa estampada de algodão",
    variacoesTamanhos: [
      { tamanho: "02", precoAVista: 64.50, precoCreditoAVista: 67.30, precoCreditoParcelado: 71.50 },
      { tamanho: "04", precoAVista: 68.50, precoCreditoAVista: 71.50, precoCreditoParcelado: 75.50 },
      { tamanho: "06", precoAVista: 74.50, precoCreditoAVista: 77.50, precoCreditoParcelado: 82.50 },
      { tamanho: "08", precoAVista: 78.50, precoCreditoAVista: 81.50, precoCreditoParcelado: 86.50 },
      { tamanho: "10", precoAVista: 84.50, precoCreditoAVista: 87.50, precoCreditoParcelado: 93.50 },
      { tamanho: "12", precoAVista: 94.50, precoCreditoAVista: 98.50, precoCreditoParcelado: 104.50 },
      { tamanho: "14", precoAVista: 104.50, precoCreditoAVista: 108.50, precoCreditoParcelado: 115.50 },
      { tamanho: "16", precoAVista: 114.50, precoCreditoAVista: 119.50, precoCreditoParcelado: 126.50 },
      { tamanho: "P", precoAVista: 124.50, precoCreditoAVista: 129.50, precoCreditoParcelado: 137.50 },
      { tamanho: "M", precoAVista: 129.50, precoCreditoAVista: 134.50, precoCreditoParcelado: 143.50 },
      { tamanho: "G", precoAVista: 132.50, precoCreditoAVista: 138.50, precoCreditoParcelado: 146.50 },
      { tamanho: "GG", precoAVista: 138.50, precoCreditoAVista: 144.50, precoCreditoParcelado: 153.50 },
      { tamanho: "XGG", precoAVista: 145.50, precoCreditoAVista: 151.50, precoCreditoParcelado: 160.50 }
    ]
  },
  {
    nome: "Leg",
    sku: "LEG-001",
    categoria: "leg",
    precoBase: 28.50,
    status: "ativo",
    categoriaFiscalId: "023",
    ncm: "6109.10.00",
    descricaoFiscal: "Camiseta diversa estampada de algodão",
    variacoesTamanhos: [
      { tamanho: "02", precoAVista: 28.50, precoCreditoAVista: 29.50, precoCreditoParcelado: 31.50 },
      { tamanho: "04", precoAVista: 32.50, precoCreditoAVista: 34.50, precoCreditoParcelado: 35.50 },
      { tamanho: "06", precoAVista: 38.50, precoCreditoAVista: 40.50, precoCreditoParcelado: 42.50 },
      { tamanho: "08", precoAVista: 42.50, precoCreditoAVista: 44.50, precoCreditoParcelado: 47.50 },
      { tamanho: "10", precoAVista: 48.50, precoCreditoAVista: 50.50, precoCreditoParcelado: 53.50 },
      { tamanho: "12", precoAVista: 52.50, precoCreditoAVista: 54.50, precoCreditoParcelado: 58.50 },
      { tamanho: "14", precoAVista: 58.50, precoCreditoAVista: 60.50, precoCreditoParcelado: 65.50 },
      { tamanho: "16", precoAVista: 62.50, precoCreditoAVista: 65.50, precoCreditoParcelado: 69.50 },
      { tamanho: "P", precoAVista: 64.50, precoCreditoAVista: 67.50, precoCreditoParcelado: 71.50 },
      { tamanho: "M", precoAVista: 68.50, precoCreditoAVista: 71.50, precoCreditoParcelado: 75.50 },
      { tamanho: "G", precoAVista: 74.50, precoCreditoAVista: 77.50, precoCreditoParcelado: 82.50 },
      { tamanho: "GG", precoAVista: 78.50, precoCreditoAVista: 81.50, precoCreditoParcelado: 86.50 },
      { tamanho: "XGG", precoAVista: 82.50, precoCreditoAVista: 85.90, precoCreditoParcelado: 91.50 }
    ]
  }
];
