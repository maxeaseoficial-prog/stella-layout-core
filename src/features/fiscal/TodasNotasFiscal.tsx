import { useMemo, useState } from "react";
import { Search, Filter, RefreshCw, Trash2 } from "lucide-react";
import { usePedidos } from "@/features/pedidos/usePedidos";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatarMoeda, formatarDataBR } from "@/features/pedidos/utils";
import { LABEL_STATUS_NFE } from "./types";
import { RevisarEmissaoDialog } from "./RevisarEmissaoDialog";
import { toast } from "sonner";

export function TodasNotasFiscal() {
  const { pedidos, salvarNotaFiscal } = usePedidos();
  const [busca, setBusca] = useState("");
  const [revisando, setRevisando] = useState<any>(null);
  const [limpandoFiscalId, setLimpandoFiscalId] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    return pedidos.filter(p => {
      // Pedidos que tiveram alguma interação fiscal ou que são aptos
      if (!p.notaFiscal && !['producao', 'finalizado', 'entregue'].includes(p.statusProducao)) return false;
      
      const termo = busca.toLowerCase();
      return (
        p.numero.toLowerCase().includes(termo) ||
        (p.notaFiscal?.spedyId ?? "").toLowerCase().includes(termo) ||
        (p.notaFiscal?.status ?? "").toLowerCase().includes(termo)
      );
    });
  }, [pedidos, busca]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por pedido ou status..."
            className="pl-9"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-muted/50">
              <TableHead>Pedido</TableHead>
              <TableHead>Status Fiscal</TableHead>
              <TableHead>Última Atu.</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs font-semibold">{p.numero}</TableCell>
                  <TableCell>
                    {p.notaFiscal ? (
                      <Badge variant="outline" className={p.notaFiscal.status === 'authorized' ? 'bg-emerald-50 text-emerald-700' : ''}>
                        {LABEL_STATUS_NFE[p.notaFiscal.status]}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Não emitida</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.notaFiscal?.atualizadoEm ? formatarDataBR(p.notaFiscal.atualizadoEm) : formatarDataBR(p.atualizadoEm)}
                  </TableCell>
                  <TableCell className="text-sm font-semibold">{formatarMoeda(p.total)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setRevisando(p)}
                    >
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <RevisarEmissaoDialog 
        pedido={revisando} 
        onFechar={() => setRevisando(null)} 
      />
    </div>
  );
}
