import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Info,
  Landmark,
  Loader2,
  Plug,
  XCircle,
} from "lucide-react";

import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/custom-select";
import { Separator } from "@/components/ui/separator";
import { formatarCNPJ } from "@/features/clientes/utils";

import {
  LABEL_AMBIENTE_SPEDY,
  SPEDY_BASE_URLS,
  useFiscalConfig,
  type AmbienteSpedy,
  type EmpresaFiscal,
  type FiscalConfig,
  type RegimeTributarioFiscal,
  type TributacaoPadrao,
} from "@/features/fiscal";
import { testarConexaoFiscal } from "@/lib/fiscal.functions";
import { useConfiguracoes } from "../useConfiguracoes";
import { SectionCard } from "../SectionCard";

const ESTADOS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

function formatarCEP(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

const num = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};


export function FiscalTab() {
  const { config, carregando, salvando, erro, salvar } = useFiscalConfig();
  const { state: configGeral } = useConfiguracoes();

  const [form, setForm] = useState<FiscalConfig>(config);
  const [dirty, setDirty] = useState(false);
  const [testando, setTestando] = useState(false);

  useEffect(() => {
    setForm(config);
    setDirty(false);
  }, [config]);

  function updateEmpresa<K extends keyof EmpresaFiscal>(key: K, value: EmpresaFiscal[K]) {
    setForm((f) => ({ ...f, empresa: { ...f.empresa, [key]: value } }));
    setDirty(true);
  }

  function updateTributacao<K extends keyof TributacaoPadrao>(
    key: K,
    value: TributacaoPadrao[K],
  ) {
    setForm((f) => ({ ...f, tributacao: { ...f.tributacao, [key]: value } }));
    setDirty(true);
  }

  function updateAmbiente(ambiente: AmbienteSpedy) {
    setForm((f) => ({ ...f, ambiente }));
    setDirty(true);
  }

  function updateRegime(regime: RegimeTributarioFiscal) {
    setForm((f) => ({
      ...f,
      tributacao: {
        ...f.tributacao,
        regime,
        // Aplica os defaults do cenário correspondente da documentação.
        ...(regime === "simplesNacional"
          ? { csosn: 400, pisCst: 7, cofinsCst: 7 }
          : { icmsCst: 0, pisCst: 1, cofinsCst: 1 }),
      },
    }));
    setDirty(true);
  }

  function importarDadosEmpresa() {
    const emp = configGeral.empresa;
    setForm((f) => ({
      ...f,
      empresa: {
        razaoSocial: emp.nome || f.empresa.razaoSocial,
        nomeFantasia: emp.nomeFantasia,
        cnpj: emp.cnpj,
        inscricaoEstadual: emp.inscricaoEstadual,
        cep: emp.endereco.cep,
        rua: emp.endereco.rua,
        numero: emp.endereco.numero,
        complemento: emp.endereco.complemento,
        bairro: emp.endereco.bairro,
        cidade: emp.endereco.cidade,
        estado: emp.endereco.estado,
      },
    }));
    setDirty(true);
    toast.success("Dados importados da aba Empresa. Revise e salve.");
  }

  async function handleSalvar() {
    const ok = await salvar(form);
    if (ok) {
      toast.success("Configurações fiscais salvas.");
      setDirty(false);
    } else {
      toast.error("Não foi possível salvar as configurações fiscais.");
    }
  }

  async function handleTestar() {
    setTestando(true);
    try {
      const res = await testarConexaoFiscal();
      if (res.ok) toast.success(res.mensagem);
      else toast.error(res.mensagem);
      setForm((f) => ({
        ...f,
        ultimoTeste: { em: new Date().toISOString(), ok: res.ok, mensagem: res.mensagem },
      }));
    } catch {
      toast.error("Falha ao testar a conexão. Faça login novamente.");
    } finally {
      setTestando(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando configurações fiscais...
      </div>
    );
  }

  const t = form.tributacao;
  const regimeNormal = t.regime === "regimeNormal";

  return (
    <div className="space-y-6">
      {erro && (
        <div className="rounded-lg border border-red-200 bg-red-50/70 px-3 py-2 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
          {erro}
        </div>
      )}

      <div className="flex items-start gap-2 rounded-lg border border-border bg-surface-muted/60 px-3 py-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <p>
          Integração com a <strong>API da Spedy</strong> para emissão de NF-e
          (modelo 55, produto). O certificado digital, série e numeração das
          notas são configurados no backoffice da Spedy — aqui ficam os dados
          usados pelo sistema para montar e enviar as notas. A tributação
          padrão segue os exemplos oficiais da documentação; confirme os
          valores com a sua contabilidade.
        </p>
      </div>

      <SectionCard
        title="Dados da empresa"
        description="Espelham o cadastro fiscal da emitente. A UF da empresa define se a nota sai como operação interna ou interestadual."
        icon={<Building2 className="h-4 w-4" />}
        action={
          <Button type="button" size="sm" variant="outline" onClick={importarDadosEmpresa}>
            Importar da aba Empresa
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-6">
          <div className="space-y-1.5 sm:col-span-4">
            <Label htmlFor="fis-razao">Razão social</Label>
            <Input
              id="fis-razao"
              value={form.empresa.razaoSocial}
              onChange={(e) => updateEmpresa("razaoSocial", e.target.value)}
              placeholder="Stella Espaço dos Uniformes LTDA"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="fis-cnpj">CNPJ</Label>
            <Input
              id="fis-cnpj"
              value={form.empresa.cnpj}
              onChange={(e) => updateEmpresa("cnpj", formatarCNPJ(e.target.value))}
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-3">
            <Label htmlFor="fis-fantasia">Nome fantasia</Label>
            <Input
              id="fis-fantasia"
              value={form.empresa.nomeFantasia}
              onChange={(e) => updateEmpresa("nomeFantasia", e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-3">
            <Label htmlFor="fis-ie">Inscrição Estadual</Label>
            <Input
              id="fis-ie"
              value={form.empresa.inscricaoEstadual}
              onChange={(e) => updateEmpresa("inscricaoEstadual", e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="fis-cep">CEP</Label>
            <Input
              id="fis-cep"
              value={form.empresa.cep}
              onChange={(e) => updateEmpresa("cep", formatarCEP(e.target.value))}
              placeholder="00000-000"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-3">
            <Label htmlFor="fis-rua">Rua</Label>
            <Input
              id="fis-rua"
              value={form.empresa.rua}
              onChange={(e) => updateEmpresa("rua", e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-1">
            <Label htmlFor="fis-num">Número</Label>
            <Input
              id="fis-num"
              value={form.empresa.numero}
              onChange={(e) => updateEmpresa("numero", e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="fis-comp">Complemento</Label>
            <Input
              id="fis-comp"
              value={form.empresa.complemento}
              onChange={(e) => updateEmpresa("complemento", e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="fis-bairro">Bairro</Label>
            <Input
              id="fis-bairro"
              value={form.empresa.bairro}
              onChange={(e) => updateEmpresa("bairro", e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-1">
            <Label htmlFor="fis-cidade">Cidade</Label>
            <Input
              id="fis-cidade"
              value={form.empresa.cidade}
              onChange={(e) => updateEmpresa("cidade", e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-1">
            <Label htmlFor="fis-uf">Estado</Label>
            <Select
              id="fis-uf"
              value={form.empresa.estado}
              onValueChange={(v) => updateEmpresa("estado", v)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="UF" />
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

      <SectionCard
        title="API Spedy"
        description="A Spedy emite uma única chave por conta, válida para Sandbox e Produção. A chave fica salva no cofre de segredos do servidor — nunca aparece no código, no banco de dados ou no navegador."
        icon={<Plug className="h-4 w-4" />}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fis-ambiente">Ambiente de emissão</Label>
            <Select
              id="fis-ambiente"
              value={form.ambiente}
              onValueChange={(v) => updateAmbiente(v as AmbienteSpedy)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">{LABEL_AMBIENTE_SPEDY.sandbox}</SelectItem>
                <SelectItem value="producao">{LABEL_AMBIENTE_SPEDY.producao}</SelectItem>
              </SelectContent>
            </Select>
            <p className="break-all text-xs text-muted-foreground">
              Endpoint: {SPEDY_BASE_URLS[form.ambiente]}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Status da conexão</Label>
            <div className="flex h-9 items-center gap-2 text-sm">
              {form.ultimoTeste ? (
                form.ultimoTeste.ok ? (
                  <span className="flex items-center gap-1.5 text-success">
                    <CheckCircle2 className="h-4 w-4" /> Conectado
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-destructive">
                    <XCircle className="h-4 w-4" /> Falha no último teste
                  </span>
                )
              ) : (
                <span className="text-muted-foreground">Nunca testado</span>
              )}
            </div>
            {form.ultimoTeste && (
              <p className="text-xs text-muted-foreground">
                {form.ultimoTeste.mensagem}
              </p>
            )}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>API Key da Spedy</Label>
            <div className="flex items-start gap-2 rounded-md border border-border bg-surface-muted/60 px-3 py-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <p>
                A chave está salva no <strong>cofre de segredos</strong> do
                sistema — ela nunca aparece no código, no banco de dados ou no
                navegador, e serve para os dois ambientes (Sandbox e Produção).
                Para trocar a chave, peça para atualizar o segredo{" "}
                <code className="rounded bg-background px-1 py-0.5 font-mono text-[11px]">
                  SPEDY_API_KEY
                </code>
                .
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleTestar}
            disabled={testando}
            className="gap-1.5"
          >
            {testando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plug className="h-4 w-4" />
            )}
            {testando ? "Testando..." : "Testar Conexão"}
          </Button>
          <p className="text-xs text-muted-foreground">
            O teste usa a chave do cofre de segredos com o ambiente{" "}
            <strong>salvo</strong> acima — salve antes de testar após trocar o
            ambiente.
          </p>
        </div>
      </SectionCard>

      <SectionCard
        title="Tributação padrão dos itens"
        description="Aplicada a todos os produtos e adicionais da NF-e (matrizes/logos entram como itens próprios). Sem regras tributárias próprias — os valores seguem os exemplos oficiais da Spedy."
        icon={<Landmark className="h-4 w-4" />}
      >
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="fis-regime">Regime tributário</Label>
            <Select
              id="fis-regime"
              value={t.regime}
              onValueChange={(v) => updateRegime(v as RegimeTributarioFiscal)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simplesNacional">Simples Nacional</SelectItem>
                <SelectItem value="regimeNormal">Regime Normal (Lucro Presumido/Real)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fis-ncm">NCM padrão</Label>
            <Input
              id="fis-ncm"
              inputMode="numeric"
              value={t.ncm}
              onChange={(e) =>
                updateTributacao("ncm", e.target.value.replace(/\D/g, "").slice(0, 8))
              }
              placeholder="Ex.: 61091000"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fis-cfop-int">CFOP interno</Label>
            <Input
              id="fis-cfop-int"
              type="number"
              value={t.cfopInterno}
              onChange={(e) => updateTributacao("cfopInterno", num(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fis-cfop-inter">CFOP interestadual</Label>
            <Input
              id="fis-cfop-inter"
              type="number"
              value={t.cfopInterestadual}
              onChange={(e) => updateTributacao("cfopInterestadual", num(e.target.value))}
            />
          </div>

          {!regimeNormal ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="fis-csosn">CSOSN do ICMS</Label>
                <Input
                  id="fis-csosn"
                  type="number"
                  value={t.csosn}
                  onChange={(e) => updateTributacao("csosn", num(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  400 = tributada pelo Simples sem crédito (mais comum)
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fis-pis-cst">CST do PIS</Label>
                <Input
                  id="fis-pis-cst"
                  type="number"
                  value={t.pisCst}
                  onChange={(e) => updateTributacao("pisCst", num(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fis-cofins-cst">CST da COFINS</Label>
                <Input
                  id="fis-cofins-cst"
                  type="number"
                  value={t.cofinsCst}
                  onChange={(e) => updateTributacao("cofinsCst", num(e.target.value))}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="fis-icms-cst">CST do ICMS</Label>
                <Input
                  id="fis-icms-cst"
                  type="number"
                  value={t.icmsCst}
                  onChange={(e) => updateTributacao("icmsCst", num(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">0 = tributada integralmente</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fis-icms-aliq">Alíquota ICMS (%)</Label>
                <Input
                  id="fis-icms-aliq"
                  type="number"
                  step="0.01"
                  value={t.icmsAliquota}
                  onChange={(e) => updateTributacao("icmsAliquota", num(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Interna: conforme UF. Interestadual: 12% ou 7%
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fis-pis-cst-rn">CST do PIS</Label>
                <Input
                  id="fis-pis-cst-rn"
                  type="number"
                  value={t.pisCst}
                  onChange={(e) => updateTributacao("pisCst", num(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fis-pis-aliq">Alíquota PIS (%)</Label>
                <Input
                  id="fis-pis-aliq"
                  type="number"
                  step="0.01"
                  value={t.pisAliquota}
                  onChange={(e) => updateTributacao("pisAliquota", num(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Lucro Presumido: 0,65%</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fis-cofins-cst-rn">CST da COFINS</Label>
                <Input
                  id="fis-cofins-cst-rn"
                  type="number"
                  value={t.cofinsCst}
                  onChange={(e) => updateTributacao("cofinsCst", num(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fis-cofins-aliq">Alíquota COFINS (%)</Label>
                <Input
                  id="fis-cofins-aliq"
                  type="number"
                  step="0.01"
                  value={t.cofinsAliquota}
                  onChange={(e) => updateTributacao("cofinsAliquota", num(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Lucro Presumido: 3%</p>
              </div>
            </>
          )}
        </div>
      </SectionCard>

      <Separator />
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          disabled={!dirty}
          onClick={() => {
            setForm(config);
            setDirty(false);
          }}
        >
          Descartar
        </Button>
        <Button disabled={!dirty || salvando} onClick={handleSalvar}>
          {salvando ? "Salvando..." : "Salvar configurações fiscais"}
        </Button>
      </div>
    </div>
  );
}
