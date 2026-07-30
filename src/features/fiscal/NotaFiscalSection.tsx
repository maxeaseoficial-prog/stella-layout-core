import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Ban,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  RefreshCw,
  Send,
} from "lucide-react";

import { toast } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useAuth } from "@/features/auth/useAuth";
import { usePedidos } from "@/features/pedidos/usePedidos";
import type { Pedido } from "@/features/pedidos/types";
import {
  formatarDataHoraBR,
  formatarMoeda,
  pedidoTemPendencia,
} from "@/features/pedidos/utils";
import { cn } from "@/lib/utils";
import {
  cancelarNfePedido,
  consultarNfePedido,
  emitirNfePedido,
  reenviarDanfePedido,
} from "@/lib/fiscal.functions";

import {
  LABEL_AMBIENTE_SPEDY,
  LABEL_STATUS_NFE,
  STATUS_NFE_FINAIS,
  urlDanfePdf,
  urlXmlNfe,
} from "./index";
import type { NotaFiscalPedido, StatusNfe } from "./types";

/** Intervalo de consulta recomendado pela documentação da Spedy (5–10s). */
const POLL_INTERVALO_MS = 5000;
const POLL_MAX_TENTATIVAS = 24; // ~2 minutos

function classeStatusNfe(status: StatusNfe): string {
  switch (status) {
    case "authorized":
      return "border-emerald-300 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200";
    case "rejected":
    case "denied":
      return "border-red-300 bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-200";
    case "canceled":
    case "disabled":
    case "removed":
      return "border-zinc-300 bg-zinc-100 text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200";
    default:
      return "border-amber-300 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200";
  }
}

interface Props {
  pedido: Pedido;
}

