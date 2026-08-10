import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Wallet } from "lucide-react";
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
  CaixaFiltros,
  CaixaStatsCards,
  FecharCaixaDialog,
  MovimentacaoFormDrawer,
  MovimentacaoViewDialog,
  MovimentacoesTable,
  useCaixa,
  type Movimentacao,
  type MovimentacaoInput,
  LABEL_CATEGORIA,
  LABEL_FORMA_PAGAMENTO,
} from "@/features/caixa";
import {
  hojeISO,
  inicioMesISO,
  inicioSemanaISO,
} from "@/features/caixa/utils";
import type { PeriodoFiltro, TipoFiltro } from "@/features/caixa/CaixaFiltros";

export const Route = createFileRoute("/caixa")({
  component: CaixaPage,
});

function CaixaPage() {
  const {
    movimentacoes,
    hidratado,
    totais,
    criar,
    atualizar,
    excluir,
    excluirVarios,
    fecharDia,
  } = useCaixa();

  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Movimentacao | null>(null);
  const [visualizando, setVisualizando] = useState<Movimentacao | null>(null);
  const [excluindo, setExcluindo] = useState<Movimentacao | null>(null);
  const [fecharAberto, setFecharAberto] = useState(false);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [confirmarMassa, setConfirmarMassa] = useState(false);

  const [termo, setTermo] = useState("");
  const [periodo, setPeriodo] = useState<PeriodoFiltro>("todos");
  const [tipo, setTipo] = useState<TipoFiltro>("todos");
  const [dataInicio, setDataInicio] = useState(hojeISO());
  const [dataFim, setDataFim] = useState(hojeISO());


  const movimentacoesFiltradas = useMemo(() => {
    const hoje = hojeISO();
    const semana = inicioSemanaISO();
    const mes = inicioMesISO();
    const t = termo.trim().toLowerCase();

    return movimentacoes.filter((m) => {
      if (tipo !== "todos" && m.tipo !== tipo) return false;

      if (periodo === "hoje" && m.data !== hoje) return false;
      if (periodo === "semana" && m.data < semana) return false;
      if (periodo === "mes" && m.data < mes) return false;
      if (periodo === "personalizado") {
        if (dataInicio && m.data < dataInicio) return false;
        if (dataFim && m.data > dataFim) return false;
      }

      if (t) {
        const alvo = [
          m.descricao,
          LABEL_CATEGORIA[m.categoria],
          LABEL_FORMA_PAGAMENTO[m.formaPagamento],
          m.valor.toFixed(2),
          m.valor.toFixed(2).replace(".", ","),
        ]
          .join(" ")
          .toLowerCase();
        if (!alvo.includes(t)) return false;
      }

      return true;
    });
  }, [movimentacoes, periodo, tipo, dataInicio, dataFim, termo]);

  const limparSelecao = useCallback(() => setSelecionados(new Set()), []);

  // Qualquer mudança de filtro limpa a seleção (evita agir em itens ocultos).
  useEffect(() => {
    setSelecionados(new Set());
  }, [termo, periodo, tipo, dataInicio, dataFim]);

  // Remove da seleção itens que deixaram de existir.
  useEffect(() => {
    setSelecionados((atual) => {
      if (atual.size === 0) return atual;
      const existentes = new Set(movimentacoes.map((m) => m.id));
      const proximo = new Set(Array.from(atual).filter((id) => existentes.has(id)));
      return proximo.size === atual.size ? atual : proximo;
    });
  }, [movimentacoes]);

  function alternarSelecao(id: string, selecionado: boolean) {
    setSelecionados((atual) => {
      const proximo = new Set(atual);
      if (selecionado) proximo.add(id);
      else proximo.delete(id);
      return proximo;
    });
  }

  function alternarTodos(selecionado: boolean) {
    setSelecionados(
      selecionado ? new Set(movimentacoesFiltradas.map((m) => m.id)) : new Set(),
    );
  }

  const totalSelecionados = selecionados.size;


  function abrirNova() {
    setEditando(null);
    setFormAberto(true);
  }

  function abrirEdicao(m: Movimentacao) {
    setVisualizando(null);
    setEditando(m);
    setFormAberto(true);
  }

  function handleSalvar(dados: MovimentacaoInput, id?: string) {
    if (id) {
      atualizar(id, dados);
      toast.success("Movimentação atualizada.");
    } else {
      criar(dados);
      toast.success("Movimentação registrada.");
    }
  }

  function handleConfirmarExclusao() {
    if (!excluindo) return;
    const ok = excluir(excluindo.id);
    if (ok) {
      toast.success("Movimentação excluída.");
      limparSelecao();
    } else {
      toast.error("Não foi possível excluir a movimentação.");
    }
    setExcluindo(null);
  }

  function handleConfirmarExclusaoMassa() {
    const ids = Array.from(selecionados);
    const ok = excluirVarios(ids);
    if (ok) {
      toast.success(
        ids.length === 1
          ? "Movimentação excluída."
          : `${ids.length} movimentações excluídas.`,
      );
      limparSelecao();
    } else {
      toast.error(
        ids.length === 1
          ? "Não foi possível excluir a movimentação."
          : "Não foi possível excluir as movimentações.",
      );
    }
    setConfirmarMassa(false);
  }


  function handleFecharCaixa(opts: { data: string; saldoInicial: number }) {
    const f = fecharDia(opts);
    toast.success(
      `Caixa fechado. Saldo final: ${f.saldoFinal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
    );
  }

  const listaVazia = hidratado && movimentacoes.length === 0;
  const semResultado =
    hidratado && movimentacoes.length > 0 && movimentacoesFiltradas.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Caixa"
        description="Movimentações de entrada, saída e fechamento diário."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setFecharAberto(true)}>
              Fechar caixa
            </Button>
            <Button size="sm" onClick={abrirNova}>
              <Plus className="h-4 w-4" />
              Nova movimentação
            </Button>
          </>
        }
      />

      <CaixaStatsCards
        saldo={totais.saldo}
        entradas={totais.entradas}
        saidas={totais.saidas}
        resultado={totais.resultado}
      />

      <CaixaFiltros
        termo={termo}
        onTermo={setTermo}
        periodo={periodo}
        onPeriodo={setPeriodo}
        tipo={tipo}
        onTipo={setTipo}
        dataInicio={dataInicio}
        dataFim={dataFim}
        onDataInicio={setDataInicio}
        onDataFim={setDataFim}
      />

      {listaVazia ? (
        <EmptyState
          icon={Wallet}
          title="Sem movimentações"
          description="Registre a primeira entrada ou saída para começar o controle do caixa."
          action={
            <Button onClick={abrirNova}>
              <Plus className="h-4 w-4" />
              Nova movimentação
            </Button>
          }
        />
      ) : semResultado ? (
        <EmptyState
          icon={Wallet}
          title="Nenhuma movimentação encontrada"
          description="Ajuste os filtros ou a busca para ver mais resultados."
        />
      ) : (
        <MovimentacoesTable
          movimentacoes={movimentacoesFiltradas}
          onVisualizar={setVisualizando}
          onEditar={abrirEdicao}
          onExcluir={setExcluindo}
        />
      )}

      <MovimentacaoFormDrawer
        aberto={formAberto}
        onFechar={() => setFormAberto(false)}
        movimentacao={editando}
        onSalvar={handleSalvar}
      />

      <MovimentacaoViewDialog
        movimentacao={visualizando}
        aberto={!!visualizando}
        onFechar={() => setVisualizando(null)}
      />

      <FecharCaixaDialog
        aberto={fecharAberto}
        onFechar={() => setFecharAberto(false)}
        movimentacoes={movimentacoes}
        onConfirmar={handleFecharCaixa}
      />

      <AlertDialog
        open={!!excluindo}
        onOpenChange={(v) => (!v ? setExcluindo(null) : null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir movimentação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A movimentação{" "}
              <span className="font-medium text-foreground">
                {excluindo?.descricao}
              </span>{" "}
              será removida do caixa.
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
