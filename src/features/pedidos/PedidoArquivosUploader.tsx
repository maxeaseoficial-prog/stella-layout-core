import { useRef, useState } from "react";
import { FileText, FolderOpen, ImageIcon, Paperclip, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { ClienteArquivo } from "@/features/clientes";
import { fileToDataUrl, formatarTamanho } from "@/features/clientes/utils";
import { SelecionarArquivoDialog } from "@/features/arquivos";
import type { Arquivo } from "@/features/arquivos";
import { formatarDataBR, novoId } from "./utils";

const ACCEPT =
  ".png,.jpg,.jpeg,.svg,.pdf,image/png,image/jpeg,image/svg+xml,application/pdf";
const EXTS = ["png", "jpg", "jpeg", "svg", "pdf"];

interface Props {
  arquivos: ClienteArquivo[];
  onChange: (arquivos: ClienteArquivo[]) => void;
  clienteId?: string;
  titulo?: string;
  subtitulo?: string;
  /** Oculta o cabeçalho padrão (usado quando o card externo já traz o título). */
  semCabecalho?: boolean;
  /**
   * Disparado quando o usuário adiciona itens vindos do acervo (Matrizes &
   * Logos). Permite que o pedido reaproveite valor e especificações do
   * arquivo — lançando adicional único e copiando dados para observações.
   */
  onAnexosDoAcervo?: (arquivos: Arquivo[]) => void;
}

export function PedidoArquivosUploader({
  arquivos,
  onChange,
  clienteId,
  titulo,
  subtitulo,
  semCabecalho,
  onAnexosDoAcervo,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectorAberto, setSelectorAberto] = useState(false);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const novos: ClienteArquivo[] = [];
    for (const file of Array.from(fileList)) {
      const ext = (file.name.split(".").pop() ?? "").toLowerCase();
      if (!EXTS.includes(ext)) continue;
      const dataUrl = await fileToDataUrl(file);
      novos.push({
        id: novoId(),
        nome: file.name,
        tipo: file.type || `application/${ext}`,
        extensao: ext,
        tamanho: file.size,
        dataUrl,
        criadoEm: new Date().toISOString(),
      });
    }
    if (novos.length) onChange([...arquivos, ...novos]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function excluir(id: string) {
    onChange(arquivos.filter((a) => a.id !== id));
  }

  function adicionarDoAcervo(itens: Arquivo[]) {
    const jaIds = new Set(arquivos.map((a) => a.id));
    const inéditos = itens.filter((i) => !jaIds.has(i.id));
    const novos: ClienteArquivo[] = inéditos.map((i) => ({
      id: i.id,
      nome: i.arquivoNome,
      tipo: i.mime,
      extensao: i.extensao,
      tamanho: i.tamanho,
      dataUrl: i.dataUrl,
      capaDataUrl: i.capaDataUrl,
      criadoEm: new Date().toISOString(),
    }));
    if (novos.length) onChange([...arquivos, ...novos]);
    if (inéditos.length && onAnexosDoAcervo) onAnexosDoAcervo(inéditos);
    setSelectorAberto(false);
  }


  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {!semCabecalho && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {titulo ?? "Arquivos"}
            </p>
            <p className="text-xs text-muted-foreground">
              {subtitulo ??
                "Reutilize logos e matrizes já cadastradas do cliente ou envie novos arquivos."}
            </p>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {clienteId && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setSelectorAberto(true)}
            >
              <FolderOpen className="h-4 w-4" /> Anexar Matriz/Logo
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-4 w-4" /> Enviar arquivo
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>


      {clienteId && (
        <SelecionarArquivoDialog
          aberto={selectorAberto}
          onFechar={() => setSelectorAberto(false)}
          clienteId={clienteId}
          jaSelecionadosIds={arquivos.map((a) => a.id)}
          onConfirmar={adicionarDoAcervo}
        />
      )}

      {arquivos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-surface-muted/50 p-6 text-center">
          <Paperclip className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Nenhum arquivo anexado.</p>
        </div>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {arquivos.map((arq) => {
            const isImg = ["png", "jpg", "jpeg", "svg"].includes(arq.extensao);
            const thumb = arq.capaDataUrl ?? (isImg ? arq.dataUrl : undefined);
            return (
              <li
                key={arq.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 shadow-[var(--shadow-soft)]"
              >
                {thumb ? (
                  <img
                    src={thumb}
                    alt={arq.nome}
                    className={`h-10 w-10 shrink-0 rounded-lg ring-1 ring-border ${
                      arq.capaDataUrl
                        ? "bg-surface-muted object-contain"
                        : "object-cover"
                    }`}
                  />
                ) : (
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {arq.nome}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {arq.extensao.toUpperCase()} • {formatarTamanho(arq.tamanho)} •{" "}
                    {formatarDataBR(arq.criadoEm.slice(0, 10))}
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => excluir(arq.id)}
                  aria-label="Excluir arquivo"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// avoids unused ImageIcon import warnings in some tsconfig setups
export const _iconRef = ImageIcon;
