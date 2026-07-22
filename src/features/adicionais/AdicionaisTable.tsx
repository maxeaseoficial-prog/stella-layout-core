import { MoreHorizontal, Pencil, Puzzle, Trash2 } from "lucide-react";

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

import type { Adicional } from "./types";
import { LABEL_CATEGORIA_ADICIONAL, LABEL_TIPO_ADICIONAL } from "./types";

interface Props {
  adicionais: Adicional[];
  onEditar: (a: Adicional) => void;
  onExcluir: (a: Adicional) => void;
  onRemover: (a: Adicional) => void;
}

export function AdicionaisTable({ adicionais, onEditar, onExcluir, onRemover }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-soft)]">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-muted/50 hover:bg-surface-muted/50">
              <TableHead className="min-w-[240px]">Adicional</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead className="w-[60px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adicionais.map((a) => (
              <TableRow key={a.id} className="cursor-pointer" onClick={() => onEditar(a)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-surface-muted">
                      {a.imagem ? (
                        <img src={a.imagem} alt={a.nome} className="h-full w-full object-cover" />
                      ) : (
                        <Puzzle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{a.nome}</p>
                      {a.descricao && (
                        <p className="truncate text-xs text-muted-foreground">{a.descricao}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-border bg-surface-muted/60">
                    {LABEL_TIPO_ADICIONAL[a.tipo]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {LABEL_CATEGORIA_ADICIONAL[a.categoria]}
                  </span>
                </TableCell>
                <TableCell className="tabular-nums">
                  {a.valor > 0 ? `+ ${formatarMoeda(a.valor)}` : "—"}
                </TableCell>
                <TableCell>
                  {a.status === "ativo" ? (
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
                  {formatarDataBR(a.criadoEm)}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditar(a)}>
                        <Pencil className="h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      {a.status === "ativo" && (
                        <DropdownMenuItem
                          onClick={() => onExcluir(a)}
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
