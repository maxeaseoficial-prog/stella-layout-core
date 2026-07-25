import { useEffect, useRef, useState } from "react";
import {
  Trash2,
  PencilLine,
  AlertTriangle,
  ClipboardList,
  Cog,
  CheckCircle2,
  Truck,
  Inbox,
  Calendar,
  Package,
  CircleDollarSign,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
import { LABEL_PENDENCIA_ADICIONAL } from "@/features/adicionais";

import type { EtapaKanban, Pedido } from "./types";
import {
  ETAPAS_KANBAN,
  LABEL_BADGE,
  LABEL_ETAPA_KANBAN,
  LABEL_STATUS_FINANCEIRO,
} from "./types";
import { usePedidos } from "./usePedidos";
import {
  corStatusFinanceiro,
  formatarDataBR,
  formatarMoeda,
  pendenciasDoPedido,
  totalItensPedido,
} from "./utils";

const ICONE_ETAPA: Record<EtapaKanban, LucideIcon> = {
  em_elaboracao: PencilLine,
  pendencias_orcamento: AlertTriangle,
  aguardando_aprovacao: ClipboardList,
  em_producao: Cog,
  finalizado: CheckCircle2,
  entregue: Truck,
};

// Estilo de acento do cabeçalho da coluna (borda superior + halo suave).
const ACENTO_ETAPA: Record<EtapaKanban, { bar: string; icon: string; badge: string }> = {
  em_elaboracao: {
    bar: "bg-slate-400/70",
    icon: "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300",
    badge: "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200",
  },
  pendencias_orcamento: {
    bar: "bg-orange-400/80",
    icon: "bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-300",
    badge: "border-orange-200 bg-orange-100 text-orange-800 dark:border-orange-900 dark:bg-orange-950/50 dark:text-orange-200",
  },
  aguardando_aprovacao: {
    bar: "bg-amber-400/80",
    icon: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    badge: "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
  },
  em_producao: {
    bar: "bg-blue-400/80",
    icon: "bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300",
    badge: "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200",
  },
  finalizado: {
    bar: "bg-emerald-400/80",
    icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    badge: "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
  },
  entregue: {
    bar: "bg-zinc-400/80",
    icon: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
    badge: "border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100",
  },
};

interface Props {
  pedidos: Pedido[];
  onAbrir: (p: Pedido) => void;
  etapasVisiveis?: EtapaKanban[];
}

export function PedidosKanban({ pedidos, onAbrir, etapasVisiveis }: Props) {
  const ativos = pedidos.filter((p) => p.statusFinanceiro !== "cancelado");

  const porColuna: Record<EtapaKanban, Pedido[]> = {
    em_elaboracao: [],
    pendencias_orcamento: [],
    aguardando_aprovacao: [],
    em_producao: [],
    finalizado: [],
    entregue: [],
  };
  for (const p of ativos) porColuna[p.etapa].push(p);

  const colunas =
    etapasVisiveis && etapasVisiveis.length > 0 ? etapasVisiveis : ETAPAS_KANBAN;

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let pointerId: number | null = null;
    let moved = false;
    let startX = 0;
    let startScroll = 0;
    let suppressClick = false;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 || e.pointerType === "touch") return;
      const target = e.target as HTMLElement;
      if (target.closest("button, a, input, textarea, select, [role='menu']")) return;
      pointerId = e.pointerId;
      moved = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
    };

    const applyDelta = (clientX: number) => {
      const dx = clientX - startX;
      if (!moved) {
        if (Math.abs(dx) < 4) return;
        moved = true;
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
        try {
          el.setPointerCapture(pointerId!);
        } catch {}
      }
      el.scrollLeft = startScroll - dx;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (pointerId === null || e.pointerId !== pointerId) return;
      // Consume every coalesced sample the OS captured between frames so the
      // drag matches the native scrollbar's compositor-driven smoothness.
      const events =
        typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : [];
      if (events.length > 0) {
        for (const ev of events) applyDelta(ev.clientX);
      } else {
        applyDelta(e.clientX);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (pointerId === null || e.pointerId !== pointerId) return;
      const wasMoved = moved;
      try {
        el.releasePointerCapture(pointerId);
      } catch {}
      pointerId = null;
      moved = false;
      if (wasMoved) {
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        suppressClick = true;
        setTimeout(() => {
          suppressClick = false;
        }, 0);
      }
    };

    const onClickCapture = (e: MouseEvent) => {
      if (suppressClick) {
        e.stopPropagation();
        e.preventDefault();
        suppressClick = false;
      }
    };

    const onDragStart = (e: DragEvent) => {
      if (pointerId !== null) e.preventDefault();
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("click", onClickCapture, true);
    el.addEventListener("dragstart", onDragStart);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("click", onClickCapture, true);
      el.removeEventListener("dragstart", onDragStart);
    };
  }, []);


  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const el = scrollRef.current;
    if (!el) return;
    const alvo = e.target as HTMLElement;
    if (alvo.closest("input, textarea, select, [contenteditable='true']")) return;
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const passo = 324;
    el.scrollBy({ left: e.key === "ArrowRight" ? passo : -passo, behavior: "smooth" });
  }

  return (
    <div
      ref={scrollRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="scrollbar-thin -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-4 pt-1 cursor-grab focus:outline-none"
    >
      {colunas.map((etapa) => (
        <ColunaKanban
          key={etapa}
          etapa={etapa}
          pedidos={porColuna[etapa]}
          onAbrir={onAbrir}
        />
      ))}
    </div>
  );
}

