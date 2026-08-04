import { useEffect, useRef, useState } from "react";
import { ImageIcon, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/custom-select";
import { cn } from "@/lib/utils";
import { fileToDataUrl, formatarTamanho, hojeISO } from "@/features/clientes/utils";

import type {
  Arquivo,
  ArquivoInput,
  CorAplicacao,
  StatusArquivo,
  TipoAplicacao,
  TipoArquivo,
} from "./types";
import {
  EXTENSOES_ACEITAS,
  LABEL_GRUPO_POSICAO,
  LABEL_TIPO_APLICACAO,
  LABEL_TIPO_ARQUIVO,
  posicoesParaTipo,
} from "./types";
import { ArquivoPreview } from "./ArquivoPreview";
import { ArquivoClienteSelector } from "./ArquivoClienteSelector";
import { extensaoDoNome } from "./utils";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  arquivo?: Arquivo | null;
  clienteIdInicial?: string;
  onSalvar: (dados: ArquivoInput, id?: string) => void;
}

interface FormState {
  clienteId: string;
  tipo: TipoArquivo;
  tipoAplicacao: TipoAplicacao | "";
  posicaoAplicacao: string;
  descricaoAplicacao: string;
  nome: string;
  descricao: string;
  status: StatusArquivo;
  larguraCm: string;
  alturaCm: string;
  cores: CorAplicacao[];
  valorStr: string;
  arquivoNome: string;
  extensao: string;
  mime: string;
  tamanho: number;
  dataUrl: string;
  capaNome: string;
  capaDataUrl: string;
}

function estadoInicial(a?: Arquivo | null, clienteIdInicial?: string): FormState {
  if (!a) {
    return {
      clienteId: clienteIdInicial ?? "",
      tipo: "logo",
      tipoAplicacao: "",
      posicaoAplicacao: "",
      descricaoAplicacao: "",
      nome: "",
      descricao: "",
      status: "ativo",
      larguraCm: "",
      alturaCm: "",
      cores: [],
      valorStr: "",
      arquivoNome: "",
      extensao: "",
      mime: "",
      tamanho: 0,
      dataUrl: "",
      capaNome: "",
      capaDataUrl: "",
    };
  }
  // Migração de campos legados
  let cores: CorAplicacao[] = a.cores ?? [];
  if (cores.length === 0 && (a.cor || a.numeroCor)) {
    cores = [{ nome: a.cor ?? "", numero: a.numeroCor ?? "" }];
  }
  return {
    clienteId: a.clienteId,
    tipo: a.tipo,
    tipoAplicacao: a.tipoAplicacao ?? "",
    posicaoAplicacao: a.posicaoAplicacao ?? "",
    descricaoAplicacao: a.descricaoAplicacao ?? "",
    nome: a.nome,
    descricao: a.descricao ?? "",
    status: a.status,
    larguraCm: a.larguraCm != null ? String(a.larguraCm) : "",
    alturaCm: a.alturaCm != null ? String(a.alturaCm) : "",
    cores,
    valorStr:
      a.valor != null && a.valor > 0
        ? a.valor.toFixed(2).replace(".", ",")
        : "",
    arquivoNome: a.arquivoNome,
    extensao: a.extensao,
    mime: a.mime,
    tamanho: a.tamanho,
    dataUrl: a.dataUrl,
    capaNome: a.capaNome ?? "",
    capaDataUrl: a.capaDataUrl ?? "",
  };
}


const ACCEPT = EXTENSOES_ACEITAS.map((e) => `.${e}`).join(",");
const ACCEPT_CAPA = ".png,.jpg,.jpeg";
const EXTS_CAPA = ["png", "jpg", "jpeg"];

