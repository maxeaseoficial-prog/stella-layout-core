import { useState, useMemo } from "react";
import { Plus, Search, FileText, CheckCircle2, Clock } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatarMoeda, formatarDataBR } from "@/features/pedidos/utils";
import { useNfeAvulsas } from "./useNfeAvulsas";
import { LABEL_STATUS_NFE } from "./types";

export function NotasAvulsasFiscal() {
  const { notas } = useNfeAvulsas();
  const [busca, setBusca] = useState("");

  const filtradas = useMemo(() => {
    return notas.filter(n => {
      const termo = busca.toLowerCase();
      return (
        n.destinatario.nome.toLowerCase().includes(termo) ||
        (n.notaFiscal?.chaveAcesso ?? "").includes(termo) ||
        (n.notaFiscal?.status ?? "").toLowerCase().includes(termo)
      );
    });
  }, [notas, busca]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por destinatário, chave ou status..."
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
              <TableHead>Destinatário</TableHead>
              <TableHead>Status Fiscal</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  Nenhuma NF-e avulsa encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filtradas.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-medium">{n.destinatario.nome}</TableCell>
                  <TableCell>
                    {n.notaFiscal ? (
                      <Badge variant="outline" className={n.notaFiscal.status === 'authorized' ? 'bg-emerald-50 text-emerald-700' : ''}>
                        {LABEL_STATUS_NFE[n.notaFiscal.status]}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Não emitida</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{formatarDataBR(n.criadaEm)}</TableCell>
                  <TableCell className="text-sm font-semibold">{formatarMoeda(n.total)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost">Detalhes</Button>
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
