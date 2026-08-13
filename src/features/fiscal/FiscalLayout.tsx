import { useState, useMemo } from "react";
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  FileText,
  Search,
  Filter,
  ArrowRight,
  Printer
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePedidos } from "@/features/pedidos/usePedidos";
import { useClientes, getClienteNome } from "@/features/clientes";
import { formatarMoeda, formatarDataBR, totalItensPedido } from "@/features/pedidos/utils";
import { DetalhesPedidoFiscal } from "@/features/pedidos/DetalhesPedidoFiscal";
import { cn } from "@/lib/utils";

export function FiscalLayout() {
  const [abaAtiva, setAbaAtiva] = useState("pendentes");
  const [busca, setBusca] = useState("");
  const { pedidos, marcarNotaEmitida } = usePedidos();
  const { clientes } = useClientes();
  const [pedidoSelecionado, setPedidoSelecionado] = useState<any | null>(null);

  const filtrados = useMemo(() => {
    // Ordenação padrão: mais recentes primeiro
    const ordenados = [...pedidos].sort((a, b) => 
      new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
    );

    return ordenados.filter(p => {
      const emitida = !!p.notaFiscalControle?.emitida;
      
      // Filtro de aba
      if (abaAtiva === "pendentes" && emitida) return false;
      if (abaAtiva === "emitidas" && !emitida) return false;

      // Filtro de busca
      if (busca.trim()) {
        const termo = busca.toLowerCase();
        const cliente = clientes.find(c => c.id === p.clienteId);
        const nomeCliente = cliente ? getClienteNome(cliente).toLowerCase() : "";
        const numero = p.numero.toLowerCase();
        
        return nomeCliente.includes(termo) || numero.includes(termo);
      }

      return true;
    });
  }, [pedidos, clientes, abaAtiva, busca]);

  const stats = useMemo(() => {
    const pendentes = pedidos.filter(p => !p.notaFiscalControle?.emitida).length;
    const emitidasMes = pedidos.filter(p => {
      if (!p.notaFiscalControle?.emitida) return false;
      const data = new Date(p.notaFiscalControle.emitidaEm!);
      const agora = new Date();
      return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
    }).length;

    return { pendentes, emitidasMes };
  }, [pedidos]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fiscal"
        description="Controle manual de faturamento de pedidos."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-md p-1.5 bg-amber-100 text-amber-700">
                <Clock className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pendentes de Emissão</span>
            </div>
            <div className="mt-3">
              <div className="text-xl font-bold text-foreground">{stats.pendentes}</div>
              <div className="text-[10px] text-muted-foreground">Aguardando faturamento externo</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-md p-1.5 bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Emitidas (Mês)</span>
            </div>
            <div className="mt-3">
              <div className="text-xl font-bold text-foreground">{stats.emitidasMes}</div>
              <div className="text-[10px] text-muted-foreground">Processadas este mês</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full md:w-auto">
          <TabsList className="bg-surface p-1 shadow-sm h-11 border border-border">
            <TabsTrigger value="pendentes" className="gap-2 px-4">
              <Clock className="h-4 w-4" /> Pendentes
            </TabsTrigger>
            <TabsTrigger value="emitidas" className="gap-2 px-4">
              <CheckCircle2 className="h-4 w-4" /> Emitidas
            </TabsTrigger>
            <TabsTrigger value="todos" className="gap-2 px-4">
              <FileText className="h-4 w-4" /> Todos
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative flex-1 min-w-[300px] md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar pedido ou cliente..."
            className="pl-9"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface-muted/50">
              <TableHead className="w-[120px]">Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status da Nota</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Nenhum pedido encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((p) => {
                const cliente = clientes.find(c => c.id === p.clienteId);
                const emitida = !!p.notaFiscalControle?.emitida;
                return (
                  <TableRow key={p.id} className="cursor-pointer hover:bg-surface-muted/30" onClick={() => setPedidoSelecionado(p)}>
                    <TableCell className="font-mono text-xs font-semibold">{p.numero}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{cliente ? getClienteNome(cliente) : "—"}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatarDataBR(p.criadoEm)}
                    </TableCell>
                    <TableCell className="text-sm font-semibold">{formatarMoeda(p.total)}</TableCell>
                    <TableCell>
                      {emitida ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          Emitida {p.notaFiscalControle?.emitidaEm && `em ${formatarDataBR(p.notaFiscalControle.emitidaEm)}`}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Pendente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="gap-2 h-8"
                          onClick={() => setPedidoSelecionado(p)}
                        >
                          Ver Detalhes <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <DetalhesPedidoFiscal 
        pedido={pedidoSelecionado}
        onFechar={() => setPedidoSelecionado(null)}
        onMarcarEmitida={marcarNotaEmitida}
      />
    </div>
  );
}