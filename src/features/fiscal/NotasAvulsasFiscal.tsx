import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { consultarStatusNfe } from "@/lib/fiscal-avulsa.functions";
import { Plus, Search, FileText, CheckCircle2, Clock, RefreshCw, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { useNfeAvulsas } from "./useNfeAvulsas";
import { LABEL_STATUS_NFE, STATUS_NFE_FINAIS } from "./types";
import { cn } from "@/lib/utils";

export function NotasAvulsasFiscal() {
  const { notas, atualizarNotaFiscal, excluir } = useNfeAvulsas();
  const [busca, setBusca] = useState("");
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const consultarStatusFn = useServerFn(consultarStatusNfe);
  const [sincronizando, setSincronizando] = useState<string | null>(null);

  /** Consulta (GET) o status atual da NF-e já transmitida — nunca reemite. */
  const sincronizarStatus = async (id: string, spedyId: string, ambiente: "sandbox" | "producao") => {
    setSincronizando(id);
    try {
      const res: any = await consultarStatusFn({ data: { spedyId, ambiente } });
      if (res?.ok && res.nota) {
        atualizarNotaFiscal(id, res.nota);
        if (res.nota.status === "authorized") toast.success("NF-e autorizada com sucesso.");
        else if (res.nota.status === "rejected") {
          toast.error("NF-e rejeitada pela SEFAZ", { description: res.nota.processingDetail?.message || undefined });
        } else toast.info("A NF-e continua em processamento.");
      } else {
        toast.error(res?.mensagem || "Falha ao consultar status.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Falha ao consultar status.");
    } finally {
      setSincronizando(null);
    }
  };

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
                    {n.notaFiscal?.spedyId && !STATUS_NFE_FINAIS.includes(n.notaFiscal.status) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 mr-2"
                        disabled={sincronizando === n.id}
                        onClick={() => sincronizarStatus(n.id, n.notaFiscal!.spedyId, n.notaFiscal!.ambiente)}
                      >
                        <RefreshCw className={cn("h-3.5 w-3.5", sincronizando === n.id && "animate-spin")} />
                        Atualizar status
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">Detalhes</Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setExcluindoId(n.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!excluindoId} onOpenChange={(open) => !open && setExcluindoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir NF-e Avulsa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá o registro da nota avulsa do sistema local. 
              Isso **não** cancela a nota fiscal na SEFAZ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (excluindoId) {
                  excluir(excluindoId);
                  toast.success("Nota excluída com sucesso.");
                  setExcluindoId(null);
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
