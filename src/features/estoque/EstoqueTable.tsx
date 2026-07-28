import { ArrowLeftRight, History, MoreHorizontal, Package, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatarMoeda } from "@/features/pedidos";

import type { ItemEstoque } from "./types";
import { LABEL_CATEGORIA_ESTOQUE, SIGLA_UNIDADE } from "./types";

interface Props {
  itens: ItemEstoque[];
  onEditar: (i: ItemEstoque) => void;
  onExcluir: (i: ItemEstoque) => void;
  onRemover: (i: ItemEstoque) => void;
  onExcluirDefinitivo: (i: ItemEstoque) => void;
  podeRemover: (id: string) => boolean;
  onMovimentar: (i: ItemEstoque) => void;
  onHistorico: (i: ItemEstoque) => void;
}



function badgeEstoque(i: ItemEstoque) {
  if (i.quantidade <= 0) {
    return (
      <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/10">
        Sem estoque
      </Badge>
    );
  }
  if (i.quantidade <= i.estoqueMinimo) {
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        Estoque baixo
      </Badge>
    );
  }
  if (i.status === "inativo") {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Inativo
      </Badge>
    );
  }
  return (
    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Ativo</Badge>
  );
}

export function EstoqueTable({ itens, onEditar, onExcluir, onRemover, podeRemover, onMovimentar, onHistorico }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-soft)]">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-muted/50 hover:bg-surface-muted/50">
              <TableHead className="min-w-[240px]">Item</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead className="text-right">Preço compra</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[140px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.map((i) => {
              const inativo = i.status === "inativo";
              const podeRemoverItem = inativo && podeRemover(i.id);
              return (
              <TableRow
                key={i.id}
                className={`cursor-pointer ${inativo ? "text-muted-foreground opacity-60" : ""}`}
                onClick={() => onEditar(i)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={`grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-surface-muted ${inativo ? "grayscale" : ""}`}>
                      {i.imagem ? (
                        <img src={i.imagem} alt={i.nome} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`truncate font-medium ${inativo ? "text-muted-foreground" : "text-foreground"}`}>{i.nome}</p>
                      {i.descricao && (
                        <p className="truncate text-xs text-muted-foreground">{i.descricao}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-border bg-surface-muted/60">
                    {LABEL_CATEGORIA_ESTOQUE[i.categoria]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {i.quantidade}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {SIGLA_UNIDADE[i.unidade]}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatarMoeda(i.precoCompra)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {i.fornecedor || "—"}
                </TableCell>
                <TableCell>{badgeEstoque(i)}</TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => onMovimentar(i)}
                      disabled={inativo}
                    >
                      <ArrowLeftRight className="h-3.5 w-3.5" />
                      Movimentar
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditar(i)}>
                          <Pencil className="h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onHistorico(i)}>
                          <History className="h-4 w-4" /> Histórico
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {!inativo && (
                          <DropdownMenuItem
                            onClick={() => onExcluir(i)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" /> Inativar
                          </DropdownMenuItem>
                        )}
                        {podeRemoverItem && (
                          <DropdownMenuItem
                            onClick={() => onRemover(i)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" /> Excluir permanentemente
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

