import { useNavigate } from "@tanstack/react-router";
import { Bell, BellOff, CheckCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { useNotificacoes } from "./useNotificacoes";
import { useSomNotificacao } from "./useSomNotificacao";
import type { Notificacao } from "./types";

function tempoRelativo(iso: string): string {
  const alvo = new Date(iso).getTime();
  if (!Number.isFinite(alvo)) return "";
  const diff = Math.max(0, Date.now() - alvo);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `há ${d} d`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function NotificacoesPopover() {
  const { itens, naoLidas, lidas, marcarLida, marcarTodas } = useNotificacoes();
  const navigate = useNavigate();

  function clicarNotificacao(n: Notificacao) {
    marcarLida(n.id);
    navigate({
      to: n.rota,
      search: n.search ?? {},
    } as never);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
          aria-label={`Notificações${naoLidas > 0 ? ` (${naoLidas} não lidas)` : ""}`}
        >
          <Bell className="h-4 w-4" />
          {naoLidas > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
              {naoLidas > 9 ? "9+" : naoLidas}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[360px] p-0"
        sideOffset={8}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Notificações</p>
            <p className="text-[11px] text-muted-foreground">
              {itens.length === 0
                ? "Você está em dia."
                : `${itens.length} no total · ${naoLidas} não ${naoLidas === 1 ? "lida" : "lidas"}`}
            </p>
          </div>
          {itens.length > 0 && naoLidas > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-[11px] font-medium text-muted-foreground hover:text-foreground"
              onClick={marcarTodas}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Marcar tudo
            </Button>
          )}
        </div>

        {itens.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-surface-muted text-muted-foreground">
              <BellOff className="h-4 w-4" />
            </span>
            <p className="text-sm font-medium text-foreground">Nenhuma notificação</p>
            <p className="text-xs text-muted-foreground">
              Você será avisado aqui quando algo mudar.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[420px]">
            <ul className="flex flex-col">
              {itens.map((n) => {
                const naoLida = !lidas.has(n.id);
                const Icon = n.icon ?? Bell;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => clicarNotificacao(n)}
                      className={cn(
                        "flex w-full items-start gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-surface-muted/60 focus:outline-none focus-visible:bg-surface-muted",
                        naoLida && "bg-primary-soft/30",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                          naoLida
                            ? "bg-primary/10 text-primary"
                            : "bg-surface-muted text-muted-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p
                            className={cn(
                              "truncate text-sm",
                              naoLida
                                ? "font-semibold text-foreground"
                                : "font-medium text-muted-foreground",
                            )}
                          >
                            {n.titulo}
                          </p>
                          {naoLida && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {n.descricao}
                        </p>
                        <p className="mt-1 text-[10.5px] uppercase tracking-wide text-muted-foreground/80">
                          {tempoRelativo(n.criadoEm)}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
