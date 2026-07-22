import { createFileRoute } from "@tanstack/react-router";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  ShoppingBag,
  Clock,
  BarChart3,
  ListOrdered,
  Package,
} from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { PlaceholderPanel } from "@/components/common/PlaceholderPanel";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useCaixa } from "@/features/caixa";
import { formatarMoeda } from "@/features/caixa/utils";

import { useAuth } from "@/features/auth/useAuth";
import { MatrizDashboard } from "@/features/dashboard/MatrizDashboard";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { papel } = useAuth();
  if (papel === "operador_matriz") {
    return <MatrizDashboard />;
  }
  return <AdminDashboard />;
}

function AdminDashboard() {
  const { totais, movimentacoes } = useCaixa();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Acompanhe o desempenho geral do seu negócio."
        actions={
          <>
            <Button variant="outline" size="sm">
              Este mês
            </Button>
            <Button size="sm">Novo pedido</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Faturamento"
          value={formatarMoeda(totais.entradas)}
          hint="entradas registradas"
          icon={DollarSign}
        />
        <StatCard
          label="Lucro"
          value={formatarMoeda(totais.resultado)}
          hint="entradas - saídas"
          icon={TrendingUp}
        />
        <StatCard
          label="Gastos"
          value={formatarMoeda(totais.saidas)}
          hint="saídas registradas"
          icon={Receipt}
        />
        <StatCard
          label="Pedidos"
          value="—"
          hint="total no período"
          icon={ShoppingBag}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PlaceholderPanel title="Faturamento" className="lg:col-span-2">
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted/40 text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary/60" />
              {movimentacoes.length === 0
                ? "Espaço reservado para o gráfico"
                : `${movimentacoes.length} movimentações registradas`}
            </div>
          </div>
        </PlaceholderPanel>

        <PlaceholderPanel title="Pedidos pendentes">
          <EmptyState
            icon={Clock}
            title="Sem pendências"
            description="Os pedidos aguardando ação aparecerão aqui."
          />
        </PlaceholderPanel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PlaceholderPanel title="Últimos pedidos">
          <EmptyState
            icon={ListOrdered}
            title="Nenhum pedido ainda"
            description="Os pedidos mais recentes serão listados aqui."
          />
        </PlaceholderPanel>

        <PlaceholderPanel title="Produtos mais vendidos">
          <EmptyState
            icon={Package}
            title="Ranking em breve"
            description="Os produtos com maior saída aparecerão nesta seção."
          />
        </PlaceholderPanel>
      </div>
    </div>
  );
}
