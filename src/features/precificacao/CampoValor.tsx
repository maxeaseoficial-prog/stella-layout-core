import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CampoValorProps {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  tipo: "moeda" | "percentual" | "tempo";
  descricao?: string;
}

const SUFIXO: Record<CampoValorProps["tipo"], string> = {
  moeda: "R$",
  percentual: "%",
  tempo: "h",
};

export function CampoValor({ label, valor, onChange, tipo, descricao }: CampoValorProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="relative">
        {tipo === "moeda" && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
            R$
          </span>
        )}
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step={tipo === "tempo" ? "0.25" : "0.01"}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-10 rounded-lg border-border bg-surface text-sm font-semibold tabular-nums focus-visible:ring-ring",
            tipo === "moeda" ? "pl-9" : "pl-3",
            tipo !== "moeda" && "pr-8",
          )}
        />
        {tipo !== "moeda" && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
            {SUFIXO[tipo]}
          </span>
        )}
      </div>
      {descricao && <span className="block text-[11px] text-muted-foreground/80">{descricao}</span>}
    </label>
  );
}
