import { UsuariosManager } from "@/features/usuarios/UsuariosManager";
import { useAuth } from "@/features/auth/useAuth";

export function UsuariosTab() {
  const { capacidades } = useAuth();

  // Segurança em profundidade: mesmo que a aba seja renderizada,
  // apenas administradores enxergam o conteúdo.
  if (!capacidades.configuracoes.admin) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
        Você não tem permissão para acessar este módulo.
      </div>
    );
  }

  return <UsuariosManager />;
}
