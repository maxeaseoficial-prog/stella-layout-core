import { ShieldCheck, UserCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useConfiguracoes } from "../useConfiguracoes";
import { LABEL_PAPEL, type PapelUsuario } from "../types";
import { SectionCard } from "../SectionCard";

const PAPEIS_FUTUROS: PapelUsuario[] = ["operador_matriz", "financeiro", "producao", "vendas"];

export function UsuariosTab() {
  const { state } = useConfiguracoes();

  return (
    <SectionCard
      title="Usuários e permissões"
      description="Cadastro de usuários e controle de acesso serão liberados em breve."
      icon={<ShieldCheck className="h-4 w-4" />}
    >
      <div className="space-y-4">
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ativos
          </h4>
          <ul className="space-y-2">
            {state.usuarios.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-primary">
                    <UserCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.nome}</p>
                    <p className="text-xs text-muted-foreground">{LABEL_PAPEL[u.papel]}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-primary-soft text-primary">Ativo</Badge>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Perfis previstos
          </h4>
          <div className="flex flex-wrap gap-2">
            {PAPEIS_FUTUROS.map((p) => (
              <Badge key={p} variant="outline" className="border-dashed text-muted-foreground">
                {LABEL_PAPEL[p]}
              </Badge>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            O sistema de login e permissões será habilitado em uma próxima etapa.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
