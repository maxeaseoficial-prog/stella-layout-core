import { useMemo } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Download,
  Mail,
  RefreshCw,
  Search
} from "lucide-react";
import { usePedidos } from "@/features/pedidos/usePedidos";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { formatarMoeda, formatarDataBR } from "@/features/pedidos/utils";
import { urlDanfePdf, urlXmlNfe } from "./spedy";

export function NotasEmitidasFiscal() {
  const { pedidos } = usePedidos();
  const [busca, setBusca] = useState("");

  const emitidas = useMemo(() => {
    return pedidos.filter(p => {
      if (p.notaFiscal?.status !== 'authorized') return false;
      const termo = busca.toLowerCase();
      return (
        p.numero.toLowerCase().includes(termo) ||
        p.notaFiscal.spedyId.toLowerCase().includes(termo) ||
        (p.notaFiscal.chaveAcesso ?? "").includes(termo)
      );
    });
  }, [pedidos, busca]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por pedido, ID Spedy ou chave de acesso..."
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
              <TableHead>Número NF-e</TableHead>
              <TableHead>Pedido</TableHead>
              <TableHead>Emitida em</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Chave de Acesso</TableHead>
              <TableHead className="text-right">Documentos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emitidas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Nenhuma nota fiscal emitida encontrada.
                </TableCell>
              </TableRow>
            ) : (
              emitidas.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold">
                    {p.notaFiscal?.numero ? `${p.notaFiscal.numero}/${p.notaFiscal.serie}` : p.notaFiscal?.spedyId.slice(0, 8)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{p.numero}</TableCell>
                  <TableCell className="text-sm">
                    {p.notaFiscal?.emitidaEm ? formatarDataBR(p.notaFiscal.emitidaEm) : '—'}
                  </TableCell>
                  <TableCell className="text-sm font-semibold">
                    {formatarMoeda(p.notaFiscal?.valor ?? p.total)}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[150px] truncate font-mono text-[10px] text-muted-foreground" title={p.notaFiscal?.chaveAcesso ?? ''}>
                      {p.notaFiscal?.chaveAcesso ?? '—'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" asChild title="Ver DANFE">
                      <a href={urlDanfePdf(p.notaFiscal!)} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" asChild title="Baixar XML">
                      <a href={urlXmlNfe(p.notaFiscal!)} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
