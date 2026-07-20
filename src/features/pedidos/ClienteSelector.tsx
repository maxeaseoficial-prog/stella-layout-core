import { useMemo, useState } from "react";
import { AlertCircle, Check, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  ClienteAvatar,
  ClienteFormDrawer,
  useClientes,
  getClienteNome,
  type Cliente,
  type ClienteInput,
} from "@/features/clientes";

interface Props {
  clienteId: string;
  onSelecionar: (id: string) => void;
}

export function ClienteSelector({ clienteId, onSelecionar }: Props) {
  const { clientes, filtrar, criar } = useClientes();
  const [termo, setTermo] = useState("");
  const [formAberto, setFormAberto] = useState(false);
  const [duplicado, setDuplicado] = useState<Cliente | null>(null);

  const lista = useMemo(() => filtrar(termo).slice(0, 8), [filtrar, termo]);
  const selecionado = clientes.find((c) => c.id === clienteId);

  function handleCriar(dados: ClienteInput) {
    const resultado = criar(dados);
    if (!resultado.ok) {
      setDuplicado(resultado.cliente);
      toast.error("Este cliente já está cadastrado.");
      return;
    }
    onSelecionar(resultado.cliente.id);
    toast.success("Cliente cadastrado e selecionado.");
    setFormAberto(false);
  }

  function selecionarDuplicado() {
    if (!duplicado) return;
    onSelecionar(duplicado.id);
    setDuplicado(null);
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
            className="pl-9"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setFormAberto(true)}
          className="shrink-0"
        >
          <UserPlus className="h-4 w-4" /> Cadastrar novo
        </Button>
      </div>

      {selecionado && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary-soft/40 p-3">
          <ClienteAvatar
            nome={getClienteNome(selecionado)}
            imagem={selecionado.imagem}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {getClienteNome(selecionado)}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {selecionado.telefone}
              {selecionado.tipo === "empresa" &&
                selecionado.responsavel &&
                ` • Resp.: ${selecionado.responsavel}`}
            </p>
          </div>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-4 w-4" />
          </span>
        </div>
      )}

      {duplicado && (
        <div className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              Este cliente já está cadastrado.
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {getClienteNome(duplicado)} • {duplicado.telefone}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => setDuplicado(null)}>
              Fechar
            </Button>
            <Button type="button" size="sm" onClick={selecionarDuplicado}>
              Selecionar existente
            </Button>
          </div>
        </div>
      )}

      <div className="max-h-56 overflow-y-auto rounded-xl border border-border bg-surface-muted/40">
        {clientes.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            Nenhum cliente cadastrado ainda. Use “Cadastrar novo”.
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
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-surface",
                    c.id === clienteId && "bg-primary-soft/60",
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
