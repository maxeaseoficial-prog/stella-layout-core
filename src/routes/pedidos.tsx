import { createFileRoute } from "@tanstack/react-router";
import { ShoppingBag, Plus } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { PlaceholderPanel } from "@/components/common/PlaceholderPanel";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/pedidos")({
  component: PedidosPage,
});

function PedidosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        description="Acompanhe todos os pedidos e seus estágios."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Novo pedido
          </Button>
        }
      />

      <Tabs defaultValue="todos">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="producao">Em produção</TabsTrigger>
          <TabsTrigger value="entregues">Entregues</TabsTrigger>
        </TabsList>
      </Tabs>

      <PlaceholderPanel title="Pedidos">
        <EmptyState
          icon={ShoppingBag}
          title="Nenhum pedido registrado"
          description="Assim que um pedido for criado ele aparecerá aqui."
        />
      </PlaceholderPanel>
    </div>
  );
}
