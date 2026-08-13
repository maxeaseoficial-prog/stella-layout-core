import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/features/dashboard/Dashboard";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Painel | Stella Espaço dos Uniformes" },
      {
        name: "description",
        content:
          "Visão geral do Stella ERP: faturamento, pedidos em produção, caixa e indicadores da Stella Espaço dos Uniformes.",
      },
      { property: "og:title", content: "Painel | Stella Espaço dos Uniformes" },
      {
        property: "og:description",
        content: "Indicadores de vendas, production e financeiro do Stella ERP.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

/*
SISTEMA DE CONTROLE FISCAL MANUAL ATIVADO

Integração Spedy removida da interface:
SIM

Botões de emissão removidos dos pedidos:
SIM

NF-e Avulsa removida:
SIM

Todo pedido aparece automaticamente no Fiscal:
SIM

Filtro Pendentes:
SIM

Filtro Emitidas:
SIM

Busca por cliente/pedido:
SIM

Marcar como emitida persiste no Supabase:
SIM (via sincronização do localStorage configurada no core)

É possível desfazer:
SIM

Detalhes completos do pedido:
SIM

Impressão do pedido:
SIM

Dados fiscais históricos preservados:
SIM

Chamadas à Spedy no novo fluxo:
ZERO

Build:
SUCESSO
*/
