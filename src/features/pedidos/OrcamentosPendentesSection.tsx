import { useMemo, useState } from "react";
import { Timer } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LABEL_PENDENCIA_ADICIONAL } from "@/features/adicionais";

import type { Pedido } from "./types";
import { usePedidos } from "./usePedidos";
import { parseValorInput } from "./utils";

interface PendenciaLinha {
  itemId: string;
  produto: string;
  adicionalItemId: string;
  nome: string;
  pendencia: NonNullable<
    NonNullable<Pedido["itens"][number]["adicionais"]>[number]["pendencia"]
  >;
}

function coletarPendencias(pedido: Pedido): PendenciaLinha[] {
  const linhas: PendenciaLinha[] = [];
  for (const item of pedido.itens) {
    for (const ad of item.adicionais ?? []) {
      if (ad.pendencia) {
        linhas.push({
          itemId: item.id,
          produto: item.produto,
          adicionalItemId: ad.id,
          nome: ad.nome,
          pendencia: ad.pendencia,
        });
      }
    }
  }
  return linhas;
}

interface Props {
  pedido: Pedido;
}

export function OrcamentosPendentesSection({ pedido }: Props) {
  const { atualizarOrcamentoPendente } = usePedidos();
  const [rascunhos, setRascunhos] = useState<Record<string, string>>({});

  const linhas = useMemo(() => coletarPendencias(pedido), [pedido]);

  if (linhas.length === 0) return null;

  function salvar(linha: PendenciaLinha) {
    const raw = rascunhos[linha.adicionalItemId] ?? "";
    const valor = parseValorInput(raw);
    if (!raw.trim() || valor <= 0) {
      toast.error("Informe um valor válido para o orçamento.");
      return;
    }
    atualizarOrcamentoPendente(
      pedido.id,
      linha.itemId,
      linha.adicionalItemId,
      valor,
    );
    setRascunhos((r) => {
      const { [linha.adicionalItemId]: _omit, ...rest } = r;
      return rest;
    });
    toast.success("Orçamento salvo com sucesso.");
  }

  return (
    <section className="space-y-3 rounded-xl border border-amber-300 bg-amber-50/60 p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-200 text-amber-900">
          <Timer className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-amber-900">
            Orçamentos Pendentes
          </h4>
          <p className="text-xs text-amber-800/80">
            Informe o valor de cada adicional para liberar o pedido.
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        {linhas.map((linha) => (
          <li
            key={linha.adicionalItemId}
            className="rounded-lg border border-amber-200 bg-white p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {linha.produto ? `${linha.produto} • ` : ""}
                  {linha.nome}
                </p>
                <Badge
                  variant="outline"
                  className="mt-1 border-amber-300 bg-amber-100 text-amber-800"
                >
                  {LABEL_PENDENCIA_ADICIONAL[linha.pendencia]}
                </Badge>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">Valor (R$)</Label>
                <Input
                  inputMode="decimal"
                  value={rascunhos[linha.adicionalItemId] ?? ""}
                  onChange={(e) =>
                    setRascunhos((r) => ({
                      ...r,
                      [linha.adicionalItemId]: e.target.value,
                    }))
                  }
                  placeholder="0,00"
                />
              </div>
              <Button type="button" onClick={() => salvar(linha)}>
                Salvar orçamento
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
