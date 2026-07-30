import { useEffect, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { toast } from "@/lib/toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { hojeISO } from "@/features/pedidos";

import type { ItemEstoque, TipoMovimentacao } from "./types";
import { SIGLA_UNIDADE } from "./types";
import { useEstoque } from "./useEstoque";

interface Props {
  item: ItemEstoque | null;
  aberto: boolean;
  onFechar: () => void;
}

export function MovimentacaoEstoqueModal({ item, aberto, onFechar }: Props) {
  const { movimentar } = useEstoque();
  const [tipo, setTipo] = useState<TipoMovimentacao>("entrada");
  const [quantidadeStr, setQuantidadeStr] = useState("");
  const [data, setData] = useState(hojeISO());
  const [observacoes, setObservacoes] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (aberto) {
      setTipo("entrada");
      setQuantidadeStr("");
      setData(hojeISO());
      setObservacoes("");
      setErro(null);
    }
  }, [aberto]);

  if (!item) return null;

  function confirmar() {
    if (!item) return;
    const qtd = Number(quantidadeStr.replace(",", "."));
    if (!Number.isFinite(qtd) || qtd <= 0) {
      setErro("Informe uma quantidade válida.");
      return;
    }
    const res = movimentar({
      itemId: item.id,
      tipo,
      quantidade: qtd,
      data,
      observacoes,
    });
    if (!res.ok) {
      setErro(res.erro ?? "Não foi possível registrar.");
      return;
    }
    toast.success(
      tipo === "entrada" ? "Entrada registrada com sucesso." : "Saída registrada com sucesso.",
    );
    onFechar();
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => (!v ? onFechar() : undefined)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Movimentar estoque</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{item.nome}</span> · atual:{" "}
            {item.quantidade} {SIGLA_UNIDADE[item.unidade]}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTipo("entrada")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition",
                tipo === "entrada"
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : "border-border bg-surface text-muted-foreground hover:bg-surface-muted/60",
              )}
            >
              <ArrowUpCircle className="h-4 w-4" />
              Entrada
            </button>
            <button
              type="button"
              onClick={() => setTipo("saida")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition",
                tipo === "saida"
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : "border-border bg-surface text-muted-foreground hover:bg-surface-muted/60",
              )}
            >
              <ArrowDownCircle className="h-4 w-4" />
              Saída
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="qtd">Quantidade</Label>
              <Input
                id="qtd"
                inputMode="decimal"
                value={quantidadeStr}
                onChange={(e) => setQuantidadeStr(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="obs">Observações</Label>
            <Textarea
              id="obs"
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex.: Compra do fornecedor XYZ."
            />
          </div>

          {erro && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {erro}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="button" onClick={confirmar}>
            Confirmar movimentação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
