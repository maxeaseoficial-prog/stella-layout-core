import { Settings2 } from "lucide-react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useConfiguracoes } from "../useConfiguracoes";
import type { FormatoData, FormatoHora, Idioma, Moeda } from "../types";
import { SectionCard } from "../SectionCard";

export function PreferenciasTab() {
  const { state, salvarPreferencias } = useConfiguracoes();
  const p = state.preferencias;

  function update<K extends keyof typeof p>(key: K, value: (typeof p)[K]) {
    salvarPreferencias({ ...p, [key]: value });
    toast.success("Preferência atualizada.");
  }

  return (
    <SectionCard
      title="Preferências gerais"
      description="Formato de exibição usado em todo o sistema."
      icon={<Settings2 className="h-4 w-4" />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Moeda</Label>
          <Select value={p.moeda} onValueChange={(v) => update("moeda", v as Moeda)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">Real (R$)</SelectItem>
              <SelectItem value="USD">Dólar (US$)</SelectItem>
              <SelectItem value="EUR">Euro (€)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Idioma</Label>
          <Select value={p.idioma} onValueChange={(v) => update("idioma", v as Idioma)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Formato de data</Label>
          <Select value={p.formatoData} onValueChange={(v) => update("formatoData", v as FormatoData)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="DD/MM/AAAA">DD/MM/AAAA</SelectItem>
              <SelectItem value="MM/DD/AAAA">MM/DD/AAAA</SelectItem>
              <SelectItem value="AAAA-MM-DD">AAAA-MM-DD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Formato de hora</Label>
          <Select value={p.formatoHora} onValueChange={(v) => update("formatoHora", v as FormatoHora)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 horas</SelectItem>
              <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </SectionCard>
  );
}