function ColunaKanban({
  etapa,
  pedidos,
  onAbrir,
}: {
  etapa: EtapaKanban;
  pedidos: Pedido[];
  onAbrir: (p: Pedido) => void;
}) {
  const Icon = ICONE_ETAPA[etapa];
  const acento = ACENTO_ETAPA[etapa];

  return (
    <div className="flex w-[300px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border/70 bg-surface-muted/40 shadow-[var(--shadow-soft)] sm:w-[320px]">
      <div className={cn("h-[3px] w-full", acento.bar)} />
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-surface/60 px-4 py-3 backdrop-blur-sm">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "grid h-7 w-7 place-items-center rounded-lg",
              acento.icon,
            )}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
          </span>
          <span className="truncate text-[13px] font-semibold tracking-tight text-foreground">
            {LABEL_ETAPA_KANBAN[etapa]}
          </span>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "h-6 min-w-[1.75rem] justify-center rounded-full border px-2 text-[11px] font-semibold tabular-nums",
            acento.badge,
          )}
        >
          {pedidos.length}
        </Badge>
      </div>
      <ul className="flex flex-col gap-2.5 p-3">
        {pedidos.length === 0 ? (
          <li className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/70 bg-surface/40 px-4 py-8 text-center">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-surface-muted/70 text-muted-foreground/70">
              <Inbox className="h-4 w-4" strokeWidth={2} />
            </span>
            <p className="text-[11px] leading-tight text-muted-foreground/80">
              Sem pedidos nesta etapa
            </p>
          </li>
        ) : (
          pedidos.map((p) => (
            <PedidoCard key={p.id} pedido={p} onAbrir={onAbrir} />
          ))
        )}
      </ul>
    </div>
  );
}

