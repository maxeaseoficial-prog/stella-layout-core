import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import type { ClienteArquivo } from "@/features/clientes";
import type { Arquivo } from "@/features/arquivos";
import { arquivoParaObservacoes } from "@/features/arquivos";

import type { ItemAdicional, ItemPedido, Pedido, PedidoInput } from "./types";
import { ClienteSelector } from "./ClienteSelector";
import { ItensPedidoTable } from "./ItensPedidoTable";
import { PedidoArquivosUploader } from "./PedidoArquivosUploader";
import { ResumoFinanceiro } from "./ResumoFinanceiro";
import { calcularSubtotal, novoId, parseValorInput } from "./utils";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  pedido?: Pedido | null;
  onSalvar: (dados: PedidoInput, id?: string) => void;
}

interface FormState {
  clienteId: string;
  itens: ItemPedido[];
  arquivos: ClienteArquivo[];
  descontoStr: string;
  freteStr: string;
  previsaoEntrega: string;
  observacoes: string;
}

function estadoInicial(pedido?: Pedido | null): FormState {
  if (!pedido) {
    return {
      clienteId: "",
      itens: [],
      arquivos: [],
      descontoStr: "",
      freteStr: "",
      previsaoEntrega: "",
      observacoes: "",
    };
  }
  // Migração de arquivos legados (vinculados ao pedido) para o primeiro item,
  // caso nenhum item ainda possua arquivos próprios. Assim pedidos antigos
  // continuam funcionando e passam a seguir a nova estrutura por produto.
  const algumItemComArquivos = pedido.itens.some(
    (i) => (i.arquivos ?? []).length > 0,
  );
  let itens = pedido.itens;
  let arquivosLegados = pedido.arquivos;
  if (
    !algumItemComArquivos &&
    pedido.arquivos.length > 0 &&
    pedido.itens.length > 0
  ) {
    itens = pedido.itens.map((i, idx) =>
      idx === 0 ? { ...i, arquivos: pedido.arquivos } : i,
    );
    arquivosLegados = [];
  }
  return {
    clienteId: pedido.clienteId,
    itens,
    arquivos: arquivosLegados,
    descontoStr:
      pedido.desconto > 0 ? pedido.desconto.toFixed(2).replace(".", ",") : "",
    freteStr: pedido.frete > 0 ? pedido.frete.toFixed(2).replace(".", ",") : "",
    previsaoEntrega: pedido.previsaoEntrega ?? "",
    observacoes: pedido.observacoes ?? "",
  };
}


const ETAPAS = [
  { id: 1, label: "Cliente" },
  { id: 2, label: "Produtos" },
  { id: 3, label: "Arquivos e valores" },
];

