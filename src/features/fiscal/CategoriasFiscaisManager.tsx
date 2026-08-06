import { useState, useEffect } from "react";
import { Plus, Search, ShieldCheck, Tag, Edit2, Power, PowerOff, FileText, Check, X, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { useServerFn } from "@tanstack/react-start";
import { getCategoriasFiscais, salvarCategoriaFiscal, searchNCM, importarPlanilhaNCM } from "./ncm.functions";
import { cn } from "@/lib/utils";

export function CategoriasFiscaisManager() {
  const [busca, setBusca] = useState("");
  const [categorias, setCategorias] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [importando, setImportando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  
  const [form, setForm] = useState({
    nome_amigavel: "",
    ncm: "",
    descricao_oficial: "",
    situacao: "ativo" as "ativo" | "inativo"
  });

  const fetchCategorias = useServerFn(getCategoriasFiscais);
  const saveAction = useServerFn(salvarCategoriaFiscal);
  const searchNcmAction = useServerFn(searchNCM);
  const importAction = useServerFn(importarPlanilhaNCM);

  const carregar = async () => {
    try {
      const res = await fetchCategorias();
      setCategorias(res);
    } catch (error) {
      toast.error("Erro ao carregar categorias.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const handleEdit = (cat: any) => {
    setEditing(cat);
    setForm({
      nome_amigavel: cat.nome_amigavel,
      ncm: cat.ncm,
      descricao_oficial: cat.descricao_oficial || "",
      situacao: cat.situacao
    });
    setModalAberto(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveAction({
        data: {
          ...form,
          id: editing?.id
        }
      });
      toast.success(editing ? "Categoria atualizada." : "Categoria criada.");
      setModalAberto(false);
      setEditing(null);
      carregar();
    } catch (error) {
      toast.error("Erro ao salvar categoria.");
    }
  };

  const handleToggleStatus = async (cat: any) => {
    try {
      await saveAction({
        data: {
          ...cat,
          situacao: cat.situacao === "ativo" ? "inativo" : "ativo"
        }
      });
      toast.success("Status atualizado.");
      carregar();
    } catch (error) {
      toast.error("Erro ao alterar status.");
    }
  };

  const handleImport = async () => {
    setImportando(true);
    try {
      const response = await fetch("/tmp/ncm/full_data.json");
      if (!response.ok) throw new Error("Falha ao ler dados da planilha.");
      const data = await response.json();
      
      // Dividir em chunks para evitar estouro de limite de payload do server function
      const chunkSize = 500;
      let importados = 0;
      
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await importAction({ data: chunk });
        importados += chunk.length;
      }
      
      toast.success(`${importados} NCMs importados com sucesso!`);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao importar planilha. Verifique se o arquivo existe.");
    } finally {
      setImportando(false);
    }
  };

  const filtered = categorias.filter(c => 
    c.nome_amigavel.toLowerCase().includes(busca.toLowerCase()) || 
    c.ncm.includes(busca)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
         <Button variant="outline" size="sm" onClick={handleImport} disabled={importando}>
            <FileText className={cn("h-4 w-4 mr-2", importando && "animate-spin")} />
            {importando ? "Importando..." : "Importar Planilha NCM"}
         </Button>
         <Button size="sm" onClick={() => { setEditing(null); setForm({ nome_amigavel: "", ncm: "", descricao_oficial: "", situacao: "ativo" }); setModalAberto(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Nova Categoria
         </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" /> Categorias Fiscais
              </CardTitle>
              <CardDescription>Relacione nomes amigáveis Stella aos NCMs oficiais da Receita.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar categorias..." 
              className="pl-9"
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>

          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome Amigável</TableHead>
                  <TableHead>NCM</TableHead>
                  <TableHead>Descrição Oficial</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carregando ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma categoria encontrada.</TableCell></TableRow>
                ) : (
                  filtered.map(c => (
                    <TableRow key={c.id} className={c.situacao === 'inativo' ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">{c.nome_amigavel}</TableCell>
                      <TableCell><code className="bg-muted px-1.5 py-0.5 rounded text-xs">{c.ncm}</code></TableCell>
                      <TableCell className="max-w-[300px] truncate text-xs text-muted-foreground" title={c.descricao_oficial}>
                        {c.descricao_oficial || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.situacao === 'ativo' ? 'outline' : 'secondary'} className={c.situacao === 'ativo' ? 'bg-emerald-50 text-emerald-700' : ''}>
                          {c.situacao}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(c)}>
                            {c.situacao === 'ativo' ? <Power className="h-4 w-4 text-emerald-600" /> : <PowerOff className="h-4 w-4 text-muted-foreground" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Categoria" : "Nova Categoria Fiscal"}</DialogTitle>
              <DialogDescription>Preencha os dados da categoria para emissão de nota.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome Amigável Stella *</Label>
                <Input id="nome" placeholder="Ex: Camiseta de Algodão" value={form.nome_amigavel} onChange={e => setForm({...form, nome_amigavel: e.target.value})} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ncm">NCM Oficial (8 dígitos) *</Label>
                <Input id="ncm" placeholder="61091000" value={form.ncm} onChange={e => setForm({...form, ncm: e.target.value})} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">Descrição Oficial da Receita (Opcional)</Label>
                <Input id="desc" value={form.descricao_oficial} onChange={e => setForm({...form, descricao_oficial: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{editing ? "Atualizar" : "Salvar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

