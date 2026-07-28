import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ClipboardList, Plus, Search, CheckCircle2, AlertCircle, ListChecks } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTarefas } from "@/features/tarefas/useTarefas";
import { TarefaCard } from "@/features/tarefas/TarefaCard";
import { TarefaFormDialog } from "@/features/tarefas/TarefaFormDialog";
import { TarefaDetalhesDialog } from "@/features/tarefas/TarefaDetalhesDialog";
import type { Prioridade, Tarefa, TarefaInput, TipoTarefa } from "@/features/tarefas/types";

export const Route = createFileRoute("/tarefas")({
  head: () => ({
    meta: [
      { title: "Tarefas — Stella" },
      { name: "description", content: "Lista pessoal de tarefas e checklists do operador matriz." },
      { property: "og:title", content: "Tarefas — Stella" },
      { property: "og:description", content: "Lista pessoal de tarefas e checklists do operador matriz." },
    ],
  }),
  component: TarefasPage,
});

type FiltroPrioridade = "todos" | Prioridade;
type FiltroTipo = "todos" | TipoTarefa;
type FiltroStatus = "todos" | "pendentes" | "concluidas";

function ehHoje(iso: string | null) {
  if (!iso) return false;
  const d = new Date(iso);
  const h = new Date();
  return (
    d.getFullYear() === h.getFullYear() &&
    d.getMonth() === h.getMonth() &&
    d.getDate() === h.getDate()
  );
}

