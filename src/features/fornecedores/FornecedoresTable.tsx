import { MoreHorizontal, Pencil, Power } from "lucide-react";

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
import { ClienteAvatar } from "@/features/clientes";

import type { Fornecedor } from "./types";
import { LABEL_CATEGORIA_FORNECEDOR } from "./types";

interface Props {
  fornecedores: Fornecedor[];
  onAbrir: (f: Fornecedor) => void;
  onEditar: (f: Fornecedor) => void;
  onAlternarStatus: (f: Fornecedor) => void;
}

export function FornecedoresTable({
  fornecedores,
  onAbrir,
  onEditar,
  onAlternarStatus,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-soft)]">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-muted/50 hover:bg-surface-muted/50">
              <TableHead className="min-w-[260px]">Empresa</TableHead>
              <TableHead>Representante</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Última compra</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fornecedores.map((f) => (
              <TableRow key={f.id} className="cursor-pointer" onClick={() => onAbrir(f)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <ClienteAvatar nome={f.empresa} imagem={f.logo} size="md" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{f.empresa}</p>
                      {f.categorias.length > 0 && (
                        <p className="truncate text-xs text-muted-foreground">
                          {f.categorias
                            .slice(0, 3)
                            .map((c) => LABEL_CATEGORIA_FORNECEDOR[c])
                            .join(" · ")}
                          {f.categorias.length > 3 && ` +${f.categorias.length - 3}`}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{f.representante}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{f.telefone}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {f.endereco?.cidade
                    ? `${f.endereco.cidade}${f.endereco.estado ? " / " + f.endereco.estado : ""}`
                    : "—"}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">—</TableCell>
                <TableCell>
                  {f.status === "ativo" ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Inativo
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditar(f)}>
                        <Pencil className="h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAlternarStatus(f)}>
                        <Power className="h-4 w-4" />
                        {f.status === "ativo" ? "Inativar" : "Ativar"}
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
