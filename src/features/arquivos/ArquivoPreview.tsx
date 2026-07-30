import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { isImagem } from "./types";
import { iconePorExtensao } from "./utils";
import { getPesPreview, isPes } from "./pesRender";

interface Props {
  extensao: string;
  dataUrl: string;
  nome: string;
  /** Capa opcional (PNG/JPG) — quando presente, é sempre a imagem exibida. */
  capaDataUrl?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20",
  xl: "h-40 w-full",
};

const iconSizeMap = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const pdfThumbCache = new Map<string, string>();
const pdfThumbPending = new Map<string, Promise<string | null>>();

async function renderPdfThumb(dataUrl: string): Promise<string | null> {
  if (pdfThumbCache.has(dataUrl)) return pdfThumbCache.get(dataUrl)!;
  if (pdfThumbPending.has(dataUrl)) return pdfThumbPending.get(dataUrl)!;
  const task = (async () => {
    try {
      const pdfjs = await import("pdfjs-dist");
      const workerUrl = (await import("pdfjs-dist/build/pdf.worker.mjs?url")).default;
      (pdfjs as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc =
        workerUrl;
      const base64 = dataUrl.split(",")[1] ?? "";
      const bin = atob(base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const pdf = await pdfjs.getDocument({ data: bytes }).promise;
      const page = await pdf.getPage(1);
      const baseViewport = page.getViewport({ scale: 1 });
      const alvo = 800;
      const scale = Math.min(alvo / baseViewport.width, alvo / baseViewport.height, 3);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      const url = canvas.toDataURL("image/png");
      pdfThumbCache.set(dataUrl, url);
      return url;
    } catch {
      return null;
    } finally {
      pdfThumbPending.delete(dataUrl);
    }
  })();
  pdfThumbPending.set(dataUrl, task);
  return task;
}

export function ArquivoPreview({
  extensao,
  dataUrl,
  nome,
  capaDataUrl,
  className,
  size = "md",
}: Props) {
  const Icon = iconePorExtensao(extensao);
  const ehImg = isImagem(extensao);
  const ehPdf = extensao.toLowerCase() === "pdf";
  const ehPes = isPes(extensao);
  const pesThumb = ehPes ? getPesPreview(dataUrl) : null;
  const [pdfThumb, setPdfThumb] = useState<string | null>(() =>
    ehPdf ? pdfThumbCache.get(dataUrl) ?? null : null,
  );

  useEffect(() => {
    if (!ehPdf) return;
    if (pdfThumbCache.has(dataUrl)) {
      setPdfThumb(pdfThumbCache.get(dataUrl)!);
      return;
    }
    let ativo = true;
    renderPdfThumb(dataUrl).then((url) => {
      if (ativo) setPdfThumb(url);
    });
    return () => {
      ativo = false;
    };
  }, [ehPdf, dataUrl]);

  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-surface-muted",
        sizeMap[size],
        className,
      )}
    >
      {capaDataUrl ? (
        <img src={capaDataUrl} alt={nome} className="h-full w-full object-contain" />
      ) : ehImg ? (
        <img src={dataUrl} alt={nome} className="h-full w-full object-cover" />
      ) : ehPdf && pdfThumb ? (
        <img src={pdfThumb} alt={nome} className="h-full w-full object-contain" />
      ) : ehPes && pesThumb ? (
        <img src={pesThumb} alt={nome} className="h-full w-full object-contain" />
      ) : (
        <div className="flex flex-col items-center gap-1 p-2 text-primary">
          <Icon className={iconSizeMap[size]} />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {extensao}
          </span>
        </div>
      )}
    </div>
  );
}
