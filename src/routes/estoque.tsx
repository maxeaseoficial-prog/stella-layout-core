import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Boxes, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  EstoqueStatsCards,
  EstoqueTable,
  HistoricoEstoqueDialog,
  ItemEstoqueFormDrawer,
  MovimentacaoEstoqueModal,
  useEstoque,
} from "@/features/estoque";
import type {
  CategoriaEstoque,
  ItemEstoque,
  ItemEstoqueInput,
} from "@/features/estoque";
import { useConfiguracoes } from "@/features/configuracoes";

export const Route = createFileRoute("/estoque")({
  component: EstoquePage,
});

function EstoquePage() {
  const { itens, hidratado, stats, criar, atualizar, excluir, filtrar } = useEstoque();
  const { categoriasPorEscopo } = useConfiguracoes();
  const categoriasEstoque = categoriasPorEscopo("estoque");

  const [termo, setTermo] = useState("");
  const [categoria, setCategoria] = useState<CategoriaEstoque | "todas">("todas");
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<ItemEstoque | null>(null);
  const [excluindo, setExcluindo] = useState<ItemEstoque | null>(null);
  const [movimentando, setMovimentando] = useState<ItemEstoque | null>(null);
  const [historico, setHistorico] = useState<ItemEstoque | null>(null);

  const lista = useMemo(() => {
    let l = filtrar(termo);
    if (categoria !== "todas") l = l.filter((i) => i.categoria === categoria);
    return l;
  }, [filtrar, termo, categoria]);

  function abrirNovo() {
    setEditando(null);
    setFormAberto(true);
  }

  function abrirEdicao(i: ItemEstoque) {
    setEditando(i);
    setFormAberto(true);
  }

  function handleSalvar(dados: ItemEstoqueInput, id?: string) {
    if (id) {
      atualizar(id, dados);
      toast.success("Item atualizado com sucesso.");
    } else {
      criar(dados);
      toast.success("Item cadastrado com sucesso.");
    }
    setFormAberto(false);
  }

  function confirmarExclusao() {
    if (!excluindo) return;
    excluir(excluindo.id);
    toast.success("Item marcado como inativo.");
    setExcluindo(null);
  }

  const total = itens.length;
  const listaVazia = hidratado && total === 0;
  const semResultado = hidratado && total > 0 && lista.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estoque"
        description="Gerencie todos os materiais utilizados na produção."
        actions={
          <Button size="sm" onClick={abrirNovo}>
            <Plus className="h-4 w-4" />
            Novo item
          </Button>
        }
      />

      <EstoqueStatsCards
        total={stats.total}
        baixo={stats.baixo}
        sem={stats.sem}
        valor={stats.valor}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Pesquisar por nome, categoria ou fornecedor"
            className="pl-9"
          />
        </div>
        <Select
          value={categoria}
          onValueChange={(v) => setCategoria(v as CategoriaEstoque | "todas")}
        >
          <SelectTrigger className="h-9 w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {CATEGORIAS_ESTOQUE.map((c) => (
              <SelectItem key={c} value={c}>
                {LABEL_CATEGORIA_ESTOQUE[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {listaVazia ? (
        <EmptyState
          icon={Boxes}
          title="Nenhum item cadastrado"
          description="Cadastre o primeiro material ou insumo para começar o controle do estoque."
          action={
            <Button onClick={abrirNovo}>
              <Plus className="h-4 w-4" />
              Cadastrar item
            </Button>
          }
        />
      ) : semResultado ? (
        <EmptyState
          icon={Search}
          title="Nenhum item encontrado"
          description="Ajuste os filtros ou o termo de pesquisa."
        />
      ) : (
        <EstoqueTable
          itens={lista}
          onEditar={abrirEdicao}
          onExcluir={setExcluindo}
          onMovimentar={setMovimentando}
          onHistorico={setHistorico}
        />
      )}

      <ItemEstoqueFormDrawer
        aberto={formAberto}
        onFechar={() => setFormAberto(false)}
        item={editando}
        onSalvar={handleSalvar}
      />

      <MovimentacaoEstoqueModal
        aberto={!!movimentando}
        item={movimentando}
        onFechar={() => setMovimentando(null)}
      />

      <HistoricoEstoqueDialog
        aberto={!!historico}
        item={historico}
        onFechar={() => setHistorico(null)}
      />

      <AlertDialog open={!!excluindo} onOpenChange={(v) => (!v ? setExcluindo(null) : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inativar item?</AlertDialogTitle>
            <AlertDialogDescription>
              O item{" "}
              <span className="font-medium text-foreground">{excluindo?.nome}</span> será
              marcado como inativo. O histórico de movimentações será preservado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Inativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
