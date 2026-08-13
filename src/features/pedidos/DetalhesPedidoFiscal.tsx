import { useMemo, useState } from "react";
import { 
  Printer, 
  CheckCircle2, 
  XCircle,
  Phone,
  MapPin,
  FileText,
  User,
  CreditCard,
  History,
  Package
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  formatarMoeda, 
  formatarDataBR, 
  formatarDataHoraBR,
  calcularSubtotalItem,
  totalItensPedido 
} from "@/features/pedidos/utils";
import { useClientes, getClienteNome } from "@/features/clientes";
import { imprimirPedido } from "@/features/pedidos/imprimirPedido";
import { 
  LABEL_FORMA_PAGAMENTO_PEDIDO, 
  LABEL_TIPO_PERSONALIZACAO,
  LABEL_POSICAO_PERSONALIZACAO
} from "@/features/pedidos/types";
import { cn } from "@/lib/utils";

interface Props {
  pedido: any | null;
  onFechar: () => void;
  onMarcarEmitida: (id: string, emitida: boolean) => void;
}

export function DetalhesPedidoFiscal({ pedido, onFechar, onMarcarEmitida }: Props) {
  const { clientes } = useClientes();
  const [confirmarDesfazer, setConfirmarEmitida] = useState(false);

  const cliente = useMemo(() => {
    if (!pedido) return null;
    return clientes.find(c => c.id === pedido.clienteId);
  }, [pedido, clientes]);

  if (!pedido) return null;

  const emitida = !!pedido.notaFiscalControle?.emitida;

  return (
    <>
      <Dialog open={!!pedido} onOpenChange={(v) => !v && onFechar()}>
        <DialogContent className="max-w-3xl gap-0 p-0 overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader className="p-6 border-b bg-surface">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                   <DialogTitle className="text-xl font-mono">{pedido.numero}</DialogTitle>
                   {emitida ? (
                     <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                       Emitida em {formatarDataBR(pedido.notaFiscalControle.emitidaEm)}
                     </Badge>
                   ) : (
                     <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                       Pendente de emissão
                     </Badge>
                   )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Pedido realizado em {formatarDataHoraBR(pedido.criadoEm)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => imprimirPedido(pedido, cliente)} className="gap-2">
                  <Printer className="h-4 w-4" /> Imprimir Pedido
                </Button>
                {emitida ? (
                  <Button variant="outline" size="sm" onClick={() => setConfirmarEmitida(true)} className="text-destructive hover:text-destructive">
                    Marcar como não emitida
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => onMarcarEmitida(pedido.id, true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Marcar como emitida
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8">
              {/* Seção Cliente */}
              <section className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <User className="h-3 w-3" /> Dados do Cliente
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="font-bold text-lg">{cliente ? getClienteNome(cliente) : "Cliente não identificado"}</p>
                    {cliente && (
                      <>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span className="font-mono">{cliente.tipo === 'empresa' ? `CNPJ: ${cliente.cnpj}` : `CPF: ${cliente.cpf}`}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{cliente.telefone || "Telefone não informado"}</span>
                        </div>
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 mt-0.5" />
                          <span>{cliente.logradouro}, {cliente.numero}{cliente.complemento ? ` - ${cliente.complemento}` : ""}<br />{cliente.bairro} - {cliente.cidade}/{cliente.estado}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <CreditCard className="h-3 w-3" /> Financeiro
                  </h4>
                  <div className="bg-surface-muted/50 rounded-xl p-4 border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Forma de Pagamento:</span>
                      <span className="font-medium">{pedido.pagamentos?.[0]?.forma ? LABEL_FORMA_PAGAMENTO_PEDIDO[pedido.pagamentos[0].forma as keyof typeof LABEL_FORMA_PAGAMENTO_PEDIDO] : "Não informada"}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>{formatarMoeda(pedido.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Desconto:</span>
                      <span>- {formatarMoeda(pedido.desconto)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Frete:</span>
                      <span>+ {formatarMoeda(pedido.frete)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
                      <span>Total:</span>
                      <span className="text-primary">{formatarMoeda(pedido.total)}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Seção Itens */}
              <section className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Package className="h-3 w-3" /> Itens do Pedido ({totalItensPedido(pedido)})
                </h4>
                <div className="rounded-xl border bg-surface overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-muted/50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">Produto</th>
                        <th className="px-4 py-3 text-center font-medium">Qtd</th>
                        <th className="px-4 py-3 text-right font-medium">Unitário</th>
                        <th className="px-4 py-3 text-right font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {pedido.itens.map((it: any) => (
                        <tr key={it.id}>
                          <td className="px-4 py-3">
                            <div className="font-medium">{it.produto} {it.tamanho && <span className="text-muted-foreground font-normal ml-1">• Tam: {it.tamanho}</span>}</div>
                            {it.personalizacoes?.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {it.personalizacoes.map((p: any) => (
                                  <Badge key={p.id} variant="secondary" className="text-[10px] py-0 h-4">
                                    {LABEL_TIPO_PERSONALIZACAO[p.tipo as keyof typeof LABEL_TIPO_PERSONALIZACAO]}: {LABEL_POSICAO_PERSONALIZACAO[p.posicao as keyof typeof LABEL_POSICAO_PERSONALIZACAO]}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">{it.quantidade}</td>
                          <td className="px-4 py-3 text-right">{formatarMoeda(it.valorUnitario)}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatarMoeda(calcularSubtotalItem(it))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {pedido.observacoes && (
                <section className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Observações</h4>
                  <div className="p-4 bg-surface-muted/30 border rounded-lg text-sm text-foreground whitespace-pre-wrap">
                    {pedido.observacoes}
                  </div>
                </section>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmarDesfazer} onOpenChange={setConfirmarEmitida}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como não emitida?</AlertDialogTitle>
            <AlertDialogDescription>
              O pedido voltará para a lista de pendências. Use esta opção caso tenha marcado o pedido como emitido por engano.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onMarcarEmitida(pedido.id, false);
                setConfirmarEmitida(false);
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}