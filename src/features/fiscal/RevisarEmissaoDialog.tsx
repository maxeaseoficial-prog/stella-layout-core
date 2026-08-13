import { useMemo, useState, useEffect } from "react";
import { 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  FileText, 
  Info, 
  Package, 
  Send,
  Loader2,
  X,
  ExternalLink,
  Download,
  Database,
  Search,
  Eye
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
import { getFiscalPreflight } from "@/lib/fiscal-preflight.functions";
import { previewNfePedido } from "@/lib/fiscal-preview.functions";
import { supabase } from "@/integrations/supabase/client";
import { useFiscalConfig } from "./useFiscalConfig";
import { NotaFiscalSection } from "./NotaFiscalSection";
import { SPEDY_BASE_URLS } from "./spedy";
import type { AmbienteApiSpedy } from "./types";

interface Props {
  pedido: any | null;
  onFechar: () => void;
}

export function RevisarEmissaoDialog({ pedido, onFechar }: Props) {
  const { config } = useFiscalConfig();
  const [emitindo, setEmitindo] = useState(false);
  const [notaSucesso, setNotaSucesso] = useState<any>(null);
  const [preflight, setPreflight] = useState<any>(null);
  const [carregandoPreflight, setCarregandoPreflight] = useState(false);
  const [showPayload, setShowPayload] = useState(false);
  const [realPayload, setRealPayload] = useState<any>(null);
  const [carregandoPayload, setCarregandoPayload] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const { salvarNotaFiscal } = usePedidos();

  useEffect(() => {
    if (pedido?.clienteId) {
      carregarPreflight();
    }
  }, [pedido?.clienteId]);

  async function carregarPreflight() {
    setCarregandoPreflight(true);
    try {
      const res = await getFiscalPreflight({ data: { clienteId: pedido.clienteId } });
      setPreflight(res);
    } catch (e) {
      console.error("Erro ao carregar preflight:", e);
      toast.error("Não foi possível validar os dados fiscais no servidor.");
    } finally {
      setCarregandoPreflight(false);
    }
  }

  async function sincronizarFiscal() {
    if (!pedido?.clienteId || !pedido?.cliente) return;
    
    setSincronizando(true);
    const id = toast.loading("Sincronizando dados fiscais com o servidor...");
    
    try {
      // 1. Pegar cliente local atual
      const clienteLocal = pedido.cliente;

      // 2. Persistir no Supabase
      const { data: session } = await supabase.auth.getSession();
      const { data: empUser } = await supabase
        .from("empresa_usuarios")
        .select("empresa_id")
        .eq("user_id", session?.session?.user?.id)
        .maybeSingle();

      const tenantId = empUser?.empresa_id;

      if (!tenantId) {
        throw new Error("Não foi possível determinar o ID da empresa para sincronização.");
      }

      // Localizar cliente local atualizado no storage
      const raw = localStorage.getItem("stella.clientes.v1");
      const clientes = JSON.parse(raw || "[]");
      const clienteLocal = clientes.find((c: any) => c.id === pedido.clienteId);

      if (!clienteLocal) {
        throw new Error("Cliente não encontrado no armazenamento local para sincronização.");
      }

      const { error } = await supabase
        .from("clientes")
        .upsert({
          id: pedido.clienteId,
          tenant_id: tenantId,
          data: clienteLocal as any,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // 3. Aguardar e reler do servidor (Preflight faz isso)
      const res = await getFiscalPreflight({ data: { clienteId: pedido.clienteId } }) as any;
      
      // 4. Comparar campos críticos
      const camposCriticos = ['tipo', 'indicadorIe', 'inscricaoEstadual', 'estado', 'cidade', 'cep', 'logradouro', 'numero'];
      const divergencias = [];
      
      for (const campo of camposCriticos) {
          const valLocal = clienteLocal[campo];
          const valRemoto = campo === 'estado' ? res.uf : res[campo];
          
          if (valLocal !== valRemoto && (valLocal || valRemoto)) {
              divergencias.push(campo);
          }
      }

      setPreflight(res);

      if (divergencias.length > 0) {
        toast.error(`Sincronização concluída com avisos. Campos ainda divergentes: ${divergencias.join(", ")}`, { id });
      } else {
        toast.success("Dados fiscais sincronizados e validados com sucesso!", { id });
      }
    } catch (e) {
      console.error("Erro na sincronização fiscal:", e);
      toast.error("Falha ao sincronizar dados fiscais.", { id });
    } finally {
      setSincronizando(false);
    }
  }

  async function carregarPayloadReal() {
    setCarregandoPayload(true);
    try {
      const res = await previewNfePedido({ data: { pedidoId: pedido.id } });
      setRealPayload(res.payload);
      setShowPayload(true);
    } catch (e) {
      console.error("Erro ao carregar payload:", e);
      toast.error("Não foi possível gerar a prévia do payload real.");
    } finally {
      setCarregandoPayload(false);
    }
  }


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
        setNotaSucesso(res.nota);
        toast.success("Nota Fiscal autorizada com sucesso!");
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
        {notaSucesso ? (
          <div className="flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="p-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">NF-e autorizada com sucesso</h2>
                <p className="text-muted-foreground">O pedido {pedido.numero} foi processado e a nota emitida.</p>
              </div>
            </div>

            <div className="px-8 pb-8 space-y-6">
              <div className="grid gap-4 md:grid-cols-2 bg-surface border rounded-xl p-4 shadow-sm">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Número / Série</p>
                  <p className="font-bold">{notaSucesso.numero} / {notaSucesso.serie}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Protocolo</p>
                  <p className="font-mono text-xs">{notaSucesso.protocolo}</p>
                </div>
                <div className="col-span-2 space-y-1 pt-2 border-t">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Chave de Acesso</p>
                  <p className="text-[10px] font-mono break-all bg-surface-muted p-2 rounded border border-border">
                    {notaSucesso.chaveAcesso}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl space-y-3">
                <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">Documentos Fiscais</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="bg-surface gap-2" asChild>
                    <a href={`${SPEDY_BASE_URLS[notaSucesso.ambiente as AmbienteApiSpedy]}/product-invoices/${notaSucesso.spedyId}/pdf`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" /> Visualizar DANFE
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="bg-surface gap-2" asChild>
                    <a href={`${SPEDY_BASE_URLS[notaSucesso.ambiente as AmbienteApiSpedy]}/product-invoices/${notaSucesso.spedyId}/pdf`} download={`DANFE-${pedido.numero}.pdf`}>
                      <Download className="h-4 w-4" /> Baixar PDF
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="bg-surface gap-2 md:col-span-2" asChild>
                    <a href={`${SPEDY_BASE_URLS[notaSucesso.ambiente as AmbienteApiSpedy]}/product-invoices/${notaSucesso.spedyId}/xml`} download={`NFe-${pedido.numero}.xml`}>
                      <Download className="h-4 w-4" /> Baixar XML Autorizado
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 border-t bg-surface-muted/30">
              <Button 
                className="w-full" 
                onClick={() => {
                  setNotaSucesso(null);
                  onFechar();
                }}
              >
                Fechar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Revisar Pedido {pedido.numero}</DialogTitle>
              <DialogDescription>
                Verifique os dados fiscais antes de enviar para a SEFAZ.
              </DialogDescription>
            </div>
            <Badge variant="outline" className="h-fit">
              {config.ambienteFiscal === 'homologacao' ? 'Ambiente de Homologação' : 'Ambiente de Produção'}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-6">
          <div className="space-y-6 pb-6">
            {/* Preflight do Servidor (Obrigatório) */}
            <div className="rounded-xl border border-border bg-surface-muted/30 overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-surface border-b flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Database className="h-3 w-3" /> Dados Fiscais do Destinatário (Canônico)
                </h4>
                {carregandoPreflight ? (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                ) : (
                  <Badge variant={preflight?.prontoParaEmitir ? "secondary" : "destructive"} className="text-[9px] px-1 h-4">
                    {preflight?.prontoParaEmitir ? "Validado" : "Inconsistente"}
                  </Badge>
                )}
              </div>
              
              <div className="p-4 space-y-4">
                {carregandoPreflight ? (
                  <div className="flex flex-col items-center justify-center py-4 gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-[10px] text-muted-foreground">Consultando base remota...</p>
                  </div>
                ) : preflight ? (
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase text-muted-foreground font-semibold">Razão Social / Nome</p>
                      <p className="font-medium truncate">{preflight.nome || "Não identificado"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase text-muted-foreground font-semibold">CNPJ/CPF</p>
                      <p className="font-mono">{preflight.federalTaxNumber || "Vazio"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase text-muted-foreground font-semibold">Situação IE</p>
                      <p className="capitalize font-medium">
                        {preflight.indicadorIe === 'contribuinte' ? 'Contribuinte ICMS' : 
                         preflight.indicadorIe === 'isento' ? 'Isento' : 
                         preflight.indicadorIe === 'nao_contribuinte' ? 'Não Contribuinte' : 
                         <span className="text-red-500 flex items-center gap-1 font-bold">Não Definido <AlertCircle className="h-3 w-3" /></span>}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase text-muted-foreground font-semibold">Inscrição Estadual</p>
                      <p className="font-mono">{preflight.inscricaoEstadual || (preflight.indicadorIe === 'isento' ? 'ISENTO' : 'N/A')}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase text-muted-foreground font-semibold">UF / Destino</p>
                      <p className="font-bold">{preflight.uf?.toUpperCase() || "???"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase text-muted-foreground font-semibold">Base de Dados</p>
                      <div className="flex items-center justify-between">
                        <p className="text-blue-600 font-medium flex items-center gap-1">
                          Remoto (Supabase) <CheckCircle2 className="h-3 w-3" />
                        </p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 text-primary" 
                          title="Sincronizar agora"
                          disabled={sincronizando}
                          onClick={sincronizarFiscal}
                        >
                          <Database className={`h-3 w-3 ${sincronizando ? 'animate-pulse' : ''}`} />
                        </Button>
                      </div>
                    </div>

                    {preflight.erros.length > 0 && (
                      <div className="col-span-2 mt-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-bold uppercase">Erros de Validação</span>
                        </div>
                        <ul className="space-y-1">
                          {preflight.erros.map((err: string, idx: number) => (
                            <li key={idx} className="text-[10px] text-red-600 dark:text-red-300">• {err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center italic py-4">Erro ao carregar validação do servidor.</p>
                )}
              </div>
            </div>

            {/* Alertas de Itens (UI Local) */}
            {temErros && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2 text-red-800 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-bold">Inconsistências nos Itens</span>
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

            {/* Resumo do Pedido */}
            <div className="grid grid-cols-2 gap-4 px-1">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Valor Total</p>
                <p className="text-lg font-bold">{formatarMoeda(pedido.total)}</p>
              </div>
              <div className="space-y-1 text-right">
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
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setShowPayload(!showPayload)}
              >
                <Eye className="h-4 w-4" /> {showPayload ? "Ocultar" : "Ver"} Payload
              </Button>
              <Button 
                className="gap-2" 
                disabled={temErros || !preflight?.prontoParaEmitir || emitindo}
                onClick={handleEmitir}
              >
                {emitindo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Emitir Nota Fiscal agora
              </Button>
            </div>
          )}
        </DialogFooter>
        
        {showPayload && preflight && (
          <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-[10px] border-t overflow-auto max-h-[30vh]">
            <p className="text-slate-500 mb-2 uppercase font-bold text-[9px] tracking-widest">// PREVIEW DO DESTINATÁRIO (PAYLOAD)</p>
            <pre>
{JSON.stringify({
  receiver: {
    federalTaxNumber: preflight.federalTaxNumber,
    stateTaxNumber: preflight.indicadorIe === 'contribuinte' ? preflight.inscricaoEstadual?.replace(/\D/g, '') : (preflight.indicadorIe === 'isento' ? 'ISENTO' : null),
    indicatorStateTaxNumber: preflight.indicadorIe === 'contribuinte' ? 1 : (preflight.indicadorIe === 'isento' ? 2 : 9)
  }
}, null, 2)}
            </pre>
          </div>
        )}

          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
