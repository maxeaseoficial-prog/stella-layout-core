import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/common/EmptyState";
import { FolderOpen } from "lucide-react";

import type { Arquivo } from "./types";
import { LABEL_FINALIDADE, LABEL_TIPO_ARQUIVO } from "./types";
import { ArquivoPreview } from "./ArquivoPreview";
import { useArquivos } from "./useArquivos";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  clienteId: string;
  jaSelecionadosIds?: string[];
  onConfirmar: (arquivos: Arquivo[]) => void;
}

/**
 * Diálogo para reutilizar arquivos já cadastrados de um cliente
 * (Pedidos, Produção). Não faz upload — apenas referencia por ID.
 */
export function SelecionarArquivoDialog({
  aberto,
  onFechar,
  clienteId,
  jaSelecionadosIds = [],
  onConfirmar,
}: Props) {
  const { porCliente } = useArquivos();
  const [termo, setTermo] = useState("");
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  const disponiveis = useMemo(() => {
    if (!clienteId) return [];
    const t = termo.trim().toLowerCase();
    return porCliente(clienteId).filter(
      (a) =>
        a.status === "ativo" &&
        !jaSelecionadosIds.includes(a.id) &&
        (!t ||
          a.nome.toLowerCase().includes(t) ||
          a.arquivoNome.toLowerCase().includes(t)),
    );
  }, [clienteId, porCliente, termo, jaSelecionadosIds]);

  function toggle(id: string) {
    setSelecionados((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirmar() {
    const escolhidos = disponiveis.filter((a) => selecionados.has(a.id));
    onConfirmar(escolhidos);
    setSelecionados(new Set());
    setTermo("");
  }

  function handleFechar() {
    setSelecionados(new Set());
    setTermo("");
    onFechar();
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => (!v ? handleFechar() : null)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Selecionar arquivo existente</DialogTitle>
          <DialogDescription>
            Logos, matrizes e artes já cadastradas para este cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Pesquisar arquivo"
            className="pl-9"
          />
        </div>

        <div className="max-h-[420px] overflow-y-auto rounded-xl border border-border bg-surface-muted/30">
          {disponiveis.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="Nenhum arquivo disponível"
              description="Este cliente ainda não possui arquivos ativos cadastrados em Matrizes & Logos."
            />
          ) : (
            <ul className="divide-y divide-border">
              {disponiveis.map((a) => {
                const ativo = selecionados.has(a.id);
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => toggle(a.id)}
                      aria-pressed={ativo}
                      className={cn(
                        "flex w-full items-center gap-3 p-3 text-left transition hover:bg-surface",
                        ativo && "bg-primary-soft/60 ring-1 ring-inset ring-primary/30",
                      )}
                    >
                      <ArquivoPreview
                        extensao={a.extensao}
                        dataUrl={a.dataUrl}
                        nome={a.arquivoNome}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {a.nome}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className="border-border bg-surface-muted/60 text-[10px]"
                          >
                            {LABEL_TIPO_ARQUIVO[a.tipo]}
                          </Badge>
                          {a.finalidade && (
                            <Badge
                              variant="outline"
                              className="border-border bg-surface-muted/60 text-[10px]"
                            >
                              {LABEL_FINALIDADE[a.finalidade]}
                            </Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {a.extensao.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      {ativo && (
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleFechar}>
            Cancelar
          </Button>
          <Button onClick={confirmar} disabled={selecionados.size === 0}>
            Adicionar {selecionados.size > 0 && `(${selecionados.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
