import { useState } from "react";
import { UserCircle2, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { SectionCard } from "@/features/configuracoes/SectionCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/useAuth";

export function PerfilTab() {
  const { user } = useAuth();
  const [nome, setNome] = useState(user?.nome ?? "");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");

  function salvarNome(e: React.FormEvent) {
    e.preventDefault();
    toast.success("Nome atualizado (mock).");
  }

  function salvarSenha(e: React.FormEvent) {
    e.preventDefault();
    if (!senhaAtual || !novaSenha) {
      toast.error("Preencha todos os campos.");
      return;
    }
    if (novaSenha !== confirmar) {
      toast.error("A confirmação não confere.");
      return;
    }
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmar("");
    toast.success("Senha alterada (mock).");
  }

  return (
    <div className="space-y-4">
      <SectionCard
        icon={<UserCircle2 className="h-5 w-5" />}
        title="Dados pessoais"
        description="Atualize suas informações de acesso."
      >
        <form onSubmit={salvarNome} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
            />
          </div>
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-1.5">
            <Label>Perfil</Label>
            <Input value={user?.papelLabel ?? ""} disabled />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" size="sm">
              Salvar alterações
            </Button>
          </div>
        </form>
      </SectionCard>

      <SectionCard
        icon={<KeyRound className="h-5 w-5" />}
        title="Alterar senha"
        description="Defina uma nova senha de acesso."
      >
        <form onSubmit={salvarSenha} className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Senha atual</Label>
            <Input
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Nova senha</Label>
            <Input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Confirmar nova senha</Label>
            <Input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
            />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <Button type="submit" size="sm">
              Alterar senha
            </Button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
