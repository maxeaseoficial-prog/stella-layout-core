import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, UserPlus, Users } from "lucide-react";
import { toast } from "@/lib/toast";

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
  ClienteFormDrawer,
  ClientesTable,
  ClienteViewDrawer,
  useClientes,
  type Cliente,
  type ClienteInput,
} from "@/features/clientes";
import { useAuth } from "@/features/auth/useAuth";

export const Route = createFileRoute("/clientes")({
  component: ClientesPage,
});

function ClientesPage() {
  const { clientes, hidratado, criar, atualizar, excluir, filtrar } = useClientes();
  const { capacidades } = useAuth();
  const cap = capacidades.clientes;

  const [termo, setTermo] = useState("");
  const [formAberto, setFormAberto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [clienteVisualizando, setClienteVisualizando] = useState<Cliente | null>(null);
  const [clienteExcluindo, setClienteExcluindo] = useState<Cliente | null>(null);

  const clientesFiltrados = useMemo(() => filtrar(termo), [filtrar, termo]);

  function abrirNovo() {
    setClienteEditando(null);
    setFormAberto(true);
  }

  function abrirEdicao(cliente: Cliente) {
    setClienteVisualizando(null);
    setClienteEditando(cliente);
    setFormAberto(true);
  }

  function handleSalvar(dados: ClienteInput, id?: string) {
    if (id) {
      atualizar(id, dados);
      toast.success("Cliente atualizado com sucesso.");
      setFormAberto(false);
      return;
    }
    const resultado = criar(dados);
    if (!resultado.ok) {
      toast.error("Este cliente já está cadastrado.");
      return;
    }
    toast.success("Cliente cadastrado com sucesso.");
    setFormAberto(false);
  }

  function handleConfirmarExclusao() {
    if (!clienteExcluindo) return;
    excluir(clienteExcluindo.id);
    toast.success("Cliente excluído.");
    setClienteExcluindo(null);
  }

  const totalClientes = clientes.length;
  const semResultado = hidratado && totalClientes > 0 && clientesFiltrados.length === 0;
  const listaVazia = hidratado && totalClientes === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gerencie a base de clientes da Stella."
        actions={
          cap.criar ? (
            <Button size="sm" onClick={abrirNovo}>
              <UserPlus className="h-4 w-4" />
              Novo cliente
            </Button>
          ) : null
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Pesquisar por nome, empresa, responsável ou telefone"
            className="pl-9"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {totalClientes} cliente{totalClientes === 1 ? "" : "s"} cadastrado
          {totalClientes === 1 ? "" : "s"}
        </p>
      </div>

      {listaVazia ? (
        <EmptyState
          icon={Users}
          title="Nenhum cliente cadastrado"
          description={
            cap.criar
              ? "Cadastre o primeiro cliente da Stella para começar a organizar sua base."
              : "Ainda não há clientes cadastrados na base."
          }
          action={
            cap.criar ? (
              <Button onClick={abrirNovo}>
                <UserPlus className="h-4 w-4" />
                Cadastrar cliente
              </Button>
            ) : undefined
          }
        />
      ) : semResultado ? (
        <EmptyState
          icon={Search}
          title="Nenhum cliente encontrado"
          description={`Não encontramos clientes com o termo "${termo}".`}
        />
      ) : (
        <ClientesTable
          clientes={clientesFiltrados}
          onVisualizar={setClienteVisualizando}
          onEditar={abrirEdicao}
          onExcluir={setClienteExcluindo}
        />
      )}

      <ClienteFormDrawer
        aberto={formAberto}
        onFechar={() => setFormAberto(false)}
        cliente={clienteEditando}
        onSalvar={handleSalvar}
      />

      <ClienteViewDrawer
        cliente={clienteVisualizando}
        aberto={!!clienteVisualizando}
        onFechar={() => setClienteVisualizando(null)}
        onEditar={abrirEdicao}
      />

      <AlertDialog
        open={!!clienteExcluindo}
        onOpenChange={(v) => (!v ? setClienteExcluindo(null) : null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O cliente{" "}
              <span className="font-medium text-foreground">
                {clienteExcluindo?.tipo === "empresa"
                  ? clienteExcluindo.nomeEmpresa
                  : clienteExcluindo?.nome}
              </span>{" "}
              será removido permanentemente da base.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmarExclusao}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
