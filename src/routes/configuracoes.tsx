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

export const Route = createFileRoute("/configuracoes")({
  component: ConfiguracoesPage,
});

const TABS = [
  { value: "empresa", label: "Empresa", icon: Building2 },
  { value: "preferencias", label: "Preferências", icon: Settings2 },
  { value: "numeracao", label: "Numeração", icon: Hash },
  { value: "categorias", label: "Categorias", icon: Tag },
  { value: "pagamentos", label: "Pagamentos", icon: CreditCard },
  { value: "backup", label: "Backup", icon: Database },
  { value: "usuarios", label: "Usuários", icon: ShieldCheck },
  { value: "aparencia", label: "Aparência", icon: Palette },
  { value: "sobre", label: "Sobre", icon: Info },
] as const;

function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações gerais do sistema."
      />

      <Tabs defaultValue="empresa" className="w-full">
        <div className="-mx-1 overflow-x-auto pb-1">
          <TabsList className="inline-flex h-auto flex-nowrap gap-1 rounded-xl bg-muted/60 p-1">
            {TABS.map((t) => (
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

        <TabsContent value="empresa" className="mt-6"><EmpresaTab /></TabsContent>
        <TabsContent value="preferencias" className="mt-6"><PreferenciasTab /></TabsContent>
        <TabsContent value="numeracao" className="mt-6"><NumeracaoTab /></TabsContent>
        <TabsContent value="categorias" className="mt-6"><CategoriasTab /></TabsContent>
        <TabsContent value="pagamentos" className="mt-6"><PagamentosTab /></TabsContent>
        <TabsContent value="backup" className="mt-6"><BackupTab /></TabsContent>
        <TabsContent value="usuarios" className="mt-6"><UsuariosTab /></TabsContent>
        <TabsContent value="aparencia" className="mt-6"><AparenciaTab /></TabsContent>
        <TabsContent value="sobre" className="mt-6"><SobreTab /></TabsContent>
      </Tabs>
    </div>
  );
}
