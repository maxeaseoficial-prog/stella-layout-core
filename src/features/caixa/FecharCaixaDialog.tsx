import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { Movimentacao } from "./types";
import { formatarDataBR, formatarMoeda, hojeISO, parseValorInput } from "./utils";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  movimentacoes: Movimentacao[];
  onConfirmar: (opts: { data: string; saldoInicial: number }) => void;
}

export function FecharCaixaDialog({
  aberto,
  onFechar,
  movimentacoes,
  onConfirmar,
}: Props) {
  const [data, setData] = useState(hojeISO());
  const [saldoInicialStr, setSaldoInicialStr] = useState("0,00");

  useEffect(() => {
    if (aberto) {
      setData(hojeISO());
      setSaldoInicialStr("0,00");
    }
  }, [aberto]);

  const doDia = movimentacoes.filter(
    (m) => m.data === data && m.status !== "cancelada",
  );
  const entradas = doDia
    .filter((m) => m.tipo === "entrada")
    .reduce((s, m) => s + m.valor, 0);
  const saidas = doDia
    .filter((m) => m.tipo === "saida")
    .reduce((s, m) => s + m.valor, 0);
  const saldoInicial = parseValorInput(saldoInicialStr);
  const saldoFinal = saldoInicial + entradas - saidas;

  return (
    <Dialog open={aberto} onOpenChange={(v) => (!v ? onFechar() : null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Fechar caixa</DialogTitle>
          <DialogDescription>
            Confira o resumo do dia antes de confirmar o fechamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Data</Label>
              <Input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Saldo inicial (R$)</Label>
              <Input
                value={saldoInicialStr}
                onChange={(e) => setSaldoInicialStr(e.target.value)}
                inputMode="decimal"
              />
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-border bg-surface-muted/50 p-4">
            <Linha label={`Movimentações em ${formatarDataBR(data)}`} valor={`${doDia.length}`} />
            <Linha label="Saldo inicial" valor={formatarMoeda(saldoInicial)} />
            <Linha
              label="Entradas"
              valor={`+ ${formatarMoeda(entradas)}`}
              cor="success"
            />
            <Linha
              label="Saídas"
              valor={`− ${formatarMoeda(saidas)}`}
              cor="destructive"
            />
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <span className="text-sm font-semibold">Saldo final</span>
              <span className="font-display text-lg font-bold text-foreground">
                {formatarMoeda(saldoFinal)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onFechar}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onConfirmar({ data, saldoInicial });
              onFechar();
            }}
          >
            Confirmar fechamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Linha({
  label,
  valor,
  cor,
}: {
  label: string;
  valor: string;
  cor?: "success" | "destructive";
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          cor === "success"
            ? "font-semibold text-success"
            : cor === "destructive"
              ? "font-semibold text-destructive"
              : "font-medium text-foreground"
        }
      >
        {valor}
      </span>
    </div>
  );
}
