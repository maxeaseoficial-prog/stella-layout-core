import { useMemo, useState } from "react";
import { Plus, Puzzle, Search } from "lucide-react";
import { toast } from "sonner";

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

import { AdicionalFormDrawer } from "./AdicionalFormDrawer";
import { AdicionaisTable } from "./AdicionaisTable";
import { useAdicionais } from "./useAdicionais";
import type {
  Adicional,
  AdicionalInput,
  StatusAdicional,
  TipoAdicional,
} from "./types";
import { LABEL_TIPO_ADICIONAL, TIPOS_ADICIONAL } from "./types";

export function AdicionaisPanel() {
  const { adicionais, hidratado, criar, atualizar, excluir, remover, filtrar } = useAdicionais();

  const [termo, setTermo] = useState("");
  const [tipo, setTipo] = useState<TipoAdicional | "todos">("todos");
  const [status, setStatus] = useState<StatusAdicional | "todos">("todos");
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Adicional | null>(null);
  const [excluindo, setExcluindo] = useState<Adicional | null>(null);
  const [removendo, setRemovendo] = useState<Adicional | null>(null);

  const lista = useMemo(() => {
    let l = filtrar(termo);
    if (tipo !== "todos") l = l.filter((a) => a.tipo === tipo);
    if (status !== "todos") l = l.filter((a) => a.status === status);
    return l;
  }, [filtrar, termo, tipo, status]);

  function abrirNovo() {
    setEditando(null);
    setFormAberto(true);
  }

  function abrirEdicao(a: Adicional) {
    setEditando(a);
    setFormAberto(true);
  }

  function handleSalvar(dados: AdicionalInput, id?: string) {
    if (id) {
      atualizar(id, dados);
      toast.success("Adicional atualizado com sucesso.");
    } else {
      criar(dados);
      toast.success("Adicional cadastrado com sucesso.");
    }
    setFormAberto(false);
  }

  function confirmarExclusao() {
    if (!excluindo) return;
    excluir(excluindo.id);
    toast.success("Adicional marcado como inativo.");
    setExcluindo(null);
  }

  function confirmarRemocao() {
    if (!removendo) return;
    remover(removendo.id);
    toast.success("Adicional excluído permanentemente.");
    setRemovendo(null);
  }

  const total = adicionais.length;
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
            placeholder="Pesquisar por nome, tipo ou categoria"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={tipo}
            onValueChange={(v) => setTipo(v as TipoAdicional | "todos")}
          >
            <SelectTrigger className="h-9 w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              {TIPOS_ADICIONAL.map((t) => (
                <SelectItem key={t} value={t}>
                  {LABEL_TIPO_ADICIONAL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as StatusAdicional | "todos")}
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
          <Button size="sm" onClick={abrirNovo}>
            <Plus className="h-4 w-4" />
            Novo adicional
          </Button>
        </div>
      </div>

      {listaVazia ? (
        <EmptyState
          icon={Puzzle}
          title="Nenhum adicional cadastrado"
          description="Cadastre botões, tecidos, acabamentos e outros extras aplicáveis aos produtos."
          action={
            <Button onClick={abrirNovo}>
              <Plus className="h-4 w-4" />
              Cadastrar adicional
            </Button>
          }
        />
      ) : semResultado ? (
        <EmptyState
          icon={Search}
          title="Nenhum adicional encontrado"
          description="Ajuste os filtros ou o termo de pesquisa."
        />
      ) : (
        <AdicionaisTable adicionais={lista} onEditar={abrirEdicao} onExcluir={setExcluindo} onRemover={setRemovendo} />
      )}

      <AdicionalFormDrawer
        aberto={formAberto}
        onFechar={() => setFormAberto(false)}
        adicional={editando}
        onSalvar={handleSalvar}
      />

      <AlertDialog open={!!excluindo} onOpenChange={(v) => (!v ? setExcluindo(null) : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inativar adicional?</AlertDialogTitle>
            <AlertDialogDescription>
              O adicional{" "}
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
    </div>
  );
}
