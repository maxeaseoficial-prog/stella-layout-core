import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import {
  LABEL_CATEGORIA,
  LABEL_FORMA_PAGAMENTO,
  LABEL_ORIGEM,
  LABEL_STATUS,
  type Movimentacao,
} from "./types";
import { formatarDataBR, formatarMoeda } from "./utils";

interface Props {
  movimentacoes: Movimentacao[];
  onVisualizar: (m: Movimentacao) => void;
  onEditar: (m: Movimentacao) => void;
  onExcluir: (m: Movimentacao) => void;
  selecionados: Set<string>;
  onAlternarSelecao: (id: string, selecionado: boolean) => void;
  onAlternarTodos: (selecionado: boolean) => void;
}

export function MovimentacoesTable({
  movimentacoes,
  onVisualizar,
  onEditar,
  onExcluir,
  selecionados,
  onAlternarSelecao,
  onAlternarTodos,
}: Props) {
  const visiveis = movimentacoes.length;
  const marcados = movimentacoes.filter((m) => selecionados.has(m.id)).length;
  const estadoCabecalho: boolean | "indeterminate" =
    visiveis > 0 && marcados === visiveis
      ? true
      : marcados > 0
        ? "indeterminate"
        : false;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-soft)]">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={estadoCabecalho}
                  disabled={visiveis === 0}
                  onCheckedChange={(v) => onAlternarTodos(v === true)}
                  aria-label="Selecionar todas as movimentações visíveis"
                />
              </TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Forma</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {movimentacoes.map((m) => (
              <TableRow
                key={m.id}
                className="group"
                data-state={selecionados.has(m.id) ? "selected" : undefined}
              >
                <TableCell>
                  <Checkbox
                    checked={selecionados.has(m.id)}
                    onCheckedChange={(v) => onAlternarSelecao(m.id, v === true)}
                    aria-label={`Selecionar movimentação ${m.descricao}`}
                  />
                </TableCell>
                <TableCell>

                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium",
                      m.tipo === "entrada"
                        ? "border-success/40 bg-success/10 text-success"
                        : "border-destructive/40 bg-destructive/10 text-destructive",
                    )}
                  >
                    {m.tipo === "entrada" ? "Entrada" : "Saída"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-foreground">
                  {LABEL_CATEGORIA[m.categoria]}
                </TableCell>
                <TableCell className="max-w-[280px] truncate text-sm text-foreground">
                  {m.descricao}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {LABEL_FORMA_PAGAMENTO[m.formaPagamento]}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-semibold tabular-nums",
                    m.tipo === "entrada" ? "text-success" : "text-destructive",
                  )}
                >
                  {m.tipo === "entrada" ? "+" : "-"} {formatarMoeda(m.valor)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatarDataBR(m.data)}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    {LABEL_ORIGEM[m.origem]}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {LABEL_STATUS[m.status]}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onVisualizar(m)}>
                        <Eye className="h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditar(m)}>
                        <Pencil className="h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onExcluir(m)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
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
