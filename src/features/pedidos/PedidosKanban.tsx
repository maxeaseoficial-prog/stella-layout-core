import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

import { useClientes, getClienteNome } from "@/features/clientes";
import { LABEL_PENDENCIA_ADICIONAL } from "@/features/adicionais";

import type { EtapaKanban, Pedido } from "./types";
import {
  ETAPAS_KANBAN,
  ICONE_ETAPA_KANBAN,
  LABEL_BADGE,
  LABEL_ETAPA_KANBAN,
  LABEL_STATUS_FINANCEIRO,
} from "./types";
import {
  corEtapaKanban,
  corStatusFinanceiro,
  formatarDataBR,
  formatarMoeda,
  pendenciasDoPedido,
  totalItensPedido,
} from "./utils";

interface Props {
  pedidos: Pedido[];
  onAbrir: (p: Pedido) => void;
}

export function PedidosKanban({ pedidos, onAbrir }: Props) {
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

  return (
    <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2">
      {ETAPAS_KANBAN.map((etapa) => (
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
  return (
    <div className="flex w-[280px] shrink-0 snap-start flex-col rounded-xl border border-border bg-surface-muted/40 sm:w-[300px]">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <span aria-hidden>{ICONE_ETAPA_KANBAN[etapa]}</span>
          <span>{LABEL_ETAPA_KANBAN[etapa]}</span>
        </div>
        <Badge
          variant="outline"
          className={cn("h-5 min-w-[1.5rem] justify-center px-1.5 text-[10px]", corEtapaKanban(etapa))}
        >
          {pedidos.length}
        </Badge>
      </div>
      <ul className="flex flex-col gap-2 p-2">
        {pedidos.length === 0 ? (
          <li className="rounded-lg border border-dashed border-border bg-surface/40 p-4 text-center text-xs text-muted-foreground">
            Nenhum pedido nesta etapa.
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
  const cliente = clientes.find((c) => c.id === pedido.clienteId);
  const nomeCliente = cliente ? getClienteNome(cliente) : "Cliente removido";
  const responsavel =
    cliente?.tipo === "empresa" ? cliente.responsavel : undefined;
  const primeiroItem = pedido.itens[0];
  const restantes = Math.max(0, pedido.itens.length - 1);
  const qtdTotal = totalItensPedido(pedido);
  const pendencias = pendenciasDoPedido(pedido.itens);

  return (
    <li>
      <button
        type="button"
        onClick={() => onAbrir(pedido)}
        className="flex w-full flex-col gap-2 rounded-lg border border-border bg-surface p-3 text-left shadow-[var(--shadow-soft)] transition hover:border-primary/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-xs font-semibold text-primary">
            {pedido.numero}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {pedido.previsaoEntrega
              ? `Entrega ${formatarDataBR(pedido.previsaoEntrega)}`
              : "Sem previsão"}
          </span>
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {nomeCliente}
          </p>
          {responsavel && (
            <p className="truncate text-[11px] text-muted-foreground">
              Resp.: {responsavel}
            </p>
          )}
        </div>

        {primeiroItem && (
          <div className="min-w-0 text-xs text-muted-foreground">
            <p className="truncate">
              <span className="text-foreground">{primeiroItem.produto}</span>
              {restantes > 0 && (
                <span className="text-muted-foreground"> +{restantes}</span>
              )}
            </p>
            <p>
              {qtdTotal} un. • {formatarMoeda(pedido.total)}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1">
          <Badge
            variant="outline"
            className={cn("text-[10px]", corStatusFinanceiro(pedido.statusFinanceiro))}
          >
            {LABEL_STATUS_FINANCEIRO[pedido.statusFinanceiro]}
          </Badge>
          {pedido.etapa === "pendencias_orcamento" &&
            pendencias.map((pen) => (
              <Badge
                key={pen}
                variant="outline"
                className="border-orange-300 bg-orange-100 text-[10px] text-orange-900 dark:bg-orange-950/40 dark:text-orange-200"
              >
                🟠 {LABEL_PENDENCIA_ADICIONAL[pen]}
              </Badge>
            ))}
          {(pedido.badges ?? []).map((b) => (
            <Badge
              key={b}
              variant="outline"
              className="border-primary/30 bg-primary-soft/60 text-[10px] text-primary"
            >
              {LABEL_BADGE[b]}
            </Badge>
          ))}
        </div>
      </button>
    </li>
  );
}
