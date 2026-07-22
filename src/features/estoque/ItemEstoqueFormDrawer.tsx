import { useEffect, useRef, useState } from "react";
import { ImagePlus, Package } from "lucide-react";

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
} from "@/components/ui/select";
import { fileToDataUrl } from "@/features/clientes";
import { useFornecedores } from "@/features/fornecedores";
import { useConfiguracoes } from "@/features/configuracoes";

import type {
  CategoriaEstoque,
  ItemEstoque,
  ItemEstoqueInput,
  StatusItemEstoque,
  UnidadeMedida,
} from "./types";
import {
  LABEL_UNIDADE,
  UNIDADES_MEDIDA,
} from "./types";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  item?: ItemEstoque | null;
  onSalvar: (dados: ItemEstoqueInput, id?: string) => void;
}

interface FormState {
  nome: string;
  categoria: CategoriaEstoque;
  imagem?: string;
  descricao: string;
  fornecedor: string;
  unidade: UnidadeMedida;
  quantidadeStr: string;
  minimoStr: string;
  precoCompraStr: string;
  precoVendaStr: string;
  status: StatusItemEstoque;
}

function num(v: string): number {
  const s = v.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function toStrDec(v: number) {
  return v > 0 ? v.toFixed(2).replace(".", ",") : "";
}

function estadoInicial(item?: ItemEstoque | null): FormState {
  if (!item) {
    return {
      nome: "",
      categoria: "",
      imagem: undefined,
      descricao: "",
      fornecedor: "",
      unidade: "unidade",
      quantidadeStr: "",
      minimoStr: "",
      precoCompraStr: "",
      precoVendaStr: "",
      status: "ativo",
    };
  }
  return {
    nome: item.nome,
    categoria: item.categoria,
    imagem: item.imagem,
    descricao: item.descricao ?? "",
    fornecedor: item.fornecedor ?? "",
    unidade: item.unidade,
    quantidadeStr: item.quantidade ? String(item.quantidade) : "",
    minimoStr: item.estoqueMinimo ? String(item.estoqueMinimo) : "",
    precoCompraStr: toStrDec(item.precoCompra),
    precoVendaStr: item.precoVenda ? toStrDec(item.precoVenda) : "",
    status: item.status,
  };
}

const IMG_ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

export function ItemEstoqueFormDrawer({ aberto, onFechar, item, onSalvar }: Props) {
  const [form, setForm] = useState<FormState>(() => estadoInicial(item));
  const [erros, setErros] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const { ativos: fornecedoresAtivos } = useFornecedores();

  useEffect(() => {
    if (aberto) {
      setForm(estadoInicial(item));
      setErros({});
    }
  }, [aberto, item]);

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
    if (!form.nome.trim()) novosErros.nome = "Informe o nome do item.";
    if (!form.categoria) novosErros.categoria = "Selecione a categoria.";
    if (!form.precoCompraStr.trim()) novosErros.precoCompra = "Informe o preço de compra.";
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    const dados: ItemEstoqueInput = {
      nome: form.nome.trim(),
      categoria: form.categoria,
      imagem: form.imagem,
      descricao: form.descricao.trim() || undefined,
      fornecedor: form.fornecedor.trim() || undefined,
      unidade: form.unidade,
      quantidade: Math.max(0, num(form.quantidadeStr)),
      estoqueMinimo: Math.max(0, num(form.minimoStr)),
      precoCompra: num(form.precoCompraStr),
      precoVenda: form.precoVendaStr.trim() ? num(form.precoVendaStr) : undefined,
      status: form.status,
    };
    onSalvar(dados, item?.id);
  }

  return (
    <Sheet open={aberto} onOpenChange={(v) => (!v ? onFechar() : undefined)}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <SheetHeader className="border-b border-border bg-surface p-6">
            <SheetTitle>{item ? "Editar item" : "Novo item de estoque"}</SheetTitle>
            <SheetDescription>
              Cadastre um material ou insumo utilizado na produção.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-6 p-6">
            {/* Imagem */}
            <div className="flex items-center gap-4">
              <div className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-surface-muted">
                {form.imagem ? (
                  <img src={form.imagem} alt="Item" className="h-full w-full object-cover" />
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

            {/* Informações */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="nome">Nome do item *</Label>
                <Input
                  id="nome"
                  value={form.nome}
                  onChange={(e) => upd("nome", e.target.value)}
                  placeholder="Ex.: Tecido PV branco"
                />
                {erros.nome && <p className="text-xs text-destructive">{erros.nome}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Categoria *</Label>
                <Select
                  value={form.categoria}
                  onValueChange={(v) => upd("categoria", v as CategoriaEstoque)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_ESTOQUE.map((c) => (
                      <SelectItem key={c} value={c}>
                        {LABEL_CATEGORIA_ESTOQUE[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Unidade de medida</Label>
                <Select
                  value={form.unidade}
                  onValueChange={(v) => upd("unidade", v as UnidadeMedida)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES_MEDIDA.map((u) => (
                      <SelectItem key={u} value={u}>
                        {LABEL_UNIDADE[u]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label>Fornecedor</Label>
                <Select
                  value={form.fornecedor || "__nenhum"}
                  onValueChange={(v) => upd("fornecedor", v === "__nenhum" ? "" : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__nenhum">Sem fornecedor</SelectItem>
                    {fornecedoresAtivos.map((f) => (
                      <SelectItem key={f.id} value={f.empresa}>
                        {f.empresa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fornecedoresAtivos.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Nenhum fornecedor ativo cadastrado. Cadastre em Fornecedores.
                  </p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="desc">Descrição</Label>
                <Textarea
                  id="desc"
                  rows={2}
                  value={form.descricao}
                  onChange={(e) => upd("descricao", e.target.value)}
                  placeholder="Detalhes do material (cor, gramatura, referência, etc.)."
                />
              </div>
            </div>

            {/* Controle */}
            <div className="space-y-3 rounded-xl border border-border bg-surface-muted/40 p-4">
              <p className="text-sm font-semibold text-foreground">Controle de estoque</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="qtd">Quantidade atual</Label>
                  <Input
                    id="qtd"
                    inputMode="decimal"
                    value={form.quantidadeStr}
                    onChange={(e) => upd("quantidadeStr", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="min">Estoque mínimo</Label>
                  <Input
                    id="min"
                    inputMode="decimal"
                    value={form.minimoStr}
                    onChange={(e) => upd("minimoStr", e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Valores */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pc">Preço de compra (R$) *</Label>
                <Input
                  id="pc"
                  inputMode="decimal"
                  value={form.precoCompraStr}
                  onChange={(e) => upd("precoCompraStr", e.target.value)}
                  placeholder="0,00"
                />
                {erros.precoCompra && (
                  <p className="text-xs text-destructive">{erros.precoCompra}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pv">Preço de venda (R$)</Label>
                <Input
                  id="pv"
                  inputMode="decimal"
                  value={form.precoVendaStr}
                  onChange={(e) => upd("precoVendaStr", e.target.value)}
                  placeholder="Opcional"
                />
                <p className="text-xs text-muted-foreground">
                  Preencha somente se o item for vendido separadamente.
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => upd("status", v as StatusItemEstoque)}
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
            <Button type="submit">{item ? "Salvar alterações" : "Cadastrar item"}</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
