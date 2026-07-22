import { Tag } from "lucide-react";

import { useConfiguracoes } from "../useConfiguracoes";
import { LABEL_ESCOPO, type EscopoCategoria } from "../types";
import { SectionCard } from "../SectionCard";
import { CategoriaManager } from "../CategoriaManager";

interface ListaProps {
  escopo: EscopoCategoria;
  descricao: string;
}

function ListaCategorias({ escopo, descricao }: ListaProps) {
  const {
    categoriasPorEscopo,
    criarCategoria,
    editarCategoria,
    excluirCategoria,
    reordenarCategorias,
  } = useConfiguracoes();
  const lista = categoriasPorEscopo(escopo);

  return (
    <CategoriaManager
      titulo={LABEL_ESCOPO[escopo]}
      descricao={descricao}
      itens={lista.map((c) => ({ id: c.id, nome: c.nome }))}
      onCriar={(nome) => ({ ok: !!criarCategoria(escopo, nome) })}
      onEditar={(id, nome) => ({ ok: editarCategoria(id, nome) })}
      onExcluir={(id) => excluirCategoria(id)}
      onReordenar={(ids) => reordenarCategorias(escopo, ids)}
      labelBotao="Adicionar categoria"
      labelSingular="categoria"
    />
  );
}

export function CategoriasTab() {
  return (
    <SectionCard
      title="Categorias"
      description="Categorias administráveis usadas nos cadastros de Produtos, Estoque e Adicionais. Reorganize arrastando pelo ícone à esquerda."
      icon={<Tag className="h-4 w-4" />}
      contentClassName="grid gap-4 md:grid-cols-3"
    >
      <ListaCategorias escopo="produto" descricao="Ex: Camiseta, Polo, Jaleco, Boné." />
      <ListaCategorias escopo="estoque" descricao="Ex: Tecidos, Linhas, Botões, Etiquetas." />
      <ListaCategorias escopo="adicional" descricao="Ex: Tecido, Aviamento, Acessório." />
    </SectionCard>
  );
}
