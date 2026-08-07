import { useMemo, useState } from "react";
import { 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  FileText, 
  Info, 
  Package, 
  Send,
  Loader2,
  X
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/lib/toast";
import { usePedidos } from "@/features/pedidos/usePedidos";
import { formatarMoeda, totalItensPedido } from "@/features/pedidos/utils";
import { emitirNfePedido } from "@/lib/fiscal.functions";
import { useFiscalConfig } from "./useFiscalConfig";
import { NotaFiscalSection } from "./NotaFiscalSection";

interface Props {
  pedido: any | null;
  onFechar: () => void;
}

export function RevisarEmissaoDialog({ pedido, onFechar }: Props) {
  const { config } = useFiscalConfig();
  const [emitindo, setEmitindo] = useState(false);
  const { salvarNotaFiscal } = usePedidos();

  const validacoes = useMemo(() => {
    if (!pedido) return [];
    const erros = [];

    // Validar itens
    for (const it of pedido.itens) {
      const ncm = (it.ncm || config?.tributacao?.ncm || "").replace(/\D/g, "");
      if (ncm.length !== 8) {
        erros.push(`Produto "${it.produto}" não possui NCM válido de 8 dígitos.`);
      }
    }


    // Validar cliente (simplificado)
    if (!pedido.clienteId) {
      erros.push("Pedido sem cliente vinculado.");
    }

    // Validar valores
    if (pedido.total <= 0) {
      erros.push("O valor total do pedido deve ser maior que zero.");
    }

    return erros;
  }, [pedido]);

  const temErros = validacoes.length > 0;

  async function handleEmitir() {
    if (!pedido) return;
    setEmitindo(true);
    try {
      const res = await emitirNfePedido({ data: { pedidoId: pedido.id } });
      if (res.ok) {
        salvarNotaFiscal(pedido.id, res.nota, "NF-e enviada para emissão via módulo Fiscal.");
        toast.success("Nota Fiscal enviada com sucesso!");
        onFechar();
      } else {
        toast.error(res.mensagem);
      }
    } catch (error) {
      toast.error("Erro técnico ao tentar emitir a nota.");
    } finally {
      setEmitindo(false);
    }
  }

  if (!pedido) return null;

  return (
    <Dialog open={!!pedido} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="max-w-2xl gap-0 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Revisar Pedido {pedido.numero}</DialogTitle>
              <DialogDescription>
                Verifique os dados fiscais antes de enviar para a SEFAZ.
              </DialogDescription>
            </div>
            <Badge variant="outline" className="h-fit">
              {config.ambiente === 'sandbox' ? 'Ambiente de Testes' : 'Ambiente de Produção'}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-6">
          <div className="space-y-6 pb-6">
            {/* Seção de Alertas */}
            {temErros && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2 text-red-800 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-bold">Pendências impeditivas</span>
                </div>
                <ul className="space-y-1">
                  {validacoes.map((e, i) => (
                    <li key={i} className="text-xs text-red-700 flex items-start gap-1">
                      <span className="mt-1 h-1 w-1 rounded-full bg-red-400 shrink-0" />
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!temErros && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Todos os dados básicos foram validados.</span>
                </div>
              </div>
            )}

            {/* Resumo do Pedido */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Valor Total</p>
                <p className="text-lg font-bold">{formatarMoeda(pedido.total)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Qtde de Itens</p>
                <p className="text-lg font-bold">{totalItensPedido(pedido)} produtos</p>
              </div>
            </div>

            <Separator />

            {/* Lista de Itens */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" /> Itens e Classificação Fiscal
              </h4>
              <div className="grid gap-2">
                {pedido.itens.map((it: any) => {
                  const ncmItem = (it.ncm || config?.tributacao?.ncm || "").replace(/\D/g, "");
                  const isSimples = config?.tributacao?.regime === "simplesNacional";
                  const cfop = (pedido.cliente?.estado !== config?.empresa?.estado) 
                    ? config?.tributacao?.cfopInterestadual 
                    : config?.tributacao?.cfopInterno;

                  return (
                    <div key={it.id} className="rounded-md border border-border p-3 text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{it.produto}</p>
                          <p className="text-[10px] text-muted-foreground">{it.quantidade} un. x {formatarMoeda(it.valorUnitario)}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <p className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded flex items-center gap-1">
                            NCM: {ncmItem || <span className="text-red-500">Pendente</span>}
                          </p>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-[8px] h-4 py-0 px-1 font-mono">
                              CFOP: {cfop}
                            </Badge>
                            <Badge variant="outline" className="text-[8px] h-4 py-0 px-1 font-mono">
                              {isSimples ? `CSOSN: ${config?.tributacao?.csosn}` : `CST: ${config?.tributacao?.icmsCst}`}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {(it.ncm || it.descricaoFiscal) && (
                        <p className="text-[10px] text-muted-foreground leading-tight italic">
                          {it.descricaoFiscal || "Classificação Fiscal vinculada ao item"}
                        </p>
                      )}


                    {it.adicionais && it.adicionais.length > 0 && (
                      <div className="pt-1 border-t border-dashed border-border mt-1">
                        <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Adicionais (Sub-itens na NF):</p>
                        {it.adicionais.filter((a: any) => !a.pendencia).map((a: any) => (
                          <div key={a.id} className="flex justify-between text-[10px]">
                            <span>• {a.nome}</span>
                            <span className="font-mono">{formatarMoeda(a.valor)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    </div>
                  );
                })}

              </div>
            </div>

            {pedido.notaFiscal && (
              <>
                <Separator />
                <NotaFiscalSection pedido={pedido} />
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="border-t border-border p-4 bg-surface-muted/30">
          <Button variant="ghost" onClick={onFechar}>Fechar</Button>
          {!pedido.notaFiscal?.spedyId && (
            <Button 
              className="gap-2" 
              disabled={temErros || emitindo}
              onClick={handleEmitir}
            >
              {emitindo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Emitir Nota Fiscal agora
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
