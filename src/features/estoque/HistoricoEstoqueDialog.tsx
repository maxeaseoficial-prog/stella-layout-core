import { ArrowDownCircle, ArrowUpCircle, History } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/common/EmptyState";
import { formatarDataBR } from "@/features/pedidos";

import type { ItemEstoque } from "./types";
import { SIGLA_UNIDADE } from "./types";
import { useEstoque } from "./useEstoque";

interface Props {
  item: ItemEstoque | null;
  aberto: boolean;
  onFechar: () => void;
}

export function HistoricoEstoqueDialog({ item, aberto, onFechar }: Props) {
  const { historicoDoItem } = useEstoque();
  if (!item) return null;
  const historico = historicoDoItem(item.id);
  const un = SIGLA_UNIDADE[item.unidade];

  return (
    <Dialog open={aberto} onOpenChange={(v) => (!v ? onFechar() : undefined)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Histórico — {item.nome}</DialogTitle>
          <DialogDescription>
            Movimentações de entrada e saída registradas para este item.
          </DialogDescription>
        </DialogHeader>

        {historico.length === 0 ? (
          <EmptyState
            icon={History}
            title="Nenhuma movimentação"
            description="Assim que uma entrada ou saída for registrada, ela aparecerá aqui."
          />
        ) : (
          <ul className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
            {historico.map((m) => {
              const entrada = m.tipo === "entrada";
              return (
                <li
                  key={m.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3"
                >
                  <div
                    className={
                      entrada
                        ? "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700"
                        : "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive"
                    }
                  >
                    {entrada ? (
                      <ArrowUpCircle className="h-4 w-4" />
                    ) : (
                      <ArrowDownCircle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {entrada ? "Entrada" : "Saída"}
                        <span
                          className={
                            entrada
                              ? "ml-2 text-emerald-700"
                              : "ml-2 text-destructive"
                          }
                        >
                          {entrada ? "+" : "-"}
                          {m.quantidade} {un}
                        </span>
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatarDataBR(m.data)}
                      </span>
                    </div>
                    {m.observacoes && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{m.observacoes}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
