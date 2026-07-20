import { CalendarDays, Download, FileType2, Tag, User } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ClienteAvatar,
  getClienteNome,
  useClientes,
} from "@/features/clientes";
import { formatarDataBR, formatarTamanho } from "@/features/clientes/utils";

import type { Arquivo } from "./types";
import { LABEL_FINALIDADE, LABEL_TIPO_ARQUIVO } from "./types";
import { ArquivoPreview } from "./ArquivoPreview";

interface Props {
  arquivo: Arquivo | null;
  aberto: boolean;
  onFechar: () => void;
  onEditar?: (a: Arquivo) => void;
}

export function ArquivoViewDrawer({ arquivo, aberto, onFechar, onEditar }: Props) {
  const { buscarPorId } = useClientes();
  const cliente = arquivo ? buscarPorId(arquivo.clienteId) : undefined;

  return (
    <Sheet open={aberto} onOpenChange={(v) => (!v ? onFechar() : null)}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        {arquivo && (
          <>
            <SheetHeader className="border-b border-border bg-surface px-6 py-4">
              <SheetTitle className="text-xl font-bold">Detalhes do arquivo</SheetTitle>
              <SheetDescription>Preview e informações do arquivo.</SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto bg-surface-muted/40 px-6 py-6">
              <div className="space-y-6">
                <section className="rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
                  <ArquivoPreview
                    extensao={arquivo.extensao}
                    dataUrl={arquivo.dataUrl}
                    nome={arquivo.arquivoNome}
                    size="xl"
                    className="!h-56"
                  />
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold text-foreground">
                        {arquivo.nome}
                      </h3>
                      <p className="truncate text-xs text-muted-foreground">
                        {arquivo.arquivoNome}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        arquivo.status === "ativo"
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-border bg-muted text-muted-foreground"
                      }
                    >
                      {arquivo.status === "ativo" ? "Ativo" : "Arquivado"}
                    </Badge>
                  </div>
                </section>

                <Bloco titulo="Informações">
                  {cliente && (
                    <div className="flex items-center gap-2 text-sm">
                      <ClienteAvatar
                        nome={getClienteNome(cliente)}
                        imagem={cliente.imagem}
                        size="sm"
                      />
                      <div>
                        <span className="text-muted-foreground">Cliente: </span>
                        <span className="font-medium text-foreground">
                          {getClienteNome(cliente)}
                        </span>
                      </div>
                    </div>
                  )}
                  {!cliente && (
                    <Info
                      icon={User}
                      label="Cliente"
                      valor="Cliente removido"
                    />
                  )}
                  <Info
                    icon={Tag}
                    label="Tipo"
                    valor={LABEL_TIPO_ARQUIVO[arquivo.tipo]}
                  />
                  {arquivo.finalidade && (
                    <Info
                      icon={Tag}
                      label="Finalidade"
                      valor={LABEL_FINALIDADE[arquivo.finalidade]}
                    />
                  )}
                  <Info
                    icon={FileType2}
                    label="Arquivo"
                    valor={`${arquivo.extensao.toUpperCase()} • ${formatarTamanho(arquivo.tamanho)}`}
                  />
                  <Info
                    icon={CalendarDays}
                    label="Cadastrado em"
                    valor={formatarDataBR(arquivo.criadoEm)}
                  />
                </Bloco>

                {arquivo.descricao && (
                  <Bloco titulo="Descrição">
                    <p className="whitespace-pre-wrap text-sm text-foreground">
                      {arquivo.descricao}
                    </p>
                  </Bloco>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border bg-surface px-6 py-4">
              <Button variant="outline" onClick={onFechar}>
                Fechar
              </Button>
              <Button variant="outline" asChild>
                <a href={arquivo.dataUrl} download={arquivo.arquivoNome}>
                  <Download className="h-4 w-4" /> Baixar
                </a>
              </Button>
              {onEditar && (
                <Button onClick={() => onEditar(arquivo)}>Editar</Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
      <h4 className="text-sm font-semibold text-foreground">{titulo}</h4>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Info({
  icon: Icon,
  label,
  valor,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  valor?: string;
}) {
  if (!valor) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
      <div>
        <span className="text-muted-foreground">{label}: </span>
        <span className="text-foreground">{valor}</span>
      </div>
    </div>
  );
}
