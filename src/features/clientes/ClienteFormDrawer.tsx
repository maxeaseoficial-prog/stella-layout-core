import { useEffect, useRef, useState } from "react";
import { Building2, Camera, User } from "lucide-react";

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

import type {
  Cliente,
  ClienteArquivo,
  ClienteInput,
  StatusCliente,
  TipoCliente,
} from "./types";
import { ClienteAvatar } from "./ClienteAvatar";
import { ClienteFilesUploader } from "./ClienteFilesUploader";
import {
  fileToDataUrl,
} from "./utils";

interface ClienteFormDrawerProps {
  aberto: boolean;
  onFechar: () => void;
  cliente?: Cliente | null;
  onSalvar: (dados: ClienteInput, id?: string) => void;
}

interface FormState {
  tipo: TipoCliente;
  status: StatusCliente;
  dataCadastro: string;
  imagem?: string;
  arquivos: ClienteArquivo[];
  // Pessoa Física
  nome: string;
  cpf: string;
  // Empresa
  nomeEmpresa: string;
  responsavel: string;
  cnpj: string;
  inscricaoEstadual: string;
  // Comuns opcionais
  telefone: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  complemento: string;
  cidade: string;
  estado: string;
  observacoes: string;
}

function estadoInicial(cliente?: Cliente | null): FormState {
  if (!cliente) {
    return {
      tipo: "pessoa_fisica",
      status: "ativo",
      dataCadastro: hojeISO(),
      imagem: undefined,
      arquivos: [],
      nome: "",
      cpf: "",
      nomeEmpresa: "",
      responsavel: "",
      cnpj: "",
      inscricaoEstadual: "",
      telefone: "",
      email: "",
      cep: "",
      logradouro: "",
      numero: "",
      bairro: "",
      complemento: "",
      cidade: "",
      estado: "",
      observacoes: "",
    };
  }
  return {
    tipo: cliente.tipo,
    status: cliente.status,
    dataCadastro: cliente.dataCadastro,
    imagem: cliente.imagem,
    arquivos: cliente.arquivos,
    nome: cliente.tipo === "pessoa_fisica" ? cliente.nome : "",
    cpf: cliente.tipo === "pessoa_fisica" ? cliente.cpf ?? "" : "",
    nomeEmpresa: cliente.tipo === "empresa" ? cliente.nomeEmpresa : "",
    responsavel: cliente.tipo === "empresa" ? cliente.responsavel : "",
    cnpj: cliente.tipo === "empresa" ? cliente.cnpj ?? "" : "",
    inscricaoEstadual:
      cliente.tipo === "empresa" ? cliente.inscricaoEstadual ?? "" : "",
    telefone: cliente.telefone,
    email: cliente.email ?? "",
    cep: cliente.cep ?? "",
    logradouro: cliente.logradouro ?? "",
    numero: cliente.numero ?? "",
    bairro: cliente.bairro ?? "",
    complemento: cliente.complemento ?? "",
    cidade: cliente.cidade ?? "",
    estado: cliente.estado ?? "",
    observacoes: cliente.observacoes ?? "",
  };
}

import { formatarCEP, buscarCep, formatarCNPJ, formatarCPF, formatarTelefone, getIniciais, hojeISO } from "./utils";
import { toast } from "sonner";

