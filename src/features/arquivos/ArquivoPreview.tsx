import { cn } from "@/lib/utils";
import { isImagem } from "./types";
import { iconePorExtensao } from "./utils";

interface Props {
  extensao: string;
  dataUrl: string;
  nome: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20",
  xl: "h-40 w-full",
};

const iconSizeMap = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

export function ArquivoPreview({
  extensao,
  dataUrl,
  nome,
  className,
  size = "md",
}: Props) {
  const Icon = iconePorExtensao(extensao);
  const ehImg = isImagem(extensao);
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-surface-muted",
        sizeMap[size],
        className,
      )}
    >
      {ehImg ? (
        <img src={dataUrl} alt={nome} className="h-full w-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-1 p-2 text-primary">
          <Icon className={iconSizeMap[size]} />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {extensao}
          </span>
        </div>
      )}
    </div>
  );
}
