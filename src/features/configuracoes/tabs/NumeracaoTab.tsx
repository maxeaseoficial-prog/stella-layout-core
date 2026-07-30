import { useEffect, useState } from "react";
import { Hash } from "lucide-react";
import { toast } from "@/lib/toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatarNumeracao, useConfiguracoes } from "../useConfiguracoes";
import { LABEL_TIPO_NUMERACAO, type ConfigNumeracao, type TipoNumeracao } from "../types";
import { SectionCard } from "../SectionCard";

const TIPOS: TipoNumeracao[] = ["pedido", "orcamento", "notaFiscal"];

interface LinhaProps {
  tipo: TipoNumeracao;
}

function LinhaNumeracao({ tipo }: LinhaProps) {
  const { state, salvarNumeracao } = useConfiguracoes();
  const cfg = state.numeracao[tipo];
  const [form, setForm] = useState<ConfigNumeracao>(cfg);

  useEffect(() => setForm(cfg), [cfg.proximo, cfg.digitos, cfg.prefixo]);

  const proximos = [0, 1, 2].map((i) => formatarNumeracao(form, form.proximo + i));

  function salvar() {
    if (form.proximo < 1) {
      toast.error("O número inicial deve ser maior que zero.");
      return;
    }
    if (form.digitos < 1 || form.digitos > 12) {
      toast.error("Dígitos entre 1 e 12.");
      return;
    }
    salvarNumeracao(tipo, form);
    toast.success(`Numeração de ${LABEL_TIPO_NUMERACAO[tipo].toLowerCase()} atualizada.`);
  }

  return (
    <div className="rounded-xl border border-border bg-background/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{LABEL_TIPO_NUMERACAO[tipo]}</h4>
          <p className="text-xs text-muted-foreground">
            Sequência automática. Números duplicados são impedidos.
          </p>
        </div>
        <Button size="sm" onClick={salvar}>Salvar</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Prefixo</Label>
          <Input
            value={form.prefixo}
            onChange={(e) => setForm((f) => ({ ...f, prefixo: e.target.value }))}
            placeholder="Ex: PED-"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Próximo número</Label>
          <Input
            type="number"
            min={1}
            value={form.proximo}
            onChange={(e) => setForm((f) => ({ ...f, proximo: Number(e.target.value) || 1 }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Dígitos</Label>
          <Input
            type="number"
            min={1}
            max={12}
            value={form.digitos}
            onChange={(e) => setForm((f) => ({ ...f, digitos: Number(e.target.value) || 1 }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Prévia</Label>
          <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-muted/40 px-2 py-1.5 text-xs font-mono text-foreground">
            {proximos.map((n) => (
              <span key={n} className="rounded bg-background px-1.5 py-0.5">{n}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NumeracaoTab() {
  return (
    <SectionCard
      title="Numeração automática"
      description="Configure a sequência de pedidos, orçamentos e notas fiscais."
      icon={<Hash className="h-4 w-4" />}
      contentClassName="space-y-3"
    >
      {TIPOS.map((t) => <LinhaNumeracao key={t} tipo={t} />)}
    </SectionCard>
  );
}