function PedidoCard({
  pedido,
  onAbrir,
}: {
  pedido: Pedido;
  onAbrir: (p: Pedido) => void;
}) {
  const { clientes } = useClientes();
  const { excluir } = usePedidos();
  const [confirmarAberto, setConfirmarAberto] = useState(false);
  const cliente = clientes.find((c) => c.id === pedido.clienteId);
  const nomeCliente = cliente ? getClienteNome(cliente) : "Cliente removido";
  const responsavel =
    cliente?.tipo === "empresa" ? cliente.responsavel : undefined;
  const primeiroItem = pedido.itens[0];
  const restantes = Math.max(0, pedido.itens.length - 1);
  const qtdTotal = totalItensPedido(pedido);
  const pendencias = pendenciasDoPedido(pedido.itens);

  function confirmarExclusao() {
    excluir(pedido.id);
    setConfirmarAberto(false);
    toast.success(`Pedido ${pedido.numero} excluído.`);
  }

  return (
    <li>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button
            type="button"
            onClick={() => onAbrir(pedido)}
            className="group flex w-full flex-col gap-3 rounded-xl border border-border/70 bg-surface p-3.5 text-left shadow-[0_1px_2px_rgb(0_0_0_/_0.03)] transition-all duration-200 ease-out hover:-translate-y-[1px] hover:border-primary/40 hover:shadow-[0_8px_20px_-10px_color-mix(in_oklab,var(--primary)_35%,transparent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="inline-flex items-center rounded-md border border-border/60 bg-surface-muted/60 px-1.5 py-0.5 font-mono text-[10.5px] font-semibold tracking-tight text-muted-foreground">
                {pedido.numero}
              </span>
              <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-muted-foreground">
                <Calendar className="h-3 w-3" strokeWidth={2.25} />
                {pedido.previsaoEntrega
                  ? formatarDataBR(pedido.previsaoEntrega)
                  : "Sem previsão"}
              </span>
            </div>

            <div className="min-w-0">
              <p className="truncate text-[14.5px] font-semibold leading-tight text-foreground">
                {nomeCliente}
              </p>
              {responsavel && (
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  Resp.: {responsavel}
                </p>
              )}
            </div>

            {primeiroItem && (
              <div className="min-w-0 space-y-1 rounded-lg bg-surface-muted/40 px-2.5 py-2">
                <p className="flex min-w-0 items-center gap-1.5 truncate text-[12.5px] font-medium text-foreground">
                  <Package className="h-3 w-3 shrink-0 text-muted-foreground" strokeWidth={2.25} />
                  <span className="truncate">{primeiroItem.produto}</span>
                  {restantes > 0 && (
                    <span className="shrink-0 text-[10.5px] font-normal text-muted-foreground">
                      +{restantes}
                    </span>
                  )}
                </p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{qtdTotal} un.</span>
                  <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-foreground">
                    <CircleDollarSign className="h-3 w-3 text-primary" strokeWidth={2.25} />
                    {formatarMoeda(pedido.total)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className={cn(
                  "gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium transition-colors",
                  corStatusFinanceiro(pedido.statusFinanceiro),
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                {LABEL_STATUS_FINANCEIRO[pedido.statusFinanceiro]}
              </Badge>
              {pedido.etapa === "pendencias_orcamento" &&
                pendencias.map((pen) => (
                  <Badge
                    key={pen}
                    variant="outline"
                    className="gap-1 rounded-full border-orange-200 bg-orange-100 px-2 py-0.5 text-[10.5px] font-medium text-orange-900 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200"
                  >
                    <AlertTriangle className="h-2.5 w-2.5" strokeWidth={2.5} />
                    {LABEL_PENDENCIA_ADICIONAL[pen]}
                  </Badge>
                ))}
              {(pedido.badges ?? []).map((b) => (
                <Badge
                  key={b}
                  variant="outline"
                  className="rounded-full border-primary/30 bg-primary-soft/60 px-2 py-0.5 text-[10.5px] font-medium text-primary"
                >
                  {LABEL_BADGE[b]}
                </Badge>
              ))}
            </div>
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52">
          <ContextMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setConfirmarAberto(true);
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir pedido
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={confirmarAberto} onOpenChange={setConfirmarAberto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pedido {pedido.numero}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O pedido de{" "}
              <span className="font-medium text-foreground">{nomeCliente}</span>{" "}
              será removido permanentemente, junto com seus itens, pagamentos e
              histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}
