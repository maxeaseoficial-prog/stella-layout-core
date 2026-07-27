import { Package, Layers } from "lucide-react";

import { StatCard } from "@/components/common/StatCard";
import { useProdutos } from "@/features/produtos/useProdutos";
import { useAdicionais } from "@/features/adicionais/useAdicionais";

export function ProdutosMiniDashboard() {
  const { produtos } = useProdutos();
  const { adicionais } = useAdicionais();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
      <StatCard
        label="Total de produtos cadastrados"
        value={String(produtos.length)}
        hint="Produtos ativos e inativos"
        icon={Package}
      />
      <StatCard
        label="Total de adicionais cadastrados"
        value={String(adicionais.length)}
        hint="Adicionais ativos e inativos"
        icon={Layers}
      />
    </div>
  );
}
