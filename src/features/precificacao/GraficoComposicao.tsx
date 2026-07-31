import { useMemo } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartPie } from "lucide-react";

import { brl } from "./calculos";
import type { PrecificacaoEntrada, PrecificacaoResultado } from "./types";

interface GraficoComposicaoProps {
  entrada: PrecificacaoEntrada;
  resultado: PrecificacaoResultado;
}

interface Fatia {
  name: string;
  value: number;
  color: string;
}

export function GraficoComposicao({ entrada, resultado }: GraficoComposicaoProps) {
  const dados = useMemo<Fatia[]>(() => {
    if (!resultado.valido) return [];
    const producao = Math.max(resultado.custoProducao - entrada.materiaPrima, 0);
    return [
      { name: "Matéria-prima", value: entrada.materiaPrima, color: "var(--chart-3)" },
      { name: "Produção", value: producao, color: "var(--chart-5)" },
      { name: "Impostos", value: resultado.valorImpostos, color: "var(--chart-2)" },
      { name: "Taxa Cartão", value: resultado.valorTaxaCartao, color: "var(--muted-foreground)" },
      { name: "Lucro", value: resultado.valorLucro, color: "var(--chart-4)" },
      { name: "Reinvestimento", value: resultado.valorReinvestimento, color: "var(--chart-1)" },
    ].filter((f) => f.value > 0.004);
  }, [entrada.materiaPrima, resultado]);

  return (
    <Card className="shadow-[var(--shadow-soft)]">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ChartPie className="h-4 w-4 text-primary" />
          Composição do Preço
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {dados.length === 0 ? (
          <div className="grid h-56 place-items-center text-sm text-muted-foreground">
            Preencha os custos para visualizar o gráfico.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dados}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius="55%"
                  outerRadius="85%"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {dados.map((f) => (
                    <Cell key={f.name} fill={f.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${brl(value)} (${((value / resultado.precoVenda) * 100).toFixed(1)}%)`,
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--popover)",
                    color: "var(--popover-foreground)",
                    fontSize: 12,
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