export function PedidoFormDrawer({ aberto, onFechar, pedido, onSalvar }: Props) {
  const [form, setForm] = useState<FormState>(() => estadoInicial(pedido));
  const [etapa, setEtapa] = useState(1);
  const [erro, setErro] = useState<string>();

  useEffect(() => {
    if (aberto) {
      setForm(estadoInicial(pedido));
      setEtapa(1);
      setErro(undefined);
    }
  }, [aberto, pedido]);

  const subtotal = useMemo(() => calcularSubtotal(form.itens), [form.itens]);

  function up<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function anexarDoAcervo(itemId: string, arqs: Arquivo[]) {
    setForm((f) => ({
      ...f,
      itens: f.itens.map((it) => {
        if (it.id !== itemId) return it;
        const atuais = it.adicionais ?? [];
        // Evita duplicar adicionais para o mesmo arquivo já anexado
        const jaVinculados = new Set(
          atuais
            .map((a) => (a as ItemAdicional & { arquivoId?: string }).arquivoId)
            .filter(Boolean) as string[],
        );
        const novosAdicionais: ItemAdicional[] = arqs
          .filter((a) => (a.valor ?? 0) > 0 && !jaVinculados.has(a.id))
          .map((a) => ({
            id: novoId(),
            nome: `${a.nome} (matriz/logo)`,
            valor: a.valor ?? 0,
            unico: true,
            arquivoId: a.id,
          } as ItemAdicional & { arquivoId: string }));

        const blocos = arqs.map(arquivoParaObservacoes).filter(Boolean);
        const anterior = (it.observacoes ?? "").trim();
        const combinado = [anterior, ...blocos].filter(Boolean).join("\n\n");

        return {
          ...it,
          adicionais: [...atuais, ...novosAdicionais],
          observacoes: combinado || undefined,
        };
      }),
    }));
  }


  function podeAvancar(): boolean {
    if (etapa === 1 && !form.clienteId) {
      setErro("Selecione um cliente para continuar.");
      return false;
    }
    if (etapa === 2) {
      if (form.itens.length === 0) {
        setErro("Adicione pelo menos um produto.");
        return false;
      }
      const invalido = form.itens.find(
        (i) => !i.produto.trim() || i.quantidade <= 0 || i.valorUnitario < 0,
      );
      if (invalido) {
        setErro("Preencha produto, quantidade e valor de cada item.");
        return false;
      }
    }
    setErro(undefined);
    return true;
  }

  function avancar() {
    if (!podeAvancar()) return;
    setEtapa((e) => Math.min(3, e + 1));
  }

  function voltar() {
    setErro(undefined);
    setEtapa((e) => Math.max(1, e - 1));
  }

  function handleSalvar() {
    if (!podeAvancar()) return;
    const dados: PedidoInput = {
      clienteId: form.clienteId,
      itens: form.itens,
      arquivos: form.arquivos,
      desconto: parseValorInput(form.descontoStr),
      frete: parseValorInput(form.freteStr),
      previsaoEntrega: form.previsaoEntrega || undefined,
      observacoes: form.observacoes.trim() || undefined,
    };
    onSalvar(dados, pedido?.id);
    onFechar();
  }

  return (
    <Sheet open={aberto} onOpenChange={(v) => (!v ? onFechar() : null)}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
      >
        <SheetHeader className="border-b border-border bg-surface px-6 py-4">
          <SheetTitle className="text-xl font-bold">
            {pedido ? `Editar pedido ${pedido.numero}` : "Novo pedido"}
          </SheetTitle>
          <SheetDescription>
            Preencha as etapas para {pedido ? "atualizar" : "criar"} o pedido.
          </SheetDescription>

          <div className="mt-3 flex items-center gap-2">
            {ETAPAS.map((e, idx) => (
              <div key={e.id} className="flex flex-1 items-center gap-2">
                <div
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
                    etapa === e.id
                      ? "bg-primary text-primary-foreground"
                      : etapa > e.id
                        ? "bg-success text-white"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {e.id}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    etapa === e.id ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {e.label}
                </span>
                {idx < ETAPAS.length - 1 && (
                  <div className="h-px flex-1 bg-border" />
                )}
              </div>
            ))}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-surface-muted/40 px-6 py-6">
          {etapa === 1 && (
            <section className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Selecionar cliente
                </h4>
                <p className="text-xs text-muted-foreground">
                  Pesquise um cliente cadastrado ou cadastre um novo agora.
                </p>
              </div>
              <ClienteSelector
                clienteId={form.clienteId}
                onSelecionar={(id) => up("clienteId", id)}
              />
            </section>
          )}

          {etapa === 2 && (
            <ItensPedidoTable
              itens={form.itens}
              onChange={(i) => up("itens", i)}
            />
          )}

          {etapa === 3 && (
            <div className="space-y-4">
              <section className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Arquivos por produto
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Cada produto do pedido possui sua própria lista de logos, matrizes e artes.
                    Os PDFs de Produção e Orçamento exibem apenas os arquivos do produto correspondente.
                  </p>
                </div>

                {form.itens.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/70 bg-surface-muted/40 p-6 text-center text-sm text-muted-foreground">
                    Nenhum produto no pedido. Volte à etapa anterior para adicionar produtos.
                  </div>
                ) : (
                  form.itens.map((item, idx) => (
                    <div
                      key={item.id}
                      className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {item.produto?.trim() || `Produto ${idx + 1}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Quantidade: {item.quantidade}
                            {item.tamanho ? ` • Tamanho: ${item.tamanho}` : ""}
                          </p>
                        </div>
                      </div>
                      <PedidoArquivosUploader
                        semCabecalho
                        arquivos={item.arquivos ?? []}
                        onChange={(a) =>
                          up(
                            "itens",
                            form.itens.map((it) =>
                              it.id === item.id ? { ...it, arquivos: a } : it,
                            ),
                          )
                        }
                        clienteId={form.clienteId}
                        onAnexosDoAcervo={(arqs) => anexarDoAcervo(item.id, arqs)}
                      />
                      <div className="space-y-1.5">
                        <Label className="text-xs">Observações do produto</Label>
                        <Textarea
                          rows={4}
                          value={item.observacoes ?? ""}
                          onChange={(e) =>
                            up(
                              "itens",
                              form.itens.map((it) =>
                                it.id === item.id
                                  ? { ...it, observacoes: e.target.value }
                                  : it,
                              ),
                            )
                          }
                          placeholder="Preenchido automaticamente ao anexar uma Matriz/Logo."
                        />
                      </div>
                    </div>
                  ))
                )}
              </section>



              <ResumoFinanceiro
                subtotal={subtotal}
                desconto={form.descontoStr}
                frete={form.freteStr}
                onDesconto={(v) => up("descontoStr", v)}
                onFrete={(v) => up("freteStr", v)}
              />

              <section className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Previsão de entrega</Label>
                    <Input
                      type="date"
                      value={form.previsaoEntrega}
                      onChange={(e) => up("previsaoEntrega", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Observações gerais</Label>
                  <Textarea
                    rows={3}
                    value={form.observacoes}
                    onChange={(e) => up("observacoes", e.target.value)}
                    placeholder="Anotações internas, prazos, condições especiais..."
                  />
                </div>
              </section>
            </div>
          )}

          {erro && (
            <p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm font-medium text-destructive">
              {erro}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-surface px-6 py-4">
          <div>
            {etapa > 1 && (
              <Button type="button" variant="outline" onClick={voltar}>
                Voltar
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onFechar}>
              Cancelar
            </Button>
            {etapa < 3 ? (
              <Button type="button" onClick={avancar}>
                Avançar
              </Button>
            ) : (
              <Button type="button" onClick={handleSalvar}>
                {pedido ? "Salvar alterações" : "Criar pedido"}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
