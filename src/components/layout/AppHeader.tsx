import { useRouterState, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getPageMeta } from "@/lib/navigation";
import { logout, useAuth } from "@/features/auth/useAuth";
import { NotificacoesPopover } from "@/features/notificacoes";
import { useConfiguracoes } from "@/features/configuracoes/useConfiguracoes";

export function AppHeader() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const meta = getPageMeta(pathname);
  const { user } = useAuth();
  const { state: config } = useConfiguracoes();
  const navigate = useNavigate();

  const iniciais = (user?.nome ?? "AD")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleLogout() {
    logout();
    navigate({ to: "/login", replace: true });
  }

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
        <NotificacoesPopover />


        <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 outline-none transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar className="h-8 w-8">
                {user?.foto || config.empresa.logo ? (
                  <img
                    src={user?.foto || config.empresa.logo}
                    alt={user?.nome}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-primary-soft text-xs font-semibold text-primary">
                    {iniciais}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold leading-tight text-foreground">
                  {user?.nome ?? "Admin"}
                </p>
                <p className="text-[11px] leading-tight text-muted-foreground">
                  {user?.papel ?? "Administrador"}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">{user?.nome ?? "Admin"}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {user?.email ?? "—"}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
