import { useState } from "react";
import { Palette, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProdutos } from "@/features/produtos";
import { useAdicionais, LABEL_PENDENCIA_ADICIONAL, LABEL_TIPO_ADICIONAL } from "@/features/adicionais";

import type { ItemAdicional, ItemPedido, Personalizacao } from "./types";
import {
  calcularSubtotalItem,
  formatarMoeda,
  novoId,
  parseValorInput,
  somaAdicionaisItem,
} from "./utils";
import { PersonalizacaoModal } from "./PersonalizacaoModal";

interface Props {
  itens: ItemPedido[];
  onChange: (itens: ItemPedido[]) => void;
}

interface Rascunho {
  quantidadeStr: string;
  valorStr: string;
}

export function ItensPedidoTable({ itens, onChange }: Props) {
  const { ativos: produtosAtivos } = useProdutos();
  const { ativos: adicionaisAtivos } = useAdicionais();
  const [editandoPersonalizacao, setEditandoPersonalizacao] = useState<
    ItemPedido | null
  >(null);
  const [rascunhos, setRascunhos] = useState<Record<string, Rascunho>>({});

  function selecionarProduto(itemId: string, produtoId: string) {
    const p = produtosAtivos.find((x) => x.id === produtoId);
    if (!p) return;
    onChange(
      itens.map((i) =>
        i.id === itemId
          ? {
              ...i,
              produtoId: p.id,
              produto: p.nome,
              valorUnitario: i.valorUnitario > 0 ? i.valorUnitario : p.precoBase,
            }
          : i,
      ),
    );
    setRascunhos((r) => ({
      ...r,
      [itemId]: {
        quantidadeStr: r[itemId]?.quantidadeStr ?? String(itens.find((i) => i.id === itemId)?.quantidade ?? 1),
        valorStr:
          r[itemId]?.valorStr && r[itemId]!.valorStr.length > 0
            ? r[itemId]!.valorStr
            : p.precoBase > 0
              ? p.precoBase.toFixed(2).replace(".", ",")
              : "",
      },
    }));
  }

  function adicionarItem() {
    const novo: ItemPedido = {
      id: novoId(),
      produto: "",
      quantidade: 1,
      valorUnitario: 0,
      personalizacoes: [],
      adicionais: [],
    };
    onChange([...itens, novo]);
    setRascunhos((r) => ({
      ...r,
      [novo.id]: { quantidadeStr: "1", valorStr: "" },
    }));
  }

  function removerItem(id: string) {
    onChange(itens.filter((i) => i.id !== id));
  }

  function atualizarItem<K extends keyof ItemPedido>(
    id: string,
    key: K,
    value: ItemPedido[K],
  ) {
    onChange(itens.map((i) => (i.id === id ? { ...i, [key]: value } : i)));
  }

  function salvarPersonalizacoes(id: string, p: Personalizacao[]) {
    atualizarItem(id, "personalizacoes", p);
  }

  function adicionarAdicional(itemId: string, adicionalId: string) {
    const a = adicionaisAtivos.find((x) => x.id === adicionalId);
    if (!a) return;
    onChange(
      itens.map((i) => {
        if (i.id !== itemId) return i;
        const atuais = i.adicionais ?? [];
        const novo: ItemAdicional = {
          id: novoId(),
          adicionalId: a.id,
          nome: a.nome,
          valor: a.pendencia ? 0 : a.valor,
          pendencia: a.pendencia,
        };
        return { ...i, adicionais: [...atuais, novo] };
      }),
    );
  }


  function removerAdicional(itemId: string, adicionalItemId: string) {
    onChange(
      itens.map((i) =>
        i.id !== itemId
          ? i
          : { ...i, adicionais: (i.adicionais ?? []).filter((a) => a.id !== adicionalItemId) },
      ),
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Produtos</h4>
        <Button type="button" size="sm" variant="outline" onClick={adicionarItem}>
          <Plus className="h-4 w-4" /> Adicionar produto
        </Button>
      </div>

      {itens.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 bg-surface-muted/40 p-6 text-center text-sm text-muted-foreground">
          Nenhum produto adicionado. Clique em “Adicionar produto”.
        </div>
      ) : (
        <ul className="space-y-2">
          {itens.map((item) => {
            const rascunho = rascunhos[item.id] ?? {
              quantidadeStr: String(item.quantidade),
              valorStr:
                item.valorUnitario > 0
                  ? item.valorUnitario.toFixed(2).replace(".", ",")
                  : "",
            };
            return (
              <li
                key={item.id}
                className="space-y-2 rounded-xl border border-border bg-surface-muted/40 p-3"
              >
                <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_90px_120px_120px_auto]">
                  {item.produtoId || produtosAtivos.some((p) => p.nome === item.produto) ? (
                    <Select
                      value={item.produtoId ?? ""}
                      onValueChange={(v) => selecionarProduto(item.id, v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o produto">
                          {item.produto || "Selecione o produto"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {produtosAtivos.length === 0 ? (
                          <div className="px-2 py-3 text-xs text-muted-foreground">
                            Nenhum produto ativo cadastrado.
                          </div>
                        ) : (
                          produtosAtivos.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.nome}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select
                      value=""
                      onValueChange={(v) => selecionarProduto(item.id, v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {produtosAtivos.length === 0 ? (
                          <div className="px-2 py-3 text-xs text-muted-foreground">
                            Nenhum produto ativo cadastrado.
                          </div>
                        ) : (
                          produtosAtivos.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.nome}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  <Input
                    value={rascunho.quantidadeStr}
                    inputMode="numeric"
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      setRascunhos((r) => ({
                        ...r,
                        [item.id]: { ...rascunho, quantidadeStr: v },
                      }));
                      atualizarItem(item.id, "quantidade", Number(v) || 0);
                    }}
                    placeholder="Qtd"
                  />
                  <Input
                    value={rascunho.valorStr}
                    inputMode="decimal"
                    onChange={(e) => {
                      const v = e.target.value;
                      setRascunhos((r) => ({
                        ...r,
                        [item.id]: { ...rascunho, valorStr: v },
                      }));
                      atualizarItem(item.id, "valorUnitario", parseValorInput(v));
                    }}
                    placeholder="Valor unit."
                  />
                  <div className="grid h-10 place-items-center rounded-md border border-input bg-background px-3 text-sm font-semibold tabular-nums text-foreground">
                    {formatarMoeda(calcularSubtotalItem(item))}
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 text-muted-foreground hover:text-destructive"
                    onClick={() => removerItem(item.id)}
                    aria-label="Remover produto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setEditandoPersonalizacao(item)}
                  >
                    <Palette className="h-4 w-4" /> Editar personalização
                  </Button>
                  {item.personalizacoes.length > 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      {item.personalizacoes.length} personalização
                      {item.personalizacoes.length === 1 ? "" : "es"}
                    </Badge>
                  )}
                </div>

                {/* Adicionais — cart-like */}
                <div className="space-y-2 rounded-lg border border-dashed border-border/70 bg-surface p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Adicionais
                    </p>
                    <div className="min-w-[220px]">
                      <Select
                        value=""
                        onValueChange={(v) => adicionarAdicional(item.id, v)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="+ Adicionar adicional" />
                        </SelectTrigger>
                        <SelectContent>
                          {adicionaisAtivos.length === 0 ? (
                            <div className="px-2 py-3 text-xs text-muted-foreground">
                              Nenhum adicional ativo cadastrado.
                            </div>
                          ) : (
                            adicionaisAtivos.map((a) => {
                              const jaUsado = (item.adicionais ?? []).some(
                                (x) => x.adicionalId === a.id,
                              );
                              return (
                                <SelectItem key={a.id} value={a.id} disabled={jaUsado}>
                                  {a.nome}
                                  {a.pendencia
                                    ? " — Orçamento pendente"
                                    : a.valor > 0
                                      ? ` — +${formatarMoeda(a.valor)}`
                                      : ""}
                                  <span className="ml-1 text-[10px] text-muted-foreground">
                                    ({LABEL_TIPO_ADICIONAL[a.tipo]})
                                  </span>
                                </SelectItem>
                              );
                            })
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {(item.adicionais ?? []).length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Nenhum adicional aplicado.
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {(item.adicionais ?? []).map((a) => (
                        <li
                          key={a.id}
                          className="flex items-center justify-between gap-2 rounded-md bg-surface-muted/40 px-2 py-1 text-sm"
                        >
                          <span className="truncate">{a.nome}</span>
                          <div className="flex items-center gap-2">
                            {a.pendencia ? (
                              <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                {LABEL_PENDENCIA_ADICIONAL[a.pendencia]}
                              </span>
                            ) : (
                              <span className="tabular-nums text-muted-foreground">
                                + {formatarMoeda(a.valor)}
                              </span>
                            )}
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => removerAdicional(item.id, a.id)}
                              aria-label={`Remover adicional ${a.nome}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {somaAdicionaisItem(item) > 0 && (
                    <p className="text-right text-xs text-muted-foreground">
                      Adicionais por unidade:{" "}
                      <span className="font-semibold text-foreground">
                        {formatarMoeda(somaAdicionaisItem(item))}
                      </span>
                    </p>
                  )}
                </div>

              </li>
            );
          })}
        </ul>
      )}

      <PersonalizacaoModal
        aberto={!!editandoPersonalizacao}
        onFechar={() => setEditandoPersonalizacao(null)}
        produto={editandoPersonalizacao?.produto ?? ""}
        personalizacoes={editandoPersonalizacao?.personalizacoes ?? []}
        onSalvar={(p) => {
          if (editandoPersonalizacao) {
            salvarPersonalizacoes(editandoPersonalizacao.id, p);
          }
        }}
      />
    </div>
  );
}
