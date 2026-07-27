import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProdutosMiniDashboard } from "@/features/produtos/ProdutosMiniDashboard";
import { ProdutosPanel } from "@/features/produtos/ProdutosPanel";
import { AdicionaisPanel } from "@/features/adicionais/AdicionaisPanel";

export const Route = createFileRoute("/produtos")({
  component: ProdutosPage,
});

function ProdutosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        description="Gerencie o catálogo de produtos comercializados e os adicionais aplicáveis a cada pedido."
      />

      <ProdutosMiniDashboard />

      <Tabs defaultValue="produtos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="adicionais">Adicionais</TabsTrigger>
        </TabsList>

        <TabsContent value="produtos" className="space-y-6">
          <ProdutosPanel />
        </TabsContent>

        <TabsContent value="adicionais" className="space-y-6">
          <AdicionaisPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
