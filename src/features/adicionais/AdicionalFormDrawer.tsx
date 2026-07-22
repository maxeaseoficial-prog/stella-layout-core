import { useEffect, useRef, useState } from "react";
import { ImagePlus, Puzzle } from "lucide-react";

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
import { useConfiguracoes } from "@/features/configuracoes";

import type {
  Adicional,
  AdicionalInput,
  CategoriaAdicional,
  PendenciaAdicional,
  StatusAdicional,
  TipoAdicional,
} from "./types";
import {
  LABEL_PENDENCIA_ADICIONAL,
  LABEL_TIPO_ADICIONAL,
  PENDENCIAS_ADICIONAL,
  TIPOS_ADICIONAL,
  TIPO_PADRAO_POR_CATEGORIA,
} from "./types";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  adicional?: Adicional | null;
  onSalvar: (dados: AdicionalInput, id?: string) => void;
}

interface FormState {
  nome: string;
  tipo: TipoAdicional;
  categoria: CategoriaAdicional;
  modoValor: "definido" | "pendente";
  valorStr: string;
  pendencia: PendenciaAdicional;
  descricao: string;
  imagem?: string;
  status: StatusAdicional;
}

function estadoInicial(a?: Adicional | null): FormState {
  if (!a) {
    return {
      nome: "",
      tipo: "acessorio",
      categoria: "botao",
      modoValor: "definido",
      valorStr: "",
      pendencia: "orcamento",
      descricao: "",
      imagem: undefined,
      status: "ativo",
    };
  }
  return {
    nome: a.nome,
    tipo: a.tipo,
    categoria: a.categoria,
    modoValor: a.pendencia ? "pendente" : "definido",
    valorStr: a.valor > 0 ? a.valor.toFixed(2).replace(".", ",") : "",
    pendencia: a.pendencia ?? "orcamento",
    descricao: a.descricao ?? "",
    imagem: a.imagem,
    status: a.status,
  };
}

function parseValor(v: string): number {
  const s = v.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

const IMG_ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

export function AdicionalFormDrawer({ aberto, onFechar, adicional, onSalvar }: Props) {
  const { categoriasPorEscopo } = useConfiguracoes();
  const categoriasAdicional = categoriasPorEscopo("adicional");
  const [form, setForm] = useState<FormState>(() => estadoInicial(adicional));
  const [erros, setErros] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aberto) {
      setForm(estadoInicial(adicional));
      setErros({});
    }
  }, [aberto, adicional]);

  function upd<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function selecionarCategoria(c: CategoriaAdicional) {
    setForm((s) => ({ ...s, categoria: c, tipo: TIPO_PADRAO_POR_CATEGORIA[c] ?? s.tipo }));
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
    if (!form.nome.trim()) novosErros.nome = "Informe o nome do adicional.";
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    const pendente = form.modoValor === "pendente";
    const dados: AdicionalInput = {
      nome: form.nome.trim(),
      tipo: form.tipo,
      categoria: form.categoria,
      valor: pendente ? 0 : parseValor(form.valorStr),
      pendencia: pendente ? form.pendencia : undefined,
      descricao: form.descricao.trim() || undefined,
      imagem: form.imagem,
      status: form.status,
    };
    onSalvar(dados, adicional?.id);
  }

  return (
    <Sheet open={aberto} onOpenChange={(v) => (!v ? onFechar() : undefined)}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <SheetHeader className="border-b border-border bg-surface p-6">
            <SheetTitle>{adicional ? "Editar adicional" : "Novo adicional"}</SheetTitle>
            <SheetDescription>
              Itens extras que podem ser aplicados a um produto durante o pedido.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-6 p-6">
            {/* Imagem */}
            <div className="flex items-center gap-4">
              <div className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-surface-muted">
                {form.imagem ? (
                  <img src={form.imagem} alt="Adicional" className="h-full w-full object-cover" />
                ) : (
                  <Puzzle className="h-8 w-8 text-muted-foreground" />
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={form.nome}
                  onChange={(e) => upd("nome", e.target.value)}
                  placeholder="Ex.: Botão metálico dourado"
                />
                {erros.nome && <p className="text-xs text-destructive">{erros.nome}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select
                  value={form.categoria}
                  onValueChange={(v) => selecionarCategoria(v as CategoriaAdicional)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasAdicional.map((c) => (
                      <SelectItem key={c.id} value={c.nome}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) => upd("tipo", v as TipoAdicional)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_ADICIONAL.map((t) => (
                      <SelectItem key={t} value={t}>
                        {LABEL_TIPO_ADICIONAL[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Facilita a busca durante a montagem do pedido.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="valor">Valor adicional (R$)</Label>
              <Input
                id="valor"
                inputMode="decimal"
                value={form.valorStr}
                onChange={(e) => upd("valorStr", e.target.value)}
                placeholder="0,00"
              />
              <p className="text-xs text-muted-foreground">
                Este valor será somado ao produto no pedido.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc">Descrição</Label>
              <Textarea
                id="desc"
                rows={3}
                value={form.descricao}
                onChange={(e) => upd("descricao", e.target.value)}
                placeholder="Detalhes técnicos ou observações."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => upd("status", v as StatusAdicional)}
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
                Adicionais inativos não aparecem em novos pedidos.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border bg-surface p-4">
            <Button type="button" variant="ghost" onClick={onFechar}>
              Cancelar
            </Button>
            <Button type="submit">
              {adicional ? "Salvar alterações" : "Cadastrar adicional"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
