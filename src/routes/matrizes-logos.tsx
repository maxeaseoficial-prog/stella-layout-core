import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Upload } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { PlaceholderPanel } from "@/components/common/PlaceholderPanel";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/matrizes-logos")({
  component: MatrizesLogosPage,
});

function MatrizesLogosPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Matrizes & Logos"
        description="Arquivos de bordado, matrizes e artes de clientes."
        actions={
          <Button size="sm">
            <Upload className="h-4 w-4" />
            Enviar arquivo
          </Button>
        }
      />

      <PlaceholderPanel title="Biblioteca">
        <EmptyState
          icon={Sparkles}
          title="Sem arquivos"
          description="As matrizes e logos organizadas por cliente aparecerão aqui."
        />
      </PlaceholderPanel>
    </div>
  );
}
