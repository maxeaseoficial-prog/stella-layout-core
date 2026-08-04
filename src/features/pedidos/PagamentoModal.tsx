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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/custom-select";

import {
  FORMAS_PAGAMENTO_PEDIDO,
  LABEL_FORMA_PAGAMENTO_PEDIDO,
  type FormaPagamentoPedido,
  type Pedido,
} from "./types";
import { formatarMoeda, hojeISO, parseValorInput } from "./utils";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  pedido: Pedido | null;
  onConfirmar: (dados: {
    valor: number;
    forma: FormaPagamentoPedido;
    data: string;
    observacoes?: string;
  }) => void;
}

export function PagamentoModal({ aberto, onFechar, pedido, onConfirmar }: Props) {
  const [valor, setValor] = useState("");
  const [forma, setForma] = useState<FormaPagamentoPedido>("pix");
  const [data, setData] = useState(hojeISO());
  const [observacoes, setObservacoes] = useState("");
  const [erro, setErro] = useState<string>();

  const restante = pedido ? Math.max(0, pedido.total - pedido.totalPago) : 0;

  useEffect(() => {
    if (aberto && pedido) {
      setValor(restante > 0 ? restante.toFixed(2).replace(".", ",") : "");
      setForma("pix");
      setData(hojeISO());
      setObservacoes("");
      setErro(undefined);
    }
  }, [aberto, pedido, restante]);

  function handleConfirmar() {
    const v = parseValorInput(valor);
    if (!v || v <= 0) {
      setErro("Informe um valor válido.");
      return;
    }
    onConfirmar({
      valor: v,
      forma,
      data,
      observacoes: observacoes.trim() || undefined,
    });
    onFechar();
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => (!v ? onFechar() : null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Recebimento</DialogTitle>
          <DialogDescription>
            {pedido ? `Pedido ${pedido.numero}` : "Registre um novo recebimento."}
          </DialogDescription>
        </DialogHeader>

        {pedido && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-surface-muted/50 p-3 text-center">
              <Info label="Total" valor={formatarMoeda(pedido.total)} />
              <Info label="Recebido" valor={formatarMoeda(pedido.totalPago)} />
              <Info label="Restante" valor={formatarMoeda(restante)} destaque />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Valor recebido (R$)</Label>
                <Input
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  inputMode="decimal"
                  placeholder="0,00"
                />
                {erro && (
                  <p className="text-xs font-medium text-destructive">{erro}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Forma de pagamento</Label>
                <Select
                  value={forma}
                  onValueChange={(v) => setForma(v as FormaPagamentoPedido)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMAS_PAGAMENTO_PEDIDO.map((f) => (
                      <SelectItem key={f} value={f}>
                        {LABEL_FORMA_PAGAMENTO_PEDIDO[f]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Data</Label>
                <Input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Observações</Label>
                <Textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex.: Sinal do pedido, entrada parcial, etc."
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onFechar}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar}>Salvar Recebimento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Info({
  label,
  valor,
  destaque,
}: {
  label: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
      <p
        className={
          destaque
            ? "font-display text-sm font-bold text-primary"
            : "text-sm font-semibold text-foreground"
        }
      >
        {valor}
      </p>
    </div>
  );
}
