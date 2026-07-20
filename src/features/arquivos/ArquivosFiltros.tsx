import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type { TipoArquivo } from "./types";

type FiltroTipo = TipoArquivo | "todos";

const OPCOES: { id: FiltroTipo; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "logo", label: "Logos" },
  { id: "matriz", label: "Matrizes" },
  { id: "arte", label: "Artes" },
  { id: "pdf", label: "PDFs" },
  { id: "outro", label: "Outros" },
];

interface Props {
  termo: string;
  onTermo: (v: string) => void;
  tipo: FiltroTipo;
  onTipo: (t: FiltroTipo) => void;
}

export function ArquivosFiltros({ termo, onTermo, tipo, onTipo }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={termo}
          onChange={(e) => onTermo(e.target.value)}
          placeholder="Pesquisar por cliente, empresa ou nome do arquivo"
          className="pl-9"
        />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {OPCOES.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onTipo(o.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              tipo === o.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export type { FiltroTipo };
