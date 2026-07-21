import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { redefinirSenha } from "./useUsuarios";
import type { Usuario } from "./types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
  responsavel: string;
}

export function RedefinirSenhaDialog({ open, onOpenChange, usuario, responsavel }: Props) {
  const [nova, setNova] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [exigir, setExigir] = useState(true);

  useEffect(() => {
    if (open) {
      setNova("");
      setConfirmar("");
      setExigir(true);
    }
  }, [open]);

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario) return;
    if (!nova) return toast.error("Informe a nova senha.");
    if (nova !== confirmar) return toast.error("A confirmação não confere.");
    const res = redefinirSenha(usuario.id, nova, exigir, responsavel);
    if (!res.ok) return toast.error(res.erro ?? "Não foi possível redefinir.");
    toast.success("Senha redefinida com sucesso.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redefinir senha</DialogTitle>
          <DialogDescription>
            {usuario ? `Nova senha temporária para ${usuario.nome}.` : ""}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={salvar} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nova senha temporária</Label>
            <Input type="password" value={nova} onChange={(e) => setNova(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Confirmar senha</Label>
            <Input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={exigir} onCheckedChange={(v) => setExigir(!!v)} />
            <span>Exigir troca de senha no próximo login</span>
          </label>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
