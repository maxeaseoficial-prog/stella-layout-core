import { useRouterState } from "@tanstack/react-router";
import { Bell, Search } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getPageMeta } from "@/lib/navigation";

export function AppHeader() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const meta = getPageMeta(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="h-6" />

      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-foreground sm:text-base">
            {meta.title}
          </h1>
          {meta.description && (
            <p className="hidden truncate text-xs text-muted-foreground md:block">
              {meta.description}
            </p>
          )}
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Pesquisar..."
            className="h-9 w-56 rounded-lg border-border bg-surface-muted pl-9 text-sm shadow-none focus-visible:ring-1 lg:w-72"
          />
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>

        <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />

        <div className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 hover:bg-surface-muted">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary-soft text-xs font-semibold text-primary">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-semibold leading-tight text-foreground">Admin</p>
            <p className="text-[11px] leading-tight text-muted-foreground">Administrador</p>
          </div>
        </div>
      </div>
    </header>
  );
}
