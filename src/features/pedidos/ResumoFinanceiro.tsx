import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatarMoeda, parseValorInput } from "./utils";

interface Props {
  subtotal: number;
  desconto: string;
  frete: string;
  onDesconto: (v: string) => void;
  onFrete: (v: string) => void;
}

export function ResumoFinanceiro({
  subtotal,
  desconto,
  frete,
  onDesconto,
  onFrete,
}: Props) {
  const d = parseValorInput(desconto);
  const f = parseValorInput(frete);
  const total = Math.max(0, subtotal - d + f);

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
      <h4 className="text-sm font-semibold text-foreground">Resumo financeiro</h4>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Desconto (R$)</Label>
          <Input
            value={desconto}
            onChange={(e) => onDesconto(e.target.value)}
            inputMode="decimal"
            placeholder="0,00"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Frete (R$)</Label>
          <Input
            value={frete}
            onChange={(e) => onFrete(e.target.value)}
            inputMode="decimal"
            placeholder="0,00"
          />
        </div>
      </div>

      <div className="space-y-1.5 rounded-lg bg-surface-muted/60 p-3 text-sm">
        <Linha label="Subtotal" valor={formatarMoeda(subtotal)} />
        <Linha label="Desconto" valor={`− ${formatarMoeda(d)}`} />
        <Linha label="Frete" valor={`+ ${formatarMoeda(f)}`} />
        <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
          <span className="text-sm font-semibold">Total</span>
          <span className="font-display text-lg font-bold text-primary">
            {formatarMoeda(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

function Linha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground tabular-nums">{valor}</span>
    </div>
  );
}
