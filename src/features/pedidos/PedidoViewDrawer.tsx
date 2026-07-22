import { CheckCircle2, ClipboardList, Download, FileText, ImageIcon, Palette, Printer, Send, Wallet } from "lucide-react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

import { formatarTamanho } from "@/features/clientes/utils";
import { useClientes, getClienteNome, ClienteAvatar } from "@/features/clientes";
import { useAuth } from "@/features/auth/useAuth";
import { STATUS_PERMITIDOS_MATRIZ } from "@/features/auth/permissions";
import { LABEL_PENDENCIA_ADICIONAL } from "@/features/adicionais";
import { usePedidos } from "./usePedidos";
import { OrcamentosPendentesSection } from "./OrcamentosPendentesSection";
import {
  abrirWhatsApp,
  baixarPDF,
  gerarOrcamentoPDF,
  mensagemPadraoOrcamento,
  telefoneParaWhatsapp,
} from "./enviarOrcamento";
import { abrirImpressaoPDF, gerarOrdemProducaoPDF } from "./ordemProducao";
import { useConfiguracoes } from "@/features/configuracoes/useConfiguracoes";



import type { Pedido, StatusProducao, ItemPedido } from "./types";
import {
  LABEL_FORMA_PAGAMENTO_PEDIDO,
  LABEL_POSICAO_PERSONALIZACAO,
  LABEL_STATUS_FINANCEIRO,
  LABEL_STATUS_PRODUCAO,
  LABEL_TIPO_PERSONALIZACAO,
} from "./types";
import {
  calcularSubtotalItem,
  corStatusFinanceiro,
  corStatusProducao,
  formatarDataBR,
  formatarDataHoraBR,
  formatarMoeda,
  parseValorInput,
  pedidoTemPendencia,
  totalItensPedido,
} from "./utils";


interface Props {
  pedido: Pedido | null;
  aberto: boolean;
  onFechar: () => void;
  onEditar: (p: Pedido) => void;
  onImprimir: (p: Pedido) => void;
  onReceberPagamento: (p: Pedido) => void;
}

