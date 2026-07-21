import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  CreditCard,
  Database,
  Hash,
  Info,
  Palette,
  Settings2,
  ShieldCheck,
  Tag,
  UserCircle2,
} from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmpresaTab } from "@/features/configuracoes/tabs/EmpresaTab";
import { PreferenciasTab } from "@/features/configuracoes/tabs/PreferenciasTab";
import { NumeracaoTab } from "@/features/configuracoes/tabs/NumeracaoTab";
import { CategoriasTab } from "@/features/configuracoes/tabs/CategoriasTab";
import { PagamentosTab } from "@/features/configuracoes/tabs/PagamentosTab";
import { BackupTab } from "@/features/configuracoes/tabs/BackupTab";
import { UsuariosTab } from "@/features/configuracoes/tabs/UsuariosTab";
import { AparenciaTab } from "@/features/configuracoes/tabs/AparenciaTab";
import { SobreTab } from "@/features/configuracoes/tabs/SobreTab";
import { PerfilTab } from "@/features/configuracoes/tabs/PerfilTab";
import { useAuth } from "@/features/auth/useAuth";

export const Route = createFileRoute("/configuracoes")({
  component: ConfiguracoesPage,
});

const TABS_ADMIN = [
  { value: "empresa", label: "Empresa", icon: Building2, render: () => <EmpresaTab /> },
  { value: "preferencias", label: "Preferências", icon: Settings2, render: () => <PreferenciasTab /> },
  { value: "numeracao", label: "Numeração", icon: Hash, render: () => <NumeracaoTab /> },
  { value: "categorias", label: "Categorias", icon: Tag, render: () => <CategoriasTab /> },
  { value: "pagamentos", label: "Pagamentos", icon: CreditCard, render: () => <PagamentosTab /> },
  { value: "backup", label: "Backup", icon: Database, render: () => <BackupTab /> },
  { value: "usuarios", label: "Usuários", icon: ShieldCheck, render: () => <UsuariosTab /> },
  { value: "aparencia", label: "Aparência", icon: Palette, render: () => <AparenciaTab /> },
  { value: "sobre", label: "Sobre", icon: Info, render: () => <SobreTab /> },
] as const;

const TABS_OPERADOR = [
  { value: "perfil", label: "Perfil", icon: UserCircle2, render: () => <PerfilTab /> },
  { value: "aparencia", label: "Aparência", icon: Palette, render: () => <AparenciaTab /> },
  { value: "sobre", label: "Sobre", icon: Info, render: () => <SobreTab /> },
] as const;

function ConfiguracoesPage() {
  const { capacidades } = useAuth();
  const tabs = capacidades.configuracoes.admin ? TABS_ADMIN : TABS_OPERADOR;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description={
          capacidades.configuracoes.admin
            ? "Gerencie as configurações gerais do sistema."
            : "Gerencie seu perfil e preferências pessoais."
        }
      />

      <Tabs defaultValue={tabs[0].value} className="w-full">
        <div className="-mx-1 overflow-x-auto pb-1">
          <TabsList className="inline-flex h-auto flex-nowrap gap-1 rounded-xl bg-muted/60 p-1">
            {tabs.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value} className="mt-6">
            {t.render()}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