export function ClienteFormDrawer({
  aberto,
  onFechar,
  cliente,
  onSalvar,
}: ClienteFormDrawerProps) {
  const [form, setForm] = useState<FormState>(() => estadoInicial(cliente));
  const [erros, setErros] = useState<Record<string, string>>({});
  const imgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aberto) {
      setForm(estadoInicial(cliente));
      setErros({});
    }
  }, [aberto, cliente]);

  function up<K extends keyof FormState>(key: K, valor: FormState[K]) {
    setForm((f) => ({ ...f, [key]: valor }));
  }

  async function handleImagem(file: File | undefined) {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    up("imagem", dataUrl);
  }

  function validar(): boolean {
    const e: Record<string, string> = {};
    if (form.tipo === "pessoa_fisica") {
      if (!form.nome.trim()) e.nome = "Informe o nome completo.";
      if (!form.cpf.trim()) e.cpf = "Informe o CPF.";
    } else {
      if (!form.nomeEmpresa.trim()) e.nomeEmpresa = "Informe o nome da empresa.";
      if (!form.responsavel.trim()) e.responsavel = "Informe o nome do responsável.";
      if (!form.cnpj.trim()) e.cnpj = "Informe o CNPJ.";
    }
    if (!form.telefone.trim()) e.telefone = "Informe o telefone / WhatsApp.";
    if (!form.dataCadastro) e.dataCadastro = "Informe a data de cadastro.";
    
    // Endereço obrigatório
    if (!form.cep.trim()) e.cep = "Informe o CEP.";
    if (!form.estado.trim()) e.estado = "Informe o Estado.";
    if (!form.cidade.trim()) e.cidade = "Informe a Cidade.";
    if (!form.bairro.trim()) e.bairro = "Informe o Bairro.";
    if (!form.logradouro.trim()) e.logradouro = "Informe o Logradouro.";
    if (!form.numero.trim()) e.numero = "Informe o Número.";

    setErros(e);
    if (Object.keys(e).length > 0) {
      const primeiroErro = Object.values(e)[0];
      toast.error(primeiroErro);
      return false;
    }
    return true;
  }

  function handleSalvar() {
    if (!validar()) return;
    const base = {
      telefone: form.telefone.trim(),
      email: form.email.trim() || undefined,
      cep: form.cep.trim() || undefined,
      logradouro: form.logradouro.trim() || undefined,
      numero: form.numero.trim() || undefined,
      bairro: form.bairro.trim() || undefined,
      complemento: form.complemento.trim() || undefined,
      cidade: form.cidade.trim() || undefined,
      estado: form.estado.trim() || undefined,
      observacoes: form.observacoes.trim() || undefined,
      status: form.status,
      dataCadastro: form.dataCadastro,
      imagem: form.imagem,
      arquivos: form.arquivos,
    };
    const dados: ClienteInput =
      form.tipo === "pessoa_fisica"
        ? ({
            tipo: "pessoa_fisica",
            nome: form.nome.trim(),
            cpf: form.cpf.trim() || undefined,
            ...base,
          } as ClienteInput)
        : ({
            tipo: "empresa",
            nomeEmpresa: form.nomeEmpresa.trim(),
            responsavel: form.responsavel.trim(),
            cnpj: form.cnpj.trim() || undefined,
            inscricaoEstadual: form.inscricaoEstadual.trim() || undefined,
            ...base,
          } as ClienteInput);
    onSalvar(dados, cliente?.id);
    // O fechamento é responsabilidade do componente pai (para permitir
    // validações como duplicidade antes de fechar).
  }

  const nomeParaAvatar =
    form.tipo === "empresa" ? form.nomeEmpresa || "Empresa" : form.nome || "Cliente";

  return (
    <Sheet open={aberto} onOpenChange={(v) => (!v ? onFechar() : null)}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <SheetHeader className="border-b border-border bg-surface px-6 py-4">
          <SheetTitle className="text-xl font-bold">
            {cliente ? "Editar cliente" : "Novo cliente"}
          </SheetTitle>
          <SheetDescription>
            Preencha as informações do cliente. Campos com <span className="text-primary">*</span>{" "}
            são obrigatórios.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-surface-muted/40 px-6 py-6">
          <div className="space-y-6">
            {/* Tipo */}
            <section className="space-y-2">
              <Label>Tipo de cliente</Label>
              <div className="grid grid-cols-2 gap-3">
                <TipoCard
                  ativo={form.tipo === "pessoa_fisica"}
                  onClick={() => up("tipo", "pessoa_fisica")}
                  icon={<User className="h-5 w-5" />}
                  titulo="Pessoa Física"
                  descricao="Cliente individual"
                />
                <TipoCard
                  ativo={form.tipo === "empresa"}
                  onClick={() => up("tipo", "empresa")}
                  icon={<Building2 className="h-5 w-5" />}
                  titulo="Empresa"
                  descricao="Cliente corporativo"
                />
              </div>
            </section>

            {/* Imagem */}
            <section className="rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <ClienteAvatar nome={nomeParaAvatar} imagem={form.imagem} size="xl" />
                  <button
                    type="button"
                    onClick={() => imgInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:brightness-110"
                    aria-label="Alterar imagem"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    ref={imgInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    className="hidden"
                    onChange={(e) => handleImagem(e.target.files?.[0])}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {form.tipo === "empresa" ? "Logo da empresa" : "Foto do cliente"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Usada para identificação visual. Sem imagem, mostramos as iniciais{" "}
                    <span className="font-medium text-foreground">
                      ({getIniciais(nomeParaAvatar)})
                    </span>
                    .
                  </p>
                  {form.imagem && (
                    <button
                      type="button"
                      className="mt-2 text-xs font-medium text-destructive hover:underline"
                      onClick={() => up("imagem", undefined)}
                    >
                      Remover imagem
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Dados principais */}
            <section className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
              <h4 className="text-sm font-semibold text-foreground">Dados principais</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {form.tipo === "pessoa_fisica" ? (
                  <>
                    <Campo
                      label="Nome completo"
                      obrigatorio
                      erro={erros.nome}
                      className="sm:col-span-2"
                    >
                      <Input
                        value={form.nome}
                        onChange={(e) => up("nome", e.target.value)}
                        placeholder="Ex.: João Pedro da Silva"
                      />
                    </Campo>
                    <Campo label="CPF" obrigatorio erro={erros.cpf}>
                      <Input
                        value={form.cpf}
                        onChange={(e) => up("cpf", formatarCPF(e.target.value))}
                        placeholder="000.000.000-00"
                        inputMode="numeric"
                      />
                    </Campo>
                  </>
                ) : (
                  <>
                    <Campo
                      label="Nome da empresa"
                      obrigatorio
                      erro={erros.nomeEmpresa}
                      className="sm:col-span-2"
                    >
                      <Input
                        value={form.nomeEmpresa}
                        onChange={(e) => up("nomeEmpresa", e.target.value)}
                        placeholder="Ex.: Stella Espaço dos Uniformes"
                      />
                    </Campo>
                    <Campo label="Nome do responsável" obrigatorio erro={erros.responsavel}>
                      <Input
                        value={form.responsavel}
                        onChange={(e) => up("responsavel", e.target.value)}
                        placeholder="Ex.: Maria Souza"
                      />
                    </Campo>
                    <Campo label="CNPJ">
                      <Input
                        value={form.cnpj}
                        onChange={(e) => up("cnpj", formatarCNPJ(e.target.value))}
                        placeholder="00.000.000/0000-00"
                        inputMode="numeric"
                      />
                    </Campo>
                    <Campo label="Inscrição estadual">
                      <Input
                        value={form.inscricaoEstadual}
                        onChange={(e) => up("inscricaoEstadual", e.target.value)}
                        placeholder="Opcional"
                      />
                    </Campo>
                  </>
                )}

                <Campo label="Telefone / WhatsApp" obrigatorio erro={erros.telefone}>
                  <Input
                    value={form.telefone}
                    onChange={(e) => up("telefone", formatarTelefone(e.target.value))}
                    placeholder="(11) 91234-5678"
                    inputMode="tel"
                  />
                </Campo>

                <Campo label="Data de cadastro" obrigatorio erro={erros.dataCadastro}>
                  <Input
                    type="date"
                    value={form.dataCadastro}
                    onChange={(e) => up("dataCadastro", e.target.value)}
                  />
                </Campo>

                <Campo label="Status">
                  <Select
                    value={form.status}
                    onValueChange={(v) => up("status", v as StatusCliente)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </Campo>
              </div>
            </section>

            {/* Contato & endereço */}
            <section className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
              <h4 className="text-sm font-semibold text-foreground">Contato & endereço</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="E-mail" className="sm:col-span-2">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => up("email", e.target.value)}
                    placeholder="cliente@email.com"
                  />
                </Campo>

                <Campo label="CEP">
                  <Input
                    value={form.cep}
                    onChange={async (e) => {
                      const v = formatarCEP(e.target.value);
                      up("cep", v);
                      if (v.length === 9) {
                        const dados = await buscarCep(v);
                        if (dados) {
                          up("logradouro", dados.logradouro);
                          up("bairro", dados.bairro);
                          up("cidade", dados.cidade);
                          up("estado", dados.estado);
                        }
                      }
                    }}
                    placeholder="00000-000"
                    inputMode="numeric"
                  />
                </Campo>

                <Campo label="Estado">
                  <Input
                    value={form.estado}
                    onChange={(e) => up("estado", e.target.value.toUpperCase().slice(0, 2))}
                    placeholder="UF"
                    maxLength={2}
                  />
                </Campo>

                <Campo label="Cidade">
                  <Input
                    value={form.cidade}
                    onChange={(e) => up("cidade", e.target.value)}
                    placeholder="Ex.: São Paulo"
                  />
                </Campo>

                <Campo label="Bairro">
                  <Input
                    value={form.bairro}
                    onChange={(e) => up("bairro", e.target.value)}
                    placeholder="Ex.: Centro"
                  />
                </Campo>

                <Campo label="Logradouro" className="sm:col-span-2">
                  <Input
                    value={form.logradouro}
                    onChange={(e) => up("logradouro", e.target.value)}
                    placeholder="Rua, Avenida, etc."
                  />
                </Campo>

                <Campo label="Número">
                  <Input
                    value={form.numero}
                    onChange={(e) => up("numero", e.target.value)}
                    placeholder="Ex.: 123"
                  />
                </Campo>

                <Campo label="Complemento">
                  <Input
                    value={form.complemento}
                    onChange={(e) => up("complemento", e.target.value)}
                    placeholder="Opcional"
                  />
                </Campo>
              </div>
            </section>

            {/* Observações */}
            <section className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
              <h4 className="text-sm font-semibold text-foreground">Observações</h4>
              <Textarea
                value={form.observacoes}
                onChange={(e) => up("observacoes", e.target.value)}
                placeholder="Preferências, anotações internas, histórico..."
                rows={3}
              />
            </section>

            {/* Arquivos */}
            <section className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
              <ClienteFilesUploader
                arquivos={form.arquivos}
                onChange={(a) => up("arquivos", a)}
              />
            </section>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface px-6 py-4">
          <Button type="button" variant="outline" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSalvar}>
            {cliente ? "Salvar alterações" : "Cadastrar cliente"}
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

function TipoCard({
  ativo,
  onClick,
  icon,
  titulo,
  descricao,
}: {
  ativo: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  titulo: string;
  descricao: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3 text-left transition",
        ativo
          ? "border-primary bg-primary-soft/60 ring-2 ring-primary/30"
          : "border-border bg-surface hover:border-primary/40 hover:bg-primary-soft/30",
      )}
    >
      <div
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-lg",
          ativo ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary",
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{titulo}</p>
        <p className="text-xs text-muted-foreground">{descricao}</p>
      </div>
    </button>
  );
}
