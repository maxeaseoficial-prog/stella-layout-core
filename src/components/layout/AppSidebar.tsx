import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Wallet,
  Users,
  ShoppingBag,
  Package,
  Boxes,
  Truck,
  Sparkles,
  ClipboardList,
  Calculator,
  Settings,
  LogOut,
  UserCircle2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StellaLogo } from "@/components/brand/StellaLogo";
import { logout, useAuth } from "@/features/auth/useAuth";
import { useConfiguracoes } from "@/features/configuracoes/useConfiguracoes";
import type { Papel } from "@/features/auth/permissions";
import { ROTAS_PERMITIDAS } from "@/features/auth/permissions";

const NAV_ITEMS = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Caixa", url: "/caixa", icon: Wallet },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Pedidos", url: "/pedidos", icon: ShoppingBag },
  { title: "Produtos", url: "/produtos", icon: Package },
  { title: "Estoque", url: "/estoque", icon: Boxes },
  { title: "Fornecedores", url: "/fornecedores", icon: Truck },
  { title: "Matrizes & Logos", url: "/matrizes-logos", icon: Sparkles },
  { title: "Tarefas", url: "/tarefas", icon: ClipboardList },
  { title: "Formação de Preço", url: "/precificacao", icon: Calculator },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
] as const;

function itensPara(papel: Papel, permissoesAbas?: string[]) {
  const permitidas = new Set<string>(permissoesAbas ?? ROTAS_PERMITIDAS[papel]);
  return NAV_ITEMS.filter((i) => i.url === "/configuracoes" || permitidas.has(i.url));
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { user, papel, permissoesAbas } = useAuth();
  const { state: config } = useConfiguracoes();

  const items = itensPara(papel ?? "administrador", permissoesAbas);

  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname === url || pathname.startsWith(`${url}/`);

  const iniciais = (user?.nome ?? "US")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex h-14 items-center gap-2 px-2">
          <StellaLogo collapsed={collapsed} />
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className="h-9 rounded-lg text-sm font-medium data-[active=true]:bg-primary-soft data-[active=true]:text-primary hover:bg-sidebar-accent"
                    >
                      <Link to={item.url} preload="intent" className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sair"
              onClick={() => logout()}
              className="h-11 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent"
            >
              <Avatar className="h-7 w-7">
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
              {!collapsed && (
                <div className="flex items-center gap-2 flex-1">
                  <span className="truncate text-sm font-medium">Sair</span>
                  <LogOut className="h-4 w-4 ml-auto" />
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
