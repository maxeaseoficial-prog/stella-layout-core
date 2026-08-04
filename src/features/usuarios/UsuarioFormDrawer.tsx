import { useEffect, useState } from "react";
import { Eye, EyeOff, ImagePlus, X } from "lucide-react";
import { toast } from "@/lib/toast";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/custom-select";
import type { ModuloRota, Papel } from "@/features/auth/permissions";
import { ROTAS_PERMITIDAS } from "@/features/auth/permissions";
import { UsuarioAvatar } from "./UsuarioAvatar";
import { atualizarUsuario, criarUsuario } from "./useUsuarios";
import { PAPEL_LABEL, type StatusUsuario, type Usuario } from "./types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuarioAtual: Usuario | null;
  responsavel: string;
}

interface FormState {
  nome: string;
  foto?: string;
  telefone: string;
  email: string;
  usuario: string;
  senha: string;
  confirmar: string;
  papel: Papel;
  status: StatusUsuario;
  precisaTrocarSenha: boolean;
  permissoesAbas: ModuloRota[];
}

function initialState(u: Usuario | null): FormState {
  return {
    nome: u?.nome ?? "",
    foto: u?.foto,
    telefone: u?.telefone ?? "",
    email: u?.email ?? "",
    usuario: u?.usuario ?? "",
    senha: "",
    confirmar: "",
    papel: u?.papel ?? "operador_matriz",
    status: u?.status ?? "ativo",
    precisaTrocarSenha: u?.precisaTrocarSenha ?? true,
    permissoesAbas: u?.permissoesAbas ?? ROTAS_PERMITIDAS[u?.papel ?? "operador_matriz"],
  };
}

const PAPEIS: Papel[] = ["administrador", "operador_matriz", "caixa"];

const ABAS_DISPONIVEIS: { rota: ModuloRota; label: string }[] = [
  { rota: "/", label: "Dashboard" },
  { rota: "/caixa", label: "Caixa" },
  { rota: "/clientes", label: "Clientes" },
  { rota: "/pedidos", label: "Pedidos" },
  { rota: "/produtos", label: "Produtos" },
  { rota: "/estoque", label: "Estoque" },
  { rota: "/fornecedores", label: "Fornecedores" },
  { rota: "/matrizes-logos", label: "Matrizes & Logos" },
  { rota: "/tarefas", label: "Tarefas" },
  { rota: "/precificacao", label: "Formação de Preço" },
];

