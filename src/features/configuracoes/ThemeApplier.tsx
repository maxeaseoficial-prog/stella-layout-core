import { useEffect } from "react";
import { useConfiguracoes } from "./useConfiguracoes";

export function ThemeApplier() {
  const { state } = useConfiguracoes();
  const { tema, corPrincipal } = state.aparencia;

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (tema === "escuro") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [tema]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (!corPrincipal) return;
    const hex = corPrincipal;
    root.style.setProperty("--primary", hex);
    root.style.setProperty("--sidebar-primary", hex);
    root.style.setProperty("--ring", `color-mix(in oklab, ${hex} 45%, transparent)`);
    root.style.setProperty("--sidebar-ring", `color-mix(in oklab, ${hex} 45%, transparent)`);
    root.style.setProperty("--accent", `color-mix(in oklab, ${hex} 14%, white)`);
    root.style.setProperty("--accent-foreground", hex);
    root.style.setProperty("--primary-soft", `color-mix(in oklab, ${hex} 14%, white)`);
    root.style.setProperty("--sidebar-accent", `color-mix(in oklab, ${hex} 14%, white)`);
    root.style.setProperty("--sidebar-accent-foreground", hex);
    root.style.setProperty("--chart-1", hex);
  }, [corPrincipal]);

  return null;
}
