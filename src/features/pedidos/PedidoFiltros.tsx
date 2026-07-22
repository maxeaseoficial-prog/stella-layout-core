import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PeriodoFiltroPedido =
  | "todos"
  | "hoje"
  | "semana"
  | "mes"
  | "personalizado";

export type FiltroRapido =
  | "todos"
  | "em_orcamento"
  | "pendentes_orcamento"
  | "pendente_orcamento_estampa"
  | "pendente_orcamento_matriz"
  | "aguardando_aprovacao"
  | "producao"
  | "finalizados"
  | "entregues"
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

const FILTROS: { valor: FiltroRapido; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "em_orcamento", label: "Em orçamento" },
  { valor: "pendentes_orcamento", label: "Pendentes de orçamento" },
  { valor: "pendente_orcamento_estampa", label: "Pend. estampa" },
  { valor: "pendente_orcamento_matriz", label: "Pend. matriz" },
  { valor: "aguardando_aprovacao", label: "Aguardando aprovação" },
  { valor: "producao", label: "Em produção" },
  { valor: "finalizados", label: "Finalizados" },
  { valor: "entregues", label: "Entregues" },
  { valor: "cancelados", label: "Cancelados" },
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
    <div className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={termo}
            onChange={(e) => onTermo(e.target.value)}
            placeholder="Buscar por número, cliente ou observação"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PERIODOS.map((p) => (
            <Chip key={p.valor} ativo={periodo === p.valor} onClick={() => onPeriodo(p.valor)}>
              {p.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTROS.map((f) => (
          <Chip key={f.valor} ativo={filtro === f.valor} onClick={() => onFiltro(f.valor)}>
            {f.label}
          </Chip>
        ))}
      </div>

      {periodo === "personalizado" && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dataInicio}
            onChange={(e) => onDataInicio(e.target.value)}
            className="h-9 w-auto"
          />
          <span className="text-xs text-muted-foreground">até</span>
          <Input
            type="date"
            value={dataFim}
            onChange={(e) => onDataFim(e.target.value)}
            className="h-9 w-auto"
          />
        </div>
      )}
    </div>
  );
}

function Chip({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={ativo ? "default" : "outline"}
      onClick={onClick}
      className={cn("h-8 rounded-full px-3 text-xs")}
    >
      {children}
    </Button>
  );
}
