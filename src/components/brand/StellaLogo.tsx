import stellaLogo from "@/assets/stella-logo.png.asset.json";
import stellaLogoWhite from "@/assets/stella-logo-white.png.asset.json";

interface StellaLogoProps {
  collapsed?: boolean;
}

/**
 * Stella brand logo. Uses the official wordmark image.
 * When the sidebar is collapsed, shows a compact cropped version.
 * Swaps to the white variant automatically under the dark theme.
 */
export function StellaLogo({ collapsed = false }: StellaLogoProps) {
  const commonAlt = "Stella — Espaço dos Uniformes";

  if (collapsed) {
    const collapsedStyle = {
      objectPosition: "28% center",
      transform: "scale(2.2)",
      transformOrigin: "left center",
    } as const;
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden">
        <img
          src={stellaLogo.url}
          alt="Stella"
          className="h-8 w-auto max-w-none object-contain object-left dark:hidden"
          style={collapsedStyle}
        />
        <img
          src={stellaLogoWhite.url}
          alt="Stella"
          className="hidden h-8 w-auto max-w-none object-contain object-left dark:block"
          style={collapsedStyle}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center overflow-hidden">
      <img
        src={stellaLogo.url}
        alt={commonAlt}
        className="h-10 w-auto object-contain dark:hidden"
      />
      <img
        src={stellaLogoWhite.url}
        alt={commonAlt}
        className="hidden h-10 w-auto object-contain dark:block"
      />
    </div>
  );
}
