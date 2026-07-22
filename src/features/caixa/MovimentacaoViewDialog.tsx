import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  LABEL_CATEGORIA,
  LABEL_FORMA_PAGAMENTO,
  LABEL_ORIGEM,
  LABEL_STATUS,
  type Movimentacao,
} from "./types";
import { formatarDataBR, formatarMoeda } from "./utils";

interface Props {
  movimentacao: Movimentacao | null;
  aberto: boolean;
  onFechar: () => void;
}

export function MovimentacaoViewDialog({ movimentacao, aberto, onFechar }: Props) {
  return (
    <Dialog open={aberto} onOpenChange={(v) => (!v ? onFechar() : null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes da movimentação</DialogTitle>
          <DialogDescription>Informações completas do lançamento.</DialogDescription>
        </DialogHeader>

        {movimentacao && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className={cn(
                  "font-medium",
                  movimentacao.tipo === "entrada"
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-destructive/40 bg-destructive/10 text-destructive",
                )}
              >
                {movimentacao.tipo === "entrada" ? "Entrada" : "Saída"}
              </Badge>
              <span
                className={cn(
                  "font-display text-2xl font-bold",
                  movimentacao.tipo === "entrada"
                    ? "text-success"
                    : "text-destructive",
                )}
              >
                {movimentacao.tipo === "entrada" ? "+" : "-"}{" "}
                {formatarMoeda(movimentacao.valor)}
              </span>
            </div>

            <div className="space-y-2 rounded-xl border border-border bg-surface-muted/50 p-4 text-sm">
              <Item label="Descrição" valor={movimentacao.descricao} />
              <Item label="Categoria" valor={LABEL_CATEGORIA[movimentacao.categoria]} />
              <Item
                label="Forma de pagamento"
                valor={LABEL_FORMA_PAGAMENTO[movimentacao.formaPagamento]}
              />
              <Item label="Data" valor={formatarDataBR(movimentacao.data)} />
              <Item label="Origem" valor={LABEL_ORIGEM[movimentacao.origem]} />
              <Item label="Status" valor={LABEL_STATUS[movimentacao.status]} />
            </div>

            {movimentacao.observacoes && (
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Observações
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {movimentacao.observacoes}
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Item({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{valor}</span>
    </div>
  );
}
