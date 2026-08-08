import { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  Building, 
  Package, 
  Trash2, 
  Plus, 
  Check, 
  AlertCircle,
  Truck,
  CreditCard,
  FileText
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useClientes, getClienteNome } from "@/features/clientes";
import { useProdutos } from "@/features/produtos";
import { useNfeAvulsas } from "./useNfeAvulsas";
import { useFiscalConfig } from "./useFiscalConfig";
import { formatarMoeda, novoId } from "@/features/pedidos/utils";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { emitirNfeAvulsa } from "@/lib/fiscal-avulsa.functions";
import { supabase } from "@/integrations/supabase/client";
import { searchCategoriasFiscais } from "./ncm.functions";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
  aberto: boolean;
  onFechar: () => void;
}

export function NfeAvulsaDrawer({ aberto, onFechar }: Props) {
  const { clientes } = useClientes();
  const { ativos: produtos } = useProdutos();
  const { criar, atualizarNotaFiscal } = useNfeAvulsas();
  const { config } = useFiscalConfig();
  const emitirFn = useServerFn(emitirNfeAvulsa);
  
  const [etapa, setEtapa] = useState(1);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [destinatario, setDestinatario] = useState<any>(null);
  const [itens, setItens] = useState<any[]>([]);
  const [valores, setValores] = useState({
    desconto: 0,
    frete: 0,
    outrasDespesas: 0,
    movimentarEstoque: false
  });
  const [emitindo, setEmitindo] = useState(false);

  // Clientes filtrados
  const clientesFiltrados = useMemo(() => {
    const t = buscaCliente.toLowerCase();
    return clientes.filter(c => 
      getClienteNome(c).toLowerCase().includes(t) || 
      (c.tipo === 'empresa' ? c.cnpj : c.cpf)?.includes(t)
    );
  }, [clientes, buscaCliente]);

  // Totais
  const subtotal = useMemo(() => itens.reduce((acc, it) => acc + (it.quantidade * it.valorUnitario), 0), [itens]);
  const total = useMemo(() => Math.max(0, subtotal - valores.desconto + valores.frete + valores.outrasDespesas), [subtotal, valores]);

  const adicionarItem = (p?: any) => {
    const novo = {
      id: novoId(),
      produtoId: p?.id,
      descricao: p?.nome || "",
      quantidade: 1,
      unidade: p?.unidade || "UN",
      valorUnitario: p?.precoBase || 0,
      ncm: p?.ncm || config.tributacao.ncm || "",
      classificacaoFiscalId: p?.classificacaoFiscalId || p?.categoriaFiscalId || "",
      descricaoFiscal: (p as any)?.descricaoFiscal || ""

    };
    setItens([...itens, novo]);
  };

  const removerItem = (id: string) => setItens(itens.filter(it => it.id !== id));

  const atualizarItem = (id: string, campo: string, valor: any) => {
    setItens(itens.map(it => it.id === id ? { ...it, [campo]: valor } : it));
  };

  const validarDestinatario = () => {
    if (!destinatario) return "Selecione um destinatário.";
    
    const doc = (destinatario.tipo === 'empresa' ? destinatario.cnpj : destinatario.cpf) || "";
    if (doc.replace(/\D/g, "").length < 11) return "O destinatário não possui CPF/CNPJ válido cadastrado.";
    
    if (!destinatario.nome || destinatario.nome.trim().length < 2) return "O nome do destinatário é obrigatório.";
    if (!destinatario.cidade) return "O município do destinatário é obrigatório.";
    if (!destinatario.estado) return "A UF do destinatário é obrigatória.";
    if (!destinatario.cep) return "O CEP do destinatário é obrigatório.";
    if (!destinatario.logradouro) return "O logradouro (endereço) do destinatário é obrigatório.";
    
    return null;
  };

  const validarItens = () => {
    if (itens.length === 0) return "Adicione ao menos um item à nota.";
    for (const it of itens) {
      if (!it.descricao || it.descricao.trim().length < 2) return `Item com descrição inválida.`;
      if (!(it.quantidade > 0)) return `A quantidade do item "${it.descricao}" deve ser maior que zero.`;
      if (!(it.valorUnitario >= 0)) return `O valor do item "${it.descricao}" não pode ser negativo.`;
      const ncm = (it.ncm || "").replace(/\D/g, "");
      if (ncm.length !== 8) {
        return `O produto "${it.descricao}" não possui uma classificação fiscal (NCM) válida de 8 dígitos.`;
      }

    }
    return null;
  };

  const handleEmitir = async () => {
    const erroDest = validarDestinatario();
    if (erroDest) {
      toast.error(erroDest);
      setEtapa(1);
      return;
    }

    const erroItens = validarItens();
    if (erroItens) {
      toast.error(erroItens);
      setEtapa(2);
      return;
    }

    if (total <= 0) {
      toast.error("O total da nota deve ser maior que zero.");
      setEtapa(3);
      return;
    }
    
    console.log("[NfeAvulsaDrawer] Iniciando emissão. Verificando sessão Supabase...");
    const { data: { session } } = await supabase.auth.getSession();
    console.log("[NfeAvulsaDrawer] Diagnóstico Sessão:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasToken: !!session?.access_token,
      expiresAt: session?.expires_at,
      now: Math.floor(Date.now() / 1000)
    });

    if (!session) {
      toast.error("Sessão não encontrada. Por favor, faça login novamente.");
      setEmitindo(false);
      return;
    }

    setEmitindo(true);
    try {
      const payload = {
        id: novoId(),
        destinatario: {
          nome: getClienteNome(destinatario),
          documento: (destinatario.tipo === 'empresa' ? destinatario.cnpj : destinatario.cpf) || "",
          email: destinatario.email || undefined,
          cep: destinatario.cep || undefined,
          logradouro: destinatario.logradouro || undefined,
          numero: destinatario.numero || undefined,
          bairro: destinatario.bairro || undefined,
          complemento: destinatario.complemento || undefined,
          cidade: destinatario.cidade || undefined,
          estado: destinatario.estado || undefined,
        },
        itens: itens.map(it => ({
          id: it.id,
          descricao: it.descricao,
          quantidade: it.quantidade,
          unidade: it.unidade || "UN",
          valorUnitario: it.valorUnitario,
          desconto: 0,
          ncm: it.ncm,
        })),
        subtotal,
        desconto: valores.desconto,
        frete: valores.frete,
        outrasDespesas: valores.outrasDespesas,
        total,
        movimentarEstoque: valores.movimentarEstoque,
      };

      const res = await emitirFn({ data: payload });
      
      if (res.ok) {
        criar({
          ...payload,
          clienteId: destinatario.id,
          notaFiscal: res.nota
        });
        toast.success("NF-e Avulsa emitida com sucesso!");
        onFechar();
        setEtapa(1);
        setDestinatario(null);
        setItens([]);
      } else {
        toast.error(res.mensagem || "Erro ao emitir NF-e");
      }
    } catch (err: any) {
      const msg = err?.message || "Erro inesperado ao emitir NF-e";
      toast.error(msg);
    } finally {
      setEmitindo(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Emitir NF-e Avulsa - Passo {etapa} de 4
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {etapa === 1 && (
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label>Pesquisar Cliente</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Nome, CPF ou CNPJ..." 
                    className="pl-9"
                    value={buscaCliente}
                    onChange={(e) => setBuscaCliente(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                {clientesFiltrados.map(c => (
                  <button 
                    key={c.id} 
                    className={cn(
                      "flex items-center gap-3 p-4 border rounded-xl hover:bg-surface-muted transition-all text-left group",
                      destinatario?.id === c.id ? "border-primary bg-primary-soft/30" : "border-border"
                    )}
                    onClick={() => setDestinatario(c)}
                  >
                    <div className="h-10 w-10 rounded-full bg-surface flex items-center justify-center border border-border group-hover:border-primary/30">
                      <Building className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{getClienteNome(c)}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {c.tipo === 'empresa' ? `CNPJ: ${c.cnpj}` : `CPF: ${c.cpf}`} • {c.cidade}/{c.estado}
                      </div>
                    </div>
                    {destinatario?.id === c.id && <Check className="h-5 w-5 text-primary shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {etapa === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Itens da Nota Fiscal</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => adicionarItem()} className="gap-2">
                    <Plus className="h-4 w-4" /> Item Manual
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Package className="h-4 w-4" /> Adicionar Produto
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[300px]" align="end">
                      <Command>
                        <CommandInput placeholder="Buscar produto..." />
                        <CommandList>
                          <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                          <CommandGroup>
                            {produtos.map(p => (
                              <CommandItem key={p.id} onSelect={() => adicionarItem(p)}>
                                <span>{p.nome}</span>
                                <span className="ml-auto text-xs text-muted-foreground">{formatarMoeda(p.precoBase)}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden bg-surface">
                <table className="w-full text-sm">
                  <thead className="bg-surface-muted border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Descrição</th>
                      <th className="px-4 py-3 text-left font-medium w-24">Qtd</th>
                      <th className="px-4 py-3 text-left font-medium w-32">Valor Unit.</th>
                      <th className="px-4 py-3 text-left font-medium w-32">Total</th>
                      <th className="px-4 py-3 text-right font-medium w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {itens.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground italic">
                          Nenhum item adicionado
                        </td>
                      </tr>
                    )}
                    {itens.map(it => (
                      <tr key={it.id}>
                        <td className="px-4 py-3">
                          <Input 
                            value={it.descricao} 
                            onChange={(e) => atualizarItem(it.id, 'descricao', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input 
                            type="number"
                            value={it.quantidade} 
                            onChange={(e) => atualizarItem(it.id, 'quantidade', Number(e.target.value))}
                            className="h-8 text-xs"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input 
                            type="number"
                            value={it.valorUnitario} 
                            onChange={(e) => atualizarItem(it.id, 'valorUnitario', Number(e.target.value))}
                            className="h-8 text-xs"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {formatarMoeda(it.quantidade * it.valorUnitario)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removerItem(it.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {etapa === 3 && (
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Truck className="h-4 w-4" /> Custos Adicionais
                </h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Frete (R$)</Label>
                    <Input 
                      type="number" 
                      value={valores.frete} 
                      onChange={(e) => setValores({ ...valores, frete: Number(e.target.value) })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Desconto (R$)</Label>
                    <Input 
                      type="number" 
                      value={valores.desconto} 
                      onChange={(e) => setValores({ ...valores, desconto: Number(e.target.value) })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Outras Despesas (R$)</Label>
                    <Input 
                      type="number" 
                      value={valores.outrasDespesas} 
                      onChange={(e) => setValores({ ...valores, outrasDespesas: Number(e.target.value) })} 
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                      id="estoque" 
                      checked={valores.movimentarEstoque}
                      onCheckedChange={(checked) => setValores({ ...valores, movimentarEstoque: !!checked })}
                    />
                    <Label htmlFor="estoque" className="text-sm font-normal cursor-pointer">
                      Movimentar estoque dos produtos selecionados
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Resumo Financeiro
                </h3>
                <div className="border rounded-xl p-6 bg-surface-muted/30 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal dos itens</span>
                    <span>{formatarMoeda(subtotal)}</span>
                  </div>
                  {valores.frete > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Frete (+)</span>
                      <span>{formatarMoeda(valores.frete)}</span>
                    </div>
                  )}
                  {valores.desconto > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Desconto (-)</span>
                      <span>- {formatarMoeda(valores.desconto)}</span>
                    </div>
                  )}
                  {valores.outrasDespesas > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Outras despesas (+)</span>
                      <span>{formatarMoeda(valores.outrasDespesas)}</span>
                    </div>
                  )}
                  <div className="pt-4 border-t flex justify-between items-center">
                    <span className="font-bold">Total da Nota</span>
                    <span className="text-2xl font-black text-primary">{formatarMoeda(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {etapa === 4 && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 text-amber-800">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold">Atenção!</p>
                  <p>Revise todos os dados abaixo. Após a emissão, o cancelamento só é possível dentro do prazo legal da SEFAZ.</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Destinatário</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-[10px] text-primary"
                      onClick={() => setEtapa(1)}
                    >
                      Corrigir dados
                    </Button>
                  </div>
                  <div className="border rounded-xl p-4 bg-surface space-y-2">
                    <p className="font-semibold text-sm">{getClienteNome(destinatario)}</p>
                    <p className="text-xs text-muted-foreground">
                      Documento: {((destinatario.tipo === 'empresa' ? destinatario.cnpj : destinatario.cpf) || "").replace(/\D/g, "") || "Não informado"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {destinatario.logradouro || "Sem logradouro"}, {destinatario.numero || "S/N"} - {destinatario.bairro || "Sem bairro"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {destinatario.cidade || "Sem cidade"}/{destinatario.estado || "—"} - {destinatario.cep || "Sem CEP"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resumo Fiscal</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-[10px] text-primary"
                      onClick={() => setEtapa(2)}
                    >
                      Corrigir itens
                    </Button>
                  </div>
                  <div className="border rounded-xl p-4 bg-surface space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Itens</span>
                      <span>{itens.length} produtos</span>
                    </div>
                    <details className="group">
                      <summary className="flex justify-between text-xs cursor-pointer hover:text-primary transition-colors py-1 list-none">
                        <span className="text-muted-foreground">Dados fiscais detalhados</span>
                        <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="pt-2 space-y-2 border-t mt-1">
                        {itens.map((it, idx) => {
                          const ncmItem = (it.ncm || config.tributacao.ncm || "").replace(/\D/g, "");
                          const cfop = (destinatario.estado === config.empresa.estado) 
                            ? config.tributacao.cfopInterno 
                            : config.tributacao.cfopInterestadual;
                          const isSimples = config.tributacao.regime === "simplesNacional";

                          return (
                            <div key={idx} className="bg-surface-muted/50 p-2 rounded text-[10px] space-y-1">
                              <p className="font-medium truncate">{it.descricao}</p>
                              <div className="grid grid-cols-2 gap-x-2 text-muted-foreground">
                                <span>NCM: {ncmItem || <span className="text-red-500">Pendente</span>}</span>
                                <span>CFOP: {cfop}</span>
                                <span>{isSimples ? "CSOSN" : "CST"}: {isSimples ? config.tributacao.csosn : config.tributacao.icmsCst}</span>
                                {it.descricaoFiscal && <span className="col-span-2 italic truncate">{it.descricaoFiscal}</span>}
                              </div>
                            </div>
                          );
                        })}

                      </div>
                    </details>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Ambiente</span>
                      <span className="font-semibold text-primary uppercase">{config.ambiente}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Natureza</span>
                      <span>Venda de Mercadoria</span>
                    </div>
                    <div className="flex justify-between text-xs pt-2 border-t font-bold">
                      <span>Valor Final</span>
                      <span className="text-primary">{formatarMoeda(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Itens da NF-e</h4>
                <div className="border rounded-xl overflow-hidden text-xs">
                  <table className="w-full">
                    <thead className="bg-surface-muted border-b">
                      <tr>
                        <th className="px-3 py-2 text-left">Descrição</th>
                        <th className="px-3 py-2 text-center w-16">Qtd</th>
                        <th className="px-3 py-2 text-right w-24">Valor</th>
                        <th className="px-3 py-2 text-right w-24">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y bg-surface">
                      {itens.map(it => (
                        <tr key={it.id}>
                          <td className="px-3 py-2 truncate">{it.descricao}</td>
                          <td className="px-3 py-2 text-center">{it.quantidade}</td>
                          <td className="px-3 py-2 text-right">{formatarMoeda(it.valorUnitario)}</td>
                          <td className="px-3 py-2 text-right font-medium">{formatarMoeda(it.quantidade * it.valorUnitario)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 border-t bg-surface-muted/30">
          <Button variant="outline" onClick={onFechar} disabled={emitindo}>
            Cancelar
          </Button>
          <div className="flex-1" />
          {etapa > 1 && (
            <Button variant="ghost" onClick={() => setEtapa(e => e - 1)} disabled={emitindo}>
              Voltar
            </Button>
          )}
          {etapa < 4 ? (
            <Button 
              onClick={() => setEtapa(e => e + 1)} 
              disabled={etapa === 1 ? !destinatario : itens.length === 0}
            >
              Próximo
            </Button>
          ) : (
            <Button 
              onClick={handleEmitir} 
              disabled={emitindo}
              className="bg-primary hover:bg-primary/90 min-w-[140px]"
            >
              {emitindo ? "Transmitindo..." : "Confirmar e Emitir"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
