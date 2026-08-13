import { useMemo, useState } from "react";
import {
  Package,
  Users,
  ShoppingBag,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { usePedidos } from "@/features/pedidos";
import { useClientes } from "@/features/clientes";
import { StatusProducaoValues } from "@/features/pedidos/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  startOfMonth,
  subMonths,
  subDays,
  isWithinInterval,
  parseISO,
} from "date-fns";

export function Dashboard() {
  const { pedidos } = usePedidos();
  const { clientes } = useClientes();
  const [periodo, setPeriodo] = useState("este_mes");

  const stats = useMemo(() => {
    const agora = new Date();
    let inicio: Date;
    let fim: Date = agora;

    switch (periodo) {
      case "hoje":
        inicio = new Date(agora.setHours(0, 0, 0, 0));
        break;
      case "7_dias":
        inicio = subDays(agora, 7);
        break;
      case "30_dias":
        inicio = subDays(agora, 30);
        break;
      case "mes_anterior":
        inicio = startOfMonth(subMonths(agora, 1));
        fim = subDays(startOfMonth(agora), 1);
        break;
      case "este_ano":
        inicio = new Date(agora.getFullYear(), 0, 1);
        break;
      case "este_mes":
      default:
        inicio = startOfMonth(agora);
        break;
    }

    const ehVendaValida = (p: any) =>
      ![
        "em_orcamento",
        "aguardando_aprovacao",
        "cancelado",
      ].includes(p.statusProducao);

    const pedidosNoPeriodo = pedidos.filter((p) =>
      isWithinInterval(parseISO(p.criadoEm), { start: inicio, end: fim })
    );

    const pedidosValidos = pedidosNoPeriodo.filter(ehVendaValida);
    
    const faturamento = pedidosValidos.reduce((sum, p) => sum + p.total, 0);
    const totalPago = pedidosValidos.reduce((sum, p) => sum + p.totalPago, 0);
    const aReceber = Math.max(0, faturamento - totalPago);

    const pendentes = pedidos.filter(p => 
      p.statusProducao !== StatusProducaoValues.FINALIZADO && 
      p.statusProducao !== StatusProducaoValues.ENTREGUE &&
      p.statusProducao !== StatusProducaoValues.CANCELADO
    ).length;

    const emProducao = pedidos.filter(p => 
      [
        StatusProducaoValues.PRODUCAO,
        StatusProducaoValues.BORDADO,
        StatusProducaoValues.COSTURA,
        StatusProducaoValues.PRODUCAO_MATRIZ,
        StatusProducaoValues.ORCAMENTO_APROVADO
      ].includes(p.statusProducao as any)
    ).length;

    return {
      faturamento,
      totalRecebido: totalPago,
      aReceber,
      totalPedidos: pedidosNoPeriodo.length,
      totalClientes: clientes.length,
      pendentes,
      emProducao,
      ticketMedio: pedidosValidos.length > 0 ? faturamento / pedidosValidos.length : 0
    };
  }, [pedidos, clientes, periodo]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Dashboard Administrativo"
          description="Visão consolidada do sistema Stella Espaço dos Uniformes."
        />
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hoje">Hoje</SelectItem>
            <SelectItem value="7_dias">Últimos 7 dias</SelectItem>
            <SelectItem value="30_dias">Últimos 30 dias</SelectItem>
            <SelectItem value="este_mes">Este mês</SelectItem>
            <SelectItem value="mes_anterior">Mês anterior</SelectItem>
            <SelectItem value="este_ano">Este ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Faturamento"
          value={stats.faturamento.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          icon={ShoppingBag}
        />
        <StatCard
          label="Recebido"
          value={stats.totalRecebido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          icon={TrendingUp}
        />
        <StatCard
          label="A Receber"
          value={stats.aReceber.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          icon={Clock}
        />
        <StatCard
          label="Total de Pedidos"
          value={String(stats.totalPedidos)}
          icon={ShoppingBag}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Ticket Médio"
          value={stats.ticketMedio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          icon={TrendingDown}
        />
        <StatCard
          label="Pedidos Pendentes"
          value={String(stats.pendentes)}
          icon={Clock}
        />
        <StatCard
          label="Em Produção"
          value={String(stats.emProducao)}
          icon={Package}
        />
        <StatCard
          label="Clientes"
          value={String(stats.totalClientes)}
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Faturamento no período</h3>
          <p className="text-sm text-muted-foreground">Em breve: gráfico de área.</p>
        </section>
        
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Status de Pedidos</h3>
          <p className="text-sm text-muted-foreground">Em breve: gráfico de distribuição.</p>
        </section>
      </div>
    </div>
  );
}
