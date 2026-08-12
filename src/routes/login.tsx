import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "@/lib/toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { login, useAuth } from "@/features/auth/useAuth";
import { bootstrapUsuariosStella } from "@/lib/bootstrap-usuarios.functions";
import { diagnosticarUsuarios } from "@/lib/diagnostico-usuarios.functions";
import { resetarSenhaSupabase } from "@/lib/reset-senha.functions";
import fachada from "@/assets/stella-fachada.png.asset.json";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const from = useRouterState({
    select: (s) => (s.location.search as { redirect?: string })?.redirect,
  });

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [esqueceuAberto, setEsqueceuAberto] = useState(false);

  useEffect(() => {
    // Garante que as contas semente da Stella existem no Cloud (idempotente).
    void bootstrapUsuariosStella().catch(() => { /* silencioso */ });
    // @ts-ignore
    window._diagnosticar = () => diagnosticarUsuarios().then(console.log);
    // @ts-ignore
    window._resetSenha = (email, senha) => resetarSenhaSupabase({ data: { email, novaSenha: senha } }).then(console.log);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: from || "/", replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !senha) {
      toast.error("Preencha e-mail e senha.");
      return;
    }
    setEnviando(true);
    // pequena latência para dar sensação de autenticação real
    const result = await login(email, senha);
    setEnviando(false);
    if (!result.ok) {
      toast.error(result.erro || "Não foi possível entrar.");
      return;
    }
    toast.success("Bem-vinda de volta!");
    navigate({ to: from || "/", replace: true });
  }

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${fachada.url})` }}
    >
      {/* Degradê preto suave por cima da foto */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.75) 85%, rgba(0,0,0,0.9) 100%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">

          {/* Cartão de login */}
          <div className="rounded-3xl border border-white/40 bg-white/95 p-6 shadow-elevated backdrop-blur-xl sm:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Entrar na sua conta
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Informe suas credenciais para continuar.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Usuário ou e-mail</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="identificador"
                    type="text"
                    autoComplete="username"
                    placeholder="seu usuário ou e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pl-9"
                    disabled={enviando}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="senha">Senha</Label>
                  <button
                    type="button"
                    onClick={() => setEsqueceuAberto(true)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="senha"
                    type={mostrarSenha ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="h-11 pl-9 pr-10"
                    disabled={enviando}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((v) => !v)}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="h-11 w-full text-sm font-semibold"
                disabled={enviando}
              >
                {enviando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-white/85 drop-shadow-sm">
            © {new Date().getFullYear()} Stella Espaço dos Uniformes
          </p>
        </div>
      </div>

      <Dialog open={esqueceuAberto} onOpenChange={setEsqueceuAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recuperar senha</DialogTitle>
            <DialogDescription>
              A recuperação de senha por e-mail será disponibilizada quando o
              sistema estiver conectado ao servidor. Por enquanto, entre em
              contato com o administrador do sistema para redefinir seu acesso.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setEsqueceuAberto(false)}>Entendi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
