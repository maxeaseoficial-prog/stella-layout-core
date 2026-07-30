import { Moon, Palette, Sun } from "lucide-react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { useAparenciaUsuario } from "../aparenciaUsuario";
import type { Tema } from "../types";
import { SectionCard } from "../SectionCard";
import { cn } from "@/lib/utils";

const CORES = [
  { hex: "#EC4899", nome: "Rosa Stella" },
  { hex: "#DB2777", nome: "Rosa profundo" },
  { hex: "#7C3AED", nome: "Violeta" },
  { hex: "#2563EB", nome: "Azul" },
  { hex: "#059669", nome: "Verde" },
  { hex: "#F97316", nome: "Laranja" },
];

export function AparenciaTab() {
  const { aparencia: a, salvarAparencia } = useAparenciaUsuario();

  function setTema(tema: Tema) {
    salvarAparencia({ ...a, tema });
    toast.success(tema === "escuro" ? "Tema escuro ativado." : "Tema claro ativado.");
  }

  function setCor(cor: string) {
    salvarAparencia({ ...a, corPrincipal: cor });
    toast.success("Cor principal atualizada.");
  }

  return (
    <SectionCard
      title="Aparência"
      description="Personalize o visual do sistema. A aparência é individual: vale apenas para o seu usuário."
      icon={<Palette className="h-4 w-4" />}
      contentClassName="space-y-6"
    >
      <div>
        <Label className="mb-2 block">Tema</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setTema("claro")}
            className={cn(
              "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors",
              a.tema === "claro"
                ? "border-primary bg-primary-soft/50"
                : "border-border bg-background/50 hover:border-primary/40",
            )}
          >
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-background shadow-sm">
              <Sun className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Tema Claro</p>
              <p className="text-xs text-muted-foreground">Padrão atual</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setTema("escuro")}
            className={cn(
              "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors",
              a.tema === "escuro"
                ? "border-primary bg-primary-soft/50"
                : "border-border bg-background/50 hover:border-primary/40",
            )}
          >
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-foreground/90 shadow-sm">
              <Moon className="h-5 w-5 text-background" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Tema Escuro</p>
              <p className="text-xs text-muted-foreground">Visual escuro</p>
            </div>
          </button>
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Cor principal</Label>
        <div className="flex flex-wrap gap-3">
          {CORES.map((c) => {
            const ativa = a.corPrincipal.toLowerCase() === c.hex.toLowerCase();
            return (
              <button
                key={c.hex}
                type="button"
                onClick={() => setCor(c.hex)}
                title={c.nome}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 transition-colors",
                  ativa ? "border-primary" : "border-transparent hover:border-border",
                )}
              >
                <span
                  className="h-9 w-9 rounded-full shadow-inner ring-2 ring-white"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-[10px] text-muted-foreground">{c.nome}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          A cor é aplicada em tempo real nos botões, destaques e elementos ativos.
        </p>
      </div>
    </SectionCard>
  );
}
