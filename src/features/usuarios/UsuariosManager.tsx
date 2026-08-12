import { useMemo, useState } from "react";
import { Plus, Search, ShieldCheck, UserCheck, UserCog, UserX } from "lucide-react";
import { toast } from "@/lib/toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { StatCard } from "@/components/common/StatCard";
import { useAuth } from "@/features/auth/useAuth";
import { alternarStatus, excluirUsuario, useUsuarios } from "./useUsuarios";
import type { Usuario } from "./types";
import { UsuariosTable } from "./UsuariosTable";
import { UsuarioFormDrawer } from "./UsuarioFormDrawer";
import { UsuarioViewDrawer } from "./UsuarioViewDrawer";
import { RedefinirSenhaDialog } from "./RedefinirSenhaDialog";

type Filtro = "todos" | "administrador" | "operador_matriz" | "ativos" | "inativos";

export function UsuariosManager() {
  const { user } = useAuth();
  const { usuarios } = useUsuarios();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [senhaOpen, setSenhaOpen] = useState(false);
  const [ativoEdit, setAtivoEdit] = useState<Usuario | null>(null);
  const [ativoView, setAtivoView] = useState<Usuario | null>(null);
  const [ativoSenha, setAtivoSenha] = useState<Usuario | null>(null);
  const [excluir, setExcluir] = useState<Usuario | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { sincronizar } = useUsuarios();

  const responsavel = user?.nome ?? "Sistema";

  const stats = useMemo(() => {
    return {
      ativos: usuarios.filter((u) => u.status === "ativo").length,
      inativos: usuarios.filter((u) => u.status === "inativo").length,
      administradores: usuarios.filter((u) => u.papel === "administrador").length,
      operadores: usuarios.filter((u) => u.papel === "operador_matriz").length,
    };
  }, [usuarios]);

  const filtrados = useMemo(() => {
    const b = busca.trim().toLowerCase();
    return usuarios.filter((u) => {
      if (filtro === "administrador" && u.papel !== "administrador") return false;
      if (filtro === "operador_matriz" && u.papel !== "operador_matriz") return false;
      if (filtro === "ativos" && u.status !== "ativo") return false;
      if (filtro === "inativos" && u.status !== "inativo") return false;
      if (!b) return true;
      return (
        u.nome.toLowerCase().includes(b) ||
        u.usuario.toLowerCase().includes(b) ||
        u.email.toLowerCase().includes(b)
      );
    });
  }, [usuarios, busca, filtro]);

  function abrirNovo() {
    setAtivoEdit(null);
    setFormOpen(true);
  }
  function abrirEdicao(u: Usuario) {
    setAtivoEdit(u);
    setFormOpen(true);
  }
  function abrirView(u: Usuario) {
    setAtivoView(u);
    setViewOpen(true);
  }
  function abrirSenha(u: Usuario) {
    setAtivoSenha(u);
    setSenhaOpen(true);
  }
  function alternar(u: Usuario) {
    const novo = u.status === "ativo" ? "inativo" : "ativo";
    alternarStatus(u.id, novo, responsavel);
    toast.success(`Usuário ${novo === "ativo" ? "ativado" : "desativado"}.`);
  }
  function confirmarExclusao() {
    if (!excluir) return;
    const res = excluirUsuario(excluir.id, responsavel);
    if (!res.ok) toast.error(res.erro ?? "Não foi possível excluir.");
    else toast.success("Usuário excluído.");
    setExcluir(null);
  }

  async function handleSincronizar(u: Usuario) {
    if (u.id.length > 20 || u.id.includes("-")) {
      toast.info("Usuário já está sincronizado.");
      return;
    }
    
    setLoadingId(u.id);
    try {
      const senha = window.prompt(`Informe a senha atual de "${u.usuario}" para sincronizar com o servidor:`, u.senha);
      if (senha === null) return;

      const res = await sincronizar(u, senha);
      if (res.ok) {
        toast.success("Usuário sincronizado com o servidor!");
      } else {
        toast.error((res as any).erro ?? "Erro ao sincronizar.");
      }
    } catch (err) {
      toast.error("Erro na comunicação com o servidor.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Usuários do Sistema</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os usuários que possuem acesso ao sistema.
          </p>
        </div>
        <Button onClick={abrirNovo} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Usuários ativos" value={String(stats.ativos)} icon={UserCheck} />
        <StatCard label="Usuários inativos" value={String(stats.inativos)} icon={UserX} />
        <StatCard label="Administradores" value={String(stats.administradores)} icon={ShieldCheck} />
        <StatCard label="Operadores Matriz" value={String(stats.operadores)} icon={UserCog} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, usuário ou e-mail"
            className="border-primary/60 pl-9 focus-visible:border-primary"
          />
        </div>
        <Select value={filtro} onValueChange={(v) => setFiltro(v as Filtro)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="administrador">Administradores</SelectItem>
            <SelectItem value="operador_matriz">Operadores Matriz</SelectItem>
            <SelectItem value="ativos">Ativos</SelectItem>
            <SelectItem value="inativos">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <UsuariosTable
        usuarios={filtrados}
        onView={abrirView}
        onEdit={abrirEdicao}
        onResetSenha={abrirSenha}
        onToggleStatus={alternar}
        onDelete={setExcluir}
        onSincronizar={handleSincronizar}
        loadingId={loadingId}
      />

      <UsuarioFormDrawer
        open={formOpen}
        onOpenChange={setFormOpen}
        usuarioAtual={ativoEdit}
        responsavel={responsavel}
      />
      <UsuarioViewDrawer open={viewOpen} onOpenChange={setViewOpen} usuario={ativoView} />
      <RedefinirSenhaDialog
        open={senhaOpen}
        onOpenChange={setSenhaOpen}
        usuario={ativoSenha}
        responsavel={responsavel}
      />

      <AlertDialog open={!!excluir} onOpenChange={(o) => !o && setExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {excluir?.nome}? Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
