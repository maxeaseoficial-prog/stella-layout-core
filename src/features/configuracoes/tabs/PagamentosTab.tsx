import { useState } from "react";
import { CreditCard, Pencil, Plus, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useConfiguracoes } from "../useConfiguracoes";
import { SectionCard } from "../SectionCard";
import type { FormaPagamento } from "../types";

export function PagamentosTab() {
  const { state, criarFormaPagamento, editarFormaPagamento, excluirFormaPagamento } = useConfiguracoes();
  const [novo, setNovo] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editValor, setEditValor] = useState("");

  function adicionar() {
    if (!novo.trim()) return;
    const res = criarFormaPagamento(novo);
    if (!res) {
      toast.error("Já existe uma forma de pagamento com esse nome.");
      return;
    }
    setNovo("");
    toast.success("Forma de pagamento adicionada.");
  }

  function iniciarEdicao(f: FormaPagamento) {
    setEditandoId(f.id);
    setEditValor(f.nome);
  }

  function salvarEdicao(id: string) {
    if (!editarFormaPagamento(id, { nome: editValor })) {
      toast.error("Nome inválido ou já existente.");
      return;
    }
    setEditandoId(null);
    toast.success("Forma atualizada.");
  }

  return (
    <SectionCard
      title="Formas de pagamento"
      description="Serão utilizadas automaticamente em Pedidos e Caixa."
      icon={<CreditCard className="h-4 w-4" />}
    >
      <div className="mb-3 flex gap-2">
        <Input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); adicionar(); } }}
          placeholder="Nova forma de pagamento"
        />
        <Button size="sm" onClick={adicionar}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Adicionar
        </Button>
      </div>

      {state.formasPagamento.length === 0 ? (
        <p className="rounded-md border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
          Nenhuma forma de pagamento cadastrada.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {state.formasPagamento.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-3 px-3 py-2">
              {editandoId === f.id ? (
                <>
                  <Input
                    value={editValor}
                    autoFocus
                    onChange={(e) => setEditValor(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") salvarEdicao(f.id);
                      if (e.key === "Escape") setEditandoId(null);
                    }}
                    className="h-8"
                  />
                  <div className="flex shrink-0 gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => salvarEdicao(f.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditandoId(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="min-w-0 flex-1 truncate text-sm text-foreground">{f.nome}</div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={f.ativo}
                        onCheckedChange={(v) => editarFormaPagamento(f.id, { ativo: v })}
                      />
                      <span className="text-xs text-muted-foreground">{f.ativo ? "Ativa" : "Inativa"}</span>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => iniciarEdicao(f)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => { excluirFormaPagamento(f.id); toast.success("Forma removida."); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
