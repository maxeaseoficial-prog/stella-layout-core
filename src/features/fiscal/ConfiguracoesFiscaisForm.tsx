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
  carregarSegredosFiscais, 
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
import { cn } from "@/lib/utils";

export function ConfiguracoesFiscaisForm() {
  const { config, salvar, carregando } = useFiscalConfig();
  const [form, setForm] = useState(config);
  const [testando, setTestando] = useState(false);
  const [salvandoChave, setSalvandoChave] = useState(false);
  const [removendoChave, setRemovendoChave] = useState(false);
  const [chaveInput, setChaveInput] = useState("");
  const [mostrarChave, setMostrarChave] = useState(false);
  const [statusChave, setStatusChave] = useState<{ 
    configurada: boolean; 
    parcial: string | null 
  } | null>(null);
  const [dialogRemover, setDialogRemover] = useState(false);

  // Carrega status das chaves
  async function carregarStatus() {
    try {
      const res = await carregarSegredosFiscais();
      setStatusChave(res);
    } catch (error) {
      console.error("Erro ao carregar status da chave:", error);
    }
  }

  useEffect(() => {
    carregarStatus();
  }, []);

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

  async function handleSalvarChave() {
    if (!chaveInput.trim()) return;
    setSalvandoChave(true);
    try {
      await salvarSegredoFiscal({ data: { chave: chaveInput.trim() } });
      await carregarStatus();
      setChaveInput("");
      setMostrarChave(false);
      toast.success("Credencial da API Spedy salva com sucesso.");
    } catch (error) {
      toast.error("Erro ao salvar credencial.");
    } finally {
      setSalvandoChave(false);
    }
  }

  async function handleRemoverChave() {
    setRemovendoChave(true);
    try {
      await removerSegredoFiscal({ data: { ambiente: form.ambienteApi } });
      await carregarStatus();
      setDialogRemover(false);
      toast.success("Credencial da API Spedy removida.");
    } catch (error) {
      toast.error("Erro ao remover credencial.");
    } finally {
      setRemovendoChave(false);
    }
  }

  async function handleTestar() {
    setTestando(true);
    try {
      const res = await testarConexaoFiscal();
      if (res.ok) {
        toast.success(res.mensagem);
      } else {
        // Trata mensagens de erro de forma mais amigável e segura
        if (res.mensagem.toLowerCase().includes("auth") || res.mensagem.includes("401") || res.mensagem.includes("403")) {
          toast.error("Credencial da API Spedy inválida ou sem permissão. Verifique a chave cadastrada.");
        } else {
          toast.error(res.mensagem);
        }
      }
    } catch (error: any) {
      console.error("Erro ao testar conexão:", error);
      toast.error("Falha na comunicação com o servidor.");
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
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
            <Key className="h-4 w-4" /> API NOTA FISCAL
          </CardTitle>
          <CardDescription>Configure as credenciais utilizadas para comunicação com o serviço Spedy.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Ambiente Fiscal NF-e</Label>
            <Select value={form.ambienteFiscal} onValueChange={v => setForm({...form, ambienteFiscal: v as any})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="homologacao">Homologação (Sem valor fiscal)</SelectItem>
                <SelectItem value="producao">Produção (Com valor fiscal)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              Define se a nota terá validade jurídica (Produção) ou apenas para testes (Homologação).
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Ambiente da API (Spedy)</Label>
            <Select value={form.ambienteApi} onValueChange={v => setForm({...form, ambienteApi: v as any})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="producao">Produção (Live)</SelectItem>
                <SelectItem value="sandbox">Sandbox (Desenvolvimento)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label>Chave da API Spedy</Label>
            <div className="relative">
              <Input 
                type={mostrarChave ? "text" : "password"}
                placeholder="Cole a credencial da API Spedy"
                value={chaveInput}
                onChange={e => setChaveInput(e.target.value)}
                className="pr-10"
              />
              {chaveInput.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMostrarChave(!mostrarChave)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {mostrarChave ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-muted-foreground">Status:</span>
              {statusChave?.configurada ? (
                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Credencial configurada {statusChave.parcial && `(${statusChave.parcial})`}
                </span>
              ) : (
                <span className="text-[11px] font-medium text-amber-600 flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> Credencial não configurada
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <div className="flex gap-2">
              <Button 
                className="flex-1 gap-2" 
                onClick={handleSalvarChave}
                disabled={salvandoChave || !chaveInput.trim()}
              >
                {salvandoChave ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-2" 
                onClick={handleTestar} 
                disabled={testando || !statusChave?.configurada}
              >
                <RefreshCw className={cn("h-4 w-4", testando && "animate-spin")} />
                Testar conexão
              </Button>
            </div>
            
            {statusChave?.configurada && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
                onClick={() => setDialogRemover(true)}
              >
                <Trash2 className="h-4 w-4" /> Remover credencial
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" /> Preferências Fiscais
          </CardTitle>
          <CardDescription>Configurações gerais de comportamento fiscal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <div className="pt-2">
            <Button size="sm" className="w-full gap-2" onClick={handleSalvar}>
              <Save className="h-4 w-4" /> Salvar Preferências
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={dialogRemover} onOpenChange={setDialogRemover}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover credencial?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja remover a credencial da API Spedy?
              Esta ação impedirá a emissão de novas notas neste ambiente até que uma nova chave seja configurada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoverChave}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={removendoChave}
            >
              {removendoChave ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sim, remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
