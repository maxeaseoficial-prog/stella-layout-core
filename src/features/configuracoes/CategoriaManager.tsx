import { useMemo, useRef, useState } from "react";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface OrdenavelItem {
  id: string;
  nome: string;
}

interface CategoriaManagerProps {
  titulo: string;
  descricao?: string;
  itens: OrdenavelItem[];
  onCriar: (nome: string) => { ok: boolean; motivo?: string };
  onEditar: (id: string, nome: string) => { ok: boolean; motivo?: string };
  onExcluir: (id: string) => void;
  onReordenar: (idsOrdenados: string[]) => void;
  labelBotao?: string;
  labelSingular?: string;
  extraAcoes?: (item: OrdenavelItem) => React.ReactNode;
}

export function CategoriaManager({
  titulo,
  descricao,
  itens,
  onCriar,
  onEditar,
  onExcluir,
  onReordenar,
  labelBotao = "Adicionar categoria",
  labelSingular = "categoria",
  extraAcoes,
}: CategoriaManagerProps) {
  const [modalAberto, setModalAberto] = useState(false);
  const [novoNome, setNovoNome] = useState("");

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editValor, setEditValor] = useState("");

  const dragId = useRef<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const ids = useMemo(() => itens.map((i) => i.id), [itens]);

  function abrirModal() {
    setNovoNome("");
    setModalAberto(true);
  }

  function salvarNovo() {
    const nome = novoNome.trim();
    if (!nome) {
      toast.error(`Informe o nome da ${labelSingular}.`);
      return;
    }
    const res = onCriar(nome);
    if (!res.ok) {
      toast.error(res.motivo ?? `Já existe uma ${labelSingular} com esse nome.`);
      return;
    }
    setModalAberto(false);
    setNovoNome("");
    toast.success(`${capitalize(labelSingular)} adicionada.`);
  }

  function iniciarEdicao(item: OrdenavelItem) {
    setEditandoId(item.id);
    setEditValor(item.nome);
  }

  function salvarEdicao(id: string) {
    const nome = editValor.trim();
    if (!nome) {
      toast.error("Nome inválido.");
      return;
    }
    const res = onEditar(id, nome);
    if (!res.ok) {
      toast.error(res.motivo ?? "Nome inválido ou já existente.");
      return;
    }
    setEditandoId(null);
    toast.success(`${capitalize(labelSingular)} atualizada.`);
  }

  function handleDragStart(id: string) {
    dragId.current = id;
  }
  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    if (id !== overId) setOverId(id);
  }
  function handleDrop(targetId: string) {
    const from = dragId.current;
    dragId.current = null;
    setOverId(null);
    if (!from || from === targetId) return;
    const nova = [...ids];
    const fromIdx = nova.indexOf(from);
    const toIdx = nova.indexOf(targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    nova.splice(fromIdx, 1);
    nova.splice(toIdx, 0, from);
    onReordenar(nova);
  }
  function handleDragEnd() {
    dragId.current = null;
    setOverId(null);
  }

  return (
    <div className="rounded-xl border border-border bg-background/50 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-foreground">{titulo}</h4>
          {descricao && <p className="text-xs text-muted-foreground">{descricao}</p>}
        </div>
        <Button size="sm" onClick={abrirModal}>
          <Plus className="mr-1 h-3.5 w-3.5" /> {labelBotao}
        </Button>
      </div>

      {itens.length === 0 ? (
        <p className="rounded-md border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
          Nenhuma {labelSingular} cadastrada.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {itens.map((item) => {
            const emEdicao = editandoId === item.id;
            const isOver = overId === item.id;
            return (
              <li
                key={item.id}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDrop={() => handleDrop(item.id)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "flex items-center gap-2 px-2 py-2 transition-colors",
                  isOver && "bg-primary/5",
                )}
              >
                <button
                  type="button"
                  draggable={!emEdicao}
                  onDragStart={() => handleDragStart(item.id)}
                  className="grid h-8 w-6 shrink-0 cursor-grab place-items-center text-muted-foreground hover:text-foreground active:cursor-grabbing"
                  aria-label="Reordenar"
                  title="Arrastar para reordenar"
                >
                  <GripVertical className="h-4 w-4" />
                </button>

                {emEdicao ? (
                  <>
                    <Input
                      value={editValor}
                      autoFocus
                      onChange={(e) => setEditValor(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") salvarEdicao(item.id);
                        if (e.key === "Escape") setEditandoId(null);
                      }}
                      className="h-8"
                    />
                    <div className="flex shrink-0 gap-1">
                      <Button size="sm" variant="ghost" className="h-8" onClick={() => salvarEdicao(item.id)}>
                        Salvar
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditandoId(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">{item.nome}</span>
                    {extraAcoes?.(item)}
                    <div className="flex shrink-0 gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => iniciarEdicao(item)}
                        aria-label="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => {
                          onExcluir(item.id);
                          toast.success(`${capitalize(labelSingular)} removida.`);
                        }}
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{labelBotao}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="cat-nome">Nome da {labelSingular}</Label>
            <Input
              id="cat-nome"
              autoFocus
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  salvarNovo();
                }
              }}
              placeholder={`Ex.: nova ${labelSingular}`}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarNovo}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
