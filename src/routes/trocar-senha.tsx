import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logout, trocarSenhaObrigatoria, useAuth } from "@/features/auth/useAuth";

export const Route = createFileRoute("/trocar-senha")({
  component: TrocarSenhaPage,
});

function TrocarSenhaPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nova, setNova] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!nova || nova.length < 4) {
      toast.error("A nova senha deve ter pelo menos 4 caracteres.");
      return;
    }
    if (nova !== confirmar) {
      toast.error("A confirmação não confere.");
      return;
    }
    setEnviando(true);
    await new Promise((r) => setTimeout(r, 250));
    const res = trocarSenhaObrigatoria(nova);
    setEnviando(false);
    if (!res.ok) {
      toast.error(res.erro ?? "Não foi possível atualizar a senha.");
      return;
    }
    toast.success("Senha atualizada. Bem-vindo(a)!");
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Defina uma nova senha</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Antes de continuar, {user?.nome ?? "usuário"}, por favor cadastre uma senha pessoal.
          </p>
        </div>
        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl border border-border bg-background p-6 shadow-[var(--shadow-soft)]"
        >
          <div className="space-y-1.5">
            <Label>Nova senha</Label>
            <div className="relative">
              <Input
                type={mostrar ? "text" : "password"}
                value={nova}
                onChange={(e) => setNova(e.target.value)}
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setMostrar((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
              >
                {mostrar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Confirmar nova senha</Label>
            <Input
              type={mostrar ? "text" : "password"}
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
              </>
            ) : (
              "Salvar nova senha"
            )}
          </Button>
          <button
            type="button"
            className="w-full text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              logout();
              navigate({ to: "/login", replace: true });
            }}
          >
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}
