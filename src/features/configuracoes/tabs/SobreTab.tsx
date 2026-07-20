import { Info, Mail, Globe } from "lucide-react";

import { SISTEMA_INFO } from "../defaults";
import { SectionCard } from "../SectionCard";
import { formatarDataBR } from "@/features/clientes/utils";

export function SobreTab() {
  const s = SISTEMA_INFO;
  return (
    <SectionCard
      title="Sobre o sistema"
      description="Informações do ERP e da empresa desenvolvedora."
      icon={<Info className="h-4 w-4" />}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-background/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sistema
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">{s.nome}</p>
          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            <p><span className="font-medium text-foreground">Versão:</span> {s.versao}</p>
            <p><span className="font-medium text-foreground">Data da versão:</span> {formatarDataBR(s.dataVersao)}</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Desenvolvido por
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">{s.desenvolvedora.nome}</p>
          <div className="mt-3 space-y-1.5 text-xs">
            <a
              className="flex items-center gap-1.5 text-primary hover:underline"
              href={s.desenvolvedora.site}
              target="_blank"
              rel="noreferrer"
            >
              <Globe className="h-3.5 w-3.5" /> {s.desenvolvedora.site.replace(/^https?:\/\//, "")}
            </a>
            <a
              className="flex items-center gap-1.5 text-primary hover:underline"
              href={`mailto:${s.desenvolvedora.contato}`}
            >
              <Mail className="h-3.5 w-3.5" /> {s.desenvolvedora.contato}
            </a>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
