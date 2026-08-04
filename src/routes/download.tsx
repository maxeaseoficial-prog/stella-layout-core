import { createFileRoute } from "@tanstack/react-router";
import { Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/download")({
  component: DownloadPage,
});

function DownloadPage() {
  const handleInstall = () => {
    // Nota: Em browsers modernos, o evento 'beforeinstallprompt' é disparado
    // para capturar a instalação. Aqui mostramos uma orientação simples.
    alert("Para instalar o app Stella:\n\n1. Clique no ícone de compartilhar (ou no menu de 3 pontos no Chrome).\n2. Selecione 'Adicionar à tela de início' ou 'Instalar Aplicativo'.");
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-background px-4 py-12">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-primary/20 blur-xl"></div>
            <img 
              src="/pwa-icon.png" 
              alt="Stella Logo" 
              className="relative h-32 w-32 rounded-3xl shadow-2xl border-4 border-background"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Stella no seu Celular
          </h1>
          <p className="text-muted-foreground">
            Instale o sistema oficial da Stella Espaço dos Uniformes para acesso rápido e offline.
          </p>
        </div>

        <div className="pt-4">
          <Button 
            size="lg" 
            className="w-full gap-2 text-lg h-14 rounded-2xl shadow-lg shadow-primary/20"
            onClick={handleInstall}
          >
            <Download className="h-5 w-5" />
            Baixar Aplicativo
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-8 text-left">
          <div className="p-4 rounded-xl bg-surface-muted/50 border border-border">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Smartphone className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold mb-1">Acesso Direto</h3>
            <p className="text-xs text-muted-foreground">Ícone na sua tela inicial como um app nativo.</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-muted/50 border border-border">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Smartphone className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold mb-1">Modo Offline</h3>
            <p className="text-xs text-muted-foreground">Consulte dados mesmo sem conexão.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
