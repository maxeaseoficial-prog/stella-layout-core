import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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

import type { Cliente } from "./types";
import { getClienteNome } from "./types";
import { ClienteAvatar } from "./ClienteAvatar";
import { formatarDataBR } from "./utils";
import { useAuth } from "@/features/auth/useAuth";

interface ClientesTableProps {
  clientes: Cliente[];
  onVisualizar: (cliente: Cliente) => void;
  onEditar: (cliente: Cliente) => void;
  onExcluir: (cliente: Cliente) => void;
}

export function ClientesTable({
  clientes,
  onVisualizar,
  onEditar,
  onExcluir,
}: ClientesTableProps) {
  const { capacidades } = useAuth();
  const cap = capacidades.clientes;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-soft)]">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-muted/50 hover:bg-surface-muted/50">
              <TableHead className="min-w-[220px]">Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.map((cliente) => {
              const nome = getClienteNome(cliente);
              return (
                <TableRow
                  key={cliente.id}
                  className="cursor-pointer"
                  onClick={() => onVisualizar(cliente)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ClienteAvatar nome={nome} imagem={cliente.imagem} size="md" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{nome}</p>
                        {cliente.email && (
                          <p className="truncate text-xs text-muted-foreground">
                            {cliente.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-border bg-surface-muted/60">
                      {cliente.tipo === "empresa" ? "Empresa" : "Pessoa Física"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {cliente.tipo === "empresa" ? cliente.responsavel : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{cliente.telefone}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatarDataBR(cliente.dataCadastro)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        cliente.status === "ativo"
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-border bg-muted text-muted-foreground"
                      }
                    >
                      {cliente.status === "ativo" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          aria-label="Ações"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => onVisualizar(cliente)}>
                          <Eye className="h-4 w-4" /> Visualizar
                        </DropdownMenuItem>
                        {cap.editar && (
                          <DropdownMenuItem onClick={() => onEditar(cliente)}>
                            <Pencil className="h-4 w-4" /> Editar
                          </DropdownMenuItem>
                        )}
                        {cap.excluir && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => onExcluir(cliente)}
                            >
                              <Trash2 className="h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
