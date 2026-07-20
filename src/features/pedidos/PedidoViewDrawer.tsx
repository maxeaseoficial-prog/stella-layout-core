import { Download, FileText, ImageIcon, Palette, Printer, Wallet } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { formatarTamanho } from "@/features/clientes/utils";
import { useClientes, getClienteNome, ClienteAvatar } from "@/features/clientes";

import type { Pedido } from "./types";
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
  pedido,
  aberto,
  onFechar,
  onEditar,
  onImprimir,
  onReceberPagamento,
}: Props) {
  const { clientes } = useClientes();
  const cliente = pedido ? clientes.find((c) => c.id === pedido.clienteId) : null;

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
              <Tabs defaultValue="geral" className="w-full">
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
                      <div
                        key={item.id}
                        className="space-y-2 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-foreground">
                              {item.produto}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantidade} × {formatarMoeda(item.valorUnitario)}
                            </p>
                          </div>
                          <p className="font-semibold tabular-nums text-foreground">
                            {formatarMoeda(calcularSubtotalItem(item))}
                          </p>
                        </div>

                        {item.personalizacoes.length > 0 && (
                          <div className="space-y-1.5 border-t border-border/60 pt-2">
                            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
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
                                      <span className="text-muted-foreground">
                                        {" "}
                                        • {p.medidas}
                                      </span>
                                    )}
                                  </p>
                                  {p.observacoes && (
                                    <p className="mt-0.5 text-muted-foreground">
                                      {p.observacoes}
                                    </p>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
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
                          valor={`− ${formatarMoeda(pedido.desconto)}`}
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
              <Button variant="outline" onClick={onFechar}>
                Fechar
              </Button>
              <Button variant="outline" onClick={() => onImprimir(pedido)}>
                <Printer className="h-4 w-4" /> Imprimir
              </Button>
              <Button variant="outline" onClick={() => onReceberPagamento(pedido)}>
                <Wallet className="h-4 w-4" /> Receber pagamento
              </Button>
              <Button onClick={() => onEditar(pedido)}>Editar pedido</Button>
            </div>
          </>
        )}
      </SheetContent>
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

// Silence unused warning when tree-shaking picks a different icon
export const _iconRef = ImageIcon;
