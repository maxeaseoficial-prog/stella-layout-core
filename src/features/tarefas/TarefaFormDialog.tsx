import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Prioridade, Tarefa, TarefaInput, TipoTarefa, ItemChecklist } from "./types";
import { gerarId } from "./useTarefas";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  onSalvar: (input: TarefaInput, id?: string) => Promise<void> | void;
  editando: Tarefa | null;
}

export function TarefaFormDialog({ aberto, onFechar, onSalvar, editando }: Props) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prioridade, setPrioridade] = useState<Prioridade>("media");
  const [tipo, setTipo] = useState<TipoTarefa>("tarefa");
  const [itens, setItens] = useState<ItemChecklist[]>([]);
  const [novoItem, setNovoItem] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    if (editando) {
      setTitulo(editando.titulo);
      setDescricao(editando.descricao ?? "");
      setPrioridade(editando.prioridade);
      setTipo(editando.tipo);
      setItens(editando.itens);
    } else {
      setTitulo("");
      setDescricao("");
      setPrioridade("media");
      setTipo("tarefa");
      setItens([]);
    }
    setNovoItem("");
  }, [aberto, editando]);

  function adicionarItem() {
    const t = novoItem.trim();
    if (!t) return;
    setItens((prev) => [...prev, { id: gerarId(), texto: t, concluido: false }]);
    setNovoItem("");
  }

  async function handleSalvar() {
    if (!titulo.trim()) return;
    setSalvando(true);
    try {
      await onSalvar(
        {
          titulo: titulo.trim(),
          descricao: descricao.trim() || undefined,
          prioridade,
          tipo,
          itens: tipo === "checklist" ? itens : [],
        },
        editando?.id,
      );
      onFechar();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={(o) => (!o ? onFechar() : null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editando ? "Editar tarefa" : "Nova tarefa"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Preparar matriz do pedido #123"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              placeholder="Detalhes adicionais…"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={prioridade} onValueChange={(v) => setPrioridade(v as Prioridade)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <RadioGroup
                value={tipo}
                onValueChange={(v) => setTipo(v as TipoTarefa)}
                className="flex gap-4 pt-1"
              >
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="tarefa" /> Tarefa
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="checklist" /> Checklist
                </label>
              </RadioGroup>
            </div>
          </div>

          {tipo === "checklist" && (
            <div className="space-y-2 rounded-lg border border-border bg-surface-muted/40 p-3">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Itens do checklist
              </Label>
              <div className="space-y-1.5">
                {itens.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhum item ainda.</p>
                )}
                {itens.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between gap-2 rounded-md bg-background px-2.5 py-1.5 text-sm"
                  >
                    <span className="truncate">{it.texto}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setItens((prev) => prev.filter((x) => x.id !== it.id))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <Input
                  value={novoItem}
                  onChange={(e) => setNovoItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      adicionarItem();
                    }
                  }}
                  placeholder="Novo item"
                  className="h-9"
                />
                <Button type="button" variant="secondary" size="sm" onClick={adicionarItem}>
                  <Plus className="h-4 w-4" />
                  Adicionar item
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={salvando || !titulo.trim()}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
