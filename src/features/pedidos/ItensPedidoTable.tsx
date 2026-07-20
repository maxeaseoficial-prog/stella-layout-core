import { useState } from "react";
import { Palette, Plus, Trash2 } from "lucide-react";

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

import type { ItemPedido, Personalizacao } from "./types";
import { calcularSubtotalItem, formatarMoeda, novoId, parseValorInput } from "./utils";
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
  const [editandoPersonalizacao, setEditandoPersonalizacao] = useState<
    ItemPedido | null
  >(null);
  const [rascunhos, setRascunhos] = useState<Record<string, Rascunho>>({});

  function adicionarItem() {
    const novo: ItemPedido = {
      id: novoId(),
      produto: "",
      quantidade: 1,
      valorUnitario: 0,
      personalizacoes: [],
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
                  <Input
                    value={item.produto}
                    onChange={(e) => atualizarItem(item.id, "produto", e.target.value)}
                    placeholder="Produto / descrição"
                  />
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
