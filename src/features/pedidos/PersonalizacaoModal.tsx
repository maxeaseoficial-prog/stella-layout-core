import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/custom-select";

import {
  LABEL_POSICAO_PERSONALIZACAO,
  LABEL_TIPO_PERSONALIZACAO,
  POSICOES_PERSONALIZACAO,
  TIPOS_PERSONALIZACAO,
  type Personalizacao,
  type PosicaoPersonalizacao,
  type TipoPersonalizacao,
} from "./types";
import { novoId } from "./utils";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  produto: string;
  personalizacoes: Personalizacao[];
  onSalvar: (p: Personalizacao[]) => void;
}

export function PersonalizacaoModal({
  aberto,
  onFechar,
  produto,
  personalizacoes,
  onSalvar,
}: Props) {
  const [lista, setLista] = useState<Personalizacao[]>(personalizacoes);

  useEffect(() => {
    if (aberto) setLista(personalizacoes);
  }, [aberto, personalizacoes]);

  function adicionar() {
    setLista((l) => [
      ...l,
      {
        id: novoId(),
        tipo: "bordado",
        posicao: "peito_esquerdo",
        medidas: "",
        observacoes: "",
      },
    ]);
  }

  function atualizar<K extends keyof Personalizacao>(
    id: string,
    key: K,
    value: Personalizacao[K],
  ) {
    setLista((l) => l.map((p) => (p.id === id ? { ...p, [key]: value } : p)));
  }

  function remover(id: string) {
    setLista((l) => l.filter((p) => p.id !== id));
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => (!v ? onFechar() : null)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Personalizações</DialogTitle>
          <DialogDescription>
            Defina tipo, posição, medidas e observações técnicas para{" "}
            <span className="font-medium text-foreground">{produto || "o produto"}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {lista.length === 0 && (
            <div className="rounded-xl border border-dashed border-border/70 bg-surface-muted/40 p-6 text-center text-sm text-muted-foreground">
              Nenhuma personalização. Clique em “Adicionar personalização”.
            </div>
          )}

          {lista.map((p, idx) => (
            <div
              key={p.id}
              className="space-y-3 rounded-xl border border-border bg-surface-muted/40 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Personalização {idx + 1}
                </p>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => remover(p.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tipo</Label>
                  <Select
                    value={p.tipo}
                    onValueChange={(v) => atualizar(p.id, "tipo", v as TipoPersonalizacao)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_PERSONALIZACAO.map((t) => (
                        <SelectItem key={t} value={t}>
                          {LABEL_TIPO_PERSONALIZACAO[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Posição</Label>
                  <Select
                    value={p.posicao}
                    onValueChange={(v) =>
                      atualizar(p.id, "posicao", v as PosicaoPersonalizacao)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POSICOES_PERSONALIZACAO.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {LABEL_POSICAO_PERSONALIZACAO[pos]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs">Medidas</Label>
                  <Input
                    value={p.medidas ?? ""}
                    onChange={(e) => atualizar(p.id, "medidas", e.target.value)}
                    placeholder="Ex.: 8cm x 6cm"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs">Observações técnicas</Label>
                  <Textarea
                    value={p.observacoes ?? ""}
                    onChange={(e) => atualizar(p.id, "observacoes", e.target.value)}
                    rows={2}
                    placeholder="Ex.: Linha branca, malha Dry Fit, sem cordão, bolso interno..."
                  />
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={adicionar} className="w-full">
            <Plus className="h-4 w-4" /> Adicionar personalização
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onFechar}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSalvar(lista);
              onFechar();
            }}
          >
            Salvar personalizações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

