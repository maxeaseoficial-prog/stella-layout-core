import { createFileRoute } from "@tanstack/react-router";
import { Users, UserPlus } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { PlaceholderPanel } from "@/components/common/PlaceholderPanel";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/clientes")({
  component: ClientesPage,
});

function ClientesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gerencie a base de clientes da Stella."
        actions={
          <Button size="sm">
            <UserPlus className="h-4 w-4" />
            Novo cliente
          </Button>
        }
      />

      <PlaceholderPanel title="Lista de clientes">
        <EmptyState
          icon={Users}
          title="Nenhum cliente cadastrado"
          description="Os clientes cadastrados aparecerão nesta lista."
        />
      </PlaceholderPanel>
    </div>
  );
}
