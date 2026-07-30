import { useRef, useState } from "react";
import { Database, Download, RotateCcw, Upload } from "lucide-react";
import { toast } from "@/lib/toast";

import { Button } from "@/components/ui/button";
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
import { useConfiguracoes } from "../useConfiguracoes";
import { SectionCard } from "../SectionCard";

export function BackupTab() {
  const { exportar, importar, restaurarPadrao } = useConfiguracoes();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [confirmarRestaurar, setConfirmarRestaurar] = useState(false);

  function baixar() {
    const json = exportar();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stella-config-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Configurações exportadas.");
  }

  async function onImportar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const texto = await file.text();
    if (importar(texto)) {
      toast.success("Configurações importadas.");
    } else {
      toast.error("Arquivo inválido.");
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <SectionCard
      title="Backup e restauração"
      description="Exporte ou importe todas as configurações do sistema. A integração com nuvem será adicionada no futuro."
      icon={<Database className="h-4 w-4" />}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline" onClick={baixar}>
          <Download className="mr-2 h-4 w-4" /> Exportar dados
        </Button>
        <Button variant="outline" onClick={() => inputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" /> Importar dados
        </Button>
        <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={onImportar} />
      </div>
      <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        Os arquivos exportados contêm apenas as configurações desta tela. Dados de clientes, pedidos e estoque
        não são incluídos nesta versão.
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Restaurar padrão</h4>
            <p className="text-xs text-muted-foreground">
              Remove todas as configurações e recarrega os valores iniciais do sistema.
            </p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setConfirmarRestaurar(true)}>
            <RotateCcw className="mr-2 h-3.5 w-3.5" /> Restaurar
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmarRestaurar} onOpenChange={setConfirmarRestaurar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar configurações padrão?</AlertDialogTitle>
            <AlertDialogDescription>
              Todas as configurações personalizadas serão perdidas. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { restaurarPadrao(); toast.success("Configurações restauradas."); }}>
              Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SectionCard>
  );
}
