import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  useNavigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppShell } from "@/layouts/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/features/auth/useAuth";
import { ThemeApplier } from "@/features/configuracoes/ThemeApplier";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Esta página não carregou
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado. Tente atualizar ou voltar ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Ir para o início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Stella — Espaço dos Uniformes" },
      {
        name: "description",
        content:
          "Sistema interno da Stella Espaço dos Uniformes — gestão de caixa, clientes, pedidos, estoque e fornecedores.",
      },
      { name: "author", content: "Stella Espaço dos Uniformes" },
      { property: "og:title", content: "Stella — Espaço dos Uniformes" },
      {
        property: "og:description",
        content: "Sistema interno da Stella Espaço dos Uniformes — gestão de caixa, clientes, pedidos, estoque e fornecedores.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Stella — Espaço dos Uniformes" },
      { name: "twitter:description", content: "Sistema interno da Stella Espaço dos Uniformes — gestão de caixa, clientes, pedidos, estoque e fornecedores." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/fd525ee3-1527-43d0-9b03-55ec9f3f9818/id-preview-da4411e5--a0ee32fe-77e9-4f03-9486-bc5f67c553e1.lovable.app-1784302719583.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/fd525ee3-1527-43d0-9b03-55ec9f3f9818/id-preview-da4411e5--a0ee32fe-77e9-4f03-9486-bc5f67c553e1.lovable.app-1784302719583.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        <AuthGate />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function AuthGate() {
  const { isAuthenticated, papel, user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isLoginRoute = pathname === "/login";
  const isTrocaSenhaRoute = pathname === "/trocar-senha";

  useEffect(() => {
    if (!isAuthenticated && !isLoginRoute) {
      navigate({
        to: "/login",
        replace: true,
        search: { redirect: pathname },
      });
      return;
    }
    if (isAuthenticated && user?.precisaTrocarSenha && !isTrocaSenhaRoute) {
      navigate({ to: "/trocar-senha", replace: true });
      return;
    }
    // Bloqueia acesso por URL a módulos fora do perfil.
    if (isAuthenticated && papel && !isLoginRoute && !isTrocaSenhaRoute) {
      import("@/features/auth/permissions").then(({ podeAcessarRota }) => {
        if (!podeAcessarRota(papel, pathname)) {
          navigate({ to: "/", replace: true });
        }
      });
    }
  }, [isAuthenticated, isLoginRoute, isTrocaSenhaRoute, navigate, pathname, papel, user?.precisaTrocarSenha]);

  if (isLoginRoute || isTrocaSenhaRoute) {
    return <Outlet />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
