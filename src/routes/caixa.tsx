import { createFileRoute } from "@tanstack/react-router";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Scale } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { PlaceholderPanel } from "@/components/common/PlaceholderPanel";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/caixa")({
  component: CaixaPage,
});

function CaixaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Caixa"
        description="Movimentações de entrada, saída e fechamento diário."
        actions={
          <>
            <Button variant="outline" size="sm">
              Fechar caixa
            </Button>
            <Button size="sm">Nova movimentação</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Saldo atual" value="—" icon={Wallet} />
        <StatCard label="Entradas" value="—" icon={ArrowDownCircle} />
        <StatCard label="Saídas" value="—" icon={ArrowUpCircle} />
        <StatCard label="Resultado" value="—" icon={Scale} />
      </div>

      <PlaceholderPanel title="Movimentações do dia">
        <EmptyState
          icon={Wallet}
          title="Sem movimentações"
          description="As entradas e saídas do dia aparecerão aqui."
        />
      </PlaceholderPanel>
    </div>
  );
}
