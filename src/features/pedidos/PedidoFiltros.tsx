import {
  Search,
  Layers,
  PencilLine,
  AlertTriangle,
  ClipboardList,
  Cog,
  CheckCircle2,
  Truck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type PeriodoFiltroPedido =
  | "todos"
  | "hoje"
  | "semana"
  | "mes"
  | "personalizado";

export type FiltroRapido =
  | "todos"
  | "em_elaboracao"
  | "pendencias_orcamento"
  | "aguardando_aprovacao"
  | "em_producao"
  | "finalizado"
  | "entregue"
  | "cancelados";

interface Props {
  termo: string;
  onTermo: (v: string) => void;
  filtro: FiltroRapido;
  onFiltro: (f: FiltroRapido) => void;
  periodo: PeriodoFiltroPedido;
  onPeriodo: (p: PeriodoFiltroPedido) => void;
  dataInicio: string;
  dataFim: string;
  onDataInicio: (v: string) => void;
  onDataFim: (v: string) => void;
}

const FILTROS: { valor: FiltroRapido; label: string; icon: LucideIcon }[] = [
  { valor: "todos", label: "Todos", icon: Layers },
  { valor: "em_elaboracao", label: "Em Elaboração", icon: PencilLine },
  { valor: "pendencias_orcamento", label: "Pendências", icon: AlertTriangle },
  { valor: "aguardando_aprovacao", label: "Aguardando Aprovação", icon: ClipboardList },
  { valor: "em_producao", label: "Em Produção", icon: Cog },
  { valor: "finalizado", label: "Finalizado", icon: CheckCircle2 },
  { valor: "entregue", label: "Entregue", icon: Truck },
  { valor: "cancelados", label: "Cancelado", icon: XCircle },
];

const PERIODOS: { valor: PeriodoFiltroPedido; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "hoje", label: "Hoje" },
  { valor: "semana", label: "Semana" },
  { valor: "mes", label: "Mês" },
  { valor: "personalizado", label: "Personalizado" },
];

export function PedidoFiltros({
  termo,
  onTermo,
  filtro,
  onFiltro,
  periodo,
  onPeriodo,
  dataInicio,
  dataFim,
  onDataInicio,
  onDataFim,
}: Props) {
  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-surface p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            value={termo}
            onChange={(e) => onTermo(e.target.value)}
            placeholder="Buscar por número, cliente ou observação…"
            className="h-11 rounded-xl border-primary/60 bg-background pl-10 text-sm shadow-[0_1px_2px_rgb(0_0_0_/_0.03)] transition placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-primary/20"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PERIODOS.map((p) => (
            <PeriodoChip
              key={p.valor}
              ativo={periodo === p.valor}
              onClick={() => onPeriodo(p.valor)}
            >
              {p.label}
            </PeriodoChip>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <FiltroChip
            key={f.valor}
            ativo={filtro === f.valor}
            icon={f.icon}
            onClick={() => onFiltro(f.valor)}
          >
            {f.label}
          </FiltroChip>
        ))}
      </div>

      {periodo === "personalizado" && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Input
            type="date"
            value={dataInicio}
            onChange={(e) => onDataInicio(e.target.value)}
            className="h-9 w-auto rounded-lg"
          />
          <span className="text-xs text-muted-foreground">até</span>
          <Input
            type="date"
            value={dataFim}
            onChange={(e) => onDataFim(e.target.value)}
            className="h-9 w-auto rounded-lg"
          />
        </div>
      )}
    </div>
  );
}

function FiltroChip({
  ativo,
  onClick,
  icon: Icon,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium transition-all duration-200 ease-out active:scale-[0.97]",
        ativo
          ? "border-primary bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_color-mix(in_oklab,var(--primary)_55%,transparent)]"
          : "border-border/70 bg-background text-muted-foreground shadow-[0_1px_2px_rgb(0_0_0_/_0.03)] hover:-translate-y-[1px] hover:border-primary/40 hover:bg-primary-soft/40 hover:text-foreground hover:shadow-[0_2px_8px_-2px_color-mix(in_oklab,var(--primary)_25%,transparent)]",
      )}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5 transition-colors",
          ativo ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary",
        )}
      />
      <span>{children}</span>
    </button>
  );
}

function PeriodoChip({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-all duration-200 ease-out active:scale-[0.97]",
        ativo
          ? "border-primary/50 bg-primary-soft/70 text-primary shadow-[0_1px_3px_rgb(0_0_0_/_0.04)]"
          : "border-transparent bg-transparent text-muted-foreground hover:bg-surface-muted/60 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
