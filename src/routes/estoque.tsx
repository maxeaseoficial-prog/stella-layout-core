import { createFileRoute } from "@tanstack/react-router";
import { Package, PackagePlus, AlertTriangle, Boxes } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { PlaceholderPanel } from "@/components/common/PlaceholderPanel";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/estoque")({
  component: EstoquePage,
});

function EstoquePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Estoque"
        description="Controle de produtos, variações e níveis de estoque."
        actions={
          <Button size="sm">
            <PackagePlus className="h-4 w-4" />
            Novo produto
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Produtos" value="—" icon={Package} />
        <StatCard label="Itens totais" value="—" icon={Boxes} />
        <StatCard label="Estoque baixo" value="—" icon={AlertTriangle} />
      </div>

      <PlaceholderPanel title="Produtos">
        <EmptyState
          icon={Package}
          title="Sem produtos cadastrados"
          description="Cadastre o primeiro produto para começar a controlar o estoque."
        />
      </PlaceholderPanel>
    </div>
  );
}
