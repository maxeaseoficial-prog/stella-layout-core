import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import type { Usuario } from "./types";
import { repararAcessoUsuario } from "@/lib/reparo.functions";
import { toast } from "@/lib/toast";
import { useUsuarios } from "./useUsuarios";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
  diagnostico: any;
  onSuccess: () => void;
}

export function RepararAcessoDialog({ open, onOpenChange, usuario, diagnostico, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const { usuarios } = useUsuarios();

  if (!usuario) return null;

  const precisaSenha = !diagnostico?.authEncontrado;

  async function handleReparar() {
    if (precisaSenha) {
      if (!senha) return toast.error("Informe a senha temporária.");
      if (senha !== confirmar) return toast.error("As senhas não coincidem.");
      if (senha.length < 6) return toast.error("A senha deve ter ao menos 6 caracteres.");
    }

    setLoading(true);
    try {
      const res = await repararAcessoUsuario({
        data: {
          email: usuario.email,
          localId: usuario.id,
          nome: usuario.nome,
          usuario: usuario.usuario,
          papel: usuario.papel,
          permissoes: usuario.permissoesAbas || [],
          status: usuario.status,
          novaSenha: senha || undefined
        }
      });

      if (res.ok) {
        // Atualizar ID local se mudou (Regra 5, 6, 7)
        if (res.userId && res.userId !== usuario.id) {
          const { salvarUsuarios, carregarUsuarios } = await import("./storage");
          const atuais = carregarUsuarios();
          const nova = atuais.map(u => u.email === usuario.email ? { ...u, id: res.userId! } : u);
          salvarUsuarios(nova);
          window.dispatchEvent(new Event("stella:usuarios:updated"));
        }
        
        toast.success("Acesso reparado com sucesso!");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(res.erro || "Falha ao reparar acesso.");
      }
    } catch (err) {
      toast.error("Erro na comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            REPARAR ACESSO
          </DialogTitle>
          <DialogDescription>
            {precisaSenha 
              ? "Para criar a conta no servidor, defina uma senha temporária."
              : "O sistema irá sincronizar o vínculo e metadados no servidor."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <AlertCircle className="h-5 w-5 text-primary shrink-0" />
            <div className="text-xs space-y-1">
                <p className="font-semibold text-primary">Ação solicitada:</p>
                <p className="text-muted-foreground">
                    {!diagnostico?.authEncontrado 
                        ? "Criar conta Auth + Vincular Empresa Stella" 
                        : !diagnostico?.vinculoEncontrado 
                            ? "Vincular conta existente à Empresa Stella" 
                            : "Corrigir IDs e Metadados divergentes"}
                </p>
            </div>
          </div>

          {precisaSenha && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="temp-pass">Nova senha temporária</Label>
                <Input 
                  id="temp-pass" 
                  type="password" 
                  value={senha} 
                  onChange={e => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pass">Confirmar senha</Label>
                <Input 
                  id="confirm-pass" 
                  type="password" 
                  value={confirmar} 
                  onChange={e => setConfirmar(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleReparar} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Executar Reparo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
