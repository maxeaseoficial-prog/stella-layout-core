import { ProdutoInput } from "../types";

export const PRODUTOS_SEED: ProdutoInput[] = [
  {
    nome: "Camiseta Estampada Longa",
    sku: "CAM-EST-LNG-001",
    categoria: "camiseta",
    precoBase: 25.50,
    status: "ativo",
    
    
    
    personalizacoes: { bordado: false, estampa: true, sublimacao: false },
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
    
    
    
    personalizacoes: { bordado: true, estampa: false, sublimacao: false },
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
    
    
    
    personalizacoes: { bordado: true, estampa: false, sublimacao: false },
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
    
    
    
    personalizacoes: { bordado: false, estampa: true, sublimacao: false },
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
    
    
    
    personalizacoes: { bordado: false, estampa: false, sublimacao: false },
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
  },
  {
    nome: "Camiseta Curta Infantil",
    sku: "CAM-CUR-INF-001",
    categoria: "camiseta",
    precoBase: 36.50,
    status: "ativo",
    
    
    
    personalizacoes: { bordado: false, estampa: true, sublimacao: false },
    variacoesTamanhos: [
      { tamanho: "01", precoAVista: 36.50, precoCreditoAVista: 38.00, precoCreditoParcelado: 40.50 },
      { tamanho: "02", precoAVista: 37.50, precoCreditoAVista: 39.00, precoCreditoParcelado: 41.50 },
      { tamanho: "04", precoAVista: 38.50, precoCreditoAVista: 40.00, precoCreditoParcelado: 42.50 },
      { tamanho: "06", precoAVista: 39.50, precoCreditoAVista: 41.00, precoCreditoParcelado: 43.50 },
      { tamanho: "08", precoAVista: 40.50, precoCreditoAVista: 42.00, precoCreditoParcelado: 44.50 },
      { tamanho: "10", precoAVista: 41.50, precoCreditoAVista: 43.00, precoCreditoParcelado: 45.50 }
    ]
  },
  {
    nome: "Camiseta Longa Infantil",
    sku: "CAM-LNG-INF-001",
    categoria: "camiseta",
    precoBase: 38.50,
    status: "ativo",
    
    
    
    personalizacoes: { bordado: false, estampa: true, sublimacao: false },
    variacoesTamanhos: [
      { tamanho: "01", precoAVista: 38.50, precoCreditoAVista: 40.50, precoCreditoParcelado: 42.50 },
      { tamanho: "02", precoAVista: 39.50, precoCreditoAVista: 41.50, precoCreditoParcelado: 43.50 },
      { tamanho: "04", precoAVista: 40.50, precoCreditoAVista: 42.50, precoCreditoParcelado: 44.50 },
      { tamanho: "06", precoAVista: 42.50, precoCreditoAVista: 44.50, precoCreditoParcelado: 46.50 },
      { tamanho: "08", precoAVista: 44.50, precoCreditoAVista: 46.50, precoCreditoParcelado: 48.50 }
    ]
  },
  {
    nome: "Bermuda Masculina Infantil",
    sku: "BER-MAS-INF-001",
    categoria: "bermuda",
    precoBase: 31.50,
    status: "ativo",
    
    
    
    personalizacoes: { bordado: false, estampa: false, sublimacao: false },
    variacoesTamanhos: [
      { tamanho: "01", precoAVista: 31.50, precoCreditoAVista: 32.50, precoCreditoParcelado: 34.90 },
      { tamanho: "02", precoAVista: 32.50, precoCreditoAVista: 33.90, precoCreditoParcelado: 35.90 },
      { tamanho: "04", precoAVista: 33.50, precoCreditoAVista: 34.90, precoCreditoParcelado: 36.90 },
      { tamanho: "06", precoAVista: 34.50, precoCreditoAVista: 35.90, precoCreditoParcelado: 37.90 },
      { tamanho: "08", precoAVista: 35.50, precoCreditoAVista: 36.90, precoCreditoParcelado: 38.90 },
      { tamanho: "10", precoAVista: 36.50, precoCreditoAVista: 37.90, precoCreditoParcelado: 39.90 }
    ]
  },
  {
    nome: "Bermuda Leg Infantil",
    sku: "BER-LEG-INF-001",
    categoria: "bermuda",
    precoBase: 27.50,
    status: "ativo",
    
    
    
    personalizacoes: { bordado: false, estampa: false, sublimacao: false },
    variacoesTamanhos: [
      { tamanho: "01", precoAVista: 27.50, precoCreditoAVista: 28.50, precoCreditoParcelado: 30.50 },
      { tamanho: "02", precoAVista: 28.50, precoCreditoAVista: 29.50, precoCreditoParcelado: 31.50 },
      { tamanho: "04", precoAVista: 29.50, precoCreditoAVista: 30.50, precoCreditoParcelado: 32.50 },
      { tamanho: "06", precoAVista: 30.50, precoCreditoAVista: 31.50, precoCreditoParcelado: 33.50 },
      { tamanho: "08", precoAVista: 31.50, precoCreditoAVista: 32.50, precoCreditoParcelado: 34.50 },
      { tamanho: "10", precoAVista: 32.50, precoCreditoAVista: 33.50, precoCreditoParcelado: 35.50 }
    ]
  },
  {
    nome: "Calça Masculina Infantil",
    sku: "CAL-MAS-INF-001",
    categoria: "calca",
    precoBase: 42.50,
    status: "ativo",
    
    
    
    personalizacoes: { bordado: false, estampa: false, sublimacao: false },
    variacoesTamanhos: [
      { tamanho: "01", precoAVista: 42.50, precoCreditoAVista: 44.50, precoCreditoParcelado: 46.50 },
      { tamanho: "02", precoAVista: 44.50, precoCreditoAVista: 46.00, precoCreditoParcelado: 48.50 },
      { tamanho: "04", precoAVista: 46.50, precoCreditoAVista: 48.50, precoCreditoParcelado: 50.50 },
      { tamanho: "06", precoAVista: 48.50, precoCreditoAVista: 50.50, precoCreditoParcelado: 52.50 },
      { tamanho: "08", precoAVista: 50.50, precoCreditoAVista: 52.50, precoCreditoParcelado: 54.50 },
      { tamanho: "10", precoAVista: 52.50, precoCreditoAVista: 54.50, precoCreditoParcelado: 56.50 }
    ]
  },
  {
    nome: "Calça Leg Infantil",
    sku: "CAL-LEG-INF-001",
    categoria: "calca",
    precoBase: 36.50,
    status: "ativo",
    
    
    
    personalizacoes: { bordado: false, estampa: false, sublimacao: false },
    variacoesTamanhos: [
      { tamanho: "02", precoAVista: 36.50, precoCreditoAVista: 38.00, precoCreditoParcelado: 40.50 },
      { tamanho: "04", precoAVista: 37.50, precoCreditoAVista: 39.00, precoCreditoParcelado: 41.50 },
      { tamanho: "06", precoAVista: 38.50, precoCreditoAVista: 40.00, precoCreditoParcelado: 42.50 },
      { tamanho: "08", precoAVista: 39.50, precoCreditoAVista: 41.00, precoCreditoParcelado: 43.50 },
      { tamanho: "10", precoAVista: 40.50, precoCreditoAVista: 42.00, precoCreditoParcelado: 44.50 },
      { tamanho: "12", precoAVista: 41.50, precoCreditoAVista: 43.00, precoCreditoParcelado: 45.50 }
    ]
  },
  {
    nome: "Blusa de Moletom Infantil",
    sku: "BLU-MOL-INF-001",
    categoria: "moletom",
    precoBase: 64.50,
    status: "ativo",
    
    
    
    personalizacoes: { bordado: false, estampa: true, sublimacao: false },
    variacoesTamanhos: [
      { tamanho: "01", precoAVista: 64.50, precoCreditoAVista: 67.50, precoCreditoParcelado: 71.50 },
      { tamanho: "02", precoAVista: 65.50, precoCreditoAVista: 68.50, precoCreditoParcelado: 72.50 },
      { tamanho: "04", precoAVista: 68.50, precoCreditoAVista: 71.50, precoCreditoParcelado: 73.50 },
      { tamanho: "06", precoAVista: 71.50, precoCreditoAVista: 74.50, precoCreditoParcelado: 74.50 },
      { tamanho: "08", precoAVista: 74.50, precoCreditoAVista: 77.50, precoCreditoParcelado: 75.50 },
      { tamanho: "10", precoAVista: 77.50, precoCreditoAVista: 81.50, precoCreditoParcelado: 76.50 }
    ]
  },
  {
    nome: "Jaqueta Infantil",
    sku: "JAQ-INF-001",
    categoria: "jaqueta",
    precoBase: 72.50,
    status: "ativo",
    
    
    
    personalizacoes: { bordado: false, estampa: true, sublimacao: false },
    variacoesTamanhos: [
      { tamanho: "02", precoAVista: 72.50, precoCreditoAVista: 75.90, precoCreditoParcelado: 80.50 },
      { tamanho: "04", precoAVista: 75.50, precoCreditoAVista: 78.90, precoCreditoParcelado: 82.50 },
      { tamanho: "06", precoAVista: 79.50, precoCreditoAVista: 82.90, precoCreditoParcelado: 86.50 },
      { tamanho: "08", precoAVista: 82.50, precoCreditoAVista: 85.90, precoCreditoParcelado: 89.50 },
      { tamanho: "10", precoAVista: 84.50, precoCreditoAVista: 87.90, precoCreditoParcelado: 91.50 },
      { tamanho: "12", precoAVista: 86.50, precoCreditoAVista: 89.90, precoCreditoParcelado: 93.50 }
    ]
  },
  {
    nome: "Calça Masculina — Tabela B",
    sku: "CAL-MAS-B-001",
    categoria: "calca",
    precoBase: 40.50,
    status: "ativo",
    
    
    
    personalizacoes: { bordado: false, estampa: false, sublimacao: false },
    variacoesTamanhos: [
      { tamanho: "02", precoAVista: 40.50, precoCreditoAVista: 42.50, precoCreditoParcelado: 44.50 },
      { tamanho: "04", precoAVista: 42.50, precoCreditoAVista: 44.50, precoCreditoParcelado: 46.50 },
      { tamanho: "06", precoAVista: 48.50, precoCreditoAVista: 51.50, precoCreditoParcelado: 52.50 },
      { tamanho: "08", precoAVista: 52.50, precoCreditoAVista: 55.50, precoCreditoParcelado: 56.50 },
      { tamanho: "10", precoAVista: 58.50, precoCreditoAVista: 61.50, precoCreditoParcelado: 62.50 },
      { tamanho: "12", precoAVista: 65.50, precoCreditoAVista: 68.50, precoCreditoParcelado: 72.50 },
      { tamanho: "14", precoAVista: 72.50, precoCreditoAVista: 75.50, precoCreditoParcelado: 80.50 },
      { tamanho: "16", precoAVista: 78.50, precoCreditoAVista: 81.50, precoCreditoParcelado: 85.50 },
      { tamanho: "P", precoAVista: 82.50, precoCreditoAVista: 85.50, precoCreditoParcelado: 89.50 },
      { tamanho: "M", precoAVista: 88.50, precoCreditoAVista: 91.50, precoCreditoParcelado: 95.50 },
      { tamanho: "G", precoAVista: 93.50, precoCreditoAVista: 96.50, precoCreditoParcelado: 98.50 },
      { tamanho: "GG", precoAVista: 98.50, precoCreditoAVista: 101.50, precoCreditoParcelado: 104.50 },
      { tamanho: "XGG", precoAVista: 102.50, precoCreditoAVista: 105.50, precoCreditoParcelado: 109.50 }
    ]
  },
  {
    nome: "Bermuda Masculina — Tabela B",
    sku: "BER-MAS-B-001",
    categoria: "bermuda",
    precoBase: 30.00,
    status: "ativo",
    
    
    
    personalizacoes: { bordado: false, estampa: false, sublimacao: false },
    variacoesTamanhos: [
      { tamanho: "02", precoAVista: 30.00, precoCreditoAVista: 31.50, precoCreditoParcelado: 33.50 },
      { tamanho: "04", precoAVista: 32.00, precoCreditoAVista: 33.50, precoCreditoParcelado: 35.50 },
      { tamanho: "06", precoAVista: 38.00, precoCreditoAVista: 40.50, precoCreditoParcelado: 42.50 },
      { tamanho: "08", precoAVista: 42.00, precoCreditoAVista: 44.50, precoCreditoParcelado: 46.50 },
      { tamanho: "10", precoAVista: 45.00, precoCreditoAVista: 47.50, precoCreditoParcelado: 49.50 },
      { tamanho: "12", precoAVista: 49.00, precoCreditoAVista: 50.50, precoCreditoParcelado: 53.50 },
      { tamanho: "14", precoAVista: 53.00, precoCreditoAVista: 54.50, precoCreditoParcelado: 57.50 },
      { tamanho: "16", precoAVista: 57.00, precoCreditoAVista: 58.50, precoCreditoParcelado: 61.50 },
      { tamanho: "P", precoAVista: 62.00, precoCreditoAVista: 63.50, precoCreditoParcelado: 66.50 },
      { tamanho: "M", precoAVista: 65.00, precoCreditoAVista: 66.50, precoCreditoParcelado: 69.50 },
      { tamanho: "G", precoAVista: 68.00, precoCreditoAVista: 69.50, precoCreditoParcelado: 72.50 },
      { tamanho: "GG", precoAVista: 69.00, precoCreditoAVista: 70.50, precoCreditoParcelado: 73.50 },
      { tamanho: "XGG", precoAVista: 73.00, precoCreditoAVista: 74.50, precoCreditoParcelado: 76.50 }
    ]
  },
  {
    nome: "Short Saia",
    sku: "SHO-SAI-001",
    categoria: "outros",
    precoBase: 41.50,
    status: "ativo",
    
    
    
    personalizacoes: { bordado: false, estampa: false, sublimacao: false },
    variacoesTamanhos: [
      { tamanho: "02", precoAVista: 41.50, precoCreditoAVista: 43.00, precoCreditoParcelado: 45.50 },
      { tamanho: "04", precoAVista: 42.50, precoCreditoAVista: 44.00, precoCreditoParcelado: 46.00 },
      { tamanho: "06", precoAVista: 45.50, precoCreditoAVista: 47.00, precoCreditoParcelado: 49.50 },
      { tamanho: "08", precoAVista: 48.50, precoCreditoAVista: 50.00, precoCreditoParcelado: 52.50 },
      { tamanho: "10", precoAVista: 52.50, precoCreditoAVista: 54.00, precoCreditoParcelado: 56.00 },
      { tamanho: "12", precoAVista: 56.50, precoCreditoAVista: 58.00, precoCreditoParcelado: 60.50 },
      { tamanho: "14", precoAVista: 59.50, precoCreditoAVista: 61.00, precoCreditoParcelado: 63.50 },
      { tamanho: "16", precoAVista: 61.50, precoCreditoAVista: 63.00, precoCreditoParcelado: 65.00 }
    ]
  },
  {
    nome: "Bermuda Leg — Tabela B",
    sku: "BER-LEG-B-001",
    categoria: "bermuda",
    precoBase: 23.50,
    status: "ativo",
    
    
    
    personalizacoes: { bordado: false, estampa: false, sublimacao: false },
    variacoesTamanhos: [
      { tamanho: "02", precoAVista: 23.50, precoCreditoAVista: 25.00, precoCreditoParcelado: 26.50 },
      { tamanho: "04", precoAVista: 25.50, precoCreditoAVista: 27.00, precoCreditoParcelado: 28.50 },
      { tamanho: "06", precoAVista: 28.50, precoCreditoAVista: 30.00, precoCreditoParcelado: 31.50 },
      { tamanho: "08", precoAVista: 30.50, precoCreditoAVista: 32.00, precoCreditoParcelado: 33.50 },
      { tamanho: "10", precoAVista: 33.50, precoCreditoAVista: 35.00, precoCreditoParcelado: 36.50 },
      { tamanho: "12", precoAVista: 36.50, precoCreditoAVista: 38.00, precoCreditoParcelado: 39.50 },
      { tamanho: "14", precoAVista: 39.50, precoCreditoAVista: 41.00, precoCreditoParcelado: 42.50 },
      { tamanho: "16", precoAVista: 41.50, precoCreditoAVista: 43.00, precoCreditoParcelado: 44.50 },
      { tamanho: "P", precoAVista: 43.50, precoCreditoAVista: 45.00, precoCreditoParcelado: 47.50 },
      { tamanho: "M", precoAVista: 45.50, precoCreditoAVista: 47.00, precoCreditoParcelado: 49.50 },
      { tamanho: "G", precoAVista: 48.50, precoCreditoAVista: 50.00, precoCreditoParcelado: 52.50 },
      { tamanho: "GG", precoAVista: 51.50, precoCreditoAVista: 53.00, precoCreditoParcelado: 55.50 },
      { tamanho: "XGG", precoAVista: 52.50, precoCreditoAVista: 54.00, precoCreditoParcelado: 56.50 }
    ]
  },
  {
    nome: "Camiseta Cosmos",
    sku: "CAM-COS-001",
    categoria: "camiseta",
    precoBase: 36.00,
    status: "ativo",
    
    
    
    personalizacoes: { bordado: false, estampa: true, sublimacao: false },
    variacoesTamanhos: [
      { tamanho: "02", precoAVista: 36.00, precoCreditoAVista: 37.90, precoCreditoParcelado: 39.50 },
      { tamanho: "04", precoAVista: 38.00, precoCreditoAVista: 39.90, precoCreditoParcelado: 41.50 },
      { tamanho: "06", precoAVista: 40.00, precoCreditoAVista: 41.90, precoCreditoParcelado: 43.50 },
      { tamanho: "08", precoAVista: 42.00, precoCreditoAVista: 43.90, precoCreditoParcelado: 45.50 },
      { tamanho: "10", precoAVista: 44.00, precoCreditoAVista: 45.90, precoCreditoParcelado: 47.50 },
      { tamanho: "12", precoAVista: 46.00, precoCreditoAVista: 47.90, precoCreditoParcelado: 49.50 },
      { tamanho: "14", precoAVista: 48.00, precoCreditoAVista: 49.90, precoCreditoParcelado: 51.50 },
      { tamanho: "16", precoAVista: 50.00, precoCreditoAVista: 51.90, precoCreditoParcelado: 53.50 },
      { tamanho: "P", precoAVista: 52.00, precoCreditoAVista: 53.90, precoCreditoParcelado: 55.50 },
      { tamanho: "M", precoAVista: 54.00, precoCreditoAVista: 55.90, precoCreditoParcelado: 57.50 },
      { tamanho: "G", precoAVista: 56.00, precoCreditoAVista: 57.90, precoCreditoParcelado: 59.50 },
      { tamanho: "GG", precoAVista: 58.00, precoCreditoAVista: 59.90, precoCreditoParcelado: 61.50 },
      { tamanho: "XG", precoAVista: 60.00, precoCreditoAVista: 61.90, precoCreditoParcelado: 63.50 }
    ]
  },
  {
    nome: "Camiseta Manga Longa Cosmos",
    sku: "CAM-ML-COS-001",
    categoria: "camiseta",
    precoBase: 39.50,
    status: "ativo",
    
    
    
    personalizacoes: { bordado: false, estampa: true, sublimacao: false },
    variacoesTamanhos: [
      { tamanho: "02", precoAVista: 39.50, precoCreditoAVista: 41.50, precoCreditoParcelado: 43.50 },
      { tamanho: "04", precoAVista: 41.50, precoCreditoAVista: 43.50, precoCreditoParcelado: 45.50 },
      { tamanho: "06", precoAVista: 43.50, precoCreditoAVista: 45.50, precoCreditoParcelado: 47.50 },
      { tamanho: "08", precoAVista: 45.50, precoCreditoAVista: 47.50, precoCreditoParcelado: 49.50 },
      { tamanho: "10", precoAVista: 47.50, precoCreditoAVista: 49.50, precoCreditoParcelado: 51.50 },
      { tamanho: "12", precoAVista: 49.50, precoCreditoAVista: 51.50, precoCreditoParcelado: 53.50 },
      { tamanho: "14", precoAVista: 51.50, precoCreditoAVista: 53.50, precoCreditoParcelado: 55.50 },
      { tamanho: "16", precoAVista: 53.50, precoCreditoAVista: 55.50, precoCreditoParcelado: 57.50 },
      { tamanho: "P", precoAVista: 55.50, precoCreditoAVista: 57.50, precoCreditoParcelado: 59.50 },
      { tamanho: "M", precoAVista: 57.50, precoCreditoAVista: 59.50, precoCreditoParcelado: 61.50 },
      { tamanho: "G", precoAVista: 59.50, precoCreditoAVista: 61.50, precoCreditoParcelado: 63.50 },
      { tamanho: "GG", precoAVista: 61.50, precoCreditoAVista: 63.50, precoCreditoParcelado: 65.50 },
      { tamanho: "XG", precoAVista: 63.50, precoCreditoAVista: 65.50, precoCreditoParcelado: 67.50 }
    ]
  },
  {
    nome: "Leg Cosmos",
    sku: "LEG-COS-001",
    categoria: "leg",
    precoBase: 36.00,
    status: "ativo",
    
    
    
    personalizacoes: { bordado: false, estampa: false, sublimacao: false },
    variacoesTamanhos: [
      { tamanho: "02", precoAVista: 36.00, precoCreditoAVista: 37.90, precoCreditoParcelado: 39.50 },
      { tamanho: "04", precoAVista: 40.00, precoCreditoAVista: 41.90, precoCreditoParcelado: 43.50 },
      { tamanho: "06", precoAVista: 46.00, precoCreditoAVista: 47.90, precoCreditoParcelado: 49.50 },
      { tamanho: "08", precoAVista: 50.00, precoCreditoAVista: 51.90, precoCreditoParcelado: 45.50 },
      { tamanho: "10", precoAVista: 56.00, precoCreditoAVista: 57.90, precoCreditoParcelado: 59.50 },
      { tamanho: "12", precoAVista: 60.00, precoCreditoAVista: 61.90, precoCreditoParcelado: 63.50 },
      { tamanho: "14", precoAVista: 66.00, precoCreditoAVista: 67.90, precoCreditoParcelado: 69.50 },
      { tamanho: "16", precoAVista: 70.00, precoCreditoAVista: 71.90, precoCreditoParcelado: 73.50 },
      { tamanho: "P", precoAVista: 72.00, precoCreditoAVista: 73.90, precoCreditoParcelado: 75.50 },
      { tamanho: "M", precoAVista: 76.00, precoCreditoAVista: 77.90, precoCreditoParcelado: 79.50 },
      { tamanho: "G", precoAVista: 82.00, precoCreditoAVista: 83.90, precoCreditoParcelado: 85.50 },
      { tamanho: "GG", precoAVista: 86.00, precoCreditoAVista: 87.90, precoCreditoParcelado: 89.50 },
      { tamanho: "XG", precoAVista: 90.00, precoCreditoAVista: 91.90, precoCreditoParcelado: 93.50 }
    ]
  },
  {
    nome: "Moletom Cosmos",
    sku: "MOL-COS-001",
    categoria: "moletom",
    precoBase: 64.50,
    status: "ativo",
    
    
    
    personalizacoes: { bordado: false, estampa: true, sublimacao: false },
    variacoesTamanhos: [
      { tamanho: "02", precoAVista: 64.50, precoCreditoAVista: 67.50, precoCreditoParcelado: 69.50 },
      { tamanho: "04", precoAVista: 68.50, precoCreditoAVista: 71.50, precoCreditoParcelado: 73.50 },
      { tamanho: "06", precoAVista: 74.50, precoCreditoAVista: 77.50, precoCreditoParcelado: 79.50 },
      { tamanho: "08", precoAVista: 78.50, precoCreditoAVista: 81.50, precoCreditoParcelado: 83.50 },
      { tamanho: "10", precoAVista: 84.50, precoCreditoAVista: 87.50, precoCreditoParcelado: 89.50 },
      { tamanho: "12", precoAVista: 94.50, precoCreditoAVista: 97.50, precoCreditoParcelado: 99.50 },
      { tamanho: "14", precoAVista: 104.50, precoCreditoAVista: 107.50, precoCreditoParcelado: 109.50 },
      { tamanho: "16", precoAVista: 114.50, precoCreditoAVista: 117.50, precoCreditoParcelado: 119.50 },
      { tamanho: "P", precoAVista: 124.50, precoCreditoAVista: 127.50, precoCreditoParcelado: 129.50 },
      { tamanho: "M", precoAVista: 129.50, precoCreditoAVista: 132.50, precoCreditoParcelado: 134.50 },
      { tamanho: "G", precoAVista: 132.50, precoCreditoAVista: 135.50, precoCreditoParcelado: 137.50 },
      { tamanho: "GG", precoAVista: 134.50, precoCreditoAVista: 137.50, precoCreditoParcelado: 139.50 },
      { tamanho: "XG", precoAVista: 145.50, precoCreditoAVista: 148.50, precoCreditoParcelado: 150.50 }
    ]
  },
  {
    nome: "Calça Adulto Cosmos",
    sku: "CAL-AD-COS-001",
    categoria: "calca",
    precoBase: 48.50,
    status: "ativo",
    
    
    
    personalizacoes: { bordado: false, estampa: false, sublimacao: false },
    variacoesTamanhos: [
      { tamanho: "02", precoAVista: 48.50, precoCreditoAVista: 50.50, precoCreditoParcelado: 52.50 },
      { tamanho: "04", precoAVista: 50.50, precoCreditoAVista: 52.50, precoCreditoParcelado: 54.50 },
      { tamanho: "06", precoAVista: 56.50, precoCreditoAVista: 58.50, precoCreditoParcelado: 60.50 },
      { tamanho: "08", precoAVista: 60.50, precoCreditoAVista: 62.50, precoCreditoParcelado: 64.50 },
      { tamanho: "10", precoAVista: 66.50, precoCreditoAVista: 68.50, precoCreditoParcelado: 70.50 },
      { tamanho: "12", precoAVista: 73.50, precoCreditoAVista: 75.50, precoCreditoParcelado: 77.50 },
      { tamanho: "14", precoAVista: 80.50, precoCreditoAVista: 82.50, precoCreditoParcelado: 84.50 },
      { tamanho: "16", precoAVista: 86.50, precoCreditoAVista: 88.50, precoCreditoParcelado: 90.50 },
      { tamanho: "P", precoAVista: 90.50, precoCreditoAVista: 92.50, precoCreditoParcelado: 94.50 },
      { tamanho: "M", precoAVista: 96.50, precoCreditoAVista: 98.50, precoCreditoParcelado: 100.50 },
      { tamanho: "G", precoAVista: 101.50, precoCreditoAVista: 103.50, precoCreditoParcelado: 105.50 },
      { tamanho: "GG", precoAVista: 106.50, precoCreditoAVista: 108.50, precoCreditoParcelado: 110.50 },
      { tamanho: "XG", precoAVista: 110.50, precoCreditoAVista: 112.50, precoCreditoParcelado: 114.50 }
    ]
  },
  {
    nome: "Bermuda Masculina Cosmos",
    sku: "BER-MAS-COS-001",
    categoria: "bermuda",
    precoBase: 36.50,
    status: "ativo",
    
    
    
    personalizacoes: { bordado: false, estampa: false, sublimacao: false },
    variacoesTamanhos: [
      { tamanho: "02", precoAVista: 36.50, precoCreditoAVista: 38.50, precoCreditoParcelado: 40.50 },
      { tamanho: "04", precoAVista: 38.50, precoCreditoAVista: 40.50, precoCreditoParcelado: 42.50 },
      { tamanho: "06", precoAVista: 44.50, precoCreditoAVista: 46.50, precoCreditoParcelado: 48.50 },
      { tamanho: "08", precoAVista: 48.50, precoCreditoAVista: 50.50, precoCreditoParcelado: 52.50 },
      { tamanho: "10", precoAVista: 51.50, precoCreditoAVista: 53.50, precoCreditoParcelado: 55.50 },
      { tamanho: "12", precoAVista: 55.50, precoCreditoAVista: 57.50, precoCreditoParcelado: 59.50 },
      { tamanho: "14", precoAVista: 59.50, precoCreditoAVista: 61.50, precoCreditoParcelado: 63.50 },
      { tamanho: "16", precoAVista: 63.50, precoCreditoAVista: 65.50, precoCreditoParcelado: 67.50 },
      { tamanho: "P", precoAVista: 69.50, precoCreditoAVista: 71.50, precoCreditoParcelado: 73.50 },
      { tamanho: "M", precoAVista: 71.50, precoCreditoAVista: 73.50, precoCreditoParcelado: 75.50 },
      { tamanho: "G", precoAVista: 75.50, precoCreditoAVista: 77.50, precoCreditoParcelado: 79.50 },
      { tamanho: "GG", precoAVista: 81.50, precoCreditoAVista: 83.50, precoCreditoParcelado: 85.50 },
      { tamanho: "XGG", precoAVista: 86.50, precoCreditoAVista: 88.50, precoCreditoParcelado: 90.50 }
    ]
  },
  {
    nome: "Leg Adulto — Tabela B",
    sku: "LEG-AD-B-001",
    categoria: "leg",
    precoBase: 38.50,
    status: "ativo",
    
    
    
    personalizacoes: { bordado: false, estampa: false, sublimacao: false },
    variacoesTamanhos: [
      { tamanho: "P", precoAVista: 38.50, precoCreditoAVista: 40.50, precoCreditoParcelado: 42.50 },
      { tamanho: "M", precoAVista: 40.50, precoCreditoAVista: 42.50, precoCreditoParcelado: 44.50 },
      { tamanho: "G", precoAVista: 42.50, precoCreditoAVista: 44.50, precoCreditoParcelado: 46.50 },
      { tamanho: "GG", precoAVista: 44.50, precoCreditoAVista: 46.50, precoCreditoParcelado: 48.50 }
    ]
  },
  {
    nome: "Short Masculino — Tabela B",
    sku: "SHO-MAS-B-001",
    categoria: "bermuda",
    precoBase: 28.50,
    status: "ativo",
    
    
    
    personalizacoes: { bordado: false, estampa: false, sublimacao: false },
    variacoesTamanhos: [
      { tamanho: "P", precoAVista: 28.50, precoCreditoAVista: 30.50, precoCreditoParcelado: 32.50 },
      { tamanho: "M", precoAVista: 30.50, precoCreditoAVista: 32.50, precoCreditoParcelado: 34.50 },
      { tamanho: "G", precoAVista: 32.50, precoCreditoAVista: 34.50, precoCreditoParcelado: 36.50 },
      { tamanho: "GG", precoAVista: 34.50, precoCreditoAVista: 36.50, precoCreditoParcelado: 38.50 }
    ]
  },
  {
    nome: "Jaqueta Adulto — Tabela B",
    sku: "JAQ-AD-B-001",
    categoria: "jaqueta",
    precoBase: 85.50,
    status: "ativo",
    
    
    
    personalizacoes: { bordado: false, estampa: false, sublimacao: false },
    variacoesTamanhos: [
      { tamanho: "P", precoAVista: 85.50, precoCreditoAVista: 89.50, precoCreditoParcelado: 93.50 },
      { tamanho: "M", precoAVista: 89.50, precoCreditoAVista: 93.50, precoCreditoParcelado: 97.50 },
      { tamanho: "G", precoAVista: 93.50, precoCreditoAVista: 97.50, precoCreditoParcelado: 101.50 },
      { tamanho: "GG", precoAVista: 97.50, precoCreditoAVista: 101.50, precoCreditoParcelado: 105.50 }
    ]
  }
];
