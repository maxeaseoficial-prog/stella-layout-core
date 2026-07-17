import { createFileRoute } from "@tanstack/react-router";
import { Truck, Plus } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { PlaceholderPanel } from "@/components/common/PlaceholderPanel";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/fornecedores")({
  component: FornecedoresPage,
});

function FornecedoresPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Fornecedores"
        description="Parceiros e fornecedores da Stella."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Novo fornecedor
          </Button>
        }
      />

      <PlaceholderPanel title="Lista de fornecedores">
        <EmptyState
          icon={Truck}
          title="Nenhum fornecedor cadastrado"
          description="Os fornecedores cadastrados aparecerão nesta lista."
        />
      </PlaceholderPanel>
    </div>
  );
}
