import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  trend?: { value: string; direction: "up" | "down" | "neutral" };
  icon?: LucideIcon;
}

export function StatCard({ label, value, hint, trend, icon: Icon }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-4 p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-elevated)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
        </div>
        {Icon && (
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="font-display text-2xl font-bold tracking-tight text-foreground">
          {value}
        </p>
        <div className="flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium",
                trend.direction === "up" && "bg-success/10 text-success",
                trend.direction === "down" && "bg-destructive/10 text-destructive",
                trend.direction === "neutral" && "bg-muted text-muted-foreground",
              )}
            >
              {trend.direction === "up" && <ArrowUpRight className="h-3 w-3" />}
              {trend.direction === "down" && <ArrowDownRight className="h-3 w-3" />}
              {trend.value}
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      </div>
    </Card>
  );
}
