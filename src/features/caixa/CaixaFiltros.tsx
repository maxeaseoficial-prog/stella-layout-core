import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PeriodoFiltro = "hoje" | "semana" | "mes" | "personalizado" | "todos";
export type TipoFiltro = "todos" | "entrada" | "saida";

interface Props {
  termo: string;
  onTermo: (v: string) => void;
  periodo: PeriodoFiltro;
  onPeriodo: (p: PeriodoFiltro) => void;
  tipo: TipoFiltro;
  onTipo: (t: TipoFiltro) => void;
  dataInicio: string;
  dataFim: string;
  onDataInicio: (v: string) => void;
  onDataFim: (v: string) => void;
}

const PERIODOS: { valor: PeriodoFiltro; label: string }[] = [
  { valor: "hoje", label: "Hoje" },
  { valor: "semana", label: "Esta semana" },
  { valor: "mes", label: "Este mês" },
  { valor: "personalizado", label: "Personalizado" },
  { valor: "todos", label: "Todos" },
];

const TIPOS: { valor: TipoFiltro; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "entrada", label: "Entrada" },
  { valor: "saida", label: "Saída" },
];

export function CaixaFiltros({
  termo,
  onTermo,
  periodo,
  onPeriodo,
  tipo,
  onTipo,
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
            placeholder="Buscar por descrição, categoria, valor ou forma"
            className="border-primary/60 pl-9 focus-visible:border-primary"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TIPOS.map((t) => (
            <Chip
              key={t.valor}
              ativo={tipo === t.valor}
              onClick={() => onTipo(t.valor)}
              variant={
                t.valor === "entrada"
                  ? "success"
                  : t.valor === "saida"
                    ? "destructive"
                    : "default"
              }
            >
              {t.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {PERIODOS.map((p) => (
            <Chip
              key={p.valor}
              ativo={periodo === p.valor}
              onClick={() => onPeriodo(p.valor)}
            >
              {p.label}
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
    </div>
  );
}

function Chip({
  ativo,
  onClick,
  children,
  variant = "default",
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "success" | "destructive";
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={ativo ? "default" : "outline"}
      onClick={onClick}
      className={cn(
        "h-8 rounded-full px-3 text-xs",
        ativo &&
          variant === "success" &&
          "bg-success text-white hover:bg-success/90",
        ativo &&
          variant === "destructive" &&
          "bg-destructive text-white hover:bg-destructive/90",
      )}
    >
      {children}
    </Button>
  );
}
