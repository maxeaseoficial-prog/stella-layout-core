import { useEffect, useRef, useState } from "react";
import { Building2, ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "@/components/ui/select";
import { fileToDataUrl, formatarTelefone, formatarCNPJ } from "@/features/clientes";
import { hojeISO } from "@/features/pedidos";

import type {
  CategoriaFornecedor,
  EnderecoFornecedor,
  Fornecedor,
  FornecedorInput,
  StatusFornecedor,
} from "./types";
import { CATEGORIAS_FORNECEDOR, LABEL_CATEGORIA_FORNECEDOR, UFS } from "./types";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  fornecedor?: Fornecedor | null;
  onSalvar: (dados: FornecedorInput, id?: string) => void;
}

interface FormState {
  empresa: string;
  representante: string;
  telefone: string;
  dataCadastro: string;
  cnpj: string;
  inscricaoEstadual: string;
  email: string;
  site: string;
  instagram: string;
  endereco: EnderecoFornecedor;
  categorias: CategoriaFornecedor[];
  logo?: string;
  observacoes: string;
  prazoMedioStr: string;
  status: StatusFornecedor;
}

function estadoInicial(f?: Fornecedor | null): FormState {
  if (!f) {
    return {
      empresa: "",
      representante: "",
      telefone: "",
      dataCadastro: hojeISO(),
      cnpj: "",
      inscricaoEstadual: "",
      email: "",
      site: "",
      instagram: "",
      endereco: {},
      categorias: [],
      logo: undefined,
      observacoes: "",
      prazoMedioStr: "",
      status: "ativo",
    };
  }
  return {
    empresa: f.empresa,
    representante: f.representante,
    telefone: f.telefone,
    dataCadastro: f.dataCadastro,
    cnpj: f.cnpj ?? "",
    inscricaoEstadual: f.inscricaoEstadual ?? "",
    email: f.email ?? "",
    site: f.site ?? "",
    instagram: f.instagram ?? "",
    endereco: { ...(f.endereco ?? {}) },
    categorias: [...f.categorias],
    logo: f.logo,
    observacoes: f.observacoes ?? "",
    prazoMedioStr: f.prazoMedioEntregaDias ? String(f.prazoMedioEntregaDias) : "",
    status: f.status,
  };
}

const IMG_ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

