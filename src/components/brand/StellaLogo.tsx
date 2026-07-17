interface StellaLogoProps {
  collapsed?: boolean;
}

/**
 * Stella wordmark rendered inline. Uses a script-style feel via italic + tight
 * tracking so we don't depend on an external font file for the logotype.
 */
export function StellaLogo({ collapsed = false }: StellaLogoProps) {
  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-foreground text-background">
        <span className="font-display text-lg font-extrabold italic leading-none">S</span>
      </div>
      {!collapsed && (
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="font-display text-lg font-extrabold italic tracking-tight text-foreground">
            Stella
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Espaço dos Uniformes
          </span>
        </div>
      )}
    </div>
  );
}
