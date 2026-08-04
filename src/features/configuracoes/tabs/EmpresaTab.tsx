import { useEffect, useRef, useState } from "react";
import { Building2, Upload, X } from "lucide-react";
import { toast } from "@/lib/toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/custom-select";
import { fileToDataUrl, formatarCNPJ, formatarTelefone } from "@/features/clientes/utils";
import { useConfiguracoes } from "../useConfiguracoes";
import type { DadosEmpresa } from "../types";
import { SectionCard } from "../SectionCard";

function formatarCEP(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

const ESTADOS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export function EmpresaTab() {
  const { state, salvarEmpresa } = useConfiguracoes();
  const [form, setForm] = useState<DadosEmpresa>(state.empresa);
  const [dirty, setDirty] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setForm(state.empresa);
    setDirty(false);
  }, [state.empresa]);

  function update<K extends keyof DadosEmpresa>(key: K, value: DadosEmpresa[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }
  function updateEndereco<K extends keyof DadosEmpresa["endereco"]>(
    key: K,
    value: DadosEmpresa["endereco"][K],
  ) {
    setForm((f) => ({ ...f, endereco: { ...f.endereco, [key]: value } }));
    setDirty(true);
  }

  async function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo deve ter no máximo 2 MB.");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    update("logo", dataUrl);
    if (fileRef.current) fileRef.current.value = "";
  }

  function salvar() {
    salvarEmpresa(form);
    toast.success("Dados da empresa salvos.");
    setDirty(false);
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title="Identificação"
        description="Informações principais que aparecerão em pedidos, orçamentos, PDFs e nota fiscal."
        icon={<Building2 className="h-4 w-4" />}
      >
        <div className="grid gap-6 md:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-center gap-3">
            <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40">
              {form.logo ? (
                <img src={form.logo} alt="Logo da empresa" className="h-full w-full object-contain" />
              ) : (
                <Building2 className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onLogoChange}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                {form.logo ? "Trocar logo" : "Enviar logo"}
              </Button>
              {form.logo && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-xs text-muted-foreground"
                  onClick={() => update("logo", undefined)}
                >
                  <X className="mr-1 h-3 w-3" /> Remover
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="emp-nome">Razão social</Label>
              <Input id="emp-nome" value={form.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Stella Espaço dos Uniformes LTDA" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-fantasia">Nome fantasia</Label>
              <Input id="emp-fantasia" value={form.nomeFantasia} onChange={(e) => update("nomeFantasia", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-cnpj">CNPJ</Label>
              <Input id="emp-cnpj" value={form.cnpj} onChange={(e) => update("cnpj", formatarCNPJ(e.target.value))} placeholder="00.000.000/0000-00" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-ie">Inscrição Estadual</Label>
              <Input id="emp-ie" value={form.inscricaoEstadual} onChange={(e) => update("inscricaoEstadual", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-tel">Telefone</Label>
              <Input id="emp-tel" value={form.telefone} onChange={(e) => update("telefone", formatarTelefone(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-wpp">WhatsApp</Label>
              <Input id="emp-wpp" value={form.whatsapp} onChange={(e) => update("whatsapp", formatarTelefone(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-email">E-mail</Label>
              <Input id="emp-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="contato@stella.com.br" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-site">Site</Label>
              <Input id="emp-site" value={form.site} onChange={(e) => update("site", e.target.value)} placeholder="https://" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="emp-ig">Instagram</Label>
              <Input id="emp-ig" value={form.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="@stellauniformes" />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Endereço" description="Utilizado em impressões e documentos oficiais.">
        <div className="grid gap-4 sm:grid-cols-6">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="end-cep">CEP</Label>
            <Input id="end-cep" value={form.endereco.cep} onChange={(e) => updateEndereco("cep", formatarCEP(e.target.value))} placeholder="00000-000" />
          </div>
          <div className="space-y-1.5 sm:col-span-4">
            <Label htmlFor="end-rua">Rua</Label>
            <Input id="end-rua" value={form.endereco.rua} onChange={(e) => updateEndereco("rua", e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-1">
            <Label htmlFor="end-num">Número</Label>
            <Input id="end-num" value={form.endereco.numero} onChange={(e) => updateEndereco("numero", e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-3">
            <Label htmlFor="end-comp">Complemento</Label>
            <Input id="end-comp" value={form.endereco.complemento} onChange={(e) => updateEndereco("complemento", e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="end-bairro">Bairro</Label>
            <Input id="end-bairro" value={form.endereco.bairro} onChange={(e) => updateEndereco("bairro", e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-4">
            <Label htmlFor="end-cidade">Cidade</Label>
            <Input id="end-cidade" value={form.endereco.cidade} onChange={(e) => updateEndereco("cidade", e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="end-uf">Estado</Label>
            <Select
              id="end-uf"
              value={form.endereco.estado}
              onValueChange={(v) => updateEndereco("estado", v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS.map((uf) => (
                  <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      <Separator />
      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled={!dirty} onClick={() => { setForm(state.empresa); setDirty(false); }}>
          Descartar
        </Button>
        <Button disabled={!dirty} onClick={salvar}>
          Salvar alterações
        </Button>
      </div>
    </div>
  );
}
