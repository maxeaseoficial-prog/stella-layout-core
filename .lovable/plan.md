# Plano de Melhoria do Dashboard Administrativo

Transformar o dashboard atual em um painel gerencial robusto com dados reais, filtros temporais e gráficos dinâmicos, mantendo a identidade visual da Stella.

## 1. Filtro Global de Período
- Adicionar componente de filtro no topo do dashboard.
- Opções: Hoje, Últimos 7/30 dias, Este mês (padrão), Mês anterior, Este ano e Personalizado (Data Inicial/Final).
- O estado do filtro será mantido durante a sessão (em memória).

## 2. Indicadores Financeiros (Cards)
- **Faturamento:** Soma de `pedido.total` para pedidos com status de venda válida (aprovados, em produção, finalizados, entregues). Exclui orçamentos pendentes e cancelados.
- **Recebido:** Soma de `pagamento.valor` de todos os pagamentos realizados dentro do período filtrado.
- **A Receber:** Diferença entre o faturamento total e o total pago para as vendas válidas do período.
- **Ticket Médio:** Faturamento dividido pela quantidade de pedidos de venda.
- **Comparação:** Mostrar variação percentual (%) em relação ao período anterior de mesma duração.

## 3. Gráficos Reais
- **Faturamento no Período:** Gráfico de área mostrando a evolução das vendas ao longo do tempo (agrupado por hora/dia/mês conforme o período).
- **Status dos Pedidos:** Gráfico de rosca (donut) com agrupamentos simplificados (Orçamento, Aprovação, Produção, Finalizado, Entregue, Cancelado).
- **Recebimentos por Forma:** Gráfico de barras ou rosca mostrando a distribuição dos valores recebidos por Pix, Dinheiro, Cartão, etc.

## 4. Pedidos Recentes
- Listagem dos últimos 5 a 8 pedidos do período com dados reais: Número, Cliente, Data, Valor e Status.
- Link direto para os detalhes do pedido.

## Detalhes Técnicos
- **Fonte de Dados:** `usePedidos` e `useClientes`.
- **Cálculos:** Centralizados em `useMemo` dentro do componente `Dashboard.tsx` para performance.
- **Bibliotecas:** `recharts` (via `src/components/ui/chart.tsx`) e `date-fns` para manipulação de datas.
- **Empty State:** UI elegante para períodos sem dados ("Ainda não há dados neste período").
- **Fiscal:** Nenhuma dependência de NF-e ou dados da Spedy.