export function UsuarioFormDrawer({ open, onOpenChange, usuarioAtual, responsavel }: Props) {
  const isEdit = !!usuarioAtual;
  const [form, setForm] = useState<FormState>(initialState(usuarioAtual));
  const [mostrarSenha, setMostrarSenha] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialState(usuarioAtual));
      setMostrarSenha(false);
    }
  }, [open, usuarioAtual]);

  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, foto: reader.result as string }));
    reader.readAsDataURL(file);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim() || !form.email.trim() || !form.usuario.trim()) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }
    if (!isEdit) {
      if (!form.senha) {
        toast.error("Informe a senha temporária.");
        return;
      }
      if (form.senha !== form.confirmar) {
        toast.error("A confirmação de senha não confere.");
        return;
      }
      const res = criarUsuario(
        {
          nome: form.nome.trim(),
          foto: form.foto,
          telefone: form.telefone.trim() || undefined,
          email: form.email.trim(),
          usuario: form.usuario.trim(),
          senha: form.senha,
          papel: form.papel,
          status: form.status,
          precisaTrocarSenha: form.precisaTrocarSenha,
          permissoesAbas: form.permissoesAbas,
        },
        responsavel,
      );
      if (!res.ok) {
        toast.error(res.erro ?? "Não foi possível criar o usuário.");
        return;
      }
      toast.success("Usuário criado com sucesso.");
      onOpenChange(false);
      return;
    }

    // edição — senha só é atualizada via "Redefinir senha"
    const res = atualizarUsuario(
      usuarioAtual!.id,
      {
        nome: form.nome.trim(),
        foto: form.foto,
        telefone: form.telefone.trim() || undefined,
        email: form.email.trim(),
        usuario: form.usuario.trim(),
        papel: form.papel,
        status: form.status,
        precisaTrocarSenha: form.precisaTrocarSenha,
        permissoesAbas: form.permissoesAbas,
      },
      responsavel,
    );
    if (!res.ok) {
      toast.error(res.erro ?? "Não foi possível salvar.");
      return;
    }
    toast.success("Usuário atualizado.");
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle>{isEdit ? "Editar usuário" : "Novo usuário"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Atualize os dados de acesso e o perfil."
              : "Cadastre um novo acesso ao sistema."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Foto */}
            <div className="flex items-center gap-4">
              <UsuarioAvatar nome={form.nome || "?"} foto={form.foto} className="h-16 w-16" />
              <div className="flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent">
                  <ImagePlus className="h-3.5 w-3.5" />
                  {form.foto ? "Trocar foto" : "Enviar foto"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
                </label>
                {form.foto && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setForm((f) => ({ ...f, foto: undefined }))}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Dados pessoais */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Dados pessoais
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Nome completo *</Label>
                  <Input
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Telefone</Label>
                  <Input
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>E-mail *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Dados de acesso */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Dados de acesso
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Usuário *</Label>
                  <Input
                    value={form.usuario}
                    onChange={(e) => setForm({ ...form, usuario: e.target.value })}
                    placeholder="ex.: joao.silva"
                    required
                  />
                </div>
                {!isEdit && (
                  <>
                    <div className="space-y-1.5">
                      <Label>Senha temporária *</Label>
                      <div className="relative">
                        <Input
                          type={mostrarSenha ? "text" : "password"}
                          value={form.senha}
                          onChange={(e) => setForm({ ...form, senha: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha((v) => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
                        >
                          {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Confirmar senha *</Label>
                      <Input
                        type={mostrarSenha ? "text" : "password"}
                        value={form.confirmar}
                        onChange={(e) => setForm({ ...form, confirmar: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}
              </div>
              {isEdit && (
                <p className="text-xs text-muted-foreground">
                  Para trocar a senha use a ação <strong>Redefinir senha</strong> na lista.
                </p>
              )}
            </section>

            {/* Perfil / Status */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Perfil e status
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Perfil</Label>
                  <Select
                    value={form.papel}
                    onValueChange={(v) => {
                      const novoPapel = v as Papel;
                      setForm({
                        ...form,
                        papel: novoPapel,
                        permissoesAbas: ROTAS_PERMITIDAS[novoPapel],
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAPEIS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {PAPEL_LABEL[p]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v: StatusUsuario) => setForm({ ...form, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <label className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-sm">
                <Checkbox
                  checked={form.precisaTrocarSenha}
                  onCheckedChange={(v) => setForm({ ...form, precisaTrocarSenha: !!v })}
                />
                <span>Exigir troca de senha no primeiro login</span>
              </label>
            </section>

            {/* Permissões de Abas */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Acesso às abas
              </h3>
              <div className="grid grid-cols-2 gap-2 rounded-md border border-border bg-muted/20 p-4">
                {ABAS_DISPONIVEIS.map((aba) => (
                  <label
                    key={aba.rota}
                    className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground"
                  >
                    <Checkbox
                      checked={form.permissoesAbas.includes(aba.rota)}
                      onCheckedChange={(v: boolean) => {
                        const novaLista = v
                          ? [...form.permissoesAbas, aba.rota]
                          : form.permissoesAbas.filter((r) => r !== aba.rota);
                        setForm({ ...form, permissoesAbas: novaLista });
                      }}
                    />
                    <span>{aba.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">
                A aba de Configurações é padrão para todos os usuários.
              </p>
            </section>
          </div>

          <SheetFooter className="border-t border-border bg-muted/30 px-6 py-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{isEdit ? "Salvar alterações" : "Criar usuário"}</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
