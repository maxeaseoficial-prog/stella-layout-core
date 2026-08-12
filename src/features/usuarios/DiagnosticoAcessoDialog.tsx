import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Shield, Link as LinkIcon, User, Mail, Info, RefreshCw } from "lucide-react";
import type { Usuario } from "./types";

import { diagnosticarUsuario } from "@/lib/diagnostico.functions";
import { toast } from "@/lib/toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
  onRepair: (diagnostico: any) => void;
}

export function DiagnosticoAcessoDialog({ open, onOpenChange, usuario, onRepair }: Props) {
  const [loading, setLoading] = useState(false);
  const [diagnostico, setDiagnostico] = useState<any>(null);

  useEffect(() => {
    if (open && usuario) {
      handleDiagnosticar();
    } else {
      setDiagnostico(null);
    }
  }, [open, usuario]);

  async function handleDiagnosticar() {
    if (!usuario) return;
    setLoading(true);
    try {
      const res = await diagnosticarUsuario({
        data: {
          email: usuario.email,
          localId: usuario.id,
          usuario: usuario.usuario
        }
      });
      setDiagnostico(res);
    } catch (err) {
      toast.error("Erro ao realizar diagnóstico.");
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  if (!usuario) return null;

  const StatusRow = ({ label, status, detail }: { label: string; status: "ok" | "error" | "warning" | "loading"; detail?: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {detail && <span className="text-xs text-muted-foreground">{detail}</span>}
        {status === "ok" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        {status === "error" && <XCircle className="h-4 w-4 text-destructive" />}
        {status === "warning" && <AlertTriangle className="h-4 w-4 text-amber-500" />}
        {status === "loading" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
      </div>
    </div>
  );

  const podeAutenticar = diagnostico?.authEncontrado && diagnostico?.vinculoEncontrado && diagnostico?.idsCoincidem && diagnostico?.authStatus !== "inativo";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            DIAGNÓSTICO DE ACESSO
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Procurando rastros no Supabase Auth...</p>
          </div>
        ) : diagnostico ? (
          <div className="space-y-6 py-4">
            <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
              <StatusRow 
                label="Cadastro local" 
                status="ok" 
                detail="OK" 
              />
              <StatusRow 
                label="Supabase Auth" 
                status={diagnostico.authEncontrado ? "ok" : "error"} 
                detail={diagnostico.authEncontrado ? "OK" : "AUSENTE"} 
              />
              <StatusRow 
                label="Vínculo empresa" 
                status={diagnostico.vinculoEncontrado ? "ok" : "error"} 
                detail={diagnostico.vinculoEncontrado ? "OK" : "AUSENTE"} 
              />
              <StatusRow 
                label="Coincidência de ID" 
                status={diagnostico.idsCoincidem ? "ok" : "warning"} 
                detail={diagnostico.idsCoincidem ? "SIM" : "NÃO"} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> E-mail</p>
                <p className="font-medium truncate">{usuario.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Username</p>
                <p className="font-medium truncate">{usuario.usuario}</p>
              </div>
            </div>

            <div className={`p-4 rounded-lg border flex gap-3 ${podeAutenticar ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className="mt-0.5">
                {podeAutenticar ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Info className="h-5 w-5 text-amber-600" />}
              </div>
              <div className="space-y-1">
                <p className={`text-sm font-semibold ${podeAutenticar ? 'text-emerald-900' : 'text-amber-900'}`}>
                  Resultado:
                </p>
                <p className={`text-sm ${podeAutenticar ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {!diagnostico.authEncontrado 
                    ? "Este usuário aparece na Stella, mas ainda não possui uma conta autenticável no Supabase." 
                    : !diagnostico.vinculoEncontrado 
                      ? "A conta existe no Auth, mas o usuário não está vinculado à empresa Stella."
                      : !diagnostico.idsCoincidem
                        ? "O ID local está em conflito com o ID do servidor. Isso impede a sincronização de dados."
                        : diagnostico.authStatus === "inativo"
                          ? "O usuário está marcado como Inativo no servidor e não poderá logar."
                          : "Tudo parece correto. Se o login falhar, verifique a senha."}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          {!loading && diagnostico && !podeAutenticar && (
            <Button onClick={() => onRepair(diagnostico)} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Reparar Acesso
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
