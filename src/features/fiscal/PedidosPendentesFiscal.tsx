import { useMemo, useState } from "react";
import { 
  Search, 
  Filter, 
  ArrowRight, 
  AlertTriangle,
  FileText
} from "lucide-react";
import { usePedidos } from "@/features/pedidos/usePedidos";
import { useFiscalConfig } from "./useFiscalConfig";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatarMoeda, formatarDataBR, totalItensPedido, corStatusProducao } from "@/features/pedidos/utils";
import { LABEL_STATUS_PRODUCAO } from "@/features/pedidos/types";
import { RevisarEmissaoDialog } from "./RevisarEmissaoDialog";

export function PedidosPendentesFiscal() {
  const { pedidos } = usePedidos();
  const { config } = useFiscalConfig();
  const [busca, setBusca] = useState("");
  const [revisando, setRevisando] = useState<any>(null);

  const pendentes = useMemo(() => {
    return pedidos.filter(p => {
      // Regra de negócio: não emitida ou com erro, status comercial apto, não cancelado
      if (p.notaFiscal?.status === 'authorized') return false;
      if (p.statusFinanceiro === 'cancelado') return false;
      
      const statusLiberacao = config.liberacaoPedido || 'producao';
      let apto = false;
      if (statusLiberacao === 'producao') {
        apto = ['producao', 'bordado', 'costura', 'finalizado', 'entregue'].includes(p.statusProducao);
      } else {
        apto = ['finalizado', 'entregue'].includes(p.statusProducao);
      }

      if (!apto) return false;

      // Filtro de busca
      const termo = busca.toLowerCase();
      return (
        p.numero.toLowerCase().includes(termo) ||
        p.id.toLowerCase().includes(termo)
      );
    });
  }, [pedidos, config.liberacaoPedido, busca]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por número do pedido..."
            className="pl-9"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filtros
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-muted/50">
              <TableHead className="w-[120px]">Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Status Comercial</TableHead>
              <TableHead>Status Fiscal</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendentes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  Nenhum pedido pendente de emissão no momento.
                </TableCell>
              </TableRow>
            ) : (
              pendentes.map((p) => {
                const temErro = p.itens.some(it => !it.ncm);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs font-semibold">{p.numero}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">Cliente #{p.clienteId.slice(0, 8)}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatarDataBR(p.criadoEm)}
                    </TableCell>
                    <TableCell className="text-sm font-semibold">{formatarMoeda(p.total)}</TableCell>
                    <TableCell className="text-sm">{totalItensPedido(p)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={corStatusProducao(p.statusProducao)}>
                        {LABEL_STATUS_PRODUCAO[p.statusProducao]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {temErro ? (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Erro de config.
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Pendente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="gap-2"
                        onClick={() => setRevisando(p)}
                      >
                        Revisar e emitir <ArrowRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
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
