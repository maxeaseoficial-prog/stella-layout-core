import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Truck } from "lucide-react";
import { toast } from "@/lib/toast";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  FornecedorFormDrawer,
  FornecedorViewDrawer,
  FornecedoresTable,
  useFornecedores,
} from "@/features/fornecedores";
import type {
  Fornecedor,
  FornecedorInput,
  StatusFornecedor,
} from "@/features/fornecedores";

export const Route = createFileRoute("/fornecedores")({
  component: FornecedoresPage,
});

function FornecedoresPage() {
  const { fornecedores, hidratado, criar, atualizar, alternarStatus, filtrar } =
    useFornecedores();

  const [termo, setTermo] = useState("");
  const [status, setStatus] = useState<StatusFornecedor | "todos">("todos");
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Fornecedor | null>(null);
  const [visualizando, setVisualizando] = useState<Fornecedor | null>(null);

  const lista = useMemo(() => {
    let l = filtrar(termo);
    if (status !== "todos") l = l.filter((f) => f.status === status);
    return l;
  }, [filtrar, termo, status]);

  function abrirNovo() {
    setEditando(null);
    setFormAberto(true);
  }

  function abrirEdicao(f: Fornecedor) {
    setVisualizando(null);
    setEditando(f);
    setFormAberto(true);
  }

  function handleSalvar(dados: FornecedorInput, id?: string) {
    if (id) {
      atualizar(id, dados);
      toast.success("Fornecedor atualizado com sucesso.");
    } else {
      criar(dados);
      toast.success("Fornecedor cadastrado com sucesso.");
    }
    setFormAberto(false);
  }

  function handleAlternarStatus(f: Fornecedor) {
    alternarStatus(f.id);
    toast.success(
      f.status === "ativo" ? "Fornecedor inativado." : "Fornecedor ativado.",
    );
  }

  const total = fornecedores.length;
  const listaVazia = hidratado && total === 0;
  const semResultado = hidratado && total > 0 && lista.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fornecedores"
        description="Gerencie todos os fornecedores da empresa."
        actions={
          <Button size="sm" onClick={abrirNovo}>
            <Plus className="h-4 w-4" />
            Novo fornecedor
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Pesquisar por empresa, representante, telefone ou cidade"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as StatusFornecedor | "todos")}
        >
          <SelectTrigger className="h-9 w-full sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="inativo">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {listaVazia ? (
        <EmptyState
          icon={Truck}
          title="Nenhum fornecedor cadastrado"
          description="Cadastre o primeiro fornecedor para começar a montar sua rede de parceiros."
          action={
            <Button onClick={abrirNovo}>
              <Plus className="h-4 w-4" />
              Cadastrar fornecedor
            </Button>
          }
        />
      ) : semResultado ? (
        <EmptyState
          icon={Search}
          title="Nenhum fornecedor encontrado"
          description="Ajuste os filtros ou o termo de pesquisa."
        />
      ) : (
        <FornecedoresTable
          fornecedores={lista}
          onAbrir={setVisualizando}
          onEditar={abrirEdicao}
          onAlternarStatus={handleAlternarStatus}
        />
      )}

      <FornecedorFormDrawer
        aberto={formAberto}
        onFechar={() => setFormAberto(false)}
        fornecedor={editando}
        onSalvar={handleSalvar}
      />

      <FornecedorViewDrawer
        aberto={!!visualizando}
        fornecedor={visualizando}
        onFechar={() => setVisualizando(null)}
        onEditar={abrirEdicao}
      />
    </div>
  );
}
