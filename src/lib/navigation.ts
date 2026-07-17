export interface PageMeta {
  title: string;
  description?: string;
}

const PAGE_META: Record<string, PageMeta> = {
  "/": { title: "Dashboard", description: "Visão geral do seu negócio" },
  "/caixa": { title: "Caixa", description: "Movimentações e fechamento do dia" },
  "/clientes": { title: "Clientes", description: "Base de clientes cadastrados" },
  "/pedidos": { title: "Pedidos", description: "Acompanhe o fluxo de pedidos" },
  "/estoque": { title: "Estoque", description: "Produtos e níveis de estoque" },
  "/fornecedores": { title: "Fornecedores", description: "Parceiros e fornecedores" },
  "/matrizes-logos": {
    title: "Matrizes & Logos",
    description: "Arte, matrizes de bordado e logos",
  },
  "/configuracoes": { title: "Configurações", description: "Preferências e ajustes" },
};

export function getPageMeta(pathname: string): PageMeta {
  return PAGE_META[pathname] ?? { title: "Stella" };
}
