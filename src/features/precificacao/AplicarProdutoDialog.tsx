import { useMemo, useState } from "react";
import { ArrowRight, Package, Search } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { labelCategoriaProduto, type Produto } from "@/features/produtos/types";
import { useProdutos } from "@/features/produtos/useProdutos";

import { brl } from "./calculos";

interface AplicarProdutoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  precoVenda: number;
  onConfirmar: (produto: Produto) => void;
}

function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function AplicarProdutoDialog({
  open,
  onOpenChange,
  precoVenda,
  onConfirmar,
}: AplicarProdutoDialogProps) {
  const { ativos } = useProdutos();
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState<Produto | null>(null);

  const filtrados = useMemo(() => {
    const t = normalizar(busca.trim());
    if (!t) return ativos;
    return ativos.filter(
      (p) =>
        normalizar(p.nome).includes(t) ||
        normalizar(p.sku ?? "").includes(t) ||
        normalizar(labelCategoriaProduto(p.categoria)).includes(t),
    );
  }, [ativos, busca]);

  const fechar = (v: boolean) => {
    if (!v) {
      setBusca("");
      setSelecionado(null);
    }
    onOpenChange(v);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={fechar}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Aplicar preço ao Produto</DialogTitle>
          </DialogHeader>

          <div className="rounded-xl border border-primary/30 bg-primary-soft px-4 py-3">
            <p className="text-xs font-medium text-primary">Preço calculado a aplicar</p>
            <p className="text-2xl font-extrabold tabular-nums text-foreground">{brl(precoVenda)}</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Buscar por nome, código ou categoria…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-72 rounded-xl border border-border">
            {filtrados.length === 0 ? (
              <div className="grid h-full place-items-center p-6 text-sm text-muted-foreground">
                Nenhum produto encontrado.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filtrados.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setSelecionado(p)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60"
                    >
                      {p.imagem ? (
                        <img
                          src={p.imagem}
                          alt={p.nome}
                          className="h-10 w-10 shrink-0 rounded-lg border border-border object-cover"
                        />
                      ) : (
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                          <Package className="h-4 w-4" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {p.nome}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {labelCategoriaProduto(p.categoria)}
                          {p.sku ? ` · ${p.sku}` : ""}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground">
                        {brl(p.precoBase)}
                        <ArrowRight className="h-3 w-3" />
                        <span className="font-semibold text-primary">{brl(precoVenda)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!selecionado} onOpenChange={(v) => !v && setSelecionado(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Atualizar preço de venda?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Deseja atualizar o preço de venda deste produto?</p>
                {selecionado && (
                  <div className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm">
                    <p className="font-semibold text-foreground">{selecionado.nome}</p>
                    <p className="mt-1 flex items-center gap-2 tabular-nums text-muted-foreground">
                      {brl(selecionado.precoBase)}
                      <ArrowRight className="h-3.5 w-3.5" />
                      <span className="font-bold text-primary">{brl(precoVenda)}</span>
                    </p>
                  </div>
                )}
                <p className="text-xs">A alteração ficará registrada no histórico do produto.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className={cn("bg-primary text-primary-foreground hover:bg-primary/90")}
              onClick={() => {
                if (selecionado) onConfirmar(selecionado);
                setSelecionado(null);
                fechar(false);
              }}
            >
              Confirmar atualização
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
