import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Clock,
  Layers,
  CheckCircle2,
  ListTodo,
  Eye,
  ShoppingBag,
} from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { usePedidos } from "@/features/pedidos";
import {
  LABEL_STATUS_PRODUCAO,
  type StatusProducao,
} from "@/features/pedidos/types";
import {
  corStatusProducao,
  formatarDataBR,
  hojeISO,
} from "@/features/pedidos/utils";
import { useClientes, getClienteNome } from "@/features/clientes";

const STATUS_MATRIZ_ATIVOS: StatusProducao[] = [
  "aguardando_orcamento_matriz",
  "orcamento_matriz_realizado",
  "aguardando_aprovacao",
  "producao_matriz",
];

export function MatrizDashboard() {
  const { pedidos } = usePedidos();
  const { clientes } = useClientes();
  const navigate = useNavigate();

  const nomeCliente = (id: string) => {
    const c = clientes.find((c) => c.id === id);
    return c ? getClienteNome(c) : "—";
  };

  const stats = useMemo(() => {
    const hoje = hojeISO();
    return {
      aguardandoOrcamento: pedidos.filter(
        (p) => p.statusProducao === "aguardando_orcamento_matriz",
      ).length,
      producaoMatriz: pedidos.filter(
        (p) => p.statusProducao === "producao_matriz",
      ).length,
      concluidasHoje: pedidos.filter(
        (p) =>
          p.statusProducao === "matriz_concluida" &&
          p.atualizadoEm.slice(0, 10) === hoje,
      ).length,
      totalPendentes: pedidos.filter((p) =>
        STATUS_MATRIZ_ATIVOS.includes(p.statusProducao),
      ).length,
    };
  }, [pedidos]);

  const pendentes = useMemo(
    () =>
      pedidos
        .filter((p) => STATUS_MATRIZ_ATIVOS.includes(p.statusProducao))
        .sort((a, b) => a.criadoEm.localeCompare(b.criadoEm)),
    [pedidos],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel da Matriz"
        description="Acompanhe os pedidos que dependem do processo de matriz."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Aguardando orçamento"
          value={String(stats.aguardandoOrcamento)}
          hint="pedidos precisam de orçamento"
          icon={Clock}
        />
        <StatCard
          label="Matrizes em produção"
          value={String(stats.producaoMatriz)}
          hint="em execução agora"
          icon={Layers}
        />
        <StatCard
          label="Concluídas hoje"
          value={String(stats.concluidasHoje)}
          hint="finalizadas no dia"
          icon={CheckCircle2}
        />
        <StatCard
          label="Tarefas pendentes"
          value={String(stats.totalPendentes)}
          hint="aguardando sua ação"
          icon={ListTodo}
        />
      </div>

      <section className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)] sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Pedidos pendentes
            </h2>
            <p className="text-xs text-muted-foreground">
              Lista dos pedidos que aguardam alguma ação da matriz.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate({ to: "/pedidos" })}
          >
            Ver todos
          </Button>
        </div>

        {pendentes.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Nenhum pedido pendente"
            description="Quando houver pedidos aguardando ação da matriz, eles aparecerão aqui."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-muted/50 hover:bg-surface-muted/50">
                    <TableHead>Número</TableHead>
                    <TableHead className="min-w-[180px]">Cliente</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[60px] text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendentes.map((p) => {
                    const produto =
                      p.itens[0]?.produto ??
                      (p.itens.length ? `${p.itens.length} itens` : "—");
                    const prioridade = p.previsaoEntrega
                      ? p.previsaoEntrega < hojeISO()
                        ? "Alta"
                        : "Normal"
                      : "Normal";
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs font-semibold">
                          {p.numero}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {nomeCliente(p.clienteId)}
                        </TableCell>
                        <TableCell className="text-sm">{produto}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatarDataBR(p.criadoEm.slice(0, 10))}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-medium",
                              prioridade === "Alta"
                                ? "border-destructive/40 bg-destructive/10 text-destructive"
                                : "border-border bg-muted text-muted-foreground",
                            )}
                          >
                            {prioridade}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-medium",
                              corStatusProducao(p.statusProducao),
                            )}
                          >
                            {LABEL_STATUS_PRODUCAO[p.statusProducao]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => navigate({ to: "/pedidos" })}
                            aria-label="Visualizar pedido"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
