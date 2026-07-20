import { FileText, Layers, Sparkles, Users } from "lucide-react";

import { StatCard } from "@/components/common/StatCard";

interface Props {
  clientesComArquivos: number;
  logos: number;
  matrizes: number;
  outros: number;
}

export function ArquivosStatsCards({
  clientesComArquivos,
  logos,
  matrizes,
  outros,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Clientes com arquivos"
        value={clientesComArquivos.toString()}
        icon={Users}
        hint="Base com material cadastrado"
      />
      <StatCard
        label="Logos"
        value={logos.toString()}
        icon={Sparkles}
        hint="Total no acervo"
      />
      <StatCard
        label="Matrizes"
        value={matrizes.toString()}
        icon={Layers}
        hint="Arquivos de bordado"
      />
      <StatCard
        label="Outros arquivos"
        value={outros.toString()}
        icon={FileText}
        hint="PDFs, artes e documentos"
      />
    </div>
  );
}
