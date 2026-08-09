import { useMemo } from "react";
import {
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { usePedidos } from "@/features/pedidos";
import { useClientes } from "@/features/clientes";
import { StatusProducaoValues, type StatusProducao } from "@/features/pedidos/types";

export function Dashboard() {
  const { pedidos } = usePedidos();
  const { clientes } = useClientes();

  const stats = useMemo(() => {
    const totalPedidos = pedidos.length;
    const totalClientes = clientes.length;
    
    const pendentes = pedidos.filter(p => 
      p.statusProducao !== StatusProducaoValues.FINALIZADO && 
      p.statusProducao !== StatusProducaoValues.ENTREGUE &&
      p.statusProducao !== StatusProducaoValues.CANCELADO
    ).length;

    const emProducao = pedidos.filter(p => {
      const elegiveis: StatusProducao[] = [
        StatusProducaoValues.PRODUCAO,
        StatusProducaoValues.BORDADO,
        StatusProducaoValues.COSTURA,
        StatusProducaoValues.PRODUCAO_MATRIZ,
        StatusProducaoValues.ORCAMENTO_APROVADO
      ];
      return elegiveis.includes(p.statusProducao);
    }).length;

    return {
      totalPedidos,
      totalClientes,
      pendentes,
      emProducao
    };
  }, [pedidos, clientes]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel Geral"
        description="Visão consolidada do sistema Stella Espaço dos Uniformes."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total de Pedidos"
          value={String(stats.totalPedidos)}
          icon={ShoppingBag}
        />
        <StatCard
          label="Total de Clientes"
          value={String(stats.totalClientes)}
          icon={Users}
        />
        <StatCard
          label="Pedidos Pendentes"
          value={String(stats.pendentes)}
          icon={Clock}
          hint="Aguardando ação"
        />
        <StatCard
          label="Em Produção"
          value={String(stats.emProducao)}
          icon={Package}
          hint="Na oficina/matriz"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-6">
          <h3 className="text-lg font-semibold mb-4">Atividade Recente</h3>
          <p className="text-sm text-muted-foreground">Em breve: gráfico de movimentações.</p>
        </section>
        
        <section className="rounded-xl border border-border bg-surface p-6">
          <h3 className="text-lg font-semibold mb-4">Status de Pedidos</h3>
          <p className="text-sm text-muted-foreground">Em breve: distribuição por etapa.</p>
        </section>
      </div>
    </div>
  );
}
