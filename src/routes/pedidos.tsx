import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

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

import { useClientes, getClienteNome } from "@/features/clientes";
import { useAuth } from "@/features/auth/useAuth";
import {
  PagamentoModal,
  PedidoFiltros,
  PedidoFormDrawer,
  PedidoViewDrawer,
  PedidosTable,
  usePedidos,
  imprimirPedido,
  hojeISO,
  inicioMesISO,
  type FiltroRapido,
  type Pedido,
  type PedidoInput,
  type PeriodoFiltroPedido,
} from "@/features/pedidos";

export const Route = createFileRoute("/pedidos")({
  component: PedidosPage,
});

function inicioSemanaISOLocal(): string {
  const d = new Date();
  const dia = d.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  d.setDate(d.getDate() + diff);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function PedidosPage() {
  const { pedidos, hidratado, criar, atualizar, excluir, registrarPagamento } =
    usePedidos();
  const { clientes } = useClientes();

  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Pedido | null>(null);
  const [visualizando, setVisualizando] = useState<Pedido | null>(null);
  const [excluindo, setExcluindo] = useState<Pedido | null>(null);
  const [pagamentoDe, setPagamentoDe] = useState<Pedido | null>(null);

  const [termo, setTermo] = useState("");
  const [filtro, setFiltro] = useState<FiltroRapido>("todos");
  const [periodo, setPeriodo] = useState<PeriodoFiltroPedido>("todos");
  const [dataInicio, setDataInicio] = useState(hojeISO());
  const [dataFim, setDataFim] = useState(hojeISO());

  const pedidosFiltrados = useMemo(() => {
    const hoje = hojeISO();
    const semana = inicioSemanaISOLocal();
    const mes = inicioMesISO();
    const t = termo.trim().toLowerCase();

    return pedidos.filter((p) => {
      const dataPedido = p.criadoEm.slice(0, 10);

      if (periodo === "hoje" && dataPedido !== hoje) return false;
      if (periodo === "semana" && dataPedido < semana) return false;
      if (periodo === "mes" && dataPedido < mes) return false;
      if (periodo === "personalizado") {
        if (dataInicio && dataPedido < dataInicio) return false;
        if (dataFim && dataPedido > dataFim) return false;
      }

      if (filtro === "em_orcamento" && p.statusProducao !== "em_orcamento")
        return false;
      if (
        filtro === "aguardando_aprovacao" &&
        p.statusProducao !== "aguardando_aprovacao"
      )
        return false;
      if (
        filtro === "producao" &&
        !["producao", "bordado", "costura"].includes(p.statusProducao)
      )
        return false;
      if (filtro === "finalizados" && p.statusProducao !== "finalizado")
        return false;
      if (filtro === "entregues" && p.statusProducao !== "entregue") return false;
      if (filtro === "cancelados" && p.statusProducao !== "cancelado")
        return false;

      if (t) {
        const cliente = clientes.find((c) => c.id === p.clienteId);
        const nomeCliente = cliente ? getClienteNome(cliente).toLowerCase() : "";
        const alvo = [p.numero, nomeCliente, p.observacoes ?? ""]
          .join(" ")
          .toLowerCase();
        if (!alvo.includes(t)) return false;
      }

      return true;
    });
  }, [pedidos, clientes, filtro, periodo, dataInicio, dataFim, termo]);

  function abrirNovo() {
    setEditando(null);
    setFormAberto(true);
  }

  function abrirEdicao(p: Pedido) {
    setVisualizando(null);
    setEditando(p);
    setFormAberto(true);
  }

  function handleSalvar(dados: PedidoInput, id?: string) {
    if (id) {
      atualizar(id, dados);
      toast.success("Pedido atualizado.");
    } else {
      const novo = criar(dados);
      toast.success(`Pedido ${novo.numero} criado.`);
    }
  }

  function handleExcluir() {
    if (!excluindo) return;
    excluir(excluindo.id);
    toast.success("Pedido excluído.");
    setExcluindo(null);
  }

  function handleImprimir(p: Pedido) {
    const cliente = clientes.find((c) => c.id === p.clienteId) ?? null;
    imprimirPedido(p, cliente);
  }

  function handleReceberPagamento(p: Pedido) {
    setPagamentoDe(p);
  }

  const listaVazia = hidratado && pedidos.length === 0;
  const semResultado =
    hidratado && pedidos.length > 0 && pedidosFiltrados.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        description="Gerencie todos os pedidos da empresa."
        actions={
          <Button size="sm" onClick={abrirNovo}>
            <Plus className="h-4 w-4" />
            Novo pedido
          </Button>
        }
      />

      <PedidoFiltros
        termo={termo}
        onTermo={setTermo}
        filtro={filtro}
        onFiltro={setFiltro}
        periodo={periodo}
        onPeriodo={setPeriodo}
        dataInicio={dataInicio}
        dataFim={dataFim}
        onDataInicio={setDataInicio}
        onDataFim={setDataFim}
      />

      {listaVazia ? (
        <EmptyState
          icon={ShoppingBag}
          title="Nenhum pedido registrado"
          description="Crie o primeiro pedido para começar a controlar produção, financeiro e entregas."
          action={
            <Button onClick={abrirNovo}>
              <Plus className="h-4 w-4" /> Novo pedido
            </Button>
          }
        />
      ) : semResultado ? (
        <EmptyState
          icon={ShoppingBag}
          title="Nenhum pedido encontrado"
          description="Ajuste os filtros ou a busca para ver mais resultados."
        />
      ) : (
        <PedidosTable
          pedidos={pedidosFiltrados}
          onVisualizar={setVisualizando}
          onEditar={abrirEdicao}
          onExcluir={setExcluindo}
          onImprimir={handleImprimir}
          onReceberPagamento={handleReceberPagamento}
        />
      )}

      <PedidoFormDrawer
        aberto={formAberto}
        onFechar={() => setFormAberto(false)}
        pedido={editando}
        onSalvar={handleSalvar}
      />

      <PedidoViewDrawer
        pedido={visualizando}
        aberto={!!visualizando}
        onFechar={() => setVisualizando(null)}
        onEditar={abrirEdicao}
        onImprimir={handleImprimir}
        onReceberPagamento={handleReceberPagamento}
      />

      <PagamentoModal
        aberto={!!pagamentoDe}
        onFechar={() => setPagamentoDe(null)}
        pedido={pagamentoDe}
        onConfirmar={(dados) => {
          if (pagamentoDe) {
            registrarPagamento(pagamentoDe.id, dados);
            toast.success("Pagamento registrado.");
          }
        }}
      />

      <AlertDialog
        open={!!excluindo}
        onOpenChange={(v) => (!v ? setExcluindo(null) : null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O pedido{" "}
              <span className="font-medium text-foreground">
                {excluindo?.numero}
              </span>{" "}
              será removido do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExcluir}
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
