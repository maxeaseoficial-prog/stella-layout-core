import { History, PackageCheck, RotateCcw, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { brl, pct } from "./calculos";
import type { CalculoSalvo, PrecificacaoEntrada } from "./types";

interface HistoricoListaProps {
  historico: CalculoSalvo[];
  onRestaurar: (entrada: PrecificacaoEntrada) => void;
  onRemover: (id: string) => void;
}

function dataHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoricoLista({ historico, onRestaurar, onRemover }: HistoricoListaProps) {
  return (
    <Card className="shadow-[var(--shadow-soft)]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <History className="h-4 w-4 text-primary" />
          Histórico de Cálculos
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Últimos cálculos salvos — clique em restaurar para reutilizar os valores.
        </p>
      </CardHeader>
      <CardContent>
        {historico.length === 0 ? (
          <div className="grid h-28 place-items-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
            Nenhum cálculo salvo ainda. Use “Salvar Cálculo” para registrar.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {historico.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {dataHora(c.criadoEm)}
                    </span>
                    <span className="text-xs text-muted-foreground">por {c.adminNome}</span>
                    {c.tipo === "aplicacao_produto" && c.produtoAplicado && (
                      <Badge variant="secondary" className="gap-1 text-[11px]">
                        <PackageCheck className="h-3 w-3" />
                        {c.produtoAplicado.nome}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                    <span>
                      Custo: <span className="tabular-nums">{brl(c.resultado.custoProducao)}</span>
                    </span>
                    <span>
                      Lucro: <span className="tabular-nums">{pct(c.entrada.lucroPct)}</span>
                    </span>
                    <span>
                      Markup: <span className="tabular-nums">{c.resultado.markup.toFixed(2)}×</span>
                    </span>
                  </div>
                </div>

                <span className="text-base font-bold tabular-nums text-primary">
                  {brl(c.resultado.precoVenda)}
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    title="Restaurar valores"
                    onClick={() => onRestaurar(c.entrada)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    title="Remover registro"
                    onClick={() => onRemover(c.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
