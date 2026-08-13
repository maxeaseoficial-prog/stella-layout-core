import { useMemo } from "react";
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ShieldAlert,
  ArrowRight,
  Settings,
  History,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePedidos } from "@/features/pedidos/usePedidos";
import { useFiscalConfig } from "./useFiscalConfig";
import { useNfeAvulsas } from "./useNfeAvulsas";
import { formatarMoeda, totalItensPedido } from "@/features/pedidos/utils";
import { StatusProducaoValues, type StatusProducao } from "@/features/pedidos/types";

interface Props {
  onNavegar: (aba: string) => void;
}

export function FiscalDashboard({ onNavegar }: Props) {
  const { pedidos } = usePedidos();
  const { notas: avulsas } = useNfeAvulsas();
  const { config } = useFiscalConfig();

  const stats = useMemo(() => {
    const agora = new Date();
    const esteMes = agora.getMonth();
    const esteAno = agora.getFullYear();

    const pedidosMes = pedidos.filter(p => {
      const data = new Date(p.criadoEm);
      return data.getMonth() === esteMes && data.getFullYear() === esteAno;
    });

    const avulsasMes = avulsas.filter(n => {
      const data = new Date(n.criadaEm);
      return data.getMonth() === esteMes && data.getFullYear() === esteAno;
    });

    const aguardando = pedidos.filter(p => {
      if (p.notaFiscal?.status === 'authorized') return false;
      if (p.statusFinanceiro === 'cancelado') return false;
      const statusLiberacao = config.liberacaoPedido || 'producao';
      
      const statusElegiveisProducao: StatusProducao[] = [
        StatusProducaoValues.ORCAMENTO_APROVADO,
        StatusProducaoValues.PRODUCAO,
        StatusProducaoValues.BORDADO,
        StatusProducaoValues.COSTURA,
        StatusProducaoValues.FINALIZADO,
        StatusProducaoValues.ENTREGUE
      ];

      const statusElegiveisFinalizado: StatusProducao[] = [
        StatusProducaoValues.FINALIZADO,
        StatusProducaoValues.ENTREGUE
      ];

      if (statusLiberacao === 'producao') {
        return statusElegiveisProducao.includes(p.statusProducao);
      }
      return statusElegiveisFinalizado.includes(p.statusProducao);
    });

    const emitidasPedidosMes = pedidosMes.filter(p => p.notaFiscal?.status === 'authorized');
    const emitidasAvulsasMes = avulsasMes.filter(n => n.notaFiscal?.status === 'authorized');
    
    const faturamentoPedidos = emitidasPedidosMes.reduce((acc, p) => acc + (p.notaFiscal?.valor ?? p.total), 0);
    const faturamentoAvulsas = emitidasAvulsasMes.reduce((acc, n) => acc + (n.notaFiscal?.valor ?? n.total), 0);

    const rejeitadasPedidos = pedidosMes.filter(p => p.notaFiscal?.status === 'rejected');
    const rejeitadasAvulsas = avulsasMes.filter(n => n.notaFiscal?.status === 'rejected');
    
    const errosConfig = 0; // Configuração fiscal de produtos removida.

    return {
      aguardando: aguardando.length,
      emitidas: emitidasPedidosMes.length + emitidasAvulsasMes.length,
      faturamento: faturamentoPedidos + faturamentoAvulsas,
      rejeitadas: rejeitadasPedidos.length + rejeitadasAvulsas.length,
      errosConfig
    };
  }, [pedidos, avulsas, config.liberacaoPedido]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard 
          title="Pedidos Pendentes" 
          value={stats.aguardando} 
          icon={Clock} 
          color="amber"
          hint="Aguardando emissão"
        />
        <StatCard 
          title="Emitidas (Mês)" 
          value={stats.emitidas} 
          icon={CheckCircle2} 
          color="emerald"
          hint="NF-e autorizadas"
        />
        <StatCard 
          title="Rejeitadas" 
          value={stats.rejeitadas} 
          icon={AlertCircle} 
          color="red"
          hint="Falhas na SEFAZ"
        />
        <StatCard 
          title="Faturamento (Mês)" 
          value={formatarMoeda(stats.faturamento)} 
          icon={TrendingUp} 
          color="primary"
          hint="Valor total emitido"
        />
        <StatCard 
          title="Erro de Configuração" 
          value={stats.errosConfig} 
          icon={ShieldAlert} 
          color="zinc"
          hint="Produtos sem NCM"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Acesso Rápido</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start gap-2" onClick={() => onNavegar('pendentes')}>
              <ArrowRight className="h-4 w-4" /> Revisar pendências
            </Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => onNavegar('categorias')}>
              <Settings className="h-4 w-4" /> Configurar categorias
            </Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => onNavegar('avulsas')}>
              <FileText className="h-4 w-4" /> Notas avulsas
            </Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => onNavegar('todas')}>
              <History className="h-4 w-4" /> Abrir histórico
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Regras de Liberação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-surface-muted/40 p-4 text-sm text-muted-foreground">
              <p>O sistema está configurado para liberar pedidos para o Fiscal quando atingirem o status: 
                <span className="ml-1 font-bold text-foreground">
                  {config.liberacaoPedido === 'finalizado' ? 'Finalizado' : 'Em Produção'}
                </span>
              </p>
              <p className="mt-2">
                Total de pedidos aptos para emissão agora: 
                <span className="ml-1 font-bold text-primary">{stats.aguardando}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, hint }: any) {
  const colors: any = {
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    red: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
    primary: "bg-primary-soft text-primary",
    zinc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <div className={cn("rounded-md p-1.5", colors[color])}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
        </div>
        <div className="mt-3">
          <div className="text-xl font-bold text-foreground">{value}</div>
          <div className="text-[10px] text-muted-foreground">{hint}</div>
        </div>
      </CardContent>
    </Card>
  );
}

import { cn } from "@/lib/utils";
