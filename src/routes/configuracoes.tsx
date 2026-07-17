import { createFileRoute } from "@tanstack/react-router";
import { Building2, Users, Bell, Palette, ShieldCheck, Plug } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { PlaceholderPanel } from "@/components/common/PlaceholderPanel";

export const Route = createFileRoute("/configuracoes")({
  component: ConfiguracoesPage,
});

const sections = [
  { icon: Building2, title: "Empresa", description: "Dados da Stella e informações fiscais." },
  { icon: Users, title: "Equipe", description: "Usuários e permissões de acesso." },
  { icon: Bell, title: "Notificações", description: "Preferências de alertas e avisos." },
  { icon: Palette, title: "Aparência", description: "Tema e personalização visual." },
  { icon: ShieldCheck, title: "Segurança", description: "Autenticação e políticas de senha." },
  { icon: Plug, title: "Integrações", description: "Conexões com serviços externos." },
];

function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Ajuste preferências gerais do sistema."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map((s) => (
          <PlaceholderPanel key={s.title}>
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-1">
                <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                <p className="text-xs text-muted-foreground">{s.description}</p>
              </div>
            </div>
          </PlaceholderPanel>
        ))}
      </div>
    </div>
  );
}
