import { useState, useEffect, useRef } from "react";
import { Plus, Search, Tag, Edit2, Power, PowerOff, FileText, Loader2, Upload, Trash2 } from "lucide-react";
import * as XLSX from 'xlsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { useServerFn } from "@tanstack/react-start";
import { getCategoriasFiscais, salvarCategoriaFiscal, searchNCM, importarPlanilhaNCM, excluirCategoriaFiscal } from "./ncm.functions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export function CategoriasFiscaisManager() {
  const [busca, setBusca] = useState("");
  const [categorias, setCategorias] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [importando, setImportando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState({
    codigo: "",
    nome_amigavel: "",
    ncm: "",
    descricao_oficial: "",
    vigencia: "",
    rec_pis: "0",
    rec_cofins: "0",
    natureza_receita: "0",
    tipo_contribuicao: "Sem incidência",
    situacao: "ativo" as "ativo" | "inativo",
    unidade_comercial: "UN",
    unidade_tributavel: "UN"
  });

  const fetchCategorias = useServerFn(getCategoriasFiscais);
  const saveAction = useServerFn(salvarCategoriaFiscal);
  const searchNcmAction = useServerFn(searchNCM);
  const importAction = useServerFn(importarPlanilhaNCM);
  const deleteAction = useServerFn(excluirCategoriaFiscal);

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
      codigo: cat.codigo || "",
      nome_amigavel: cat.nome_amigavel,
      ncm: cat.ncm,
      descricao_oficial: cat.descricao_oficial || "",
      vigencia: cat.vigencia || "",
      rec_pis: cat.rec_pis || "0",
      rec_cofins: cat.rec_cofins || "0",
      natureza_receita: cat.natureza_receita || "0",
      tipo_contribuicao: cat.tipo_contribuicao || "Sem incidência",
      situacao: cat.situacao,
      unidade_comercial: cat.unidade_comercial || "UN",
      unidade_tributavel: cat.unidade_tributavel || "UN"
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

  const handleDelete = async (id: string) => {
    try {
      await deleteAction({ data: { id } });
      toast.success("Categoria excluída.");
      carregar();
    } catch (error) {
      toast.error("Erro ao excluir categoria.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportando(true);
    const toastId = toast.loading("Lendo planilha...");

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Localizar aba PIS-COFINS ou usar a primeira
          const sheetName = workbook.SheetNames.find(name => name.toUpperCase() === "PIS-COFINS") || workbook.SheetNames[0];
          const firstSheet = workbook.Sheets[sheetName];
          
          // Opções para tratar datas e garantir leitura correta
          const rows = XLSX.utils.sheet_to_json(firstSheet, { 
            defval: null,
            raw: true
          }) as any[];

          if (rows.length === 0) {
            toast.error("Planilha vazia.");
            toast.dismiss(toastId);
            setImportando(false);
            return;
          }

          toast.loading(`Importando ${rows.length} registros...`, { id: toastId });

          // Função para converter serial de data do Excel para string ISO
          const excelDateToISO = (serial: any) => {
            if (!serial || isNaN(Number(serial))) return serial;
            try {
              const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
              return date.toISOString().split('T')[0];
            } catch (e) {
              return serial;
            }
          };

          const mappedData: any[] = [];
          const rejectedRows: any[] = [];

          rows.forEach((row, index) => {
            try {
              // Ignorar linhas totalmente vazias
              const values = Object.values(row).filter(v => v !== null && v !== undefined && v !== "");
              if (values.length === 0) return;

              // Mapear cabeçalhos exatos e flexíveis
              const ncmRaw = String(row.NCM || row.ncm || "").trim();
              if (!ncmRaw) {
                rejectedRows.push({ index: index + 2, reason: "NCM não encontrado" });
                return;
              }

              // Tratar NCM como texto de 8 dígitos, preservando zeros à esquerda
              const ncm = ncmRaw.replace(/\D/g, '').padStart(8, '0');
              
              // Tratar Código como texto
              const codigo = row.Código || row.Codigo || row.codigo || "";
              
              // Descrição
              const descricao = row.Descrição || row.Descricao || row.descricao || "";
              
              // Vigência (converter se for serial)
              const vigencia = excelDateToISO(row.Vigência || row.Vigencia || row.vigencia);
              
              // Valores numéricos
              const recPis = Number(row["Rec. PIS"] || row.rec_pis || 0);
              const recCofins = Number(row["Rec. COFINS"] || row.rec_cofins || 0);
              const natReceita = Number(row["Nat. Receita"] || row.nat_receita || 0);

              mappedData.push({
                ncm,
                nome_amigavel: `${descricao.slice(0, 30)} (${ncm})`,
                descricao_oficial: descricao,
                unidade_comercial: "UN",
                unidade_tributavel: "UN",
                situacao: 'ativo'
              });
            } catch (err: any) {
              rejectedRows.push({ index: index + 2, reason: err.message || "Erro desconhecido" });
            }
          });

          if (mappedData.length === 0 && rejectedRows.length > 0) {
            toast.error(`Nenhuma linha válida. ${rejectedRows.length} rejeitadas.`);
            toast.dismiss(toastId);
            setImportando(false);
            return;
          }

          toast.loading(`Importando ${mappedData.length} registros...`, { id: toastId });

          const chunkSize = 100;
          let importadosCount = 0;
          
          for (let i = 0; i < mappedData.length; i += chunkSize) {
            const chunk = mappedData.slice(i, i + chunkSize);
            await importAction({ data: chunk });
            importadosCount += chunk.length;
          }
          
          let feedbackMsg = `${importadosCount} registros importados com sucesso!`;
          if (rejectedRows.length > 0) {
            feedbackMsg += ` (${rejectedRows.length} linhas ignoradas/erro)`;
            console.log("Linhas rejeitadas:", rejectedRows);
          }

          toast.success(feedbackMsg, { id: toastId, duration: 5000 });
          carregar();
        } catch (err) {
          console.error(err);
          toast.error("Erro ao processar arquivo Excel.", { id: toastId });
        } finally {
          setImportando(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      toast.error("Falha ao abrir arquivo.", { id: toastId });
      setImportando(false);
    }
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const filtered = categorias.filter(c => 
    c.nome_amigavel.toLowerCase().includes(busca.toLowerCase()) || 
    c.ncm.includes(busca) ||
    (c.codigo && c.codigo.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
         <input 
           type="file" 
           ref={fileInputRef} 
           className="hidden" 
           accept=".xlsx,.xls" 
           onChange={handleFileChange} 
         />
         <Button variant="outline" size="sm" onClick={triggerImport} disabled={importando}>
            {importando ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {importando ? "Importando..." : "Importar Planilha NCM"}
         </Button>
         <Button size="sm" onClick={() => { setEditing(null); setForm({ codigo: "", nome_amigavel: "", ncm: "", descricao_oficial: "", vigencia: "", rec_pis: "0", rec_cofins: "0", natureza_receita: "0", tipo_contribuicao: "Sem incidência", situacao: "ativo", unidade_comercial: "UN", unidade_tributavel: "UN" }); setModalAberto(true); }}>
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
                  <TableHead>Código</TableHead>
                  <TableHead>Descrição Stella</TableHead>
                  <TableHead>NCM</TableHead>
                  <TableHead>Vigência</TableHead>
                  <TableHead>PIS/COFINS</TableHead>
                  <TableHead>Nat. Rec.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carregando ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma categoria encontrada.</TableCell></TableRow>
                ) : (
                  filtered.map(c => (
                    <TableRow key={c.id} className={c.situacao === 'inativo' ? 'opacity-50' : ''}>
                      <TableCell className="font-mono text-xs">{c.codigo || "-"}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate" title={c.nome_amigavel}>
                        {c.nome_amigavel}
                      </TableCell>
                      <TableCell><code className="bg-muted px-1.5 py-0.5 rounded text-xs">{c.ncm}</code></TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {c.vigencia ? new Date(c.vigencia).toLocaleDateString('pt-BR') : "-"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {c.rec_pis || "0"} / {c.rec_cofins || "0"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {c.natureza_receita || "0"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.situacao === 'ativo' ? 'outline' : 'secondary'} className={c.situacao === 'ativo' ? 'bg-emerald-50 text-emerald-700' : ''}>
                          {c.situacao}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(c)} title="Editar">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(c)} title={c.situacao === 'ativo' ? 'Desativar' : 'Ativar'}>
                            {c.situacao === 'ativo' ? <Power className="h-4 w-4 text-emerald-600" /> : <PowerOff className="h-4 w-4 text-muted-foreground" />}
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" title="Excluir">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Categoria Fiscal?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. A categoria <strong>{c.nome_amigavel}</strong> ({c.ncm}) será removida permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(c.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="codigo">Código *</Label>
                  <Input id="codigo" placeholder="Ex: 402022" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ncm">NCM (8 dígitos) *</Label>
                  <Input id="ncm" placeholder="61091000" value={form.ncm} onChange={e => setForm({...form, ncm: e.target.value})} required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nome">Descrição Stella *</Label>
                <Input id="nome" placeholder="Ex: Camiseta de Algodão" value={form.nome_amigavel} onChange={e => setForm({...form, nome_amigavel: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="vigencia">Vigência</Label>
                  <Input id="vigencia" type="date" value={form.vigencia} onChange={e => setForm({...form, vigencia: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tipo_cont">Tipo Contribuição</Label>
                  <Input id="tipo_cont" value={form.tipo_contribuicao} onChange={e => setForm({...form, tipo_contribuicao: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="rec_pis">Rec. PIS</Label>
                  <Input id="rec_pis" value={form.rec_pis} onChange={e => setForm({...form, rec_pis: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rec_cof">Rec. COFINS</Label>
                  <Input id="rec_cof" value={form.rec_cofins} onChange={e => setForm({...form, rec_cofins: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nat_rec">Nat. Receita</Label>
                  <Input id="nat_rec" value={form.natureza_receita} onChange={e => setForm({...form, natureza_receita: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="un_com">Un. Comercial</Label>
                  <Input id="un_com" value={form.unidade_comercial} onChange={e => setForm({...form, unidade_comercial: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="un_trib">Un. Tributável</Label>
                  <Input id="un_trib" value={form.unidade_tributavel} onChange={e => setForm({...form, unidade_tributavel: e.target.value})} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">Descrição Oficial (Opcional)</Label>
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

