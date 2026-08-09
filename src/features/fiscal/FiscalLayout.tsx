import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Settings, 
  History,
  FileSearch,
  Plus,
  FileText
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FiscalDashboard } from "./FiscalDashboard";
import { PedidosPendentesFiscal } from "./PedidosPendentesFiscal";
import { NotasEmitidasFiscal } from "./NotasEmitidasFiscal";
import { TodasNotasFiscal } from "./TodasNotasFiscal";
import { CategoriasFiscaisManager } from "./CategoriasFiscaisManager";
import { ConfiguracoesFiscaisForm } from "./ConfiguracoesFiscaisForm";
import { NotasAvulsasFiscal } from "./NotasAvulsasFiscal";
import { NfeAvulsaDrawer } from "./NfeAvulsaDrawer";
import { useServerFn } from "@tanstack/react-start";
import { getBuildInfo } from "@/lib/debug.functions";

export function FiscalLayout() {
  const [abaAtiva, setAbaAtiva] = useState("visao-geral");
  const [nfeAvulsaAberta, setNfeAvulsaAberta] = useState(false);
  const buildInfoFn = useServerFn(getBuildInfo);

  useEffect(() => {
    buildInfoFn()
      .then(info => {
        console.log("=== BUILD INFO (SERVER-SIDE) ===");
        console.log("Commit SHA:", info.commitSha);
        console.log("Timestamp:", info.buildTimestamp);
        console.log("Environment:", info.environment);
        console.log("Marker:", info.serverMarker);
        console.log("================================");
      })
      .catch(err => console.error("Falha ao obter Build Info:", err));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fiscal"
        description="Gestão completa de NF-e, categorias tributárias e integração fiscal."
        actions={
          <Button 
            className="gap-2 bg-primary hover:bg-primary/90" 
            onClick={() => setNfeAvulsaAberta(true)}
          >
            <Plus className="h-4 w-4" /> Emitir NF-e avulsa
          </Button>
        }
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
          <TabsTrigger value="avulsas" className="gap-2 px-4">
            <FileText className="h-4 w-4" /> NF-e Avulsas
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
        <TabsContent value="avulsas">
          <NotasAvulsasFiscal />
        </TabsContent>
        <TabsContent value="categorias">
          <CategoriasFiscaisManager />
        </TabsContent>
        <TabsContent value="config">
          <ConfiguracoesFiscaisForm />
        </TabsContent>
      </Tabs>

      <NfeAvulsaDrawer 
        aberto={nfeAvulsaAberta} 
        onFechar={() => setNfeAvulsaAberta(false)} 
      />
    </div>
  );
}
