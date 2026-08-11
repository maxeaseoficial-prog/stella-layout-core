import { useMemo, useState } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Download,
  Search,
  RefreshCw,
  FileText,
  AlertTriangle,
  Trash2
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { urlDanfePdf, urlXmlNfe } from "./spedy";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getNotasEmitidas } from "@/lib/fiscal-queries.functions";
import { excluirRegistroNotaFiscal } from "@/lib/fiscal-delete.functions";
import { toast } from "sonner";

export function NotasEmitidasFiscal() {
  const [busca, setBusca] = useState("");
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const fetchNotas = useServerFn(getNotasEmitidas);
  const excluirFn = useServerFn(excluirRegistroNotaFiscal);

  const { data: notas = [], isLoading, refetch } = useQuery({
    queryKey: ["notas_emitidas"],
    queryFn: () => fetchNotas(),
  });

  const mutationExcluir = useMutation({
    mutationFn: (id: string) => excluirFn({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notas_emitidas"] });
      toast.success("Registro excluído com sucesso.");
      setExcluindoId(null);
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir registro: " + (error.message || "Erro desconhecido"));
    }
  });

  const filtradas = useMemo(() => {
    return notas.filter(n => {
      const termo = busca.toLowerCase();
      const nomeDest = (n.resumo_destinatario as any)?.nome?.toLowerCase() || "";
      return (
        nomeDest.includes(termo) ||
        n.spedy_id.toLowerCase().includes(termo) ||
        (n.chave_acesso ?? "").includes(termo) ||
        (n.numero?.toString() ?? "").includes(termo)
      );
    });
  }, [notas, busca]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, número, ID Spedy ou chave..."
            className="pl-9"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-muted/50">
              <TableHead>Número NF-e</TableHead>
              <TableHead>Destinatário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Carregando notas emitidas...
                </TableCell>
              </TableRow>
            ) : filtradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Nenhuma nota fiscal autorizada encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filtradas.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-semibold">
                    {n.numero ? `${n.numero}/${n.serie}` : n.spedy_id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{(n.resumo_destinatario as any)?.nome}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {(n.resumo_destinatario as any)?.documento}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        {n.status === 'authorized' ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 py-0 h-5">
                            <CheckCircle2 className="h-3 w-3" /> Autorizada
                          </Badge>
                        ) : n.status === 'rejected' ? (
                          <Badge variant="destructive" className="gap-1 py-0 h-5">
                            <AlertTriangle className="h-3 w-3" /> Rejeitada
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 py-0 h-5">
                            <RefreshCw className="h-3 w-3 animate-spin" /> {n.status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        {n.tipo_emissao === 'avulsa' ? <FileText className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                        <span className="capitalize">{n.tipo_emissao}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {n.data_autorizacao ? formatarDataBR(n.data_autorizacao) : n.data_emissao ? formatarDataBR(n.data_emissao) : '—'}
                  </TableCell>
                  <TableCell className="text-sm font-semibold">
                    {formatarMoeda(n.valor_total ?? 0)}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {n.status === 'rejected' && n.mensagem_sefaz && (
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" title={n.mensagem_sefaz}>
                        <AlertCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="gap-2" asChild disabled={n.status !== 'authorized'}>
                      <a 
                        href={urlDanfePdf({ ambiente: n.ambiente as any, spedyId: n.spedy_id })} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" /> DANFE
                      </a>
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" asChild title="Baixar XML" disabled={n.status !== 'authorized'}>
                      <a 
                        href={urlXmlNfe({ ambiente: n.ambiente as any, spedyId: n.spedy_id })} 
                        download
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setExcluindoId(n.id)}
                      title="Excluir registro"
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
            <AlertDialogTitle>Excluir registro de nota fiscal?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá o registro local do sistema. Isso **não** cancela a nota fiscal na SEFAZ. 
              Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => excluindoId && mutationExcluir.mutate(excluindoId)}
            >
              Excluir Registro
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
