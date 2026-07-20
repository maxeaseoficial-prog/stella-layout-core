import { ArrowDownCircle, ArrowUpCircle, Scale, Wallet } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { formatarMoeda } from "./utils";

interface Props {
  saldo: number;
  entradas: number;
  saidas: number;
  resultado: number;
}

export function CaixaStatsCards({ saldo, entradas, saidas, resultado }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Saldo atual" value={formatarMoeda(saldo)} icon={Wallet} />
      <StatCard
        label="Entradas"
        value={formatarMoeda(entradas)}
        icon={ArrowDownCircle}
      />
      <StatCard label="Saídas" value={formatarMoeda(saidas)} icon={ArrowUpCircle} />
      <StatCard
        label="Resultado"
        value={formatarMoeda(resultado)}
        icon={Scale}
        trend={{
          value: resultado >= 0 ? "positivo" : "negativo",
          direction: resultado >= 0 ? "up" : "down",
        }}
      />
    </div>
  );
}
