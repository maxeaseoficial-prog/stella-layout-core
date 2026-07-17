import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PlaceholderPanelProps {
  title?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
}

/**
 * A card panel used to reserve visual space for future data-driven modules
 * (charts, tables, lists) while the system is scaffolded.
 */
export function PlaceholderPanel({
  title,
  action,
  children,
  className,
  contentClassName,
}: PlaceholderPanelProps) {
  return (
    <Card className={cn("shadow-[var(--shadow-soft)]", className)}>
      {(title || action) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          {title && (
            <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
          )}
          {action}
        </CardHeader>
      )}
      <CardContent className={cn("pt-0", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
