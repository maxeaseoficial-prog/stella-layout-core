import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Props {
  nome: string;
  foto?: string;
  className?: string;
}

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export function UsuarioAvatar({ nome, foto, className }: Props) {
  return (
    <Avatar className={cn("h-9 w-9", className)}>
      {foto ? <AvatarImage src={foto} alt={nome} /> : null}
      <AvatarFallback className="bg-primary-soft text-xs font-semibold text-primary">
        {iniciais(nome)}
      </AvatarFallback>
    </Avatar>
  );
}
