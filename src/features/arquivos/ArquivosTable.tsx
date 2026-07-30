import { Download, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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
import { ClienteAvatar, useClientes, getClienteNome } from "@/features/clientes";
import { formatarDataBR } from "@/features/clientes/utils";

import type { Arquivo } from "./types";
import {
  LABEL_FINALIDADE,
  LABEL_TIPO_APLICACAO,
  LABEL_TIPO_ARQUIVO,
  labelPosicao,
} from "./types";
import { ArquivoPreview } from "./ArquivoPreview";

interface Props {
  arquivos: Arquivo[];
  onVisualizar: (a: Arquivo) => void;
  onEditar: (a: Arquivo) => void;
  onExcluir: (a: Arquivo) => void;
}

export function ArquivosTable({ arquivos, onVisualizar, onEditar, onExcluir }: Props) {
  const { buscarPorId } = useClientes();

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-soft)]">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-muted/50 hover:bg-surface-muted/50">
              <TableHead className="w-[80px]">Miniatura</TableHead>
              <TableHead className="min-w-[220px]">Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="min-w-[220px]">Nome</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {arquivos.map((a) => {
              const cliente = buscarPorId(a.clienteId);
              return (
                <TableRow
                  key={a.id}
                  className="cursor-pointer"
                  onClick={() => onVisualizar(a)}
                >
                  <TableCell>
                    <ArquivoPreview
                      extensao={a.extensao}
                      dataUrl={a.dataUrl}
                      nome={a.arquivoNome}
                      capaDataUrl={a.capaDataUrl}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell>
                    {cliente ? (
                      <div className="flex items-center gap-2">
                        <ClienteAvatar
                          nome={getClienteNome(cliente)}
                          imagem={cliente.imagem}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {getClienteNome(cliente)}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {cliente.tipo === "empresa" ? "Empresa" : "Pessoa Física"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Cliente removido
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-border bg-surface-muted/60"
                    >
                      {LABEL_TIPO_ARQUIVO[a.tipo]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {a.nome}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.tipoAplicacao
                          ? `${LABEL_TIPO_APLICACAO[a.tipoAplicacao]}${
                              a.posicaoAplicacao
                                ? ` • ${labelPosicao(a.posicaoAplicacao)}`
                                : ""
                            }`
                          : a.finalidade
                            ? LABEL_FINALIDADE[a.finalidade]
                            : a.arquivoNome}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatarDataBR(a.criadoEm)}
                  </TableCell>
                  <TableCell>
                    {a.status === "ativo" ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Arquivado
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onVisualizar(a)}>
                          <Eye className="h-4 w-4" /> Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={a.dataUrl} download={a.arquivoNome}>
                            <Download className="h-4 w-4" /> Baixar
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditar(a)}>
                          <Pencil className="h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onExcluir(a)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" /> Excluir
                        </DropdownMenuItem>
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
