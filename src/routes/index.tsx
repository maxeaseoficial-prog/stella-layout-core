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
RELATÓRIO DE UNIFICAÇÃO DE CHAVE API SPEDY

Causa da chave ter sumido:
A arquitetura anterior tentava ler colunas separadas (sandbox/producao) que estavam nulas ou desalinhadas com o registro legado.

chave_api legada estava presente:
SIM

Arquitetura voltou para uma chave:
SIM

Salvar credencial funciona:
SIM

Recarregar página mantém status configurado:
SIM

Testar conexão:
SUCESSO

NF-e emitida durante correção:
NÃO

Build:
SUCESSO
*/
