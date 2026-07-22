import { useState } from "react";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { useConfiguracoes } from "../useConfiguracoes";
import { SectionCard } from "../SectionCard";
import { CategoriaManager } from "../CategoriaManager";

export function PagamentosTab() {
  const {
    state,
    criarFormaPagamento,
    editarFormaPagamento,
    excluirFormaPagamento,
    reordenarFormasPagamento,
  } = useConfiguracoes();

  const lista = [...state.formasPagamento].sort(
    (a, b) => (a.ordem ?? 0) - (b.ordem ?? 0),
  );

  return (
    <SectionCard
      title="Formas de pagamento"
      description="Serão utilizadas automaticamente em Pedidos e Caixa. Reorganize arrastando pelo ícone à esquerda."
      icon={<CreditCard className="h-4 w-4" />}
    >
      <CategoriaManager
        titulo="Formas cadastradas"
        itens={lista.map((f) => ({ id: f.id, nome: f.nome }))}
        onCriar={(nome) => ({ ok: !!criarFormaPagamento(nome) })}
        onEditar={(id, nome) => ({ ok: editarFormaPagamento(id, { nome }) })}
        onExcluir={(id) => excluirFormaPagamento(id)}
        onReordenar={(ids) => reordenarFormasPagamento(ids)}
        labelBotao="Adicionar forma de pagamento"
        labelSingular="forma de pagamento"
        extraAcoes={(item) => {
          const original = lista.find((f) => f.id === item.id);
          if (!original) return null;
          return (
            <StatusSwitch
              ativo={original.ativo}
              onChange={(v) => editarFormaPagamento(item.id, { ativo: v })}
            />
          );
        }}
      />
    </SectionCard>
  );
}

function StatusSwitch({ ativo, onChange }: { ativo: boolean; onChange: (v: boolean) => void }) {
  const [local, setLocal] = useState(ativo);
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Switch
        checked={local}
        onCheckedChange={(v) => {
          setLocal(v);
          onChange(v);
          toast.success(v ? "Forma ativada." : "Forma desativada.");
        }}
      />
      <span className="text-xs text-muted-foreground">{local ? "Ativa" : "Inativa"}</span>
    </div>
  );
}
