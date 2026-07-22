import { useEffect, useRef, useState } from "react";
import { ImagePlus, Package } from "lucide-react";

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
import { cn } from "@/lib/utils";
import { fileToDataUrl } from "@/features/clientes";
import { useConfiguracoes } from "@/features/configuracoes";

import type {
  CategoriaProduto,
  PersonalizacoesPermitidas,
  Produto,
  ProdutoInput,
  StatusProduto,
} from "./types";
import {
  PERSONALIZACOES_VAZIAS,
} from "./types";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  produto?: Produto | null;
  onSalvar: (dados: ProdutoInput, id?: string) => void;
}

interface FormState {
  nome: string;
  sku: string;
  categoria: CategoriaProduto;
  precoStr: string;
  personalizacoes: PersonalizacoesPermitidas;
  descricao: string;
  observacoesInternas: string;
  imagem?: string;
  status: StatusProduto;
}

function estadoInicial(produto?: Produto | null): FormState {
  if (!produto) {
    return {
      nome: "",
      sku: "",
      categoria: "",
      precoStr: "",
      personalizacoes: { ...PERSONALIZACOES_VAZIAS },
      descricao: "",
      observacoesInternas: "",
      imagem: undefined,
      status: "ativo",
    };
  }
  return {
    nome: produto.nome,
    sku: produto.sku ?? "",
    categoria: produto.categoria,
    precoStr: produto.precoBase > 0 ? produto.precoBase.toFixed(2).replace(".", ",") : "",
    personalizacoes: { ...produto.personalizacoes },
    descricao: produto.descricao ?? "",
    observacoesInternas: produto.observacoesInternas ?? "",
    imagem: produto.imagem,
    status: produto.status,
  };
}

function parsePreco(v: string): number {
  const s = v.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

const CHECKS: { key: keyof PersonalizacoesPermitidas; label: string }[] = [
  { key: "bordado", label: "Bordado" },
  { key: "estampa", label: "Estampa" },
  { key: "sublimacao", label: "Sublimação" },
];

const IMG_ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

export function ProdutoFormDrawer({ aberto, onFechar, produto, onSalvar }: Props) {
  const { categoriasPorEscopo } = useConfiguracoes();
  const categoriasProduto = categoriasPorEscopo("produto");
  const [form, setForm] = useState<FormState>(() => estadoInicial(produto));
  const [erros, setErros] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aberto) {
      setForm(estadoInicial(produto));
      setErros({});
    }
  }, [aberto, produto]);

  function upd<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function handleImagem(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) return;
    const url = await fileToDataUrl(f);
    upd("imagem", url);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const novosErros: Record<string, string> = {};
    if (!form.nome.trim()) novosErros.nome = "Informe o nome do produto.";
    if (!form.categoria) novosErros.categoria = "Selecione a categoria.";
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    const dados: ProdutoInput = {
      nome: form.nome.trim(),
      sku: form.sku.trim() || undefined,
      categoria: form.categoria,
      precoBase: parsePreco(form.precoStr),
      personalizacoes: form.personalizacoes,
      descricao: form.descricao.trim() || undefined,
      observacoesInternas: form.observacoesInternas.trim() || undefined,
      imagem: form.imagem,
      status: form.status,
    };
    onSalvar(dados, produto?.id);
  }

  return (
    <Sheet open={aberto} onOpenChange={(v) => (!v ? onFechar() : undefined)}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <SheetHeader className="border-b border-border bg-surface p-6">
            <SheetTitle>{produto ? "Editar produto" : "Novo produto"}</SheetTitle>
            <SheetDescription>
              Cadastre um produto do catálogo comercializado pela Stella.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-6 p-6">
            {/* Imagem */}
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-surface-muted",
                )}
              >
                {form.imagem ? (
                  <img src={form.imagem} alt="Produto" className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-8 w-8 text-muted-foreground" />
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
                  {form.imagem ? "Trocar imagem" : "Enviar imagem"}
                </Button>
                {form.imagem && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => upd("imagem", undefined)}
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
                  onChange={(e) => handleImagem(e.target.files)}
                />
              </div>
            </div>

            {/* Info principal */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="nome">Nome do produto *</Label>
                <Input
                  id="nome"
                  value={form.nome}
                  onChange={(e) => upd("nome", e.target.value)}
                  placeholder="Ex.: Camiseta gola careca PV"
                />
                {erros.nome && <p className="text-xs text-destructive">{erros.nome}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sku">Código interno (SKU)</Label>
                <Input
                  id="sku"
                  value={form.sku}
                  onChange={(e) => upd("sku", e.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Categoria *</Label>
                <Select
                  value={form.categoria}
                  onValueChange={(v) => upd("categoria", v as CategoriaProduto)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_PRODUTO.map((c) => (
                      <SelectItem key={c} value={c}>
                        {LABEL_CATEGORIA_PRODUTO[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Valores */}
            <div className="space-y-1.5">
              <Label htmlFor="preco">Preço base (R$)</Label>
              <Input
                id="preco"
                inputMode="decimal"
                value={form.precoStr}
                onChange={(e) => upd("precoStr", e.target.value)}
                placeholder="0,00"
              />
              <p className="text-xs text-muted-foreground">
                Valor inicial. Personalizações e ajustes podem ser aplicados por pedido.
              </p>
            </div>

            {/* Personalizações */}
            <div className="space-y-3 rounded-xl border border-border bg-surface-muted/40 p-4">
              <p className="text-sm font-semibold text-foreground">Personalizações Disponíveis</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {CHECKS.map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 rounded-lg bg-surface p-2 text-sm"
                  >
                    <Checkbox
                      checked={form.personalizacoes[key]}
                      onCheckedChange={(v) =>
                        upd("personalizacoes", { ...form.personalizacoes, [key]: v === true })
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Textos */}
            <div className="space-y-1.5">
              <Label htmlFor="desc">Descrição</Label>
              <Textarea
                id="desc"
                rows={3}
                value={form.descricao}
                onChange={(e) => upd("descricao", e.target.value)}
                placeholder="Descrição visível internamente ao montar o pedido."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="obs">Observações internas</Label>
              <Textarea
                id="obs"
                rows={2}
                value={form.observacoesInternas}
                onChange={(e) => upd("observacoesInternas", e.target.value)}
                placeholder="Notas internas (não impressas para o cliente)."
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => upd("status", v as StatusProduto)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Produtos inativos não aparecem em novos pedidos.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border bg-surface p-4">
            <Button type="button" variant="ghost" onClick={onFechar}>
              Cancelar
            </Button>
            <Button type="submit">{produto ? "Salvar alterações" : "Cadastrar produto"}</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
