import { useState } from "react";
import { Plus, Search, ShieldCheck, Tag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProdutos } from "@/features/produtos/useProdutos";
import { Badge } from "@/components/ui/badge";

export function CategoriasFiscaisManager() {
  const { produtos } = useProdutos();
  const [busca, setBusca] = useState("");

  const lista = produtos.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase()) || 
    (p.ncm ?? "").includes(busca)
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" /> NCM por Produto
              </CardTitle>
              <CardDescription>Gerencie os códigos fiscais individuais de cada produto do catálogo.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Filtrar produtos..." 
              className="pl-9"
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
          </div>

          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>NCM Atual</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nome}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.categoria}</TableCell>
                    <TableCell>
                      {p.ncm ? (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{p.ncm}</code>
                      ) : (
                        <span className="text-xs text-red-500 font-medium italic">Não configurado</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.ncm ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Pronto</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Pendente</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