export function ArquivoFormDrawer({
  aberto,
  onFechar,
  arquivo,
  clienteIdInicial,
  onSalvar,
}: Props) {
  const [form, setForm] = useState<FormState>(() =>
    estadoInicial(arquivo, clienteIdInicial),
  );
  const [erros, setErros] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const capaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aberto) {
      setForm(estadoInicial(arquivo, clienteIdInicial));
      setErros({});
    }
  }, [aberto, arquivo, clienteIdInicial]);

  function up<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleArquivo(file: File | undefined) {
    if (!file) return;
    const ext = extensaoDoNome(file.name);
    if (!EXTENSOES_ACEITAS.includes(ext as (typeof EXTENSOES_ACEITAS)[number])) {
      setErros((e) => ({
        ...e,
        arquivo: `Extensão .${ext} não aceita.`,
      }));
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setForm((f) => ({
      ...f,
      arquivoNome: file.name,
      extensao: ext,
      mime: file.type || `application/${ext}`,
      tamanho: file.size,
      dataUrl,
      nome: f.nome || file.name.replace(/\.[^.]+$/, ""),
    }));
    setErros((e) => ({ ...e, arquivo: "" }));
  }

  async function handleCapa(file: File | undefined) {
    if (!file) return;
    const ext = extensaoDoNome(file.name);
    if (!EXTS_CAPA.includes(ext)) {
      setErros((e) => ({ ...e, capa: "A capa deve ser uma imagem PNG ou JPG." }));
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setForm((f) => ({ ...f, capaNome: file.name, capaDataUrl: dataUrl }));
    setErros((e) => ({ ...e, capa: "" }));
  }

  function removerCapa() {
    setForm((f) => ({ ...f, capaNome: "", capaDataUrl: "" }));
  }

  function validar(): boolean {
    const e: Record<string, string> = {};
    if (!form.clienteId) e.clienteId = "Selecione um cliente.";
    if (!form.nome.trim()) e.nome = "Informe o nome do arquivo.";
    if (!form.dataUrl) e.arquivo = "Envie o arquivo.";
    if (
      form.posicaoAplicacao === "outro_local" &&
      !form.descricaoAplicacao.trim()
    ) {
      e.descricaoAplicacao =
        "Descreva a aplicação quando a posição for 'Outro local'.";
    }
    setErros(e);
    return Object.keys(e).length === 0;
  }

  function handleSalvar() {
    if (!validar()) return;
    const dados: ArquivoInput = {
      clienteId: form.clienteId,
      tipo: form.tipo,
      tipoAplicacao: form.tipoAplicacao || undefined,
      posicaoAplicacao: form.posicaoAplicacao || undefined,
      descricaoAplicacao: form.descricaoAplicacao.trim() || undefined,
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || undefined,
      status: form.status,
      larguraCm: form.larguraCm.trim() ? Number(form.larguraCm.replace(",", ".")) : undefined,
      alturaCm: form.alturaCm.trim() ? Number(form.alturaCm.replace(",", ".")) : undefined,
      cores: form.cores.length
        ? form.cores.map((c) => ({ nome: c.nome.trim(), numero: c.numero.trim() }))
        : undefined,
      valor: (() => {
        const v = form.valorStr.trim();
        if (!v) return undefined;
        const n = Number(v.replace(/\./g, "").replace(",", "."));
        return Number.isFinite(n) && n > 0 ? n : undefined;
      })(),
      arquivoNome: form.arquivoNome,
      extensao: form.extensao,
      mime: form.mime,
      tamanho: form.tamanho,
      dataUrl: form.dataUrl,
      capaNome: form.capaNome || undefined,
      capaDataUrl: form.capaDataUrl || undefined,
    };
    onSalvar(dados, arquivo?.id);
  }

  return (
    <Sheet open={aberto} onOpenChange={(v) => (!v ? onFechar() : null)}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="border-b border-border bg-surface px-6 py-4">
          <SheetTitle className="text-xl font-bold">
            {arquivo ? "Editar arquivo" : "Novo arquivo"}
          </SheetTitle>
          <SheetDescription>
            Vincule logos, matrizes e artes ao cliente correto. Data de cadastro:{" "}
            {hojeISO().split("-").reverse().join("/")}.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-surface-muted/40 px-6 py-6">
          <div className="space-y-6">
            {/* Cliente */}
            <section className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Cliente</h4>
                <p className="text-xs text-muted-foreground">
                  Cada arquivo pertence a um cliente da base única.
                </p>
              </div>
              <ArquivoClienteSelector
                clienteId={form.clienteId}
                onSelecionar={(id) => up("clienteId", id)}
              />
              {erros.clienteId && (
                <p className="text-xs font-medium text-destructive">
                  {erros.clienteId}
                </p>
              )}
            </section>

            {/* Tipo do arquivo & nome */}
            <section className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
              <h4 className="text-sm font-semibold text-foreground">
                Identificação
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="Tipo do arquivo" obrigatorio>
                  <Select
                    value={form.tipo}
                    onValueChange={(v) => up("tipo", v as TipoArquivo)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(LABEL_TIPO_ARQUIVO) as TipoArquivo[]).map((t) => (
                        <SelectItem key={t} value={t}>
                          {LABEL_TIPO_ARQUIVO[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Campo>
                <Campo
                  label="Nome do arquivo"
                  obrigatorio
                  erro={erros.nome}
                >
                  <Input
                    value={form.nome}
                    onChange={(e) => up("nome", e.target.value)}
                    placeholder="Ex.: Logo principal, Matriz frente"
                  />
                </Campo>
              </div>
            </section>

            {/* Aplicação (hierárquica) */}
            <section className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Aplicação
                </h4>
                <p className="text-xs text-muted-foreground">
                  Escolha o tipo, a posição e detalhe como a peça deve ser produzida.
                </p>
              </div>

              <Campo label="Tipo de aplicação">
                <Select
                  value={form.tipoAplicacao}
                  onValueChange={(v) => {
                    const novoTipo = v as TipoAplicacao | "";
                    setForm((f) => ({
                      ...f,
                      tipoAplicacao: novoTipo,
                      posicaoAplicacao: "",
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="— Não definido —" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(LABEL_TIPO_APLICACAO) as TipoAplicacao[]).map(
                      (t) => (
                        <SelectItem key={t} value={t}>
                          {LABEL_TIPO_APLICACAO[t]}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </Campo>

              <Campo label="Posição da aplicação">
                <Select
                  value={form.posicaoAplicacao}
                  onValueChange={(v) => up("posicaoAplicacao", v)}
                  disabled={!form.tipoAplicacao}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        form.tipoAplicacao
                          ? "— Selecione a posição —"
                          : "Selecione primeiro o tipo de aplicação"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {form.tipoAplicacao &&
                      (() => {
                        const opcoes = posicoesParaTipo(
                          form.tipoAplicacao as TipoAplicacao,
                        );
                        return opcoes.map((o) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.label}
                          </SelectItem>
                        ));
                      })()}
                  </SelectContent>
                </Select>
              </Campo>

              <Campo
                label={
                  form.posicaoAplicacao === "outro_local"
                    ? "Descrição da aplicação"
                    : "Descrição da aplicação (opcional)"
                }
                obrigatorio={form.posicaoAplicacao === "outro_local"}
                erro={erros.descricaoAplicacao}
              >
                <Textarea
                  rows={3}
                  value={form.descricaoAplicacao}
                  onChange={(e) => up("descricaoAplicacao", e.target.value)}
                  placeholder="Ex.: Centralizar 3 cm abaixo da gola. Bordado com 8 cm de largura."
                />
              </Campo>
            </section>


            {/* Especificações */}
            <section className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Especificações
                </h4>
                <p className="text-xs text-muted-foreground">
                  Dimensões e cores utilizadas na aplicação.
                </p>
              </div>

              {/* Dimensões */}
              <div>
                <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Dimensões da aplicação
                </h5>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Campo label="Largura (cm)">
                    <Input
                      inputMode="decimal"
                      value={form.larguraCm}
                      onChange={(e) => up("larguraCm", e.target.value)}
                      placeholder="Ex.: 8"
                    />
                  </Campo>
                  <Campo label="Altura (cm)">
                    <Input
                      inputMode="decimal"
                      value={form.alturaCm}
                      onChange={(e) => up("alturaCm", e.target.value)}
                      placeholder="Ex.: 6"
                    />
                  </Campo>
                </div>
              </div>

              {/* Valor */}
              <div>
                <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Valor da matriz/logo
                </h5>
                <Campo label="Valor (R$)">
                  <Input
                    inputMode="decimal"
                    value={form.valorStr}
                    onChange={(e) => up("valorStr", e.target.value)}
                    placeholder="Ex.: 45,00"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Este valor será lançado automaticamente como adicional único
                    do produto ao anexar esta matriz/logo em um pedido.
                  </p>
                </Campo>
              </div>


              {/* Cores */}
              <div>
                <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Cores da aplicação
                </h5>
                <Campo label="Quantidade de cores">
                  <select
                    value={form.cores.length}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      setForm((f) => {
                        const atual = f.cores;
                        let next: CorAplicacao[];
                        if (n <= atual.length) {
                          next = atual.slice(0, n);
                        } else {
                          next = [
                            ...atual,
                            ...Array.from({ length: n - atual.length }, () => ({
                              nome: "",
                              numero: "",
                            })),
                          ];
                        }
                        return { ...f, cores: next };
                      });
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value={0}>— Nenhuma —</option>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </Campo>

                {form.cores.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {form.cores.map((c, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-border bg-surface-muted/40 p-3"
                      >
                        <p className="mb-2 text-xs font-semibold text-foreground">
                          Cor {idx + 1}
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Campo label="Nome da cor">
                            <Input
                              value={c.nome}
                              onChange={(e) =>
                                setForm((f) => {
                                  const cores = [...f.cores];
                                  cores[idx] = { ...cores[idx], nome: e.target.value };
                                  return { ...f, cores };
                                })
                              }
                              placeholder="Ex.: Branco, Azul Marinho"
                            />
                          </Campo>
                          <Campo label="Número da cor">
                            <Input
                              value={c.numero}
                              onChange={(e) =>
                                setForm((f) => {
                                  const cores = [...f.cores];
                                  cores[idx] = { ...cores[idx], numero: e.target.value };
                                  return { ...f, cores };
                                })
                              }
                              placeholder="Ex.: Pantone 213C, Madeira 152"
                            />
                          </Campo>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>



            {/* Upload */}
            <section className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Arquivo
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Aceito: {EXTENSOES_ACEITAS.map((e) => e.toUpperCase()).join(", ")}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" /> Escolher arquivo
                </Button>
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPT}
                  className="hidden"
                  onChange={(e) => handleArquivo(e.target.files?.[0])}
                />
              </div>

              {form.dataUrl ? (
                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted/60 p-3">
                  <ArquivoPreview
                    extensao={form.extensao}
                    dataUrl={form.dataUrl}
                    nome={form.arquivoNome}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {form.arquivoNome}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {form.extensao.toUpperCase()} •{" "}
                      {formatarTamanho(form.tamanho)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-surface-muted/50 p-6 text-center">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum arquivo selecionado.
                  </p>
                </div>
              )}
              {erros.arquivo && (
                <p className="text-xs font-medium text-destructive">
                  {erros.arquivo}
                </p>
              )}
            </section>

            {/* Capa */}
            <section className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Capa do arquivo (opcional)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Imagem PNG ou JPG exibida nos previews, no orçamento e na
                    ordem de produção. O download continua sendo apenas do
                    arquivo principal.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => capaInputRef.current?.click()}
                >
                  <ImageIcon className="h-4 w-4" /> Escolher capa
                </Button>
                <input
                  ref={capaInputRef}
                  type="file"
                  accept={ACCEPT_CAPA}
                  className="hidden"
                  onChange={(e) => {
                    handleCapa(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </div>

              {form.capaDataUrl ? (
                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted/60 p-3">
                  <img
                    src={form.capaDataUrl}
                    alt={form.capaNome || "Capa do arquivo"}
                    className="h-14 w-14 shrink-0 rounded-lg border border-border bg-surface object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {form.capaNome}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Usada como imagem de visualização deste arquivo.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={removerCapa}
                    aria-label="Remover capa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-surface-muted/50 p-6 text-center">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma capa selecionada. Será usado o preview padrão do
                    arquivo.
                  </p>
                </div>
              )}
              {erros.capa && (
                <p className="text-xs font-medium text-destructive">
                  {erros.capa}
                </p>
              )}
            </section>

            {/* Descrição & status */}
            <section className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
              <Campo label="Descrição">
                <Textarea
                  rows={3}
                  value={form.descricao}
                  onChange={(e) => up("descricao", e.target.value)}
                  placeholder="Ex.: Matriz para bordado do peito esquerdo."
                />
              </Campo>
              <Campo label="Status">
                <select
                  value={form.status}
                  onChange={(e) => up("status", e.target.value as StatusArquivo)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="ativo">Ativo</option>
                  <option value="arquivado">Arquivado</option>
                </select>
              </Campo>
            </section>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface px-6 py-4">
          <Button type="button" variant="outline" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSalvar}>
            {arquivo ? "Salvar alterações" : "Cadastrar arquivo"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Campo({
  label,
  obrigatorio,
  erro,
  className,
  children,
}: {
  label: string;
  obrigatorio?: boolean;
  erro?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-foreground">
        {label}
        {obrigatorio && <span className="ml-1 text-primary">*</span>}
      </Label>
      {children}
      {erro && <p className="text-xs font-medium text-destructive">{erro}</p>}
    </div>
  );
}
