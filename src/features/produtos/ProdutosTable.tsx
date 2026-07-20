import { MoreHorizontal, Package, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { formatarDataBR } from "@/features/clientes";
import { formatarMoeda } from "@/features/pedidos";

import type { Produto } from "./types";
import { LABEL_CATEGORIA_PRODUTO } from "./types";

interface Props {
  produtos: Produto[];
  onEditar: (p: Produto) => void;
  onExcluir: (p: Produto) => void;
}

export function ProdutosTable({ produtos, onEditar, onExcluir }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-soft)]">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-muted/50 hover:bg-surface-muted/50">
              <TableHead className="min-w-[240px]">Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço base</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead className="w-[60px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produtos.map((p) => (
              <TableRow key={p.id} className="cursor-pointer" onClick={() => onEditar(p)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-surface-muted">
                      {p.imagem ? (
                        <img src={p.imagem} alt={p.nome} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{p.nome}</p>
                      {p.sku && (
                        <p className="truncate text-xs text-muted-foreground">SKU: {p.sku}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-border bg-surface-muted/60">
                    {LABEL_CATEGORIA_PRODUTO[p.categoria]}
                  </Badge>
                </TableCell>
                <TableCell className="tabular-nums">{formatarMoeda(p.precoBase)}</TableCell>
                <TableCell>
                  {p.status === "ativo" ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Inativo
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatarDataBR(p.criadoEm)}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditar(p)}>
                        <Pencil className="h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      {p.status === "ativo" && (
                        <DropdownMenuItem
                          onClick={() => onExcluir(p)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" /> Inativar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
