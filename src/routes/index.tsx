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
CORREÇÃO DE PERSISTÊNCIA DE AMBIENTES CONCLUÍDA

Botão para salvar ambientes adicionado:
SIM

ambienteApi persiste após trocar de aba:
SIM

ambienteFiscal persiste após trocar de aba:
SIM

Salvar credencial continua independente:
SIM

Testar conexão usa ambiente salvo:
SIM (Bloqueado se houver alterações não salvas)

NF-e emitida durante correção:
NÃO

Build:
SUCESSO
*/
