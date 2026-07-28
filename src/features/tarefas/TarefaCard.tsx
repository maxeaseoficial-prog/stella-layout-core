import { useState } from "react";
import { MoreVertical, Pencil, Trash2, Plus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Tarefa } from "./types";
import { LABEL_PRIORIDADE } from "./types";

interface Props {
  tarefa: Tarefa;
  onToggle: (concluida: boolean) => void;
  onToggleItem: (itemId: string) => void;
  onAdicionarItem: (texto: string) => void;
  onRemoverItem: (itemId: string) => void;
  onEditar: () => void;
  onExcluir: () => void;
  onVerDetalhes: () => void;
}

const PRIORIDADE_CLASSES: Record<string, string> = {
  baixa: "bg-muted text-muted-foreground",
  media: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  alta: "bg-destructive/15 text-destructive",
};

function formatarData(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return "";
  }
}

export function TarefaCard({
  tarefa,
  onToggle,
  onToggleItem,
  onAdicionarItem,
  onRemoverItem,
  onEditar,
  onExcluir,
  onVerDetalhes,
}: Props) {
  const [novoItem, setNovoItem] = useState("");
  const totalItens = tarefa.itens.length;
  const concluidosItens = tarefa.itens.filter((i) => i.concluido).length;
  const progresso = totalItens > 0 ? (concluidosItens / totalItens) * 100 : 0;

  function submitItem() {
    const t = novoItem.trim();
    if (!t) return;
    onAdicionarItem(t);
    setNovoItem("");
  }

  return (
    <Card
      className={cn(
        "flex flex-col gap-3 p-4 shadow-[var(--shadow-soft)] transition-opacity",
        tarefa.concluida && "opacity-60",
      )}
    >
      <div className="flex items-start gap-3">
        {tarefa.tipo === "tarefa" ? (
          <Checkbox
            checked={tarefa.concluida}
            onCheckedChange={(v) => onToggle(!!v)}
            className="mt-0.5"
          />
        ) : (
          <div className="mt-0.5 h-4 w-4 rounded-sm border border-border bg-primary-soft" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              onClick={onVerDetalhes}
              className="min-w-0 flex-1 text-left"
            >
              <h3
                className={cn(
                  "text-sm font-semibold text-foreground hover:text-primary transition-colors",
                  tarefa.concluida && "line-through text-muted-foreground",
                )}
              >
                {tarefa.titulo}
              </h3>
              {tarefa.descricao && (
                <p
                  className={cn(
                    "mt-0.5 line-clamp-2 text-xs text-muted-foreground",
                    tarefa.concluida && "line-through",
                  )}
                >
                  {tarefa.descricao}
                </p>
              )}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="-mt-1 -mr-1 h-7 w-7 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEditar}>
                  <Pencil className="h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onExcluir}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>


          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
            <span
              className={cn(
                "inline-flex items-center rounded-md px-1.5 py-0.5 font-medium",
                PRIORIDADE_CLASSES[tarefa.prioridade],
              )}
            >
              {LABEL_PRIORIDADE[tarefa.prioridade]}
            </span>
            {tarefa.tipo === "checklist" && (
              <span className="inline-flex items-center rounded-md bg-primary-soft px-1.5 py-0.5 font-medium text-primary">
                Checklist
              </span>
            )}
            <span className="text-muted-foreground">{formatarData(tarefa.created_at)}</span>
          </div>
        </div>
      </div>

      {tarefa.tipo === "checklist" && (
        <div className="space-y-2 rounded-lg bg-surface-muted/40 p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {concluidosItens} de {totalItens} concluídos
            </span>
          </div>
          <Progress value={progresso} className="h-1.5" />
          <div className="space-y-1 pt-1">
            {tarefa.itens.map((it) => (
              <div key={it.id} className="group flex items-center gap-2 text-sm">
                <Checkbox
                  checked={it.concluido}
                  onCheckedChange={() => onToggleItem(it.id)}
                />
                <span
                  className={cn(
                    "flex-1 truncate",
                    it.concluido && "line-through text-muted-foreground",
                  )}
                >
                  {it.texto}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={() => onRemoverItem(it.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 pt-1">
            <Input
              value={novoItem}
              onChange={(e) => setNovoItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitItem();
                }
              }}
              placeholder="Adicionar item"
              className="h-8 text-xs"
            />
            <Button size="sm" variant="secondary" onClick={submitItem} className="h-8">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