export function PedidoViewDrawer({
  pedido: pedidoProp,
  aberto,
  onFechar,
  onEditar,
  onImprimir,
  onReceberPagamento,
}: Props) {
  const { clientes } = useClientes();
  const { capacidades, papel } = useAuth();
  const cap = capacidades.pedidos;
  const { alterarStatusProducao, aprovarPedido, finalizarProducao, marcarEntregue, buscarPorId, registrarEnvioOrcamento, registrarOrdemProducao } = usePedidos();
  const { state: config } = useConfiguracoes();
  const [tabAtiva, setTabAtiva] = useState("geral");
  const [enviando, setEnviando] = useState(false);
  const [gerandoOP, setGerandoOP] = useState(false);
  const [confirmarAprovacao, setConfirmarAprovacao] = useState(false);

  // Sempre deriva a versão atual do pedido do store para refletir mudanças
  // (ex.: preencher orçamento pendente) sem precisar fechar/reabrir o drawer.
  const pedido = pedidoProp ? buscarPorId(pedidoProp.id) ?? pedidoProp : null;
  const cliente = pedido ? clientes.find((c) => c.id === pedido.clienteId) : null;

  function alterarStatus(novo: StatusProducao) {
    if (!pedido) return;
    alterarStatusProducao(pedido.id, novo);
    toast.success("Status atualizado.");
  }

  const podeEnviarOrcamento =
    !!pedido &&
    pedido.statusProducao === "aguardando_aprovacao" &&
    !pedidoTemPendencia(pedido);

  async function handleEnviarOrcamento() {
    if (!pedido) return;
    const numero = telefoneParaWhatsapp(cliente?.telefone ?? "");
    if (!numero) {
      toast.error("Cliente sem telefone/WhatsApp cadastrado.");
      return;
    }
    setEnviando(true);
    try {
      const { blob, nomeArquivo } = await gerarOrcamentoPDF(
        pedido,
        cliente,
        config.empresa,
      );
      baixarPDF(blob, nomeArquivo);
      registrarEnvioOrcamento(pedido.id, {
        nomeArquivo,
        numeroWhatsapp: numero,
      });
      abrirWhatsApp(numero, mensagemPadraoOrcamento(pedido, cliente));
      toast.success("Orçamento gerado. Anexe o PDF baixado no WhatsApp.");
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível gerar o orçamento.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleImprimirProducao() {
    if (!pedido) return;
    setGerandoOP(true);
    try {
      const { blob, nomeArquivo } = await gerarOrdemProducaoPDF(
        pedido,
        cliente,
        config.empresa,
      );
      abrirImpressaoPDF(blob);
      registrarOrdemProducao(pedido.id, { nomeArquivo });
      toast.success("Ordem de Produção gerada.");
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível gerar a Ordem de Produção.");
    } finally {
      setGerandoOP(false);
    }
  }



  return (
    <Sheet open={aberto} onOpenChange={(v) => (!v ? onFechar() : null)}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        {pedido && (
          <>
            <SheetHeader className="border-b border-border bg-surface px-6 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <SheetTitle className="font-mono text-lg font-bold">
                    {pedido.numero}
                  </SheetTitle>
                  <SheetDescription>
                    Criado em {formatarDataHoraBR(pedido.criadoEm)}
                  </SheetDescription>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <Badge
                    variant="outline"
                    className={cn("font-medium", corStatusProducao(pedido.statusProducao))}
                  >
                    {LABEL_STATUS_PRODUCAO[pedido.statusProducao]}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium",
                      corStatusFinanceiro(pedido.statusFinanceiro),
                    )}
                  >
                    {LABEL_STATUS_FINANCEIRO[pedido.statusFinanceiro]}
                  </Badge>
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto bg-surface-muted/40">
              <Tabs value={tabAtiva} onValueChange={setTabAtiva} className="w-full">
                <div className="sticky top-0 z-10 border-b border-border bg-surface px-6 pt-3">
                  <TabsList className="w-full justify-start overflow-x-auto">
                    <TabsTrigger value="geral">Geral</TabsTrigger>
                    <TabsTrigger value="produtos">Produtos</TabsTrigger>
                    <TabsTrigger value="arquivos">
                      Arquivos ({pedido.arquivos.length})
                    </TabsTrigger>
                    <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
                    <TabsTrigger value="historico">Histórico</TabsTrigger>
                  </TabsList>
                </div>

                <div className="space-y-4 px-6 py-4">
                  {tabAtiva !== "produtos" && (
                    <OrcamentosPendentesSection pedido={pedido} />
                  )}
                  <TabsContent value="geral" className="mt-0 space-y-4">
                    <Bloco titulo="Cliente">
                      {cliente ? (
                        <div className="flex items-center gap-3">
                          <ClienteAvatar
                            nome={getClienteNome(cliente)}
                            imagem={cliente.imagem}
                            size="md"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {getClienteNome(cliente)}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {cliente.telefone}
                              {cliente.tipo === "empresa" &&
                                ` • Resp.: ${cliente.responsavel}`}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Cliente não encontrado.
                        </p>
                      )}
                    </Bloco>

                    <Bloco titulo="Resumo">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <Kpi label="Itens" valor={String(totalItensPedido(pedido))} />
                        <Kpi label="Total" valor={formatarMoeda(pedido.total)} />
                        <Kpi label="Recebido" valor={formatarMoeda(pedido.totalPago)} />
                        <Kpi
                          label="Previsão"
                          valor={
                            pedido.previsaoEntrega
                              ? formatarDataBR(pedido.previsaoEntrega)
                              : "—"
                          }
                        />
                      </div>
                    </Bloco>

                    {pedido.observacoes && (
                      <Bloco titulo="Observações">
                        <p className="whitespace-pre-wrap text-sm text-foreground">
                          {pedido.observacoes}
                        </p>
                      </Bloco>
                    )}
                  </TabsContent>

                  <TabsContent value="produtos" className="mt-0 space-y-3">
                    {pedido.itens.map((item) => (
                      <ItemDetalhado
                        key={item.id}
                        pedidoId={pedido.id}
                        item={item}
                      />
                    ))}
                  </TabsContent>

                  <TabsContent value="arquivos" className="mt-0">
                    {pedido.arquivos.length === 0 ? (
                      <Bloco titulo="Arquivos">
                        <p className="text-sm text-muted-foreground">
                          Nenhum arquivo anexado a este pedido.
                        </p>
                      </Bloco>
                    ) : (
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {pedido.arquivos.map((arq) => {
                          const isImg = ["png", "jpg", "jpeg", "svg"].includes(
                            arq.extensao,
                          );
                          return (
                            <li
                              key={arq.id}
                              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 shadow-[var(--shadow-soft)]"
                            >
                              {isImg ? (
                                <img
                                  src={arq.dataUrl}
                                  alt={arq.nome}
                                  className="h-12 w-12 rounded-lg object-cover ring-1 ring-border"
                                />
                              ) : (
                                <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary-soft text-primary">
                                  <FileText className="h-5 w-5" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {arq.nome}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {arq.extensao.toUpperCase()} •{" "}
                                  {formatarTamanho(arq.tamanho)}
                                </p>
                              </div>
                              <a
                                href={arq.dataUrl}
                                download={arq.nome}
                                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                                aria-label="Baixar"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </TabsContent>

                  <TabsContent value="financeiro" className="mt-0 space-y-3">
                    <Bloco titulo="Valores">
                      <div className="space-y-1.5 text-sm">
                        <Linha label="Subtotal" valor={formatarMoeda(pedido.subtotal)} />
                        <Linha
                          label="Desconto"
                          valor={`- ${formatarMoeda(pedido.desconto)}`}
                        />
                        <Linha label="Frete" valor={`+ ${formatarMoeda(pedido.frete)}`} />
                        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                          <span className="text-sm font-semibold">Total</span>
                          <span className="font-display text-lg font-bold text-primary">
                            {formatarMoeda(pedido.total)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Recebido</span>
                          <span className="font-semibold text-success">
                            {formatarMoeda(pedido.totalPago)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Restante</span>
                          <span className="font-semibold text-foreground">
                            {formatarMoeda(Math.max(0, pedido.total - pedido.totalPago))}
                          </span>
                        </div>
                      </div>
                    </Bloco>

                    <Bloco titulo="Pagamentos">
                      {pedido.pagamentos.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Nenhum pagamento registrado.
                        </p>
                      ) : (
                        <ul className="divide-y divide-border">
                          {pedido.pagamentos.map((pg) => (
                            <li
                              key={pg.id}
                              className="flex items-center justify-between py-2 text-sm"
                            >
                              <div>
                                <p className="font-medium text-foreground">
                                  {LABEL_FORMA_PAGAMENTO_PEDIDO[pg.forma]}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatarDataBR(pg.data)}
                                  {pg.observacoes && ` • ${pg.observacoes}`}
                                </p>
                              </div>
                              <span className="font-semibold tabular-nums text-success">
                                + {formatarMoeda(pg.valor)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Bloco>
                  </TabsContent>

                  <TabsContent value="historico" className="mt-0">
                    <Bloco titulo="Histórico do pedido">
                      <ul className="space-y-3">
                        {pedido.historico.map((h) => (
                          <li key={h.id} className="flex gap-3">
                            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                            <div>
                              <p className="text-sm text-foreground">{h.descricao}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatarDataHoraBR(h.data)}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </Bloco>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-surface px-6 py-4">
              {papel === "operador_matriz" && (
                <div className="mr-auto flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Status matriz:
                  </span>
                  <Select
                    value={
                      STATUS_PERMITIDOS_MATRIZ.includes(pedido.statusProducao)
                        ? pedido.statusProducao
                        : ""
                    }
                    onValueChange={(v) => alterarStatus(v as StatusProducao)}
                  >
                    <SelectTrigger className="h-9 w-[220px]">
                      <SelectValue placeholder="Alterar status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_PERMITIDOS_MATRIZ.map((s) => (
                        <SelectItem key={s} value={s}>
                          {LABEL_STATUS_PRODUCAO[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button variant="outline" onClick={onFechar}>
                Fechar
              </Button>
              {cap.imprimir && (
                <Button variant="outline" onClick={() => onImprimir(pedido)}>
                  <Printer className="h-4 w-4" /> Imprimir
                </Button>
              )}
              {cap.imprimir && (
                <Button
                  variant="outline"
                  onClick={handleImprimirProducao}
                  disabled={gerandoOP}
                >
                  <ClipboardList className="h-4 w-4" />{" "}
                  {gerandoOP ? "Gerando..." : "Imprimir para Produção"}
                </Button>
              )}
              {podeEnviarOrcamento && (
                <Button
                  variant="outline"
                  onClick={handleEnviarOrcamento}
                  disabled={enviando}
                  className="border-primary/40 bg-primary-soft/60 text-primary hover:bg-primary-soft"
                >
                  <Send className="h-4 w-4" />{" "}
                  {enviando ? "Gerando..." : "Enviar Orçamento"}
                </Button>
              )}
              {cap.editar && pedido.etapa === "aguardando_aprovacao" && (
                <Button
                  variant="outline"
                  onClick={() => setConfirmarAprovacao(true)}
                  className="border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200"
                >
                  <CheckCircle2 className="h-4 w-4" /> Aprovar Pedido
                </Button>
              )}
              {cap.editar && pedido.etapa === "em_producao" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    finalizarProducao(pedido.id);
                    toast.success("Produção finalizada.");
                  }}
                  className="border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200"
                >
                  <CheckCircle2 className="h-4 w-4" /> Finalizar Produção
                </Button>
              )}
              {cap.editar && pedido.etapa === "finalizado" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    marcarEntregue(pedido.id);
                    toast.success("Pedido marcado como entregue.");
                  }}
                  className="border-zinc-300 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-100"
                >
                  <CheckCircle2 className="h-4 w-4" /> Marcar como Entregue
                </Button>
              )}
              {cap.registrarPagamento && (
                <Button variant="outline" onClick={() => onReceberPagamento(pedido)}>
                  <Wallet className="h-4 w-4" /> Registrar Recebimento
                </Button>
              )}
              {cap.editar && (
                <Button onClick={() => onEditar(pedido)}>Editar pedido</Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
      <AlertDialog open={confirmarAprovacao} onOpenChange={setConfirmarAprovacao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar aprovação do pedido</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja aprovar este pedido? Após a aprovação, o
              pedido será liberado para seguir o fluxo interno de produção.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => {
                if (!pedido) return;
                aprovarPedido(pedido.id);
                setConfirmarAprovacao(false);
                toast.success("Pedido aprovado com sucesso.");
              }}
            >
              Confirmar Aprovação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
      <h4 className="text-sm font-semibold text-foreground">{titulo}</h4>
      <div>{children}</div>
    </section>
  );
}

function Kpi({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-lg bg-surface-muted/60 p-3">
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
      <p className="font-display text-sm font-bold text-foreground">{valor}</p>
    </div>
  );
}

function Linha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums text-foreground">{valor}</span>
    </div>
  );
}

function ItemDetalhado({
  pedidoId,
  item,
}: {
  pedidoId: string;
  item: ItemPedido;
}) {
  const { atualizarOrcamentoPendente } = usePedidos();
  const [rascunhos, setRascunhos] = useState<Record<string, string>>({});

  const adicionais = item.adicionais ?? [];
  const pendentes = adicionais.filter((a) => a.pendencia);
  const subtotalItem = calcularSubtotalItem(item);

  let sufixoPendencia = "";
  if (pendentes.length === 1) {
    const p = pendentes[0].pendencia!;
    if (p === "estampa") sufixoPendencia = " + Estampa pendente";
    else if (p === "matriz") sufixoPendencia = " + Matriz pendente";
    else sufixoPendencia = " + 1 orçamento pendente";
  } else if (pendentes.length > 1) {
    sufixoPendencia = ` + ${pendentes.length} orçamentos pendentes`;
  }

  function salvarOrcamento(adId: string) {
    const raw = rascunhos[adId] ?? "";
    const valor = parseValorInput(raw);
    if (!raw.trim() || valor <= 0) return;
    atualizarOrcamentoPendente(pedidoId, item.id, adId, valor);
    setRascunhos((r) => {
      const { [adId]: _omit, ...rest } = r;
      return rest;
    });
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Produto
        </p>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-semibold text-foreground">
            {item.produto}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              — {formatarMoeda(item.valorUnitario)}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            Qtd: {item.quantidade}
          </p>
        </div>
      </div>

      {adicionais.length > 0 && (
        <div className="space-y-2 border-t border-border/60 pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Adicionais
          </p>
          <ul className="space-y-2">
            {adicionais.map((a) => (
              <li key={a.id} className="space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="text-foreground">• {a.nome}</span>
                  {a.pendencia ? (
                    <Badge
                      variant="outline"
                      className="border-amber-300 bg-amber-100 text-amber-800"
                    >
                      {LABEL_PENDENCIA_ADICIONAL[a.pendencia]}
                    </Badge>
                  ) : (
                    <span className="font-medium tabular-nums text-foreground">
                      {formatarMoeda(a.valor)}
                    </span>
                  )}
                </div>
                {a.pendencia && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                    <Label className="text-xs text-amber-900">
                      Valor do orçamento
                    </Label>
                    <div className="mt-1.5 flex items-end gap-2">
                      <Input
                        inputMode="decimal"
                        placeholder="R$ 0,00"
                        value={rascunhos[a.id] ?? ""}
                        onChange={(e) =>
                          setRascunhos((r) => ({ ...r, [a.id]: e.target.value }))
                        }
                        className="h-9"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => salvarOrcamento(a.id)}
                      >
                        Salvar orçamento
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {item.personalizacoes.length > 0 && (
        <div className="space-y-1.5 border-t border-border/60 pt-3">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Palette className="h-3 w-3" /> Personalizações
          </p>
          <ul className="space-y-1.5">
            {item.personalizacoes.map((p) => (
              <li
                key={p.id}
                className="rounded-md bg-surface-muted/60 p-2 text-xs"
              >
                <p className="font-medium text-foreground">
                  {LABEL_TIPO_PERSONALIZACAO[p.tipo]} •{" "}
                  {LABEL_POSICAO_PERSONALIZACAO[p.posicao]}
                  {p.medidas && (
                    <span className="text-muted-foreground"> • {p.medidas}</span>
                  )}
                </p>
                {p.observacoes && (
                  <p className="mt-0.5 text-muted-foreground">{p.observacoes}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border pt-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Total
        </span>
        <span className="font-display text-sm font-bold text-foreground">
          {formatarMoeda(subtotalItem)}
          {sufixoPendencia && (
            <span className="ml-1 text-xs font-medium text-amber-700">
              {sufixoPendencia}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}


// Silence unused warning when tree-shaking picks a different icon
export const _iconRef = ImageIcon;
