import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { UsuarioAvatar } from "./UsuarioAvatar";
import { PAPEL_LABEL, type Usuario } from "./types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}

const ACAO_LABEL: Record<string, string> = {
  criado: "Criado",
  editado: "Editado",
  senha_redefinida: "Senha redefinida",
  ativado: "Ativado",
  desativado: "Desativado",
  excluido: "Excluído",
  senha_alterada: "Senha alterada",
  login: "Login realizado",
};

export function UsuarioViewDrawer({ open, onOpenChange, usuario }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {usuario && (
          <>
            <SheetHeader>
              <SheetTitle>Detalhes do usuário</SheetTitle>
              <SheetDescription>Informações e histórico da conta.</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <UsuarioAvatar nome={usuario.nome} foto={usuario.foto} className="h-16 w-16" />
                <div>
                  <p className="text-lg font-semibold text-foreground">{usuario.nome}</p>
                  <p className="text-xs text-muted-foreground">@{usuario.usuario}</p>
                  <div className="mt-2 flex gap-1.5">
                    <Badge variant="secondary" className="bg-primary-soft text-primary">
                      {PAPEL_LABEL[usuario.papel]}
                    </Badge>
                    <Badge
                      variant={usuario.status === "ativo" ? "default" : "outline"}
                      className={usuario.status === "ativo" ? "" : "text-muted-foreground"}
                    >
                      {usuario.status === "ativo" ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-muted/30 p-4 text-sm">
                <Info label="E-mail" value={usuario.email} />
                <Info label="Telefone" value={usuario.telefone ?? "—"} />
                <Info label="Criado em" value={formatDate(usuario.criadoEm)} />
                <Info label="Último acesso" value={formatDate(usuario.ultimoAcesso)} />
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Histórico
                </h4>
                <ul className="space-y-2">
                  {usuario.historico.map((h) => (
                    <li
                      key={h.id}
                      className="rounded-md border border-border bg-background px-3 py-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">
                          {ACAO_LABEL[h.acao] ?? h.acao}
                        </span>
                        <span className="text-muted-foreground">{formatDate(h.data)}</span>
                      </div>
                      <p className="text-muted-foreground">por {h.responsavel}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
