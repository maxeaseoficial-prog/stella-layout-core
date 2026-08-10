import { useState } from "react";
import { AlertTriangle, CheckCircle2, Copy, FileJson } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatarMoeda } from "@/features/pedidos/utils";

export interface DiagnosticoItem {
  description?: string;
  unit: string;
  quantity: number;
  unitAmount: number;
  totalAmount: number;
  unitTax: string;
  quantityTax: number;
  unitTaxAmount: number;
  totalComercialCalculado: number;
  totalTributavelCalculado: number;
  divergenciaComercial: number;
  divergenciaTributavel: number;
  ok: boolean;
}

export interface PreviewPayload {
  payload: unknown;
  diagnosticos: DiagnosticoItem[];
  resumo: {
    ambienteFiscal: string;
    totalNota: number;
    somaItens: number;
    totalConfere: boolean;
    itensComDivergencia: number;
  };
}

interface Props {
  aberto: boolean;
  onFechar: () => void;
  preview: PreviewPayload | null;
}

export function PayloadPreviewDialog({ aberto, onFechar, preview }: Props) {
  const [aba, setAba] = useState<"diagnostico" | "json">("diagnostico");
  if (!preview) return null;

  const { resumo, diagnosticos } = preview;
  const tudoOk = resumo.totalConfere && resumo.itensComDivergencia === 0;
  const json = JSON.stringify(preview.payload, null, 2);

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-primary" />
            Pré-visualização da NF-e
          </DialogTitle>
          <DialogDescription>
            Conferência dos valores antes da transmissão. Nada foi enviado à SEFAZ.
          </DialogDescription>
        </DialogHeader>

        <div
          className={`rounded-lg border p-4 flex items-start gap-3 ${
            tudoOk ? "border-emerald-500/40 bg-emerald-500/5" : "border-destructive/40 bg-destructive/5"
          }`}
        >
          {tudoOk ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          )}
          <div className="space-y-1 text-sm">
            <p className="font-medium">
              {tudoOk
                ? "Valores coerentes — sem risco de rejeição 630."
                : "Divergência detectada nos valores dos itens."}
            </p>
            <p className="text-muted-foreground">
              Ambiente fiscal: <strong>{resumo.ambienteFiscal}</strong> · Soma dos itens:{" "}
              <strong>{formatarMoeda(resumo.somaItens)}</strong> · Total da nota:{" "}
              <strong>{formatarMoeda(resumo.totalNota)}</strong>
              {!resumo.totalConfere && " (não confere)"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={aba === "diagnostico" ? "default" : "outline"}
            onClick={() => setAba("diagnostico")}
          >
            Diagnósticos SEFAZ
          </Button>
          <Button
            size="sm"
            variant={aba === "json" ? "default" : "outline"}
            onClick={() => setAba("json")}
          >
            Payload JSON
          </Button>
          <div className="flex-1" />
          <Button
            size="sm"
            variant="ghost"
            className="gap-2"
            onClick={() => {
              void navigator.clipboard.writeText(json);
              toast.success("Payload copiado.");
            }}
          >
            <Copy className="h-4 w-4" /> Copiar JSON
          </Button>
        </div>

        <div className="overflow-auto flex-1">
          {aba === "diagnostico" ? (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b">
                  <th className="text-left py-2">Item</th>
                  <th className="text-right">qCom × vUnCom</th>
                  <th className="text-right">qTrib × vUnTrib</th>
                  <th className="text-right">vProd</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {diagnosticos.map((d, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-2 pr-2">{d.description ?? `Item ${idx + 1}`}</td>
                    <td className="text-right tabular-nums">
                      {d.quantity} × {d.unitAmount} = {d.totalComercialCalculado}
                    </td>
                    <td className="text-right tabular-nums">
                      {d.quantityTax} × {d.unitTaxAmount} = {d.totalTributavelCalculado}
                    </td>
                    <td className="text-right tabular-nums">{d.totalAmount}</td>
                    <td className="text-right">
                      {d.ok ? (
                        <Badge variant="outline" className="border-emerald-500/40 text-emerald-600">
                          OK
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Divergente</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <pre className="text-xs bg-surface-muted/40 rounded-lg p-4 overflow-auto whitespace-pre-wrap break-all">
              {json}
            </pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
