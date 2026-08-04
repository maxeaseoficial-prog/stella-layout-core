import { useEffect, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

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

import {
  CATEGORIAS_ENTRADA,
  CATEGORIAS_SAIDA,
  FORMAS_PAGAMENTO,
  LABEL_CATEGORIA,
  LABEL_FORMA_PAGAMENTO,
  type CategoriaMovimentacao,
  type FormaPagamento,
  type Movimentacao,
  type MovimentacaoInput,
  type TipoMovimentacao,
} from "./types";
import { hojeISO, parseValorInput } from "./utils";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  movimentacao?: Movimentacao | null;
  onSalvar: (dados: MovimentacaoInput, id?: string) => void;
}

interface FormState {
  tipo: TipoMovimentacao;
  categoria: CategoriaMovimentacao;
  descricao: string;
  valor: string;
  formaPagamento: FormaPagamento;
  data: string;
  observacoes: string;
}

function estadoInicial(m?: Movimentacao | null): FormState {
  if (!m) {
    return {
      tipo: "entrada",
      categoria: "venda",
      descricao: "",
      valor: "",
      formaPagamento: "dinheiro",
      data: hojeISO(),
      observacoes: "",
    };
  }
  return {
    tipo: m.tipo,
    categoria: m.categoria,
    descricao: m.descricao,
    valor: m.valor.toFixed(2).replace(".", ","),
    formaPagamento: m.formaPagamento,
    data: m.data,
    observacoes: m.observacoes ?? "",
  };
}

export function MovimentacaoFormDrawer({
  aberto,
  onFechar,
  movimentacao,
  onSalvar,
}: Props) {
  const [form, setForm] = useState<FormState>(() => estadoInicial(movimentacao));
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    if (aberto) {
      setForm(estadoInicial(movimentacao));
      setErros({});
    }
  }, [aberto, movimentacao]);

  function up<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function trocarTipo(t: TipoMovimentacao) {
    setForm((f) => ({
      ...f,
      tipo: t,
      categoria: t === "entrada" ? "venda" : "compra_material",
    }));
  }

  const categorias = form.tipo === "entrada" ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA;

  function validar() {
    const e: Record<string, string> = {};
    if (!form.descricao.trim()) e.descricao = "Informe uma descrição.";
    const valor = parseValorInput(form.valor);
    if (!valor || valor <= 0) e.valor = "Informe um valor válido.";
    if (!form.data) e.data = "Informe a data.";
    setErros(e);
    return Object.keys(e).length === 0;
  }

  function handleSalvar() {
    if (!validar()) return;
    const dados: MovimentacaoInput = {
      tipo: form.tipo,
      categoria: form.categoria,
      descricao: form.descricao.trim(),
      valor: parseValorInput(form.valor),
      formaPagamento: form.formaPagamento,
      data: form.data,
      observacoes: form.observacoes.trim() || undefined,
      origem: movimentacao?.origem ?? "manual",
      status: movimentacao?.status ?? "confirmada",
      referenciaId: movimentacao?.referenciaId,
    };
    onSalvar(dados, movimentacao?.id);
    onFechar();
  }

  return (
    <Sheet open={aberto} onOpenChange={(v) => (!v ? onFechar() : null)}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        <SheetHeader className="border-b border-border bg-surface px-6 py-4">
          <SheetTitle className="text-xl font-bold">
            {movimentacao ? "Editar movimentação" : "Nova movimentação"}
          </SheetTitle>
          <SheetDescription>
            Registre entradas e saídas para manter o caixa atualizado.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-surface-muted/40 px-6 py-6">
          <div className="space-y-6">
            {/* Tipo */}
            <section className="space-y-2">
              <Label>Tipo</Label>
              <div className="grid grid-cols-2 gap-3">
                <TipoCard
                  ativo={form.tipo === "entrada"}
                  onClick={() => trocarTipo("entrada")}
                  icon={<ArrowDownCircle className="h-5 w-5" />}
                  titulo="Entrada"
                  descricao="Recebimento"
                  cor="success"
                />
                <TipoCard
                  ativo={form.tipo === "saida"}
                  onClick={() => trocarTipo("saida")}
                  icon={<ArrowUpCircle className="h-5 w-5" />}
                  titulo="Saída"
                  descricao="Despesa"
                  cor="destructive"
                />
              </div>
            </section>

            <section className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label="Categoria" obrigatorio>
                  <Select
                    value={form.categoria}
                    onValueChange={(v) => up("categoria", v as CategoriaMovimentacao)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((c) => (
                        <SelectItem key={c} value={c}>
                          {LABEL_CATEGORIA[c]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Campo>

                <Campo label="Forma de pagamento" obrigatorio>
                  <Select
                    value={form.formaPagamento}
                    onValueChange={(v) => up("formaPagamento", v as FormaPagamento)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAS_PAGAMENTO.map((f) => (
                        <SelectItem key={f} value={f}>
                          {LABEL_FORMA_PAGAMENTO[f]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Campo>

                <Campo
                  label="Descrição"
                  obrigatorio
                  erro={erros.descricao}
                  className="sm:col-span-2"
                >
                  <Input
                    value={form.descricao}
                    onChange={(e) => up("descricao", e.target.value)}
                    placeholder="Ex.: Venda de uniformes escolares"
                  />
                </Campo>

                <Campo label="Valor (R$)" obrigatorio erro={erros.valor}>
                  <Input
                    value={form.valor}
                    onChange={(e) => up("valor", e.target.value)}
                    placeholder="0,00"
                    inputMode="decimal"
                  />
                </Campo>

                <Campo label="Data" obrigatorio erro={erros.data}>
                  <Input
                    type="date"
                    value={form.data}
                    onChange={(e) => up("data", e.target.value)}
                  />
                </Campo>

                <Campo label="Observações" className="sm:col-span-2">
                  <Textarea
                    value={form.observacoes}
                    onChange={(e) => up("observacoes", e.target.value)}
                    placeholder="Anotações internas, referência, etc."
                    rows={3}
                  />
                </Campo>
              </div>
            </section>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface px-6 py-4">
          <Button type="button" variant="outline" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSalvar}>
            {movimentacao ? "Salvar alterações" : "Salvar movimentação"}
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
  cor,
}: {
  ativo: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  titulo: string;
  descricao: string;
  cor: "success" | "destructive";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3 text-left transition",
        ativo
          ? cor === "success"
            ? "border-success bg-success/10 ring-2 ring-success/30"
            : "border-destructive bg-destructive/10 ring-2 ring-destructive/30"
          : "border-border bg-surface hover:border-primary/40 hover:bg-primary-soft/30",
      )}
    >
      <div
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-lg",
          ativo
            ? cor === "success"
              ? "bg-success text-white"
              : "bg-destructive text-white"
            : "bg-muted text-muted-foreground",
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
