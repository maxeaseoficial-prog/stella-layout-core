import { Zap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CenariosBlocoProps {
  valores: { lucroPct: string; taxaCartaoPct: string; impostosPct: string };
  onAplicar: (campo: "lucroPct" | "taxaCartaoPct" | "impostosPct", valor: string) => void;
}

const GRUPOS = [
  { campo: "lucroPct" as const, rotulo: "Lucro", opcoes: [20, 25, 30, 35] },
  { campo: "taxaCartaoPct" as const, rotulo: "Taxa Cartão", opcoes: [2, 2.5, 3] },
  { campo: "impostosPct" as const, rotulo: "Impostos", opcoes: [4, 6, 8] },
];

export function CenariosBloco({ valores, onAplicar }: CenariosBlocoProps) {
  return (
    <Card className="shadow-[var(--shadow-soft)]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Zap className="h-4 w-4 text-primary" />
          Cenários
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Toque para testar rapidamente — o preço é recalculado na hora.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {GRUPOS.map((g) => (
          <div key={g.campo} className="flex flex-wrap items-center gap-2">
            <span className="w-24 text-xs font-medium text-muted-foreground">{g.rotulo}</span>
            <div className="flex flex-wrap gap-1.5">
              {g.opcoes.map((op) => {
                const ativo = Number(valores[g.campo]) === op;
                return (
                  <button
                    key={op}
                    type="button"
                    onClick={() => onAplicar(g.campo, String(op))}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold tabular-nums transition-colors",
                      ativo
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-surface text-muted-foreground hover:border-primary/50 hover:text-primary",
                    )}
                  >
                    {op}%
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
