import { useState } from "react";
import { Check, Pencil, Plus, Tag, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfiguracoes } from "../useConfiguracoes";
import { LABEL_ESCOPO, type Categoria, type EscopoCategoria } from "../types";
import { SectionCard } from "../SectionCard";

interface ListaProps {
  escopo: EscopoCategoria;
  descricao: string;
}

function ListaCategorias({ escopo, descricao }: ListaProps) {
  const { categoriasPorEscopo, criarCategoria, editarCategoria, excluirCategoria } = useConfiguracoes();
  const lista = categoriasPorEscopo(escopo);
  const [novo, setNovo] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editValor, setEditValor] = useState("");

  function adicionar() {
    if (!novo.trim()) return;
    const res = criarCategoria(escopo, novo);
    if (!res) {
      toast.error("Já existe uma categoria com esse nome.");
      return;
    }
    setNovo("");
    toast.success("Categoria adicionada.");
  }

  function iniciarEdicao(c: Categoria) {
    setEditandoId(c.id);
    setEditValor(c.nome);
  }

  function salvarEdicao(id: string) {
    if (!editarCategoria(id, editValor)) {
      toast.error("Nome inválido ou já existente.");
      return;
    }
    setEditandoId(null);
    toast.success("Categoria atualizada.");
  }

  return (
    <div className="rounded-xl border border-border bg-background/50 p-4">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-foreground">{LABEL_ESCOPO[escopo]}</h4>
        <p className="text-xs text-muted-foreground">{descricao}</p>
      </div>

      <div className="mb-3 flex gap-2">
        <Input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); adicionar(); }
          }}
          placeholder={`Nova categoria de ${LABEL_ESCOPO[escopo].toLowerCase()}`}
        />
        <Button onClick={adicionar} size="sm">
          <Plus className="mr-1 h-3.5 w-3.5" /> Adicionar
        </Button>
      </div>

      {lista.length === 0 ? (
        <p className="rounded-md border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
          Nenhuma categoria cadastrada.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {lista.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2 px-3 py-2">
              {editandoId === c.id ? (
                <>
                  <Input
                    value={editValor}
                    onChange={(e) => setEditValor(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") salvarEdicao(c.id);
                      if (e.key === "Escape") setEditandoId(null);
                    }}
                    autoFocus
                    className="h-8"
                  />
                  <div className="flex shrink-0 gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => salvarEdicao(c.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditandoId(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <span className="truncate text-sm text-foreground">{c.nome}</span>
                  <div className="flex shrink-0 gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => iniciarEdicao(c)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => { excluirCategoria(c.id); toast.success("Categoria removida."); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CategoriasTab() {
  return (
    <SectionCard
      title="Categorias"
      description="Categorias administráveis usadas nos cadastros de Produtos, Estoque e Adicionais."
      icon={<Tag className="h-4 w-4" />}
      contentClassName="grid gap-4 md:grid-cols-3"
    >
      <ListaCategorias escopo="produto" descricao="Ex: Camiseta, Polo, Jaleco, Boné." />
      <ListaCategorias escopo="estoque" descricao="Ex: Tecidos, Linhas, Botões, Etiquetas." />
      <ListaCategorias escopo="adicional" descricao="Ex: Tecido, Aviamento, Acessório." />
    </SectionCard>
  );
}
