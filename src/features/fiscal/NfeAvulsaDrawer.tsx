import { useState } from "react";
import { Search, MapPin, Package, Building, X, ChevronRight, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClientes } from "@/features/clientes";
import { useProdutos } from "@/features/produtos";
import { useNfeAvulsas } from "./useNfeAvulsas";

interface Props {
  aberto: boolean;
  onFechar: () => void;
}

export function NfeAvulsaDrawer({ aberto, onFechar }: Props) {
  const { clientes } = useClientes();
  const { produtos } = useProdutos();
  const { criar } = useNfeAvulsas();
  const [etapa, setEtapa] = useState(1);
  const [destinatario, setDestinatario] = useState<any>(null);

  return (
    <Dialog open={aberto} onOpenChange={onFechar}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Emitir NF-e Avulsa - Etapa {etapa} de 5</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {etapa === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Selecione o Destinatário</h3>
              <Input placeholder="Buscar cliente por nome..." />
              <div className="grid grid-cols-1 gap-2">
                {clientes.slice(0, 5).map(c => (
                  <button 
                    key={c.id} 
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-surface-muted transition-colors text-left"
                    onClick={() => {
                      setDestinatario(c);
                      setEtapa(2);
                    }}
                  >
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{c.tipo === "empresa" ? c.nomeEmpresa : c.nome}</div>
                      <div className="text-xs text-muted-foreground">{c.telefone}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {etapa > 1 && (
            <div className="p-4 border-2 border-dashed border-primary/20 rounded-lg text-center text-sm text-muted-foreground">
              {etapa === 2 && "Seleção de Itens (Em breve)"}
              {etapa === 3 && "Configuração de Valores (Em breve)"}
              {etapa === 4 && "Revisão Final (Em breve)"}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onFechar}>Cancelar</Button>
          {etapa > 1 && <Button variant="outline" onClick={() => setEtapa(e => e - 1)}>Voltar</Button>}
          {etapa < 4 && <Button onClick={() => setEtapa(e => e + 1)}>Próximo</Button>}
          {etapa === 4 && <Button onClick={() => { 
            // criar({ ... }); 
            onFechar(); 
          }}>Emitir NF-e</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
