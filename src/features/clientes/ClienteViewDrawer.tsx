import {
  FileText,
  ImageIcon,
  Mail,
  MapPin,
  Phone,
  User,
  Building2,
  CalendarDays,
  Download,
} from "lucide-react";

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
  ArquivoPreview,
  LABEL_TIPO_ARQUIVO,
  useArquivos,
} from "@/features/arquivos";

import type { Cliente } from "./types";
import { getClienteNome } from "./types";
import { ClienteAvatar } from "./ClienteAvatar";
import { formatarDataBR, formatarTamanho } from "./utils";

interface ClienteViewDrawerProps {
  cliente: Cliente | null;
  aberto: boolean;
  onFechar: () => void;
  onEditar?: (cliente: Cliente) => void;
}

export function ClienteViewDrawer({
  cliente,
  aberto,
  onFechar,
  onEditar,
}: ClienteViewDrawerProps) {
  const { porCliente } = useArquivos();
  const arquivosDoCliente = cliente ? porCliente(cliente.id) : [];
  return (
    <Sheet open={aberto} onOpenChange={(v) => (!v ? onFechar() : null)}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        {cliente && (
          <>
            <SheetHeader className="border-b border-border bg-surface px-6 py-4">
              <SheetTitle className="text-xl font-bold">Ficha do cliente</SheetTitle>
              <SheetDescription>Visão geral e histórico do cliente.</SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto bg-surface-muted/40 px-6 py-6">
              <div className="space-y-6">
                <div className="flex items-start gap-4 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-soft)]">
                  <ClienteAvatar
                    nome={getClienteNome(cliente)}
                    imagem={cliente.imagem}
                    size="xl"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-lg font-bold text-foreground">
                        {getClienteNome(cliente)}
                      </h3>
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
                    </div>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                      {cliente.tipo === "empresa" ? (
                        <>
                          <Building2 className="h-3.5 w-3.5" /> Empresa
                        </>
                      ) : (
                        <>
                          <User className="h-3.5 w-3.5" /> Pessoa Física
                        </>
                      )}
                    </p>
                    {cliente.tipo === "empresa" && (
                      <p className="mt-1 text-sm text-foreground">
                        <span className="text-muted-foreground">Responsável: </span>
                        {cliente.responsavel}
                      </p>
                    )}
                  </div>
                </div>

                <Bloco titulo="Contato">
                  <Info icon={Phone} label="Telefone" valor={cliente.telefone} />
                  <Info icon={Mail} label="E-mail" valor={cliente.email} />
                  <Info
                    icon={MapPin}
                    label="Endereço"
                    valor={[
                      cliente.endereco,
                      [cliente.cidade, cliente.estado].filter(Boolean).join(" - "),
                    ]
                      .filter(Boolean)
                      .join(" • ")}
                  />
                  <Info
                    icon={CalendarDays}
                    label="Cadastrado em"
                    valor={formatarDataBR(cliente.dataCadastro)}
                  />
                </Bloco>

                {(cliente.tipo === "pessoa_fisica"
                  ? cliente.cpf
                  : cliente.cnpj || cliente.inscricaoEstadual) && (
                  <Bloco titulo="Documentos">
                    {cliente.tipo === "pessoa_fisica" ? (
                      <Info label="CPF" valor={cliente.cpf} />
                    ) : (
                      <>
                        <Info label="CNPJ" valor={cliente.cnpj} />
                        <Info label="Inscrição estadual" valor={cliente.inscricaoEstadual} />
                      </>
                    )}
                  </Bloco>
                )}

                {cliente.observacoes && (
                  <Bloco titulo="Observações">
                    <p className="whitespace-pre-wrap text-sm text-foreground">
                      {cliente.observacoes}
                    </p>
                  </Bloco>
                )}

                <Bloco titulo={`Arquivos (${cliente.arquivos.length})`}>
                  {cliente.arquivos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum arquivo anexado a este cliente.
                    </p>
                  ) : (
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {cliente.arquivos.map((arq) => {
                        const isImg = ["png", "jpg", "jpeg", "svg"].includes(arq.extensao);
                        const Icon = isImg ? ImageIcon : FileText;
                        return (
                          <li
                            key={arq.id}
                            className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted/60 p-3"
                          >
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">
                                {arq.nome}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {arq.extensao.toUpperCase()} • {formatarTamanho(arq.tamanho)}
                              </p>
                            </div>
                            <a
                              href={arq.dataUrl}
                              download={arq.nome}
                              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                              aria-label="Baixar arquivo"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </Bloco>

                <Bloco titulo={`Matrizes & Logos (${arquivosDoCliente.length})`}>
                  {arquivosDoCliente.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum arquivo cadastrado para este cliente. Acesse Matrizes
                      & Logos para adicionar.
                    </p>
                  ) : (
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {arquivosDoCliente.map((a) => (
                        <li
                          key={a.id}
                          className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted/60 p-3"
                        >
                          <ArquivoPreview
                            extensao={a.extensao}
                            dataUrl={a.dataUrl}
                            nome={a.arquivoNome}
                            capaDataUrl={a.capaDataUrl}
                            size="sm"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              {a.nome}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {LABEL_TIPO_ARQUIVO[a.tipo]} •{" "}
                              {a.extensao.toUpperCase()}
                            </p>
                          </div>
                          <a
                            href={a.dataUrl}
                            download={a.arquivoNome}
                            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label="Baixar arquivo"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </Bloco>

                <Bloco titulo="Histórico">
                  <p className="text-sm text-muted-foreground">
                    Pedidos, orçamentos e notas fiscais vinculados a este cliente
                    aparecerão aqui.
                  </p>
                </Bloco>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border bg-surface px-6 py-4">
              <Button variant="outline" onClick={onFechar}>
                Fechar
              </Button>
              {onEditar && (
                <Button onClick={() => onEditar(cliente)}>Editar cliente</Button>
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