function TarefasPage() {
  const {
    tarefas,
    hidratado,
    criar,
    atualizar,
    excluir,
    marcarConcluida,
    alternarItem,
    adicionarItem,
    removerItem,
  } = useTarefas();

  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Tarefa | null>(null);
  const [excluindo, setExcluindo] = useState<Tarefa | null>(null);
  const [detalhando, setDetalhando] = useState<Tarefa | null>(null);

  const [termo, setTermo] = useState("");
  const [fPrioridade, setFPrioridade] = useState<FiltroPrioridade>("todos");
  const [fTipo, setFTipo] = useState<FiltroTipo>("todos");
  const [fStatus, setFStatus] = useState<FiltroStatus>("todos");

  const filtradas = useMemo(() => {
    const t = termo.trim().toLowerCase();
    return tarefas.filter((tf) => {
      if (fPrioridade !== "todos" && tf.prioridade !== fPrioridade) return false;
      if (fTipo !== "todos" && tf.tipo !== fTipo) return false;
      if (fStatus === "pendentes" && tf.concluida) return false;
      if (fStatus === "concluidas" && !tf.concluida) return false;
      if (t) {
        const alvo = [
          tf.titulo,
          tf.descricao ?? "",
          ...tf.itens.map((i) => i.texto),
        ]
          .join(" ")
          .toLowerCase();
        if (!alvo.includes(t)) return false;
      }
      return true;
    });
  }, [tarefas, termo, fPrioridade, fTipo, fStatus]);

  const pendentes = filtradas.filter((t) => !t.concluida);
  const concluidasHoje = filtradas.filter((t) => t.concluida && ehHoje(t.concluida_em));
  const outrasConcluidas = filtradas.filter(
    (t) => t.concluida && !ehHoje(t.concluida_em),
  );

  const stats = {
    pendentes: tarefas.filter((t) => !t.concluida).length,
    concluidasHoje: tarefas.filter((t) => t.concluida && ehHoje(t.concluida_em)).length,
    alta: tarefas.filter((t) => !t.concluida && t.prioridade === "alta").length,
    checklists: tarefas.filter((t) => t.tipo === "checklist").length,
  };

  function abrirNova() {
    setEditando(null);
    setFormAberto(true);
  }

  function abrirEdicao(t: Tarefa) {
    setEditando(t);
    setFormAberto(true);
  }

  async function handleSalvar(input: TarefaInput, id?: string) {
    try {
      if (id) {
        await atualizar(id, {
          titulo: input.titulo,
          descricao: input.descricao ?? null,
          prioridade: input.prioridade,
          tipo: input.tipo,
          itens: input.tipo === "checklist" ? (input.itens ?? []) : [],
        });
        toast.success("Tarefa atualizada.");
      } else {
        await criar(input);
        toast.success("Tarefa criada.");
      }
    } catch {
      toast.error("Não foi possível salvar a tarefa.");
    }
  }

  async function handleConfirmarExclusao() {
    if (!excluindo) return;
    try {
      await excluir(excluindo.id);
      toast.success("Tarefa excluída.");
    } catch {
      toast.error("Erro ao excluir tarefa.");
    } finally {
      setExcluindo(null);
    }
  }

  function renderLista(lista: Tarefa[]) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {lista.map((t) => (
          <TarefaCard
            key={t.id}
            tarefa={t}
            onToggle={(c) => marcarConcluida(t.id, c)}
            onToggleItem={(itemId) => alternarItem(t.id, itemId)}
            onAdicionarItem={(texto) => adicionarItem(t.id, texto)}
            onRemoverItem={(itemId) => removerItem(t.id, itemId)}
            onEditar={() => abrirEdicao(t)}
            onExcluir={() => setExcluindo(t)}
            onVerDetalhes={() => setDetalhando(t)}
          />
        ))}
      </div>
    );
  }

  function renderSecao(titulo: string, lista: Tarefa[]) {
    if (lista.length === 0) return null;
    return (
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {titulo} <span className="text-muted-foreground/70">({lista.length})</span>
        </h3>
        {renderLista(lista)}
      </section>
    );
  }

  const listaVazia = hidratado && tarefas.length === 0;
  const semResultado = hidratado && tarefas.length > 0 && filtradas.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tarefas"
        description="Sua lista pessoal de tarefas e checklists."
        actions={
          <Button size="sm" onClick={abrirNova}>
            <Plus className="h-4 w-4" />
            Nova tarefa
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pendentes" value={String(stats.pendentes)} icon={ClipboardList} />
        <StatCard label="Concluídas hoje" value={String(stats.concluidasHoje)} icon={CheckCircle2} />
        <StatCard label="Prioridade alta" value={String(stats.alta)} icon={AlertCircle} />
        <StatCard label="Checklists" value={String(stats.checklists)} icon={ListChecks} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Pesquisar tarefa…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={fPrioridade} onValueChange={(v) => setFPrioridade(v as FiltroPrioridade)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas prioridades</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
          <Select value={fTipo} onValueChange={(v) => setFTipo(v as FiltroTipo)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos tipos</SelectItem>
              <SelectItem value="tarefa">Tarefas</SelectItem>
              <SelectItem value="checklist">Checklists</SelectItem>
            </SelectContent>
          </Select>
          <Select value={fStatus} onValueChange={(v) => setFStatus(v as FiltroStatus)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="pendentes">Pendentes</SelectItem>
              <SelectItem value="concluidas">Concluídas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {listaVazia ? (
        <EmptyState
          icon={ClipboardList}
          title="Sem tarefas ainda"
          description="Crie sua primeira tarefa ou checklist para organizar o dia."
          action={
            <Button onClick={abrirNova}>
              <Plus className="h-4 w-4" />
              Nova tarefa
            </Button>
          }
        />
      ) : semResultado ? (
        <EmptyState
          icon={Search}
          title="Nenhuma tarefa encontrada"
          description="Ajuste a busca ou os filtros para ver mais resultados."
        />
      ) : (
        <div className="space-y-8">
          {renderSecao("Pendentes", pendentes)}
          {renderSecao("Concluídas hoje", concluidasHoje)}
          {renderSecao("Concluídas", outrasConcluidas)}
        </div>
      )}

      <TarefaFormDialog
        aberto={formAberto}
        onFechar={() => setFormAberto(false)}
        onSalvar={handleSalvar}
        editando={editando}
      />

      <TarefaDetalhesDialog
        tarefa={detalhando}
        open={!!detalhando}
        onOpenChange={(o) => (!o ? setDetalhando(null) : null)}
        onEditar={(t) => abrirEdicao(t)}
      />

      <AlertDialog open={!!excluindo} onOpenChange={(o) => (!o ? setExcluindo(null) : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente excluir esta tarefa? Esta ação não pode ser desfeita.
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
