import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Package,
  Users,
  ShoppingBag,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { usePedidos, corStatusProducao, corStatusFinanceiro, formatarDataBR, formatarMoeda } from "@/features/pedidos";
import { useClientes } from "@/features/clientes";
import { getClienteNome } from "@/features/clientes/types";
import { StatusProducaoValues, LABEL_STATUS_PRODUCAO, LABEL_STATUS_FINANCEIRO, FORMAS_PAGAMENTO_PEDIDO, LABEL_FORMA_PAGAMENTO_PEDIDO } from "@/features/pedidos/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Tooltip,
} from "recharts";
import {
  startOfMonth,
  subMonths,
  subDays,
  isWithinInterval,
  parseISO,
  format,
  eachDayOfInterval,
  startOfDay,
  endOfDay,
  differenceInDays,
  isSameDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export function Dashboard() {
  const { pedidos } = usePedidos();
  const { clientes } = useClientes();
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState("este_mes");

  const stats = useMemo(() => {
    const agora = new Date();
    let inicio: Date;
    let fim: Date = endOfDay(agora);

    // Definir intervalo atual
    switch (periodo) {
      case "hoje":
        inicio = startOfDay(agora);
        break;
      case "7_dias":
        inicio = startOfDay(subDays(agora, 6));
        break;
      case "30_dias":
        inicio = startOfDay(subDays(agora, 29));
        break;
      case "mes_anterior":
        inicio = startOfMonth(subMonths(agora, 1));
        fim = endOfDay(subDays(startOfMonth(agora), 1));
        break;
      case "este_ano":
        inicio = new Date(agora.getFullYear(), 0, 1);
        break;
      case "este_mes":
      default:
        inicio = startOfMonth(agora);
        break;
    }

    // Intervalo anterior para comparação
    const duracao = differenceInDays(fim, inicio) + 1;
    const inicioAnterior = subDays(inicio, duracao);
    const fimAnterior = subDays(fim, duracao);

    const ehVendaValida = (p: any) =>
      ![
        StatusProducaoValues.EM_ORCAMENTO,
        StatusProducaoValues.AGUARDANDO_APROVACAO,
        StatusProducaoValues.CANCELADO,
        StatusProducaoValues.PENDENTE_ORCAMENTO,
        StatusProducaoValues.PENDENTE_ORCAMENTO_ESTAMPA,
        StatusProducaoValues.PENDENTE_ORCAMENTO_MATRIZ,
      ].includes(p.statusProducao);

    const filtrarPorIntervalo = (lista: any[], start: Date, end: Date) =>
      lista.filter((p) => {
        const data = parseISO(p.criadoEm);
        return isWithinInterval(data, { start, end });
      });

    // Dados Período Atual
    const pedidosNoPeriodo = filtrarPorIntervalo(pedidos, inicio, fim);
    const pedidosValidos = pedidosNoPeriodo.filter(ehVendaValida);
    const faturamento = pedidosValidos.reduce((sum, p) => sum + p.total, 0);
    
    const pagamentosNoPeriodo = pedidos.flatMap(p => p.pagamentos || []).filter(pag => {
      const dataPag = parseISO(pag.data);
      return isWithinInterval(dataPag, { start: inicio, end: fim });
    });
    const totalRecebido = pagamentosNoPeriodo.reduce((sum, pag) => sum + pag.valor, 0);
    
    const aReceber = pedidosValidos.reduce((sum, p) => sum + (p.total - (p.totalPago || 0)), 0);

    // Dados Período Anterior (para trend)
    const pedidosAnterior = filtrarPorIntervalo(pedidos, inicioAnterior, fimAnterior);
    const validosAnterior = pedidosAnterior.filter(ehVendaValida);
    const faturamentoAnterior = validosAnterior.reduce((sum, p) => sum + p.total, 0);

    const calcularTrend = (atual: number, anterior: number) => {
      if (anterior === 0) return null;
      const diff = ((atual - anterior) / anterior) * 100;
      return {
        value: `${Math.abs(diff).toFixed(1)}%`,
        direction: diff >= 0 ? ("up" as const) : ("down" as const),
      };
    };

    const trendFaturamento = calcularTrend(faturamento, faturamentoAnterior);

    // Gráfico de Faturamento (Evolução)
    const dias = eachDayOfInterval({ start: inicio, end: fim });
    const dataGraficoFaturamento = dias.map(dia => {
      const pedidosDoDia = pedidosValidos.filter(p => isSameDay(parseISO(p.criadoEm), dia));
      return {
        data: format(dia, periodo === "este_ano" ? "MMM" : "dd/MM", { locale: ptBR }),
        valor: pedidosDoDia.reduce((sum, p) => sum + p.total, 0),
        pedidos: pedidosDoDia.length,
        fullDate: format(dia, "dd/MM/yyyy"),
      };
    });

    // Gráfico de Status
    const statusGrupos = [
      { label: "Em Orçamento", status: [StatusProducaoValues.EM_ORCAMENTO, StatusProducaoValues.PENDENTE_ORCAMENTO, StatusProducaoValues.PENDENTE_ORCAMENTO_ESTAMPA, StatusProducaoValues.PENDENTE_ORCAMENTO_MATRIZ], color: "#94a3b8" },
      { label: "Aguardando Aprovação", status: [StatusProducaoValues.AGUARDANDO_APROVACAO], color: "#fbbf24" },
      { label: "Em Produção", status: [StatusProducaoValues.ORCAMENTO_APROVADO, StatusProducaoValues.PRODUCAO_MATRIZ, StatusProducaoValues.MATRIZ_CONCLUIDA, StatusProducaoValues.PRODUCAO, StatusProducaoValues.BORDADO, StatusProducaoValues.COSTURA], color: "#3b82f6" },
      { label: "Finalizados", status: [StatusProducaoValues.FINALIZADO], color: "#10b981" },
      { label: "Entregues", status: [StatusProducaoValues.ENTREGUE], color: "#ec4899" },
      { label: "Cancelados", status: [StatusProducaoValues.CANCELADO], color: "#ef4444" },
    ];

    const dataGraficoStatus = statusGrupos.map(g => {
      const qtd = pedidosNoPeriodo.filter(p => g.status.includes(p.statusProducao as any)).length;
      return { name: g.label, value: qtd, color: g.color };
    }).filter(g => g.value > 0);

    // Gráfico de Recebimentos por Forma
    const dataGraficoFormas = FORMAS_PAGAMENTO_PEDIDO.map(forma => {
      const total = pagamentosNoPeriodo.filter(pag => pag.forma === forma).reduce((sum, pag) => sum + pag.valor, 0);
      return { name: LABEL_FORMA_PAGAMENTO_PEDIDO[forma], value: total };
    }).filter(f => f.value > 0);

    // Pedidos Recentes
    const pedidosRecentes = [...pedidosNoPeriodo]
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
      .slice(0, 5);

    const pendentes = pedidos.filter(p => 
      ![StatusProducaoValues.FINALIZADO, StatusProducaoValues.ENTREGUE, StatusProducaoValues.CANCELADO].includes(p.statusProducao as any)
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
      totalRecebido,
      aReceber,
      totalPedidos: pedidosNoPeriodo.length,
      totalClientes: clientes.length,
      pendentes,
      emProducao,
      ticketMedio: pedidosValidos.length > 0 ? faturamento / pedidosValidos.length : 0,
      trendFaturamento,
      dataGraficoFaturamento,
      dataGraficoStatus,
      dataGraficoFormas,
      pedidosRecentes,
      semDados: pedidosNoPeriodo.length === 0 && pagamentosNoPeriodo.length === 0
    };
  }, [pedidos, clientes, periodo]);

  const nomeCliente = (id: string) => {
    const c = clientes.find((c) => c.id === id);
    return c ? getClienteNome(c) : "—";
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Dashboard Administrativo"
          description="Visão consolidada do sistema Stella Espaço dos Uniformes."
        />
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">Período:</span>
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[180px] bg-surface border-border">
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
      </div>

      {/* Linha 1: Indicadores Principais */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Faturamento"
          value={formatarMoeda(stats.faturamento)}
          icon={ShoppingBag}
          trend={stats.trendFaturamento || undefined}
        />
        <StatCard
          label="Recebido no Período"
          value={formatarMoeda(stats.totalRecebido)}
          icon={TrendingUp}
        />
        <StatCard
          label="A Receber"
          value={formatarMoeda(stats.aReceber)}
          icon={Clock}
          hint="Vendas aprovadas pendentes"
        />
        <StatCard
          label="Total de Pedidos"
          value={String(stats.totalPedidos)}
          icon={ShoppingBag}
          hint="Criados no período"
        />
      </div>
      
      {/* Linha 2: Indicadores Secundários */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Ticket Médio"
          value={formatarMoeda(stats.ticketMedio)}
          icon={TrendingDown}
        />
        <StatCard
          label="Pedidos Pendentes"
          value={String(stats.pendentes)}
          icon={Clock}
          hint="Total acumulado"
        />
        <StatCard
          label="Em Produção"
          value={String(stats.emProducao)}
          icon={Package}
          hint="Total acumulado"
        />
        <StatCard
          label="Clientes"
          value={String(stats.totalClientes)}
          icon={Users}
          hint="Base total"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Gráfico de Evolução de Faturamento */}
        <section className="lg:col-span-2 rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center justify-between">
            Faturamento no período
            {stats.faturamento > 0 && <span className="text-xs font-normal text-muted-foreground">Total: {formatarMoeda(stats.faturamento)}</span>}
          </h3>
          <div className="h-[300px] w-full">
            {stats.faturamento > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dataGraficoFaturamento}>
                  <defs>
                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="data" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickFormatter={(v) => `R$ ${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as any;
                        return (
                          <div className="rounded-lg border border-border bg-background p-3 shadow-xl">
                            <p className="text-xs font-medium text-muted-foreground mb-1">{data.fullDate}</p>
                            <p className="text-sm font-bold text-foreground">{formatarMoeda(data.valor)}</p>
                            <p className="text-xs text-muted-foreground">{data.pedidos} pedido(s)</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="#ec4899" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValor)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-muted/20 rounded-lg border border-dashed border-border">
                <ShoppingBag className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Ainda não há dados de faturamento neste período.</p>
              </div>
            )}
          </div>
        </section>
        
        {/* Gráfico de Status */}
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Status dos Pedidos</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            {stats.dataGraficoStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.dataGraficoStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.dataGraficoStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        const total = stats.totalPedidos;
                        const percent = ((data.value as number) / total * 100).toFixed(1);
                        return (
                          <div className="rounded-lg border border-border bg-background p-2 shadow-lg">
                            <p className="text-xs font-bold" style={{ color: (data.payload as any).color }}>{data.name}</p>
                            <p className="text-xs font-medium">{data.value} pedidos ({percent}%)</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-muted/20 rounded-lg border border-dashed border-border">
                <Clock className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Sem pedidos no período.</p>
              </div>
            )}
          </div>
          {stats.dataGraficoStatus.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {stats.dataGraficoStatus.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-medium text-muted-foreground truncate">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Gráfico de Formas de Pagamento */}
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Recebimentos por Forma</h3>
          <div className="h-[250px] w-full">
            {stats.dataGraficoFormas.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dataGraficoFormas} layout="vertical" margin={{ left: 0, right: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    width={80}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-border bg-background p-2 shadow-lg">
                            <p className="text-xs font-bold text-foreground">{payload[0].name}</p>
                            <p className="text-xs font-medium text-primary">{formatarMoeda(payload[0].value as number)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-muted/20 rounded-lg border border-dashed border-border">
                <TrendingUp className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm font-medium text-muted-foreground text-balance">Nenhum recebimento registrado neste período.</p>
              </div>
            )}
          </div>
        </section>

        {/* Pedidos Recentes */}
        <section className="lg:col-span-2 rounded-xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Pedidos Recentes</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/pedidos" })} className="text-xs font-medium text-primary">
              Ver todos
            </Button>
          </div>
          
          {stats.pedidosRecentes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-muted/50 hover:bg-surface-muted/50">
                    <TableHead className="h-8 text-[10px] uppercase font-bold">Número</TableHead>
                    <TableHead className="h-8 text-[10px] uppercase font-bold">Cliente</TableHead>
                    <TableHead className="h-8 text-[10px] uppercase font-bold">Data</TableHead>
                    <TableHead className="h-8 text-right text-[10px] uppercase font-bold">Valor</TableHead>
                    <TableHead className="h-8 text-[10px] uppercase font-bold">Status</TableHead>
                    <TableHead className="h-8 w-[40px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.pedidosRecentes.map((p) => (
                    <TableRow key={p.id} className="cursor-pointer hover:bg-surface-muted/30" onClick={() => navigate({ to: "/pedidos" })}>
                      <TableCell className="py-2 font-mono text-xs font-semibold">{p.numero}</TableCell>
                      <TableCell className="py-2 text-xs font-medium">{nomeCliente(p.clienteId)}</TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground">{formatarDataBR(p.criadoEm.slice(0, 10))}</TableCell>
                      <TableCell className="py-2 text-right text-xs font-semibold">{formatarMoeda(p.total)}</TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline" className={cn("text-[9px] px-1 py-0 h-4 font-medium", corStatusProducao(p.statusProducao))}>
                          {LABEL_STATUS_PRODUCAO[p.statusProducao]}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        <Button size="icon" variant="ghost" className="h-6 w-6">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
              <ShoppingBag className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Nenhum pedido recente.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
