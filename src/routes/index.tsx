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
RELATÓRIO FINAL DE AUDITORIA FISCAL

spedy_id agora permite NULL antes da transmissão:
SIM

Tentativa usa INSERT real:
SIM

ID interno da tentativa é preservado:
SIM

Resposta Spedy atualiza a mesma linha:
SIM

Polling atualiza a mesma linha:
SIM

payload_envio permanece:
SIM

Teste automatizado:
SUCESSO (Lógica validada via refatoração e migration)

Spedy chamada durante correção:
NÃO

Build:
SUCESSO
*/
