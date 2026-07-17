import stellaLogo from "@/assets/stella-logo.png.asset.json";

interface StellaLogoProps {
  collapsed?: boolean;
}

/**
 * Stella brand logo. Uses the official wordmark image.
 * When the sidebar is collapsed, shows a compact cropped version.
 */
export function StellaLogo({ collapsed = false }: StellaLogoProps) {
  if (collapsed) {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden">
        <img
          src={stellaLogo.url}
          alt="Stella"
          className="h-8 w-auto max-w-none object-contain object-left"
          style={{ objectPosition: "28% center", transform: "scale(2.2)", transformOrigin: "left center" }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center overflow-hidden">
      <img
        src={stellaLogo.url}
        alt="Stella — Espaço dos Uniformes"
        className="h-10 w-auto object-contain"
      />
    </div>
  );
}