export function FornecedorFormDrawer({ aberto, onFechar, fornecedor, onSalvar }: Props) {
  const [form, setForm] = useState<FormState>(() => estadoInicial(fornecedor));
  const [erros, setErros] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aberto) {
      setForm(estadoInicial(fornecedor));
      setErros({});
    }
  }, [aberto, fornecedor]);

  function upd<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function updEndereco<K extends keyof EnderecoFornecedor>(k: K, v: EnderecoFornecedor[K]) {
    setForm((s) => ({ ...s, endereco: { ...s.endereco, [k]: v } }));
  }

  function toggleCategoria(c: CategoriaFornecedor) {
    setForm((s) => ({
      ...s,
      categorias: s.categorias.includes(c)
        ? s.categorias.filter((x) => x !== c)
        : [...s.categorias, c],
    }));
  }

  async function handleLogo(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) return;
    const url = await fileToDataUrl(f);
    upd("logo", url);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const novosErros: Record<string, string> = {};
    if (!form.empresa.trim()) novosErros.empresa = "Informe o nome da empresa.";
    if (!form.representante.trim()) novosErros.representante = "Informe o representante.";
    if (!form.telefone.trim()) novosErros.telefone = "Informe o telefone.";
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    const prazo = Number(form.prazoMedioStr);

    const dados: FornecedorInput = {
      empresa: form.empresa.trim(),
      representante: form.representante.trim(),
      telefone: form.telefone.trim(),
      dataCadastro: form.dataCadastro || hojeISO(),
      cnpj: form.cnpj.trim() || undefined,
      inscricaoEstadual: form.inscricaoEstadual.trim() || undefined,
      email: form.email.trim() || undefined,
      site: form.site.trim() || undefined,
      instagram: form.instagram.trim() || undefined,
      endereco: {
        cep: form.endereco.cep?.trim() || undefined,
        rua: form.endereco.rua?.trim() || undefined,
        numero: form.endereco.numero?.trim() || undefined,
        complemento: form.endereco.complemento?.trim() || undefined,
        bairro: form.endereco.bairro?.trim() || undefined,
        cidade: form.endereco.cidade?.trim() || undefined,
        estado: form.endereco.estado || undefined,
      },
      categorias: form.categorias,
      logo: form.logo,
      observacoes: form.observacoes.trim() || undefined,
      prazoMedioEntregaDias:
        form.prazoMedioStr.trim() && Number.isFinite(prazo) && prazo >= 0 ? prazo : undefined,
      status: form.status,
    };
    onSalvar(dados, fornecedor?.id);
  }

  return (
    <Sheet open={aberto} onOpenChange={(v) => (!v ? onFechar() : undefined)}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <SheetHeader className="border-b border-border bg-surface p-6">
            <SheetTitle>
              {fornecedor ? "Editar fornecedor" : "Novo fornecedor"}
            </SheetTitle>
            <SheetDescription>
              Cadastre os dados da empresa, endereço e categorias fornecidas.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-6 p-6">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-surface-muted">
                {form.logo ? (
                  <img src={form.logo} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                >
                  <ImagePlus className="h-4 w-4" />
                  {form.logo ? "Trocar logo" : "Enviar logo"}
                </Button>
                {form.logo && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => upd("logo", undefined)}
                  >
                    Remover
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">JPG, PNG ou WEBP.</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept={IMG_ACCEPT}
                  className="hidden"
                  onChange={(e) => handleLogo(e.target.files)}
                />
              </div>
            </div>

            {/* Dados da empresa */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="empresa">Nome da empresa *</Label>
                <Input
                  id="empresa"
                  value={form.empresa}
                  onChange={(e) => upd("empresa", e.target.value)}
                  placeholder="Razão social ou nome fantasia"
                />
                {erros.empresa && <p className="text-xs text-destructive">{erros.empresa}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rep">Representante *</Label>
                <Input
                  id="rep"
                  value={form.representante}
                  onChange={(e) => upd("representante", e.target.value)}
                  placeholder="Contato comercial"
                />
                {erros.representante && (
                  <p className="text-xs text-destructive">{erros.representante}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tel">Telefone / WhatsApp *</Label>
                <Input
                  id="tel"
                  value={form.telefone}
                  onChange={(e) => upd("telefone", formatarTelefone(e.target.value))}
                  placeholder="(00) 00000-0000"
                />
                {erros.telefone && <p className="text-xs text-destructive">{erros.telefone}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dc">Data de cadastro</Label>
                <Input
                  id="dc"
                  type="date"
                  value={form.dataCadastro}
                  onChange={(e) => upd("dataCadastro", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prazo">Prazo médio de entrega (dias)</Label>
                <Input
                  id="prazo"
                  inputMode="numeric"
                  value={form.prazoMedioStr}
                  onChange={(e) =>
                    upd("prazoMedioStr", e.target.value.replace(/[^\d]/g, ""))
                  }
                  placeholder="Ex.: 7"
                />
              </div>
            </div>

            {/* Documentos e contatos */}
            <div className="space-y-3 rounded-xl border border-border bg-surface-muted/40 p-4">
              <p className="text-sm font-semibold text-foreground">Dados adicionais</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={form.cnpj}
                    onChange={(e) => upd("cnpj", formatarCNPJ(e.target.value))}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ie">Inscrição estadual</Label>
                  <Input
                    id="ie"
                    value={form.inscricaoEstadual}
                    onChange={(e) => upd("inscricaoEstadual", e.target.value)}
                    placeholder="Opcional"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => upd("email", e.target.value)}
                    placeholder="contato@fornecedor.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="site">Site</Label>
                  <Input
                    id="site"
                    value={form.site}
                    onChange={(e) => upd("site", e.target.value)}
                    placeholder="https://"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="ig">Instagram</Label>
                  <Input
                    id="ig"
                    value={form.instagram}
                    onChange={(e) => upd("instagram", e.target.value)}
                    placeholder="@fornecedor"
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-3 rounded-xl border border-border bg-surface-muted/40 p-4">
              <p className="text-sm font-semibold text-foreground">Endereço</p>
              <div className="grid gap-3 sm:grid-cols-6">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={form.endereco.cep ?? ""}
                    onChange={(e) => updEndereco("cep", e.target.value)}
                    placeholder="00000-000"
                  />
                </div>
                <div className="sm:col-span-4 space-y-1.5">
                  <Label htmlFor="rua">Rua</Label>
                  <Input
                    id="rua"
                    value={form.endereco.rua ?? ""}
                    onChange={(e) => updEndereco("rua", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="num">Número</Label>
                  <Input
                    id="num"
                    value={form.endereco.numero ?? ""}
                    onChange={(e) => updEndereco("numero", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-4 space-y-1.5">
                  <Label htmlFor="comp">Complemento</Label>
                  <Input
                    id="comp"
                    value={form.endereco.complemento ?? ""}
                    onChange={(e) => updEndereco("complemento", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-3 space-y-1.5">
                  <Label htmlFor="bai">Bairro</Label>
                  <Input
                    id="bai"
                    value={form.endereco.bairro ?? ""}
                    onChange={(e) => updEndereco("bairro", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="cid">Cidade</Label>
                  <Input
                    id="cid"
                    value={form.endereco.cidade ?? ""}
                    onChange={(e) => updEndereco("cidade", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-1 space-y-1.5">
                  <Label>Estado</Label>
                  <Select
                    value={form.endereco.estado ?? ""}
                    onValueChange={(v) => updEndereco("estado", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {UFS.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Categorias */}
            <div className="space-y-3 rounded-xl border border-border bg-surface-muted/40 p-4">
              <p className="text-sm font-semibold text-foreground">
                Categorias do fornecedor
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {CATEGORIAS_FORNECEDOR.map((c) => (
                  <label
                    key={c}
                    className="flex items-center gap-2 rounded-lg bg-surface p-2 text-sm"
                  >
                    <Checkbox
                      checked={form.categorias.includes(c)}
                      onCheckedChange={() => toggleCategoria(c)}
                    />
                    {LABEL_CATEGORIA_FORNECEDOR[c]}
                  </label>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-1.5">
              <Label htmlFor="obs">Observações</Label>
              <Textarea
                id="obs"
                rows={3}
                value={form.observacoes}
                onChange={(e) => upd("observacoes", e.target.value)}
                placeholder="Prazo de entrega, forma de pagamento, contato comercial, dias de atendimento..."
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => upd("status", v as StatusFornecedor)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border bg-surface p-4">
            <Button type="button" variant="ghost" onClick={onFechar}>
              Cancelar
            </Button>
            <Button type="submit">
              {fornecedor ? "Salvar alterações" : "Cadastrar fornecedor"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
