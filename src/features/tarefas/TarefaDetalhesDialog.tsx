import { CheckCircle2, Circle, Pencil } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Tarefa } from "./types";
import { LABEL_PRIORIDADE } from "./types";

interface Props {
  tarefa: Tarefa | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onEditar: (t: Tarefa) => void;
}

const PRIORIDADE_CLASSES: Record<string, string> = {
  baixa: "bg-muted text-muted-foreground",
  media: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  alta: "bg-destructive/15 text-destructive",
};

function formatarDataHora(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function TarefaDetalhesDialog({ tarefa, open, onOpenChange, onEditar }: Props) {
  if (!tarefa) return null;

  const total = tarefa.itens.length;
  const feitos = tarefa.itens.filter((i) => i.concluido).length;
  const progresso = total > 0 ? (feitos / total) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="pr-6 text-lg">{tarefa.titulo}</DialogTitle>
          <DialogDescription className="sr-only">Detalhes da tarefa</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 font-medium",
                PRIORIDADE_CLASSES[tarefa.prioridade],
              )}
            >
              Prioridade {LABEL_PRIORIDADE[tarefa.prioridade]}
            </span>
            <span className="inline-flex items-center rounded-md bg-primary-soft px-2 py-0.5 font-medium text-primary">
              {tarefa.tipo === "checklist" ? "Checklist" : "Tarefa"}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 font-medium",
                tarefa.concluida
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {tarefa.concluida ? "Concluída" : "Pendente"}
            </span>
          </div>

          <div>
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Observações
            </h4>
            {tarefa.descricao?.trim() ? (
              <p className="whitespace-pre-wrap rounded-lg bg-surface-muted/40 p-3 text-sm text-foreground">
                {tarefa.descricao}
              </p>
            ) : (
              <p className="rounded-lg bg-surface-muted/40 p-3 text-sm italic text-muted-foreground">
                Nenhuma observação registrada.
              </p>
            )}
          </div>

          {tarefa.tipo === "checklist" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <h4 className="font-semibold uppercase tracking-wider">
                  Itens do checklist
                </h4>
                <span>
                  {feitos} de {total}
                </span>
              </div>
              <Progress value={progresso} className="h-1.5" />
              <ul className="space-y-1 pt-1">
                {tarefa.itens.length === 0 && (
                  <li className="text-sm italic text-muted-foreground">Nenhum item.</li>
                )}
                {tarefa.itens.map((it) => (
                  <li key={it.id} className="flex items-start gap-2 text-sm">
                    {it.concluido ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span
                      className={cn(
                        "flex-1",
                        it.concluido && "line-through text-muted-foreground",
                      )}
                    >
                      {it.texto}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/60 p-3 text-xs">
            <div>
              <div className="text-muted-foreground">Criada em</div>
              <div className="font-medium text-foreground">
                {formatarDataHora(tarefa.created_at)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">
                {tarefa.concluida ? "Concluída em" : "Atualizada em"}
              </div>
              <div className="font-medium text-foreground">
                {formatarDataHora(tarefa.concluida ? tarefa.concluida_em : tarefa.updated_at)}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              onEditar(tarefa);
            }}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
