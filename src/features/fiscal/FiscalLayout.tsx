import { useState } from "react";
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Settings, 
  History,
  FileSearch
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FiscalDashboard } from "./FiscalDashboard";
import { PedidosPendentesFiscal } from "./PedidosPendentesFiscal";
import { NotasEmitidasFiscal } from "./NotasEmitidasFiscal";
import { TodasNotasFiscal } from "./TodasNotasFiscal";
import { CategoriasFiscaisManager } from "./CategoriasFiscaisManager";
import { ConfiguracoesFiscaisForm } from "./ConfiguracoesFiscaisForm";

export function FiscalLayout() {
  const [abaAtiva, setAbaAtiva] = useState("visao-geral");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fiscal"
        description="Gestão completa de NF-e, categorias tributárias e integração fiscal."
      />

      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="space-y-6">
        <TabsList className="bg-surface p-1 shadow-sm h-11 border border-border overflow-x-auto overflow-y-hidden flex-nowrap w-full justify-start md:w-auto">
          <TabsTrigger value="visao-geral" className="gap-2 px-4">
            <BarChart3 className="h-4 w-4" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger value="pendentes" className="gap-2 px-4">
            <Clock className="h-4 w-4" /> Pendentes
          </TabsTrigger>
          <TabsTrigger value="emitidas" className="gap-2 px-4">
            <CheckCircle2 className="h-4 w-4" /> Emitidas
          </TabsTrigger>
          <TabsTrigger value="todas" className="gap-2 px-4">
            <FileSearch className="h-4 w-4" /> Todas
          </TabsTrigger>
          <TabsTrigger value="categorias" className="gap-2 px-4">
            <Settings className="h-4 w-4" /> Categorias Fiscais
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2 px-4">
            <History className="h-4 w-4" /> Configurações Fiscais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral">
          <FiscalDashboard onNavegar={setAbaAtiva} />
        </TabsContent>
        <TabsContent value="pendentes">
          <PedidosPendentesFiscal />
        </TabsContent>
        <TabsContent value="emitidas">
          <NotasEmitidasFiscal />
        </TabsContent>
        <TabsContent value="todas">
          <TodasNotasFiscal />
        </TabsContent>
        <TabsContent value="categorias">
          <CategoriasFiscaisManager />
        </TabsContent>
        <TabsContent value="config">
          <ConfiguracoesFiscaisForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
