import {
  Building2,
  CalendarClock,
  Globe,
  Instagram,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  Timer,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClienteAvatar } from "@/features/clientes";
import { formatarDataBR } from "@/features/pedidos";

import type { Fornecedor } from "./types";
import { LABEL_CATEGORIA_FORNECEDOR } from "./types";

interface Props {
  fornecedor: Fornecedor | null;
  aberto: boolean;
  onFechar: () => void;
  onEditar: (f: Fornecedor) => void;
}

function InfoLine({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function FornecedorViewDrawer({ fornecedor, aberto, onFechar, onEditar }: Props) {
  if (!fornecedor) return null;
  const end = fornecedor.endereco ?? {};
  const enderecoLinha = [
    [end.rua, end.numero].filter(Boolean).join(", "),
    end.bairro,
    [end.cidade, end.estado].filter(Boolean).join(" / "),
    end.cep,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Sheet open={aberto} onOpenChange={(v) => (!v ? onFechar() : undefined)}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0">
        <SheetHeader className="border-b border-border bg-surface p-6">
          <div className="flex items-start gap-4">
            <ClienteAvatar nome={fornecedor.empresa} imagem={fornecedor.logo} size="xl" />
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate">{fornecedor.empresa}</SheetTitle>
              <SheetDescription>
                Representante: {fornecedor.representante}
              </SheetDescription>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {fornecedor.status === "ativo" ? (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    Ativo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Inativo
                  </Badge>
                )}
                {fornecedor.categorias.map((c) => (
                  <Badge
                    key={c}
                    variant="outline"
                    className="border-border bg-surface-muted/60"
                  >
                    {LABEL_CATEGORIA_FORNECEDOR[c]}
                  </Badge>
                ))}
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => onEditar(fornecedor)}>
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          </div>
        </SheetHeader>

        <div className="p-6">
          <Tabs defaultValue="geral" className="space-y-4">
            <TabsList>
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="produtos">Produtos fornecidos</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoLine icon={Phone} label="Telefone" value={fornecedor.telefone} />
                <InfoLine icon={Mail} label="E-mail" value={fornecedor.email} />
                <InfoLine icon={Globe} label="Site" value={fornecedor.site} />
                <InfoLine
                  icon={Instagram}
                  label="Instagram"
                  value={fornecedor.instagram}
                />
                <InfoLine icon={Building2} label="CNPJ" value={fornecedor.cnpj} />
                <InfoLine
                  icon={Building2}
                  label="Inscrição estadual"
                  value={fornecedor.inscricaoEstadual}
                />
                <InfoLine
                  icon={CalendarClock}
                  label="Data de cadastro"
                  value={formatarDataBR(fornecedor.dataCadastro)}
                />
                <InfoLine
                  icon={Timer}
                  label="Prazo médio de entrega"
                  value={
                    fornecedor.prazoMedioEntregaDias !== undefined
                      ? `${fornecedor.prazoMedioEntregaDias} dia(s)`
                      : undefined
                  }
                />
                <div className="sm:col-span-2">
                  <InfoLine icon={MapPin} label="Endereço" value={enderecoLinha || undefined} />
                </div>
              </div>

              {fornecedor.observacoes && (
                <div className="rounded-xl border border-border bg-surface-muted/40 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Observações
                  </p>
                  <p className="whitespace-pre-line text-sm text-foreground">
                    {fornecedor.observacoes}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="produtos">
              <EmptyState
                icon={Package}
                title="Nenhum produto vinculado"
                description="Ao cadastrar itens no Estoque com este fornecedor, eles aparecerão aqui."
              />
            </TabsContent>

            <TabsContent value="historico">
              <EmptyState
                icon={CalendarClock}
                title="Sem histórico de compras"
                description="Compras, entregas e valores serão exibidos quando o módulo de compras for lançado."
              />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
