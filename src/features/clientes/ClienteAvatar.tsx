import { cn } from "@/lib/utils";
import { getIniciais } from "./utils";

interface ClienteAvatarProps {
  nome: string;
  imagem?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-24 w-24 text-2xl",
};

export function ClienteAvatar({ nome, imagem, size = "md", className }: ClienteAvatarProps) {
  const iniciais = getIniciais(nome);
  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary-soft font-semibold text-primary ring-1 ring-border/60",
        sizeMap[size],
        className,
      )}
    >
      {imagem ? (
        <img src={imagem} alt={nome} className="h-full w-full object-cover" />
      ) : (
        <span>{iniciais}</span>
      )}
    </div>
  );
}
