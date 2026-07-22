import { Eye, MoreHorizontal, Pencil, Printer, Trash2, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import { useClientes, getClienteNome } from "@/features/clientes";
import { useAuth } from "@/features/auth/useAuth";

import type { Pedido } from "./types";
import { LABEL_STATUS_FINANCEIRO, LABEL_STATUS_PRODUCAO } from "./types";
import {
  corStatusFinanceiro,
  corStatusProducao,
  formatarDataBR,
  formatarMoeda,
} from "./utils";

interface Props {
  pedidos: Pedido[];
  onVisualizar: (p: Pedido) => void;
  onEditar: (p: Pedido) => void;
  onExcluir: (p: Pedido) => void;
  onImprimir: (p: Pedido) => void;
  onReceberPagamento: (p: Pedido) => void;
}

export function PedidosTable({
  pedidos,
  onVisualizar,
  onEditar,
  onExcluir,
  onImprimir,
  onReceberPagamento,
}: Props) {
  const { clientes } = useClientes();
  const { capacidades } = useAuth();
  const cap = capacidades.pedidos;

  function nomeCliente(id: string) {
    const c = clientes.find((c) => c.id === id);
    return c ? getClienteNome(c) : "—";
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-soft)]">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-muted/50 hover:bg-surface-muted/50">
              <TableHead>Número</TableHead>
              <TableHead className="min-w-[180px]">Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Produção</TableHead>
              <TableHead>Financeiro</TableHead>
              <TableHead>Previsão</TableHead>
              <TableHead className="w-[60px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.map((p) => {
              const pendente = [
                "pendente_orcamento",
                "pendente_orcamento_estampa",
                "pendente_orcamento_matriz",
              ].includes(p.statusProducao);
              return (
              <TableRow
                key={p.id}
                className={cn(
                  "cursor-pointer",
                  pendente &&
                    "bg-amber-50/60 hover:bg-amber-100/60 border-l-4 border-l-amber-400",
                )}
                onClick={() => onVisualizar(p)}
              >
                <TableCell className="font-mono text-xs font-semibold text-foreground">
                  {p.numero}
                </TableCell>
                <TableCell className="text-sm font-medium text-foreground">
                  {nomeCliente(p.clienteId)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatarDataBR(p.criadoEm.slice(0, 10))}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums text-foreground">
                  {formatarMoeda(p.total)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("font-medium", corStatusProducao(p.statusProducao))}
                  >
                    {LABEL_STATUS_PRODUCAO[p.statusProducao]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium",
                      corStatusFinanceiro(p.statusFinanceiro),
                    )}
                  >
                    {LABEL_STATUS_FINANCEIRO[p.statusFinanceiro]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {p.previsaoEntrega ? formatarDataBR(p.previsaoEntrega) : "—"}
                </TableCell>
                <TableCell
                  className="text-right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onVisualizar(p)}>
                        <Eye className="h-4 w-4" /> Visualizar
                      </DropdownMenuItem>
                      {cap.editar && (
                        <DropdownMenuItem onClick={() => onEditar(p)}>
                          <Pencil className="h-4 w-4" /> Editar
                        </DropdownMenuItem>
                      )}
                      {cap.registrarPagamento && (
                        <DropdownMenuItem onClick={() => onReceberPagamento(p)}>
                          <Wallet className="h-4 w-4" /> Receber pagamento
                        </DropdownMenuItem>
                      )}
                      {cap.imprimir && (
                        <DropdownMenuItem onClick={() => onImprimir(p)}>
                          <Printer className="h-4 w-4" /> Imprimir
                        </DropdownMenuItem>
                      )}
                      {cap.excluir && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onExcluir(p)}
                          >
                            <Trash2 className="h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
