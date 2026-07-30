import { useMemo, useState } from "react";
import { Check, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  ClienteAvatar,
  ClienteFormDrawer,
  useClientes,
  getClienteNome,
  type ClienteInput,
} from "@/features/clientes";

interface Props {
  clienteId: string;
  onSelecionar: (id: string) => void;
}

/**
 * Seletor de cliente reutilizando a MESMA base de clientes (nunca duplica).
 * Botão "Cadastrar Cliente" abre o mesmo drawer usado em Clientes.
 */
export function ArquivoClienteSelector({ clienteId, onSelecionar }: Props) {
  const { clientes, filtrar, criar } = useClientes();
  const [termo, setTermo] = useState("");
  const [formAberto, setFormAberto] = useState(false);

  const lista = useMemo(() => filtrar(termo).slice(0, 8), [filtrar, termo]);

  function handleCriar(dados: ClienteInput) {
    const resultado = criar(dados);
    if (!resultado.ok) {
      onSelecionar(resultado.cliente.id);
      toast.info("Cliente já cadastrado — selecionado automaticamente.");
      setFormAberto(false);
      return;
    }
    onSelecionar(resultado.cliente.id);
    toast.success("Cliente cadastrado e selecionado.");
    setFormAberto(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Pesquisar cliente por nome, empresa ou telefone"
            className="border-primary/60 pl-9 focus-visible:border-primary"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setFormAberto(true)}
          className="shrink-0"
        >
          <UserPlus className="h-4 w-4" /> Cadastrar Cliente
        </Button>
      </div>

      <div className="max-h-56 overflow-y-auto rounded-xl border border-border bg-surface-muted/40">
        {clientes.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            Nenhum cliente cadastrado ainda. Use “Cadastrar Cliente”.
          </p>
        ) : lista.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            Nenhum cliente encontrado.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {lista.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelecionar(c.id)}
                  aria-pressed={c.id === clienteId}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-surface",
                    c.id === clienteId &&
                      "bg-primary-soft/60 ring-1 ring-inset ring-primary/30",
                  )}
                >
                  <ClienteAvatar
                    nome={getClienteNome(c)}
                    imagem={c.imagem}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {getClienteNome(c)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.telefone}
                      {c.tipo === "empresa" && ` • Empresa`}
                    </p>
                  </div>
                  {c.id === clienteId && (
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ClienteFormDrawer
        aberto={formAberto}
        onFechar={() => setFormAberto(false)}
        onSalvar={handleCriar}
      />
    </div>
  );
}
