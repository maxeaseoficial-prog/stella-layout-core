import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { 
  Search, 
  Building, 
  Package, 
  Trash2, 
  Plus, 
  Check, 
  AlertCircle,
  Truck,
  CreditCard,
  FileText,
  Info,
  ExternalLink,
  Download,
  RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useClientes, getClienteNome } from "@/features/clientes";
import { useProdutos } from "@/features/produtos";
import { useNfeAvulsas } from "./useNfeAvulsas";
import { useFiscalConfig } from "./useFiscalConfig";
import { formatarMoeda, novoId } from "@/features/pedidos/utils";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { emitirNfeAvulsa, previewPayloadNfeAvulsa, consultarStatusNfe } from "@/lib/fiscal-avulsa.functions";
import { PayloadPreviewDialog } from "./PayloadPreviewDialog";
import { supabase } from "@/integrations/supabase/client";
import { searchCategoriasFiscais, getCategoriaFiscalPorId } from "./ncm.functions";
import { SPEDY_BASE_URLS } from "./spedy";
import type { AmbienteApiSpedy, NotaFiscalPedido, StatusNfe } from "./types";
import { STATUS_NFE_FINAIS } from "./types";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
  aberto: boolean;
  onFechar: () => void;
}

export function NfeAvulsaDrawer({ aberto, onFechar }: Props) {
  const { clientes } = useClientes();
  const { ativos: produtos } = useProdutos();
  const { criar, atualizarNotaFiscal } = useNfeAvulsas();
  const { config } = useFiscalConfig();
  const emitirFn = useServerFn(emitirNfeAvulsa);
  
const [buscaCliente, setBuscaCliente] = useState("");
  const [destinatario, setDestinatario] = useState<any>(null);
  const [itens, setItens] = useState<any[]>([]);
  const [valores, setValores] = useState({
    desconto: 0,
    frete: 0,
    outrasDespesas: 0,
    movimentarEstoque: false
  });
  const [emitindo, setEmitindo] = useState(false);
  const [notaSucesso, setNotaSucesso] = useState<any>(null);
  const previewFn = useServerFn(previewPayloadNfeAvulsa);
  const [preview, setPreview] = useState<any>(null);
  const [previewAberto, setPreviewAberto] = useState(false);
  const [previewCarregando, setPreviewCarregando] = useState(false);

  const [dialogDescartarAberto, setDialogDescartarAberto] = useState(false);

  // ---- Sincronização assíncrona de status (polling GET, nunca reemite) ----
  const consultarStatusFn = useServerFn(consultarStatusNfe);
  const [avulsaId, setAvulsaId] = useState<string | null>(null);
  const [consultando, setConsultando] = useState(false);
  const [pollingExpirado, setPollingExpirado] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tentativasRef = useRef(0);
  const pollingAtivoRef = useRef<string | null>(null);
  const avulsaIdRef = useRef<string | null>(null);

  useEffect(() => { avulsaIdRef.current = avulsaId; }, [avulsaId]);

  const pararPolling = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    pollingAtivoRef.current = null;
    tentativasRef.current = 0;
  }, []);

  const ehFinal = (status?: StatusNfe) => !!status && STATUS_NFE_FINAIS.includes(status);

  const aplicarNota = useCallback((nota: NotaFiscalPedido, anterior?: StatusNfe) => {
    setNotaSucesso(nota);
    const id = avulsaIdRef.current;
    if (id) atualizarNotaFiscal(id, nota);
    if (nota.status !== anterior) {
      if (nota.status === "authorized") toast.success("NF-e autorizada com sucesso.");
      else if (nota.status === "rejected") {
        toast.error("NF-e rejeitada pela SEFAZ", {
          description: nota.processingDetail?.message || "Verifique os detalhes da rejeição.",
        });
      }
    }
  }, [atualizarNotaFiscal]);

  /** Consulta única (usada pelo botão manual e pelo polling). */
  const consultarAgora = useCallback(async (nota: NotaFiscalPedido) => {
    if (!nota?.spedyId) return null;
    setConsultando(true);
    try {
      const res: any = await consultarStatusFn({ data: { spedyId: nota.spedyId, ambiente: nota.ambiente } });
      if (res?.ok && res.nota) {
        aplicarNota(res.nota, nota.status);
        return res.nota as NotaFiscalPedido;
      }
      if (res?.mensagem) toast.error(res.mensagem);
      return null;
    } catch (err: any) {
      console.error("[NfeAvulsaDrawer] Falha ao consultar status:", err);
      return null;
    } finally {
      setConsultando(false);
    }
  }, [aplicarNota, consultarStatusFn]);

  const INTERVALO_POLLING = 2000;
  const MAX_TENTATIVAS = 30;

  const iniciarPolling = useCallback((nota: NotaFiscalPedido) => {
    if (!nota?.spedyId || ehFinal(nota.status)) return;
    if (pollingAtivoRef.current === nota.spedyId) return; // evita polling duplicado
    pararPolling();
    pollingAtivoRef.current = nota.spedyId;
    tentativasRef.current = 0;
    setPollingExpirado(false);

    const tick = async () => {
      if (pollingAtivoRef.current !== nota.spedyId) return;
      tentativasRef.current += 1;
      const atualizada = await consultarAgora(nota);
      if (pollingAtivoRef.current !== nota.spedyId) return;
      if (atualizada && ehFinal(atualizada.status)) {
        pararPolling();
        return;
      }
      if (tentativasRef.current >= MAX_TENTATIVAS) {
        pararPolling();
        setPollingExpirado(true);
        toast.info("A NF-e continua em processamento. Você pode atualizar o status manualmente.");
        return;
      }
      timerRef.current = setTimeout(tick, INTERVALO_POLLING);
    };

    timerRef.current = setTimeout(tick, INTERVALO_POLLING);
  }, [consultarAgora, pararPolling]);

  // Limpeza ao fechar o modal / desmontar
  useEffect(() => {
    if (!aberto) pararPolling();
  }, [aberto, pararPolling]);
  useEffect(() => () => pararPolling(), [pararPolling]);

  // Clientes filtrados
  const clientesFiltrados = useMemo(() => {
    const t = buscaCliente.toLowerCase();
    return clientes.filter(c => 
      getClienteNome(c).toLowerCase().includes(t) || 
      (c.tipo === 'empresa' ? c.cnpj : c.cpf)?.includes(t)
    );
  }, [clientes, buscaCliente]);

  // Totais
  const subtotal = useMemo(() => itens.reduce((acc, it) => acc + (it.quantidade * it.valorUnitario), 0), [itens]);
  const total = useMemo(() => Math.max(0, subtotal - valores.desconto + valores.frete + valores.outrasDespesas), [subtotal, valores]);

  const getByIdFn = useServerFn(getCategoriaFiscalPorId);

  const adicionarItem = async (p?: any) => {
    let catFiscal = (p as any)?.categoriaFiscal || null;
    let ncm = p?.ncm || "";
    let categoriaFiscalId = p?.categoriaFiscalId || "";
    
    // Se for um produto cadastrado com ID mas sem o objeto completo, tentar buscar
    if (p?.categoriaFiscalId && !catFiscal) {
      try {
        const cat = await getByIdFn({ data: { id: p.categoriaFiscalId } });
        if (cat) {
          catFiscal = cat;
          ncm = cat.ncm;
          categoriaFiscalId = cat.id;
        }
      } catch (err) {
        console.error("[NfeAvulsaDrawer] Erro ao buscar categoria fiscal do produto:", err);
      }
    }

    const novo = {
      id: novoId(),
      produtoId: p?.id,
      descricao: p?.nome || "",
      quantidade: 1,
      unidade: p?.unidade || "UN",
      valorUnitario: p?.precoBase || 0,
      ncm: ncm,
      categoriaFiscalId: categoriaFiscalId,
      descricaoFiscal: (p as any)?.descricaoFiscal || "",
      categoriaFiscal: catFiscal,
    };
    setItens(prev => [...prev, novo]);
  };

  const removerItem = (id: string) => setItens(itens.filter(it => it.id !== id));

  const atualizarItem = (id: string, patch: any) => {
    setItens(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it));
  };

  const validarDestinatario = () => {
    if (!destinatario) return "Selecione um destinatário.";
    
    const doc = (destinatario.tipo === 'empresa' ? destinatario.cnpj : destinatario.cpf) || "";
    if (doc.replace(/\D/g, "").length < 11) return "O destinatário não possui CPF/CNPJ válido cadastrado.";
    
    if (!destinatario.nome || destinatario.nome.trim().length < 2) return "O nome do destinatário é obrigatório.";
    if (!destinatario.cidade) return "O município do destinatário é obrigatório.";
    if (!destinatario.estado) return "A UF do destinatário é obrigatória.";
    if (!destinatario.cep) return "O CEP do destinatário é obrigatório.";
    if (!destinatario.logradouro) return "O logradouro (endereço) do destinatário é obrigatório.";
    
    return null;
  };

  const validarItens = () => {
    if (itens.length === 0) return "Adicione ao menos um item à nota.";
    for (const it of itens) {
      if (!it.descricao || it.descricao.trim().length < 2) return `Item com descrição inválida.`;
      if (!(it.quantidade > 0)) return `A quantidade do item "${it.descricao}" deve ser maior que zero.`;
      if (!(it.valorUnitario >= 0)) return `O valor do item "${it.descricao}" não pode ser negativo.`;
      
      if (!it.categoriaFiscalId) {
        return `Selecione a classificação fiscal do item "${it.descricao}" antes de emitir a NF-e.`;
      }

      const ncm = (it.ncm || "").replace(/\D/g, "");
      if (ncm.length !== 8) {
        return `O produto "${it.descricao}" não possui uma classificação fiscal (NCM) válida de 8 dígitos.`;
      }
    }
    return null;
  };

  /** Monta os dados enviados ao servidor (emissão e pré-visualização usam a mesma fonte). */
  const montarDadosEnvio = () => ({
    id: novoId(),
    destinatario: {
      nome: getClienteNome(destinatario),
      documento: (destinatario.tipo === 'empresa' ? destinatario.cnpj : destinatario.cpf) || "",
      email: destinatario.email || undefined,
      cep: destinatario.cep || undefined,
      logradouro: destinatario.logradouro || undefined,
      numero: destinatario.numero || undefined,
      bairro: destinatario.bairro || undefined,
      complemento: destinatario.complemento || undefined,
      cidade: destinatario.cidade || undefined,
      estado: destinatario.estado || undefined,
    },
    itens: itens.map((it: any) => ({
      id: it.id,
      descricao: it.descricao,
      quantidade: it.quantidade,
      unidade: it.unidade || "UN",
      valorUnitario: it.valorUnitario,
      desconto: 0,
      ncm: it.ncm,
      classificacaoFiscal: it.categoriaFiscal,
    })),
    subtotal,
    desconto: valores.desconto,
    frete: valores.frete,
    outrasDespesas: valores.outrasDespesas,
    total,
    movimentarEstoque: valores.movimentarEstoque,
  });

  const handlePreview = async () => {
    const erro = validarDestinatario() || validarItens();
    if (erro) {
      toast.error(erro);
      return;
    }
    setPreviewCarregando(true);
    try {
      const res = await previewFn({ data: montarDadosEnvio() });
      if (res.ok) {
        setPreview(res);
        setPreviewAberto(true);
      } else {
        toast.error(res.mensagem || "Não foi possível montar o payload.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Erro ao pré-visualizar o payload.");
    } finally {
      setPreviewCarregando(false);
    }
  };

  const handleEmitir = async () => {
    const erroDest = validarDestinatario();
    if (erroDest) {
      toast.error(erroDest);
      // setEtapa(1); // Não há mais etapas
      return;
    }

    const erroItens = validarItens();
    if (erroItens) {
      toast.error(erroItens);
      // setEtapa(2); // Não há mais etapas
      return;
    }

    if (total <= 0) {
      toast.error("O total da nota deve ser maior que zero.");
      // setEtapa(3); // Não há mais etapas
      return;
    }
    
    console.log("[NfeAvulsaDrawer] Iniciando emissão. Verificando sessão Supabase...");
    const { data: { session } } = await supabase.auth.getSession();
    console.log("[NfeAvulsaDrawer] Diagnóstico Sessão:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasToken: !!session?.access_token,
      expiresAt: session?.expires_at,
      now: Math.floor(Date.now() / 1000)
    });

    if (!session) {
      toast.error("Sessão não encontrada. Por favor, faça login novamente.");
      setEmitindo(false);
      return;
    }

    setEmitindo(true);
    try {
      const payload = montarDadosEnvio();

      const res = await emitirFn({ data: payload });

      
      if (res.ok) {
        const criada = criar({
          ...payload,
          clienteId: destinatario.id,
          notaFiscal: res.nota
        });
        setAvulsaId(criada?.id ?? null);
        avulsaIdRef.current = criada?.id ?? null;
        setNotaSucesso(res.nota);

        if (!STATUS_NFE_FINAIS.includes(res.nota.status)) {
          iniciarPolling(res.nota as NotaFiscalPedido);
        }

        if (res.nota.status === "authorized") {
          toast.success("NF-e Avulsa autorizada com sucesso!");
        } else if (res.nota.status === "rejected") {
          toast.error("NF-e rejeitada pela SEFAZ", {
            description: res.nota.processingDetail?.message || "Verifique os detalhes da rejeição."
          });
        } else {
          toast.info(`NF-e em processamento: ${res.nota.status}`);
        }
      } else {
        const errorMsg = res.mensagem || "Erro ao emitir NF-e";
        toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error("[NfeAvulsaDrawer] Error detail:", {
        name: err?.name,
        message: err?.message,
        cause: err?.cause,
        status: err?.status,
        statusCode: err?.statusCode,
        fullError: err
      });
      const msg = err?.message || "Erro inesperado ao emitir NF-e";
      toast.error(msg);
    } finally {
      setEmitindo(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={() => {
      if (itens.length > 0 || destinatario) {
        setDialogDescartarAberto(true);
      } else {
        onFechar();
      }
    }}>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh] overflow-hidden flex flex-col p-0">
        {notaSucesso ? (
          <div className="flex flex-col h-full animate-in fade-in zoom-in duration-300">
            <div className="p-8 text-center space-y-4">
              <div className={cn(
                "mx-auto w-16 h-16 rounded-full flex items-center justify-center",
                notaSucesso.status === "authorized" ? "bg-emerald-100 dark:bg-emerald-950/30" : 
                notaSucesso.status === "rejected" ? "bg-red-100 dark:bg-red-950/30" :
                "bg-amber-100 dark:bg-amber-950/30"
              )}>
                {notaSucesso.status === "authorized" ? (
                  <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                ) : notaSucesso.status === "rejected" ? (
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                ) : (
                  <Info className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {notaSucesso.status === "authorized" ? "NF-e autorizada com sucesso" :
                   notaSucesso.status === "rejected" ? "NF-e rejeitada" :
                   notaSucesso.status === "canceled" ? "NF-e cancelada" :
                   "NF-e em processamento"}
                </h2>
                <p className="text-muted-foreground">
                  {notaSucesso.status === "authorized" ? "A nota fiscal foi processada e autorizada pela SEFAZ." :
                   notaSucesso.status === "rejected" ? "A NF-e foi recebida pelo serviço fiscal, mas não foi autorizada." :
                   "Aguardando o processamento final da nota fiscal pela SEFAZ."}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Info className="h-4 w-4" /> Dados da Autorização
                  </h3>
                  <div className="bg-surface border rounded-xl p-4 space-y-3 shadow-sm">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Número / Série</span>
                      <span className="font-bold">{notaSucesso.numero || "—"} / {notaSucesso.serie || "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge className={cn(
                        notaSucesso.status === "authorized" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                        notaSucesso.status === "rejected" ? "bg-red-100 text-red-800 border-red-200" :
                        "bg-amber-100 text-amber-800 border-amber-200"
                      )}>
                        {notaSucesso.status === "authorized" ? "Autorizada" :
                         notaSucesso.status === "rejected" ? "Rejeitada" :
                         notaSucesso.status === "canceled" ? "Cancelada" :
                         "Processando"}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Protocolo</span>
                      <span className="font-mono text-xs">{notaSucesso.protocolo || "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Data/Hora</span>
                      <span>{notaSucesso.autorizadaEm ? new Date(notaSucesso.autorizadaEm).toLocaleString('pt-BR') : '—'}</span>
                    </div>
                    {notaSucesso.status === "rejected" && notaSucesso.processingDetail?.message && (
                      <div className="pt-2 border-t space-y-1">
                        <span className="text-[10px] font-bold uppercase text-red-600 dark:text-red-400">Motivo da Rejeição</span>
                        <p className="text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-100 dark:border-red-900/30">
                          {notaSucesso.processingDetail.message}
                        </p>
                      </div>
                    )}
                    <div className="pt-2 border-t space-y-1">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">Chave de Acesso</span>
                      <p className="text-[10px] font-mono break-all bg-surface-muted p-2 rounded border border-border">
                        {notaSucesso.chaveAcesso || "Aguardando..."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Building className="h-4 w-4" /> Destinatário & Valor
                  </h3>
                  <div className="bg-surface border rounded-xl p-4 space-y-3 shadow-sm">
                    <div className="space-y-1">
                      <p className="font-bold text-sm truncate">{getClienteNome(destinatario)}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {((destinatario.tipo === 'empresa' ? destinatario.cnpj : destinatario.cpf) || "").replace(/\D/g, "")}
                      </p>
                    </div>
                    <div className="pt-2 border-t flex justify-between items-end">
                      <span className="text-sm text-muted-foreground">Valor Total</span>
                      <span className="text-xl font-black text-primary">{formatarMoeda(total)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl space-y-2">
                    <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">Ações Disponíveis</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="bg-surface gap-2" disabled={notaSucesso.status !== "authorized" || !notaSucesso.spedyId} asChild={notaSucesso.status === "authorized" && !!notaSucesso.spedyId}>
                        {notaSucesso.status === "authorized" && !!notaSucesso.spedyId ? (
                          <a href={`${SPEDY_BASE_URLS[notaSucesso.ambiente as AmbienteApiSpedy]}/product-invoices/${notaSucesso.spedyId}/pdf`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" /> Visualizar DANFE
                          </a>
                        ) : (
                          <>
                            <ExternalLink className="h-4 w-4" /> Visualizar DANFE
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm" className="bg-surface gap-2" disabled={notaSucesso.status !== "authorized" || !notaSucesso.spedyId} asChild={notaSucesso.status === "authorized" && !!notaSucesso.spedyId}>
                        {notaSucesso.status === "authorized" && !!notaSucesso.spedyId ? (
                          <a href={`${SPEDY_BASE_URLS[notaSucesso.ambiente as AmbienteApiSpedy]}/product-invoices/${notaSucesso.spedyId}/pdf`} download={`DANFE-${notaSucesso.numero}.pdf`}>
                            <Download className="h-4 w-4" /> Baixar PDF
                          </a>
                        ) : (
                          <>
                            <Download className="h-4 w-4" /> Baixar PDF
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm" className="bg-surface gap-2 col-span-2" disabled={notaSucesso.status !== "authorized" || !notaSucesso.spedyId} asChild={notaSucesso.status === "authorized" && !!notaSucesso.spedyId}>
                        {notaSucesso.status === "authorized" && !!notaSucesso.spedyId ? (
                          <a href={`${SPEDY_BASE_URLS[notaSucesso.ambiente as AmbienteApiSpedy]}/product-invoices/${notaSucesso.spedyId}/xml`} download={`NFe-${notaSucesso.numero}.xml`}>
                            <Download className="h-4 w-4" /> Baixar XML Autorizado
                          </a>
                        ) : (
                          <>
                            <Download className="h-4 w-4" /> Baixar XML Autorizado
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 border-t bg-surface-muted/30 flex-col md:flex-row gap-2">
              {!STATUS_NFE_FINAIS.includes(notaSucesso.status) && (
                <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
                  <Button
                    variant="outline"
                    className="gap-2 w-full md:w-auto"
                    disabled={consultando}
                    onClick={() => consultarAgora(notaSucesso as NotaFiscalPedido)}
                  >
                    <RefreshCw className={cn("h-4 w-4", consultando && "animate-spin")} />
                    Atualizar status
                  </Button>
                  {pollingExpirado && (
                    <span className="text-xs text-muted-foreground">
                      A NF-e continua em processamento. Você pode atualizar o status manualmente.
                    </span>
                  )}
                </div>
              )}
              <Button 
                className="w-full md:w-auto" 
                onClick={() => {
                  pararPolling();
                  setPollingExpirado(false);
                  setAvulsaId(null);
                  setNotaSucesso(null);
                  onFechar();
                  // setEtapa(1); // Removido
                  setDestinatario(null);
                  setItens([]);
                }}
              >
                Concluir e Fechar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Emitir NF-e Avulsa
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label>Pesquisar Cliente</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Nome, CPF ou CNPJ..." 
                    className="pl-9"
                    value={buscaCliente}
                    onChange={(e) => setBuscaCliente(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                {clientesFiltrados.map(c => (
                  <button 
                    key={c.id} 
                    className={cn(
                      "flex items-center gap-3 p-4 border rounded-xl hover:bg-surface-muted transition-all text-left group",
                      destinatario?.id === c.id ? "border-primary bg-primary-soft/30" : "border-border"
                    )}
                    onClick={() => setDestinatario(c)}
                  >
                    <div className="h-10 w-10 rounded-full bg-surface flex items-center justify-center border border-border group-hover:border-primary/30">
                      <Building className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{getClienteNome(c)}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {c.tipo === 'empresa' ? `CNPJ: ${c.cnpj}` : `CPF: ${c.cpf}`} • {c.cidade}/{c.estado}
                      </div>
                    </div>
                    {destinatario?.id === c.id && <Check className="h-5 w-5 text-primary shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Itens da Nota Fiscal</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => adicionarItem()} className="gap-2">
                    <Plus className="h-4 w-4" /> Item Manual
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Package className="h-4 w-4" /> Adicionar Produto
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[300px]" align="end">
                      <Command>
                        <CommandInput placeholder="Buscar produto..." />
                        <CommandList>
                          <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                          <CommandGroup>
                            {produtos.map(p => (
                              <CommandItem key={p.id} onSelect={() => adicionarItem(p)}>
                                <span>{p.nome}</span>
                                <span className="ml-auto text-xs text-muted-foreground">{formatarMoeda(p.precoBase)}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden bg-surface">
                <table className="w-full text-sm">
                  <thead className="bg-surface-muted border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Descrição</th>
                      <th className="px-4 py-3 text-left font-medium w-64">Classificação Fiscal</th>
                      <th className="px-4 py-3 text-left font-medium w-24">Qtd</th>
                      <th className="px-4 py-3 text-left font-medium w-32">Valor Unit.</th>
                      <th className="px-4 py-3 text-left font-medium w-32">Total</th>
                      <th className="px-4 py-3 text-right font-medium w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {itens.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground italic">
                          Nenhum item adicionado
                        </td>
                      </tr>
                    )}
                    {itens.map(it => (
                      <tr key={it.id}>
                        <td className="px-4 py-3">
                          <Input 
                            value={it.descricao} 
                            onChange={(e) => atualizarItem(it.id, { descricao: e.target.value })}
                            className="h-8 text-xs"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <ClassificacaoFiscalPicker 
                            value={it.categoriaFiscalId}
                            selectedObject={it.categoriaFiscal}
                            onChange={(cat) => {
                              atualizarItem(it.id, {
                                categoriaFiscalId: cat?.id || "",
                                ncm: cat?.ncm || "",
                                categoriaFiscal: cat
                              });
                            }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input 
                            type="number"
                            value={it.quantidade} 
                            onChange={(e) => atualizarItem(it.id, { quantidade: Number(e.target.value) })}
                            className="h-8 text-xs"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input 
                            type="number"
                            value={it.valorUnitario} 
                            onChange={(e) => atualizarItem(it.id, { valorUnitario: Number(e.target.value) })}
                            className="h-8 text-xs"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {formatarMoeda(it.quantidade * it.valorUnitario)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removerItem(it.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Truck className="h-4 w-4" /> Custos Adicionais
                </h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Frete (R$)</Label>
                    <Input 
                      type="number" 
                      value={valores.frete} 
                      onChange={(e) => setValores({ ...valores, frete: Number(e.target.value) })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Desconto (R$)</Label>
                    <Input 
                      type="number" 
                      value={valores.desconto} 
                      onChange={(e) => setValores({ ...valores, desconto: Number(e.target.value) })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Outras Despesas (R$)</Label>
                    <Input 
                      type="number" 
                      value={valores.outrasDespesas} 
                      onChange={(e) => setValores({ ...valores, outrasDespesas: Number(e.target.value) })} 
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                      id="estoque" 
                      checked={valores.movimentarEstoque}
                      onCheckedChange={(checked) => setValores({ ...valores, movimentarEstoque: !!checked })}
                    />
                    <Label htmlFor="estoque" className="text-sm font-normal cursor-pointer">
                      Movimentar estoque dos produtos selecionados
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Resumo Financeiro
                </h3>
                <div className="border rounded-xl p-6 bg-surface-muted/30 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal dos itens</span>
                    <span>{formatarMoeda(subtotal)}</span>
                  </div>
                  {valores.frete > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Frete (+)</span>
                      <span>{formatarMoeda(valores.frete)}</span>
                    </div>
                  )}
                  {valores.desconto > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Desconto (-)</span>
                      <span>- {formatarMoeda(valores.desconto)}</span>
                    </div>
                  )}
                  {valores.outrasDespesas > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Outras despesas (+)</span>
                      <span>{formatarMoeda(valores.outrasDespesas)}</span>
                    </div>
                  )}
                  <div className="pt-4 border-t flex justify-between items-center">
                    <span className="font-bold">Total da Nota</span>
                    <span className="text-2xl font-black text-primary">{formatarMoeda(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-amber-800">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold">Atenção!</p>
                  <p>Revise todos os dados abaixo. Após a emissão, o cancelamento só é possível dentro do prazo legal da SEFAZ.</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Destinatário</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-[10px] text-primary"
                      // onClick={() => setEtapa(1)}
                    >
                      Corrigir dados
                    </Button>
                  </div>
                  <div className="border rounded-xl p-4 bg-surface space-y-2">
                    <p className="font-semibold text-sm">{getClienteNome(destinatario)}</p>
                    <p className="text-xs text-muted-foreground">
                      Documento: {((destinatario.tipo === 'empresa' ? destinatario.cnpj : destinatario.cpf) || "").replace(/\D/g, "") || "Não informado"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {destinatario.logradouro || "Sem logradouro"}, {destinatario.numero || "S/N"} - {destinatario.bairro || "Sem bairro"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {destinatario.cidade || "Sem cidade"}/{destinatario.estado || "—"} - {destinatario.cep || "Sem CEP"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resumo Fiscal</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-[10px] text-primary"
                      // onClick={() => setEtapa(2)}
                    >
                      Corrigir itens
                    </Button>
                  </div>
                  <div className="border rounded-xl p-4 bg-surface space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Itens</span>
                      <span>{itens.length} produtos</span>
                    </div>
                    <details className="group">
                      <summary className="flex justify-between text-xs cursor-pointer hover:text-primary transition-colors py-1 list-none">
                        <span className="text-muted-foreground">Dados fiscais detalhados</span>
                        <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="pt-2 space-y-2 border-t mt-1">
                        {itens.map((it, idx) => {
                          const ncmItem = (it.ncm || config.tributacao.ncm || "").replace(/\D/g, "");
                          const cfop = (destinatario.estado === config.empresa.estado) 
                            ? config.tributacao.cfopInterno 
                            : config.tributacao.cfopInterestadual;
                          const isSimples = config.tributacao.regime === "simplesNacional";

                          return (
                            <div key={idx} className="bg-surface-muted/50 p-2 rounded text-[10px] space-y-1">
                              <p className="font-medium truncate">{it.descricao}</p>
                              <div className="grid grid-cols-2 gap-x-2 text-muted-foreground">
                                <span>NCM: {ncmItem || <span className="text-red-500">Pendente</span>}</span>
                                <span>CFOP: {cfop}</span>
                                <span>{isSimples ? "CSOSN" : "CST"}: {isSimples ? config.tributacao.csosn : config.tributacao.icmsCst}</span>
                                {it.descricaoFiscal && <span className="col-span-2 italic truncate">{it.descricaoFiscal}</span>}
                              </div>
                            </div>
                          );
                        })}

                      </div>
                    </details>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Ambiente</span>
                      <span className="font-semibold text-primary uppercase">{config.ambienteFiscal}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Natureza</span>
                      <span>Venda de Mercadoria</span>
                    </div>
                    <div className="flex justify-between text-xs pt-2 border-t font-bold">
                      <span>Valor Final</span>
                      <span className="text-primary">{formatarMoeda(total)}</span>
                </div>
              </div>
            </div>
          </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Itens da NF-e</h4>
                <div className="border rounded-xl overflow-hidden text-xs">
                  <table className="w-full">
                    <thead className="bg-surface-muted border-b">
                      <tr>
                        <th className="px-3 py-2 text-left">Descrição</th>
                        <th className="px-3 py-2 text-center w-16">Qtd</th>
                        <th className="px-3 py-2 text-right w-24">Valor</th>
                        <th className="px-3 py-2 text-right w-24">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-surface">
                      {itens.map(it => (
                        <tr key={it.id}>
                          <td className="px-3 py-2 truncate">{it.descricao}</td>
                          <td className="px-3 py-2 text-center">{it.quantidade}</td>
                          <td className="px-3 py-2 text-right">{formatarMoeda(it.valorUnitario)}</td>
                          <td className="px-3 py-2 text-right font-medium">{formatarMoeda(it.quantidade * it.valorUnitario)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 border-t bg-surface-muted/30">
          <Button 
            variant="outline" 
            onClick={() => {
              if (itens.length > 0 || destinatario) {
                setDialogDescartarAberto(true);
              } else {
                onFechar();
              }
            }} 
            disabled={emitindo}
          >
            Cancelar
          </Button>
          <div className="flex-1" />
          {/* Removido o controle de etapas */}
          {/* {etapa > 1 && (
            <Button variant="ghost" onClick={() => setEtapa(e => e - 1)} disabled={emitindo}>
              Voltar
            </Button>
          )} */}
          {/* {etapa < 4 ? (
            <Button 
              onClick={() => setEtapa(e => e + 1)} 
              disabled={etapa === 1 ? !destinatario : itens.length === 0}
            >
              Próximo
            </Button>
          ) : ( */}
            <>
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={emitindo || previewCarregando}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                {previewCarregando ? "Montando..." : "Pré-visualizar"}
              </Button>
              <Button 
                onClick={handleEmitir} 
                disabled={emitindo}
                className="bg-primary hover:bg-primary/90 min-w-[140px]"
              >
                {emitindo ? "Transmitindo..." : "Confirmar e Emitir"}
              </Button>
            </>
          </DialogFooter>
        </>
      )}
    </DialogContent>
  </Dialog>
  <PayloadPreviewDialog
    aberto={previewAberto}
    onFechar={() => setPreviewAberto(false)}
    preview={preview}
  />

    <AlertDialog open={dialogDescartarAberto} onOpenChange={setDialogDescartarAberto}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Descartar esta NF-e?</AlertDialogTitle>
          <AlertDialogDescription>
            Os dados preenchidos nesta nota avulsa serão perdidos e não poderão ser recuperados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setDialogDescartarAberto(false)}>
            Continuar editando
          </AlertDialogAction>
          <AlertDialogAction 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              setDialogDescartarAberto(false);
              onFechar();
            }}
          >
            Descartar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

  );
}

function ClassificacaoFiscalPicker({ 
  value, 
  selectedObject,
  onChange 
}: { 
  value: string, 
  selectedObject?: any,
  onChange: (cat: any) => void 
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(selectedObject || null);
  
  const searchFn = useServerFn(searchCategoriasFiscais);
  const getByIdFn = useServerFn(getCategoriaFiscalPorId);

  // Sincronizar com prop externo
  useEffect(() => {
    if (selectedObject) {
      setSelectedCategory(selectedObject);
    }
  }, [selectedObject]);

  // Hidratar se tiver valor mas não tiver objeto selecionado ou se o valor mudou
  useEffect(() => {
    if (value) {
      if (!selectedCategory || selectedCategory.id !== value) {
        setLoading(true);
        getByIdFn({ data: { id: value } })
          .then(cat => {
            if (cat) setSelectedCategory(cat);
          })
          .catch(err => console.error("[ClassificacaoFiscalPicker] Erro ao hidratar:", err))
          .finally(() => setLoading(false));
      }
    } else if (!value) {
      setSelectedCategory(null);
    }
  }, [value, getByIdFn]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await searchFn({ data: { query } });
        setResults(data || []);
      } catch (err) {
        console.error("[ClassificacaoFiscalPicker] Erro na busca:", err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchFn]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-8 text-xs font-normal px-2"
        >
          {selectedCategory ? (
            <span className="truncate max-w-[180px]">
              {selectedCategory.nome_amigavel}
            </span>
          ) : (
            <span className="text-muted-foreground italic">Selecionar...</span>
          )}
          <Search className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Buscar por nome, NCM ou código..." 
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading && <div className="p-4 text-center text-xs text-muted-foreground">Buscando...</div>}
            {!loading && query.length >= 2 && results.length === 0 && (
              <CommandEmpty>Nenhuma classificação encontrada.</CommandEmpty>
            )}
            <CommandGroup>
              {results.map((cat) => (
                <CommandItem
                  key={cat.id}
                  value={cat.id}
                  onSelect={() => {
                    setSelectedCategory(cat);
                    onChange(cat);
                    setOpen(false);
                  }}
                  className="text-xs"
                >
                  <Check
                    className={cn(
                      "mr-2 h-3 w-3",
                      value === cat.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{cat.nome_amigavel}</span>
                    <span className="text-[10px] text-muted-foreground">NCM: {cat.ncm} | Cód: {cat.codigo}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