export function NotaFiscalSection({ pedido }: Props) {
  const { papel } = useAuth();
  const admin = papel === "administrador";
  const { salvarNotaFiscal } = usePedidos();

  const nota = pedido.notaFiscal;
  const [ocupado, setOcupado] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [dialogCancelar, setDialogCancelar] = useState(false);
  const [justificativa, setJustificativa] = useState("");

  const pollRef = useRef<number | null>(null);
  const statusRef = useRef<StatusNfe | undefined>(nota?.status);

  useEffect(() => {
    statusRef.current = nota?.status;
  }, [nota?.status]);

  useEffect(
    () => () => {
      if (pollRef.current) window.clearTimeout(pollRef.current);
    },
    [],
  );

  const temPendencia = pedidoTemPendencia(pedido);
  const motivoBloqueioEmissao = !admin
    ? "Apenas o perfil Administrador pode emitir notas fiscais."
    : pedido.statusFinanceiro === "cancelado"
      ? "Pedido cancelado não pode gerar NF-e."
      : pedido.itens.length === 0
        ? "O pedido não possui itens."
        : temPendencia
          ? "Resolva os orçamentos pendentes antes de emitir a NF-e."
          : !(pedido.total > 0)
            ? "O total do pedido precisa ser maior que zero."
            : null;

  function historicoDaTransicao(nova: NotaFiscalPedido): string | undefined {
    if (nova.status === statusRef.current) return undefined;
    if (nova.status === "authorized") {
      return `NF-e autorizada${nova.numero ? ` (nº ${nova.numero})` : ""}.`;
    }
    if (nova.status === "rejected") {
      return `NF-e rejeitada: ${nova.processingDetail?.message ?? "sem detalhes informados"}.`;
    }
    if (nova.status === "canceled") return "NF-e cancelada.";
    if (nova.status === "denied") return "NF-e denegada pela SEFAZ.";
    return undefined;
  }

  /** Consulta o status atual na Spedy e persiste. Retorna true se chegou a um estado final. */
  async function consultarAgora(): Promise<boolean> {
    const res = await consultarNfePedido({ data: { pedidoId: pedido.id } });
    if (!res.ok) return false;
    salvarNotaFiscal(pedido.id, res.nota, historicoDaTransicao(res.nota));
    return STATUS_NFE_FINAIS.includes(res.nota.status);
  }

  function iniciarPolling() {
    if (pollRef.current) window.clearTimeout(pollRef.current);
    setProcessando(true);
    let tentativas = 0;
    const tick = async () => {
      tentativas += 1;
      try {
        const final = await consultarAgora();
        if (final || tentativas >= POLL_MAX_TENTATIVAS) {
          setProcessando(false);
          return;
        }
      } catch {
        // Falha de rede pontual — continua tentando até o limite.
      }
      pollRef.current = window.setTimeout(tick, POLL_INTERVALO_MS);
    };
    pollRef.current = window.setTimeout(tick, POLL_INTERVALO_MS);
  }

  async function handleEmitir() {
    setOcupado(true);
    try {
      const res = await emitirNfePedido({ data: { pedidoId: pedido.id } });
      if (!res.ok) {
        toast.error(res.mensagem);
        if (nota) {
          salvarNotaFiscal(pedido.id, {
            ...nota,
            erro: res.mensagem,
            atualizadoEm: new Date().toISOString(),
          });
        }
        return;
      }
      salvarNotaFiscal(
        pedido.id,
        res.nota,
        `NF-e enviada para emissão no ambiente ${LABEL_AMBIENTE_SPEDY[res.nota.ambiente]}.`,
      );
      toast.success("NF-e enviada para emissão. Acompanhe o status abaixo.");
      iniciarPolling();
    } catch {
      toast.error("Falha ao emitir a NF-e.");
    } finally {
      setOcupado(false);
    }
  }

  async function handleAtualizar() {
    setOcupado(true);
    try {
      const final = await consultarAgora();
      toast.success(final ? "Status atualizado." : "Nota ainda em processamento.");
    } catch {
      toast.error("Falha ao consultar o status da NF-e.");
    } finally {
      setOcupado(false);
    }
  }

  async function handleCancelar() {
    if (justificativa.trim().length < 15) {
      toast.error("A justificativa deve ter no mínimo 15 caracteres.");
      return;
    }
    setOcupado(true);
    try {
      const res = await cancelarNfePedido({
        data: { pedidoId: pedido.id, justificativa: justificativa.trim() },
      });
      if (!res.ok) {
        toast.error(res.mensagem);
        return;
      }
      salvarNotaFiscal(
        pedido.id,
        res.nota,
        res.nota.status === "canceled"
          ? "NF-e cancelada."
          : "Cancelamento da NF-e solicitado.",
      );
      toast.success(
        res.nota.status === "canceled"
          ? "NF-e cancelada com sucesso."
          : "Cancelamento solicitado. Acompanhe o status.",
      );
      setDialogCancelar(false);
      setJustificativa("");
      if (!STATUS_NFE_FINAIS.includes(res.nota.status)) iniciarPolling();
    } catch {
      toast.error("Falha ao cancelar a NF-e.");
    } finally {
      setOcupado(false);
    }
  }

  async function handleReenviarEmail() {
    setOcupado(true);
    try {
      const res = await reenviarDanfePedido({ data: { pedidoId: pedido.id } });
      if (res.ok) toast.success("DANFE reenviado por e-mail ao destinatário.");
      else toast.error(res.mensagem);
    } catch {
      toast.error("Falha ao reenviar o DANFE.");
    } finally {
      setOcupado(false);
    }
  }

  const documentosDisponiveis =
    !!nota?.spedyId &&
    (nota.status === "authorized" ||
      nota.status === "canceled" ||
      nota.status === "inContingent");

  return (
    <section className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <FileText className="h-4 w-4 text-primary" /> Nota Fiscal (NF-e)
        </h4>
        {nota ? (
          <Badge variant="outline" className={cn("font-medium", classeStatusNfe(nota.status))}>
            {LABEL_STATUS_NFE[nota.status]}
          </Badge>
        ) : (
          <Badge variant="outline" className="border-border bg-muted/60 font-medium text-muted-foreground">
            Não emitida
          </Badge>
        )}
      </div>

      {processando && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Nota em processamento na SEFAZ. O status é atualizado automaticamente
          a cada 5 segundos.
        </div>
      )}

      {nota?.erro && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50/70 px-3 py-2 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <p className="font-medium">Falha na última tentativa</p>
            <p className="mt-0.5 whitespace-pre-wrap">{nota.erro}</p>
          </div>
        </div>
      )}

      {nota?.status === "rejected" && nota.processingDetail?.message && (
        <div className="rounded-lg border border-red-200 bg-red-50/70 px-3 py-2 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
          <p className="font-medium">Motivo da rejeição</p>
          <p className="mt-0.5 whitespace-pre-wrap">
            {nota.processingDetail.code ? `[${nota.processingDetail.code}] ` : ""}
            {nota.processingDetail.message}
          </p>
          <p className="mt-1 text-red-700/80 dark:text-red-300/70">
            Corrija os dados do pedido/cliente e clique em "Emitir NF-e" novamente —
            a mesma nota é corrigida (sem criar duplicidade).
          </p>
        </div>
      )}

      {!nota ? (
        <p className="text-sm text-muted-foreground">
          Emita a NF-e deste pedido com os dados do cliente, produtos, valores e
          pagamentos. A tributação e o ambiente seguem o configurado em
          Configurações → Fiscal.
        </p>
      ) : (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
          <Campo label="Número" valor={nota.numero != null ? String(nota.numero) : "—"} />
          <Campo label="Série" valor={nota.serie ?? "—"} />
          <Campo label="Valor" valor={nota.valor != null ? formatarMoeda(nota.valor) : "—"} />
          <Campo label="Ambiente" valor={LABEL_AMBIENTE_SPEDY[nota.ambiente]} />
          <Campo
            label="Emitida em"
            valor={nota.emitidaEm ? formatarDataHoraBR(nota.emitidaEm) : "—"}
          />
          <Campo
            label="Autorizada em"
            valor={nota.autorizadaEm ? formatarDataHoraBR(nota.autorizadaEm) : "—"}
          />
          {nota.chaveAcesso && (
            <div className="col-span-2 sm:col-span-3">
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Chave de acesso
              </dt>
              <dd className="mt-0.5 break-all font-mono text-xs text-foreground">
                {nota.chaveAcesso}
              </dd>
            </div>
          )}
          {nota.protocolo && (
            <Campo label="Protocolo" valor={nota.protocolo} mono />
          )}
        </dl>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        {admin && (!nota || nota.status === "rejected") && (
          <Button
            size="sm"
            onClick={handleEmitir}
            disabled={ocupado || !!motivoBloqueioEmissao}
            className="gap-1.5"
          >
            {ocupado ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {nota?.status === "rejected" ? "Emitir novamente" : "Emitir NF-e"}
          </Button>
        )}

        {admin && nota && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleAtualizar}
            disabled={ocupado}
            className="gap-1.5"
          >
            <RefreshCw className={cn("h-4 w-4", ocupado && "animate-spin")} />
            Atualizar status
          </Button>
        )}

        {documentosDisponiveis && nota && (
          <>
            <Button size="sm" variant="outline" asChild className="gap-1.5">
              <a href={urlDanfePdf(nota)} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" /> Visualizar DANFE
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild className="gap-1.5">
              <a href={urlDanfePdf(nota)} download={`DANFE-${pedido.numero}.pdf`} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" /> Baixar DANFE
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild className="gap-1.5">
              <a href={urlXmlNfe(nota)} download={`NFe-${pedido.numero}.xml`} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" /> Baixar XML
              </a>
            </Button>
          </>
        )}

        {admin && nota?.status === "authorized" && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReenviarEmail}
              disabled={ocupado}
              className="gap-1.5"
            >
              <Mail className="h-4 w-4" /> Reenviar DANFE por e-mail
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDialogCancelar(true)}
              disabled={ocupado}
              className="gap-1.5 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"
            >
              <Ban className="h-4 w-4" /> Cancelar Nota
            </Button>
          </>
        )}
      </div>

      {motivoBloqueioEmissao && admin && !nota && (
        <p className="text-xs text-muted-foreground">{motivoBloqueioEmissao}</p>
      )}

      <AlertDialog open={dialogCancelar} onOpenChange={setDialogCancelar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar NF-e</AlertDialogTitle>
            <AlertDialogDescription>
              O cancelamento é enviado à SEFAZ e respeita o prazo legal do seu
              estado. Informe a justificativa (mínimo de 15 caracteres).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="justificativa-nfe">Justificativa</Label>
            <Textarea
              id="justificativa-nfe"
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Ex.: Nota emitida com dados incorretos do destinatário."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {justificativa.trim().length}/15 caracteres mínimos
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleCancelar();
              }}
              disabled={ocupado || justificativa.trim().length < 15}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {ocupado ? "Cancelando..." : "Confirmar cancelamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function Campo({
  label,
  valor,
  mono,
}: {
  label: string;
  valor: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className={cn("mt-0.5 text-foreground", mono && "font-mono text-xs")}>
        {valor}
      </dd>
    </div>
  );
}
