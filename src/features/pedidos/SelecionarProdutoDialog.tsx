import { useMemo, useState } from "react";
import { ImageIcon, LayoutGrid, List, Package, Search } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";
import {
  labelCategoriaProduto,
  useProdutos,
  type Produto,
} from "@/features/produtos";

import { formatarMoeda } from "./utils";

/** Remove acentos e converte para minúsculas, tornando a busca tolerante. */
function normalizar(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Miniatura do produto com lazy loading ou placeholder elegante. */
function Thumb({ produto, className }: { produto: Produto; className?: string }) {
  if (produto.imagem) {
    return (
      <img
        src={produto.imagem}
        alt={produto.nome}
        loading="lazy"
        className={cn(
          "shrink-0 rounded-lg border border-border bg-surface-muted object-cover",
          className,
        )}
      />
    );
  }
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-lg border border-border bg-surface-muted",
        className,
      )}
    >
      <ImageIcon className="h-1/3 w-1/3 text-muted-foreground" />
    </span>
  );
}

function StatusBadge({ status }: { status: Produto["status"] }) {
  return status === "ativo" ? (
    <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
      Ativo
    </span>
  ) : (
    <span className="rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
      Inativo
    </span>
  );
}

interface Props {
  aberto: boolean;
  onFechar: () => void;
  onSelecionar: (produto: Produto) => void;
}

/**
 * Seletor oficial de produtos do sistema: modal com busca instantânea,
 * filtro por categoria e visualização em lista ou grade.
 * Produtos inativos são exibidos (com badge), mas não podem ser selecionados.
 */
export function SelecionarProdutoDialog({ aberto, onFechar, onSelecionar }: Props) {
  const { produtos } = useProdutos();
  const [termo, setTermo] = useState("");
  const [categoria, setCategoria] = useState<string>("todas");
  const [modo, setModo] = useState<"lista" | "grade">("lista");

  const categorias = useMemo(() => {
    const mapa = new Map<string, string>();
    produtos.forEach((p) => {
      if (p.categoria) mapa.set(p.categoria, labelCategoriaProduto(p.categoria));
    });
    return [...mapa.entries()].sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
  }, [produtos]);

  const filtrados = useMemo(() => {
    const tokens = normalizar(termo.trim()).split(/\s+/).filter(Boolean);
    return produtos
      .filter((p) => {
        if (categoria !== "todas" && p.categoria !== categoria) return false;
        if (tokens.length === 0) return true;
        const alvo = normalizar(
          `${p.nome} ${p.sku ?? ""} ${labelCategoriaProduto(p.categoria)}`,
        );
        return tokens.every((tk) => alvo.includes(tk));
      })
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [produtos, termo, categoria]);

  function escolher(p: Produto) {
    if (p.status !== "ativo") return;
    onSelecionar(p);
  }

  function handleFechar() {
    setTermo("");
    setCategoria("todas");
    onFechar();
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => (!v ? handleFechar() : null)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Selecionar produto</DialogTitle>
          <DialogDescription>
            Pesquise pelo nome, código ou categoria e clique no produto para
            adicioná-lo ao pedido.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Pesquisar produto..."
              className="border-primary/60 pl-9 focus-visible:border-primary"
            />
          </div>

          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categorias.map(([valor, label]) => (
                <SelectItem key={valor} value={valor}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex shrink-0 overflow-hidden rounded-md border border-border">
            <Button
              type="button"
              size="icon"
              variant={modo === "lista" ? "secondary" : "ghost"}
              className="h-10 w-10 rounded-none"
              onClick={() => setModo("lista")}
              aria-pressed={modo === "lista"}
              aria-label="Visualizar em lista"
              title="Lista"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant={modo === "grade" ? "secondary" : "ghost"}
              className="h-10 w-10 rounded-none"
              onClick={() => setModo("grade")}
              aria-pressed={modo === "grade"}
              aria-label="Visualizar em grade"
              title="Grade"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto rounded-xl border border-border bg-surface-muted/30">
          {filtrados.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Nenhum produto encontrado"
              description="Ajuste a busca ou o filtro de categoria para ver mais resultados."
            />
          ) : modo === "lista" ? (
            <ul className="divide-y divide-border">
              {filtrados.map((p) => {
                const ativo = p.status === "ativo";
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      disabled={!ativo}
                      onClick={() => escolher(p)}
                      className={cn(
                        "flex w-full items-center gap-4 p-3 text-left transition-colors",
                        ativo
                          ? "hover:bg-surface-muted/70 focus-visible:bg-surface-muted/70"
                          : "cursor-not-allowed opacity-60",
                      )}
                    >
                      <Thumb produto={p} className="h-20 w-20" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {p.nome}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          Categoria: {labelCategoriaProduto(p.categoria)}
                        </p>
                        {p.sku ? (
                          <p className="truncate text-xs text-muted-foreground">
                            Código: {p.sku}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="text-sm font-semibold tabular-nums text-foreground">
                          {formatarMoeda(p.precoBase)}
                        </span>
                        <StatusBadge status={p.status} />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3">
              {filtrados.map((p) => {
                const ativo = p.status === "ativo";
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      disabled={!ativo}
                      onClick={() => escolher(p)}
                      className={cn(
                        "flex h-full w-full flex-col gap-2 rounded-xl border border-border bg-surface p-3 text-left shadow-[var(--shadow-soft)] transition-all",
                        ativo
                          ? "hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                          : "cursor-not-allowed opacity-60",
                      )}
                    >
                      <Thumb produto={p} className="aspect-square w-full" />
                      <div className="min-w-0 space-y-0.5">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {p.nome}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {labelCategoriaProduto(p.categoria)}
                        </p>
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold tabular-nums text-foreground">
                          {formatarMoeda(p.precoBase)}
                        </span>
                        <StatusBadge status={p.status} />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
