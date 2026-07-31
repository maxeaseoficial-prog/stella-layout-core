import { AlertTriangle, PiggyBank, RefreshCcw, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { brl, pct } from "./calculos";
import type { PrecificacaoResultado } from "./types";

interface PainelResultadoProps {
  resultado: PrecificacaoResultado;
}

function Linha({
  rotulo,
  valor,
  negativo,
  destaque,
}: {
  rotulo: string;
  valor: number;
  negativo?: boolean;
  destaque?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span
        className={cn(
          "text-sm",
          destaque ? "font-semibold text-foreground" : "text-muted-foreground",
        )}
      >
        {rotulo}
      </span>
      <span
        className={cn(
          "text-sm tabular-nums",
          destaque ? "font-bold text-foreground" : negativo ? "text-destructive" : "text-foreground",
        )}
      >
        {negativo ? `(-) ${brl(valor)}` : brl(valor)}
      </span>
    </div>
  );
}

export function PainelResultado({ resultado }: PainelResultadoProps) {
  const r = resultado;

  return (
    <div className="space-y-4">
      {/* Preço sugerido — destaque principal */}
      <Card className="overflow-hidden border-primary/30 bg-primary-soft shadow-[var(--shadow-elevated)]">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Preço de Venda Sugerido
            </p>
            <Badge variant="secondary" className="bg-background/70 text-xs tabular-nums">
              Markup {r.markup > 0 ? r.markup.toFixed(2) : "—"}×
            </Badge>
          </div>
          <p className="mt-2 font-display text-4xl font-extrabold tabular-nums tracking-tight text-foreground">
            {r.valido ? brl(r.precoVenda) : "—"}
          </p>
          {!r.valido && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
              {r.custoProducao <= 0
                ? "Informe os custos para calcular o preço."
                : "Os percentuais somam 100% ou mais — ajuste para calcular."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* DRE simplificado */}
      <Card className="shadow-[var(--shadow-soft)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Resultado Financeiro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          <Linha rotulo="Preço de Venda" valor={r.precoVenda} destaque />
          <Linha rotulo="Impostos" valor={r.valorImpostos} negativo />
          <Linha rotulo="Taxa Cartão" valor={r.valorTaxaCartao} negativo />
          <Linha rotulo="Custo Produção" valor={r.custoProducao} negativo />
          <Separator className="!my-3" />
          <Linha rotulo="Sobra" valor={r.sobra} destaque />
          <div className="flex items-center gap-1.5 pl-1">
            <TrendingUp className="h-3.5 w-3.5 text-success" />
            <span className="flex-1 text-sm text-muted-foreground">Lucro</span>
            <span className="text-sm font-semibold tabular-nums text-success">
              {brl(r.valorLucro)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 pl-1">
            <RefreshCcw className="h-3.5 w-3.5 text-info" />
            <span className="flex-1 text-sm text-muted-foreground">Reinvestimento</span>
            <span className="text-sm font-semibold tabular-nums text-info">
              {brl(r.valorReinvestimento)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Indicadores */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { rotulo: "Margem Líquida", valor: pct(r.margemLiquidaPct), icon: PiggyBank },
          { rotulo: "Lucro", valor: pct(r.lucroSobrePrecoPct), icon: TrendingUp },
          { rotulo: "Custo Produção", valor: brl(r.custoProducao), icon: RefreshCcw },
        ].map((kpi) => (
          <Card key={kpi.rotulo} className="shadow-[var(--shadow-soft)]">
            <CardContent className="p-3">
              <kpi.icon className="h-4 w-4 text-primary" />
              <p className="mt-2 text-sm font-bold tabular-nums text-foreground">{kpi.valor}</p>
              <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{kpi.rotulo}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
