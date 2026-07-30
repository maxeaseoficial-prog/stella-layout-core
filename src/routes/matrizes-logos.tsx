import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FolderOpen, Plus } from "lucide-react";
import { toast } from "@/lib/toast";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
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
  ArquivoFormDrawer,
  ArquivoViewDrawer,
  ArquivosFiltros,
  ArquivosStatsCards,
  ArquivosTable,
  filtrarArquivos,
  useArquivos,
  type Arquivo,
  type ArquivoInput,
  type FiltroTipo,
} from "@/features/arquivos";
import { getClienteNome, useClientes } from "@/features/clientes";

export const Route = createFileRoute("/matrizes-logos")({
  component: MatrizesLogosPage,
});

function MatrizesLogosPage() {
  const { arquivos, hidratado, stats, criar, atualizar, excluir } = useArquivos();
  const { buscarPorId } = useClientes();

  const [termo, setTermo] = useState("");
  const [tipo, setTipo] = useState<FiltroTipo>("todos");
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Arquivo | null>(null);
  const [visualizando, setVisualizando] = useState<Arquivo | null>(null);
  const [excluindo, setExcluindo] = useState<Arquivo | null>(null);

  const nomeCliente = (id: string) => {
    const c = buscarPorId(id);
    return c ? getClienteNome(c) : "";
  };

  const filtrados = useMemo(
    () => filtrarArquivos(arquivos, { termo, tipo, nomeCliente }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [arquivos, termo, tipo],
  );

  function abrirNovo() {
    setEditando(null);
    setFormAberto(true);
  }

  function abrirEdicao(a: Arquivo) {
    setVisualizando(null);
    setEditando(a);
    setFormAberto(true);
  }

  function handleSalvar(dados: ArquivoInput, id?: string) {
    if (id) {
      atualizar(id, dados);
      toast.success("Arquivo atualizado.");
    } else {
      criar(dados);
      toast.success("Arquivo cadastrado.");
    }
    setFormAberto(false);
  }

  function handleConfirmarExclusao() {
    if (!excluindo) return;
    excluir(excluindo.id);
    toast.success("Arquivo excluído.");
    setExcluindo(null);
  }

  const totalArquivos = arquivos.length;
  const listaVazia = hidratado && totalArquivos === 0;
  const semResultado =
    hidratado && totalArquivos > 0 && filtrados.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matrizes & Logos"
        description="Gerencie todas as logos, matrizes e arquivos utilizados na produção."
        actions={
          <Button size="sm" onClick={abrirNovo}>
            <Plus className="h-4 w-4" />
            Novo Arquivo
          </Button>
        }
      />

      <ArquivosStatsCards
        clientesComArquivos={stats.clientesComArquivos}
        logos={stats.logos}
        matrizes={stats.matrizes}
        outros={stats.outros}
      />

      <ArquivosFiltros
        termo={termo}
        onTermo={setTermo}
        tipo={tipo}
        onTipo={setTipo}
      />

      {listaVazia ? (
        <EmptyState
          icon={FolderOpen}
          title="Nenhum arquivo cadastrado"
          description="Cadastre logos, matrizes de bordado e artes vinculadas aos clientes."
          action={
            <Button onClick={abrirNovo}>
              <Plus className="h-4 w-4" />
              Novo Arquivo
            </Button>
          }
        />
      ) : semResultado ? (
        <EmptyState
          icon={FolderOpen}
          title="Nenhum arquivo encontrado"
          description="Tente ajustar a pesquisa ou os filtros de tipo."
        />
      ) : (
        <ArquivosTable
          arquivos={filtrados}
          onVisualizar={setVisualizando}
          onEditar={abrirEdicao}
          onExcluir={setExcluindo}
        />
      )}

      <ArquivoFormDrawer
        aberto={formAberto}
        onFechar={() => setFormAberto(false)}
        arquivo={editando}
        onSalvar={handleSalvar}
      />

      <ArquivoViewDrawer
        arquivo={visualizando}
        aberto={!!visualizando}
        onFechar={() => setVisualizando(null)}
        onEditar={abrirEdicao}
      />

      <AlertDialog
        open={!!excluindo}
        onOpenChange={(v) => (!v ? setExcluindo(null) : null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir arquivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O arquivo{" "}
              <span className="font-medium text-foreground">
                {excluindo?.nome}
              </span>{" "}
              será removido permanentemente.
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
