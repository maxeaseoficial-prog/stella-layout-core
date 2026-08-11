import { useMemo, useState } from "react";
import { Package, PackagePlus, RefreshCw, Search } from "lucide-react";
import { toast } from "@/lib/toast";

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

import { ProdutoFormDrawer } from "./ProdutoFormDrawer";
import { ProdutosTable } from "./ProdutosTable";
import { useProdutos } from "./useProdutos";
import type {
  CategoriaProduto,
  Produto,
  ProdutoInput,
  StatusProduto,
} from "./types";
import { useConfiguracoes } from "@/features/configuracoes";

export function ProdutosPanel() {
  const { produtos, hidratado, criar, atualizar, excluir, remover, filtrar, sincronizar } = useProdutos();
  const { categoriasPorEscopo } = useConfiguracoes();
  const categoriasProduto = categoriasPorEscopo("produto");

  const [termo, setTermo] = useState("");
  const [categoria, setCategoria] = useState<CategoriaProduto | "todas">("todas");
  const [status, setStatus] = useState<StatusProduto | "todos">("todos");
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [excluindo, setExcluindo] = useState<Produto | null>(null);
  const [removendo, setRemovendo] = useState<Produto | null>(null);

  const lista = useMemo(() => {
    let l = filtrar(termo);
    if (categoria !== "todas") l = l.filter((p) => p.categoria === categoria);
    if (status !== "todos") l = l.filter((p) => p.status === status);
    return l;
  }, [filtrar, termo, categoria, status]);

  function abrirNovo() {
    setEditando(null);
    setFormAberto(true);
  }

  function abrirEdicao(p: Produto) {
    setEditando(p);
    setFormAberto(true);
  }

  function handleSalvar(dados: ProdutoInput, id?: string) {
    if (id) {
      atualizar(id, dados);
      toast.success("Produto atualizado com sucesso.");
    } else {
      criar(dados);
      toast.success("Produto cadastrado com sucesso.");
    }
    setFormAberto(false);
  }

  function confirmarExclusao() {
    if (!excluindo) return;
    excluir(excluindo.id);
    toast.success("Produto marcado como inativo.");
    setExcluindo(null);
  }

  function confirmarRemocao() {
    if (!removendo) return;
    remover(removendo.id);
    toast.success("Produto excluído permanentemente.");
    setRemovendo(null);
  }

  function handleSincronizar() {
    const novos = sincronizar();
    if (typeof novos === "number" && novos > 0) {
      toast.success(`${novos} novos produtos sincronizados do catálogo mestre.`);
    } else {
      toast.info("O catálogo já está atualizado.");
    }
  }

  const total = produtos.length;
  const listaVazia = hidratado && total === 0;
  const semResultado = hidratado && total > 0 && lista.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Pesquisar por nome, código ou categoria"
            className="border-primary/60 pl-9 focus-visible:border-primary"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={categoria}
            onValueChange={(v) => setCategoria(v as CategoriaProduto | "todas")}
          >
            <SelectTrigger className="h-9 w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categoriasProduto.map((c) => (
                <SelectItem key={c.id} value={c.nome}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as StatusProduto | "todos")}
          >
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={handleSincronizar} title="Sincronizar com Catálogo Mestre">
            <RefreshCw className="h-4 w-4" />
            Sincronizar
          </Button>
          <Button size="sm" onClick={abrirNovo}>
            <PackagePlus className="h-4 w-4" />
            Novo produto
          </Button>
        </div>
      </div>

      {listaVazia ? (
        <EmptyState
          icon={Package}
          title="Nenhum produto cadastrado"
          description="Cadastre o primeiro produto para começar a montar seus pedidos."
          action={
            <Button onClick={abrirNovo}>
              <PackagePlus className="h-4 w-4" />
              Cadastrar produto
            </Button>
          }
        />
      ) : semResultado ? (
        <EmptyState
          icon={Search}
          title="Nenhum produto encontrado"
          description="Ajuste os filtros ou o termo de pesquisa."
        />
      ) : (
        <ProdutosTable produtos={lista} onEditar={abrirEdicao} onExcluir={setExcluindo} onRemover={setRemovendo} />
      )}

      <ProdutoFormDrawer
        aberto={formAberto}
        onFechar={() => setFormAberto(false)}
        produto={editando}
        onSalvar={handleSalvar}
      />

      <AlertDialog open={!!excluindo} onOpenChange={(v) => (!v ? setExcluindo(null) : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inativar produto?</AlertDialogTitle>
            <AlertDialogDescription>
              O produto{" "}
              <span className="font-medium text-foreground">{excluindo?.nome}</span> será
              marcado como inativo e não aparecerá em novos pedidos. Pedidos antigos serão
              preservados.
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

      <AlertDialog open={!!removendo} onOpenChange={(v) => (!v ? setRemovendo(null) : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              O produto{" "}
              <span className="font-medium text-foreground">{removendo?.nome}</span> será
              removido definitivamente do cadastro. Esta ação não pode ser desfeita.
              Pedidos antigos que já utilizaram este produto continuarão preservados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarRemocao}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
