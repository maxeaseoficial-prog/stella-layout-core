import { useState, useEffect } from "react";
import { 
  Building2, 
  Settings2, 
  ShieldCheck, 
  Globe, 
  Save, 
  RefreshCw,
  AlertTriangle,
  Key,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useFiscalConfig } from "./useFiscalConfig";
import { toast } from "@/lib/toast";
import { 
  testarConexaoFiscal, 
  carregarSegredoFiscal, 
  salvarSegredoFiscal, 
  removerSegredoFiscal 
} from "@/lib/fiscal.functions";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ConfiguracoesFiscaisForm() {
  const { config, salvar, carregando } = useFiscalConfig();
  const [form, setForm] = useState(config);
  const [testando, setTestando] = useState(false);

  // Sincroniza o estado local quando os dados são carregados do backend
  useEffect(() => {
    if (!carregando) {
      setForm(config);
    }
  }, [config, carregando]);

  async function handleSalvar() {
    try {
      await salvar(form);
      toast.success("Configurações fiscais salvas com sucesso.");
    } catch (error) {
      toast.error("Erro ao salvar configurações.");
    }
  }


  async function handleTestar() {
    setTestando(true);
    try {
      const res = await testarConexaoFiscal();
      if (res.ok) {
        toast.success(res.mensagem);
      } else {
        toast.error(res.mensagem);
      }
    } catch (error) {
      toast.error("Falha ao tentar conectar com a Spedy.");
    } finally {
      setTestando(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" /> Dados da Empresa
          </CardTitle>
          <CardDescription>Informações do emissor na NF-e.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Razão Social</Label>
            <Input value={form.empresa.razaoSocial} onChange={e => setForm({...form, empresa: {...form.empresa, razaoSocial: e.target.value}})} />
          </div>
          <div className="grid gap-2">
            <Label>CNPJ</Label>
            <Input value={form.empresa.cnpj} onChange={e => setForm({...form, empresa: {...form.empresa, cnpj: e.target.value}})} />
          </div>
          <div className="grid gap-2">
            <Label>Inscrição Estadual</Label>
            <Input value={form.empresa.inscricaoEstadual} onChange={e => setForm({...form, empresa: {...form.empresa, inscricaoEstadual: e.target.value}})} />
          </div>
          <div className="pt-2">
            <Button size="sm" className="w-full gap-2" onClick={handleSalvar}>
              <Save className="h-4 w-4" /> Salvar Dados da Empresa
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" /> Integração Spedy
          </CardTitle>
          <CardDescription>Ambiente e chaves de acesso.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Ambiente</Label>
            <Select value={form.ambiente} onValueChange={v => setForm({...form, ambiente: v as any})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox (Testes)</SelectItem>
                <SelectItem value="producao">Produção (Real)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Regra de Liberação</Label>
            <Select value={form.liberacaoPedido} onValueChange={v => setForm({...form, liberacaoPedido: v as any})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="producao">Ao entrar em Produção</SelectItem>
                <SelectItem value="finalizado">Apenas após Finalizado</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">Define quando o pedido aparece no módulo fiscal.</p>
          </div>
          <div className="pt-2 flex gap-2">
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleTestar} disabled={testando}>
              <RefreshCw className={cn("h-4 w-4", testando && "animate-spin")} /> Testar Conexão
            </Button>
            <Button size="sm" className="w-full gap-2" onClick={handleSalvar}>
              <Save className="h-4 w-4" /> Salvar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 shadow-sm border-amber-200 bg-amber-50/20">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-4 w-4" /> Atenção
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-700">
          <p>As configurações de Tributação Padrão (NCM, CFOP, CSOSN/CST) estão configuradas para o 
             <strong> Simples Nacional</strong>. Alterações nessas regras afetam diretamente o cálculo de impostos na SEFAZ.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { cn } from "@/lib/utils";
