import { Boxes, PackageX, AlertTriangle, DollarSign } from "lucide-react";

import { StatCard } from "@/components/common/StatCard";
import { formatarMoeda } from "@/features/pedidos";

interface Props {
  total: number;
  baixo: number;
  sem: number;
  valor: number;
}

export function EstoqueStatsCards({ total, baixo, sem, valor }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Itens cadastrados"
        value={total.toString()}
        icon={Boxes}
        hint="No catálogo de materiais"
      />
      <StatCard
        label="Estoque baixo"
        value={baixo.toString()}
        icon={AlertTriangle}
        hint="Abaixo ou igual ao mínimo"
      />
      <StatCard
        label="Sem estoque"
        value={sem.toString()}
        icon={PackageX}
        hint="Quantidade zerada"
      />
      <StatCard
        label="Valor estimado"
        value={formatarMoeda(valor)}
        icon={DollarSign}
        hint="Quantidade × preço de compra"
      />
    </div>
  );
}
