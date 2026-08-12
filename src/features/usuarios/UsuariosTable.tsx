import { Eye, KeyRound, MoreHorizontal, Pencil, Power, RefreshCw, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { UsuarioAvatar } from "./UsuarioAvatar";
import { PAPEL_LABEL, type Usuario } from "./types";

interface Props {
  usuarios: Usuario[];
  onView: (u: Usuario) => void;
  onEdit: (u: Usuario) => void;
  onResetSenha: (u: Usuario) => void;
  onToggleStatus: (u: Usuario) => void;
  onDelete: (u: Usuario) => void;
  onSincronizar?: (u: Usuario) => void;
  loadingId?: string | null;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function UsuariosTable({
  usuarios,
  onView,
  onEdit,
  onResetSenha,
  onToggleStatus,
  onDelete,
  onSincronizar,
  loadingId,
}: Props) {
  if (usuarios.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 py-14 text-center text-sm text-muted-foreground">
        Nenhum usuário encontrado.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead className="w-[280px]">Usuário</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Último acesso</TableHead>
            <TableHead className="w-[60px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map((u) => (
            <TableRow key={u.id} className="group">
              <TableCell>
                <div className="flex items-center gap-3">
                  <UsuarioAvatar nome={u.nome} foto={u.foto} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{u.nome}</p>
                    <p className="truncate text-xs text-muted-foreground">@{u.usuario}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-primary-soft text-primary">
                  {PAPEL_LABEL[u.papel]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
              <TableCell>
                {u.status === "ativo" ? (
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
                {formatDate(u.ultimoAcesso)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onView(u)}>
                      <Eye className="mr-2 h-4 w-4" /> Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(u)}>
                      <Pencil className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onResetSenha(u)}>
                      <KeyRound className="mr-2 h-4 w-4" /> Redefinir senha
                    </DropdownMenuItem>
                    {onSincronizar && (
                        <DropdownMenuItem 
                          onClick={() => onSincronizar(u)}
                          disabled={loadingId === u.id}
                        >
                          <RefreshCw className={`mr-2 h-4 w-4 ${loadingId === u.id ? "animate-spin" : ""}`} /> 
                          Diagnosticar Acesso
                        </DropdownMenuItem>

                    )}
                    <DropdownMenuItem onClick={() => onToggleStatus(u)}>
                      <Power className="mr-2 h-4 w-4" />
                      {u.status === "ativo" ? "Desativar" : "Ativar"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(u)}
                      disabled={u.padrao}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
