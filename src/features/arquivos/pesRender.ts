/**
 * Decodificador e renderizador de arquivos PES (matriz de bordado Brother).
 *
 * Arquivos PES (v2+) contêm um bloco PEC com os pontos da matriz
 * (coordenadas em décimos de milímetro) e a paleta de linhas Brother.
 * Este módulo decodifica esse bloco e gera um SVG dos caminhos de costura,
 * permitindo visualizar a logo/matriz no navegador — sem dependências.
 *
 * Baseado no formato documentado pelo projeto pyembroidery/libembroidery.
 */

/** Paleta Brother PEC (índice 0 é desconhecido; PEC usa 1..64). */
const PEC_THREADS: string[] = [
  "#808080", // 0 — desconhecido
  "#0E1F7C", "#0A55A3", "#008777", "#4B6BAF", "#ED171F",
  "#D15C00", "#913697", "#E49ACB", "#915FAC", "#9ED67D",
  "#E8A900", "#FEBA35", "#FFFF00", "#70BC1F", "#BA9800",
  "#A8A8A8", "#7D6F00", "#FFFFB3", "#4F5556", "#000000",
  "#0B3D91", "#770176", "#293133", "#2A1301", "#F64A8A",
  "#B27624", "#FCBBC5", "#FE370F", "#F0F0F0", "#6A1C8A",
  "#A8DDC4", "#2584BB", "#FEB343", "#FFF36B", "#D0A660",
  "#D15400", "#66BA49", "#134A46", "#878787", "#D8CCC6",
  "#435607", "#FDD9DE", "#F993BC", "#003822", "#B2AFD4",
  "#686AB0", "#EFE3B9", "#F73866", "#B54B64", "#132B1A",
  "#C70156", "#FE9E32", "#A8DEEB", "#00673E", "#4E2990",
  "#2F7E20", "#FFCCCC", "#FFD911", "#095BA6", "#F0F970",
  "#E3F35B", "#FF9900", "#FFF08D", "#FFC8C8",
];

export interface PesSegment {
  cor: string;
  /** Sub-caminhos (separados por saltos/cortes de linha), pontos em unidades PEC (0,1mm). */
  caminhos: [number, number][][];
}

export interface PesDesign {
  label: string;
  segmentos: PesSegment[];
  cores: string[];
  totalPontos: number;
  larguraMm: number;
  alturaMm: number;
}

export function isPes(extensao: string): boolean {
  return extensao.toLowerCase() === "pes";
}

function dataUrlToBytes(dataUrl: string): Uint8Array | null {
  const base64 = dataUrl.split(",")[1] ?? "";
  if (!base64) return null;
  try {
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

class Reader {
  pos = 0;
  constructor(private b: Uint8Array) {}
  seek(delta: number) {
    this.pos += delta;
  }
  u8(): number {
    if (this.pos >= this.b.length) throw new Error("fim do arquivo");
    return this.b[this.pos++];
  }
  ascii(inicio: number, tamanho: number): string {
    if (inicio + tamanho > this.b.length) return "";
    let s = "";
    for (let i = 0; i < tamanho; i++) s += String.fromCharCode(this.b[inicio + i]);
    return s;
  }
  u32leNa(pos: number): number {
    if (pos + 4 > this.b.length) return -1;
    return (
      this.b[pos] |
      (this.b[pos + 1] << 8) |
      (this.b[pos + 2] << 16) |
      (this.b[pos + 3] << 24)
    ) >>> 0;
  }
}

function signed12(b: number): number {
  b &= 0xfff;
  return b > 0x7ff ? b - 0x1000 : b;
}

function signed7(b: number): number {
  return b > 63 ? b - 128 : b;
}

/** Decodifica os pontos de um arquivo PES (ou PEC puro). Retorna null se inválido/sem pontos. */
export function decodePes(bytes: Uint8Array): PesDesign | null {
  try {
    const assinatura = new Reader(bytes).ascii(0, 8);
    let pecOffset: number;
    if (assinatura === "#PEC0001") {
      pecOffset = 8;
    } else if (assinatura.startsWith("#PES")) {
      if (assinatura === "#PES0001") return null; // v1 não tem bloco PEC padrão
      pecOffset = new Reader(bytes).u32leNa(8);
      if (pecOffset < 12 || pecOffset >= bytes.length - 16) return null;
    } else {
      return null;
    }

    const r = new Reader(bytes);
    r.pos = pecOffset;
    if (r.ascii(pecOffset, 3) !== "LA:") return null;
    r.seek(3); // "LA:"
    const label = r.ascii(r.pos, 16).trim().replace(/\0.*$/g, "");
    r.seek(16 + 0x0f); // label + (0x0D, espaços, 0xFF 0x00)
    r.u8(); // graphic byte stride
    r.u8(); // graphic icon height
    r.seek(0x0c);
    const trocasDeCor = r.u8();
    const totalCores = trocasDeCor + 1;
    const cores: string[] = [];
    for (let i = 0; i < totalCores; i++) {
      const idx = r.u8() % PEC_THREADS.length;
      cores.push(PEC_THREADS[idx] || PEC_THREADS[0]);
    }
    r.seek(0x1d0 - trocasDeCor);
    // 3 bytes (tamanho do bloco de pontos) + 11 bytes ('\x31\xff\xf0' + 4 shorts)
    r.seek(3);
    r.seek(0x0b);

    const segmentos: PesSegment[] = [];
    let corIdx = 0;
    let caminhoAtual: [number, number][] = [];
    let cx = 0;
    let cy = 0;
    let totalPontos = 0;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const fecharCaminho = () => {
      if (caminhoAtual.length >= 2) {
        let seg = segmentos[segmentos.length - 1];
        if (!seg || seg.cor !== cores[Math.min(corIdx, cores.length - 1)]) {
          seg = { cor: cores[Math.min(corIdx, cores.length - 1)] ?? PEC_THREADS[0], caminhos: [] };
          segmentos.push(seg);
        }
        seg.caminhos.push(caminhoAtual);
      }
      caminhoAtual = [];
    };

    for (;;) {
      let val1: number;
      let val2: number;
      try {
        val1 = r.u8();
        val2 = r.u8();
      } catch {
        break; // fim inesperado — usa o que decodificou
      }
      if (val1 === 0xff && val2 === 0x00) break;
      if (val1 === 0xfe && val2 === 0xb0) {
        try {
          r.u8();
        } catch {
          break;
        }
        fecharCaminho();
        corIdx++;
        continue;
      }
      let jump = false;
      let trim = false;
      let dx: number;
      let dy: number;
      if (val1 & 0x80) {
        if (val1 & 0x20) trim = true;
        if (val1 & 0x10) jump = true;
        dx = signed12((val1 << 8) | val2);
        try {
          val2 = r.u8();
        } catch {
          break;
        }
      } else {
        dx = signed7(val1);
      }
      if (val2 & 0x80) {
        if (val2 & 0x20) trim = true;
        if (val2 & 0x10) jump = true;
        const val3 = (() => {
          try {
            return r.u8();
          } catch {
            return -1;
          }
        })();
        if (val3 < 0) break;
        dy = signed12((val2 << 8) | val3);
      } else {
        dy = signed7(val2);
      }
      cx += dx;
      cy += dy;
      if (jump || trim) {
        fecharCaminho();
        continue;
      }
      caminhoAtual.push([cx, cy]);
      totalPontos++;
      if (cx < minX) minX = cx;
      if (cx > maxX) maxX = cx;
      if (cy < minY) minY = cy;
      if (cy > maxY) maxY = cy;
    }
    fecharCaminho();

    if (totalPontos === 0 || !isFinite(minX)) return null;

    return {
      label,
      segmentos,
      cores,
      totalPontos,
      larguraMm: (maxX - minX) / 10,
      alturaMm: (maxY - minY) / 10,
    };
  } catch {
    return null;
  }
}

/** Gera um SVG (string) dos caminhos de costura da matriz, com Y invertido para tela. */
export function renderPesSvg(design: PesDesign): string | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let total = 0;
  for (const seg of design.segmentos) {
    for (const caminho of seg.caminhos) {
      for (const [x, y] of caminho) {
        const sy = -y; // PEC tem Y para cima; SVG tem Y para baixo
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (sy < minY) minY = sy;
        if (sy > maxY) maxY = sy;
        total++;
      }
    }
  }
  if (total === 0 || !isFinite(minX)) return null;

  // Amostragem para manter o SVG leve em matrizes muito grandes.
  const LIMITE = 40000;
  const passo = total > LIMITE ? Math.ceil(total / LIMITE) : 1;

  const largura = maxX - minX || 1;
  const altura = maxY - minY || 1;
  const margem = Math.max(largura, altura) * 0.06;
  const vx = minX - margem;
  const vy = minY - margem;
  const vw = largura + margem * 2;
  const vh = altura + margem * 2;
  const espessura = Math.max(2, Math.max(largura, altura) / 140);

  const paths = design.segmentos
    .map((seg) => {
      const partes: string[] = [];
      for (const caminho of seg.caminhos) {
        const pts: string[] = [];
        for (let i = 0; i < caminho.length; i++) {
          if (passo > 1 && i % passo !== 0 && i !== caminho.length - 1) continue;
          const [x, y] = caminho[i];
          pts.push(`${(i === 0 || pts.length === 0 ? "M" : "L")}${x.toFixed(1)} ${(-y).toFixed(1)}`);
        }
        if (pts.length >= 2) partes.push(pts.join(""));
      }
      if (partes.length === 0) return "";
      return `<path d="${partes.join(" ")}" fill="none" stroke="${seg.cor}" stroke-width="${espessura.toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    })
    .join("");

  if (!paths) return null;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx.toFixed(1)} ${vy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}" ` +
    `width="${Math.ceil(vw)}" height="${Math.ceil(vh)}">` +
    `<rect x="${vx.toFixed(1)}" y="${vy.toFixed(1)}" width="${vw.toFixed(1)}" height="${vh.toFixed(1)}" fill="#ffffff"/>` +
    paths +
    `</svg>`
  );
}

const pesCache = new Map<string, string | null>();

/**
 * Retorna uma data URL (SVG) com a visualização da matriz PES, ou null
 * quando o arquivo não pode ser decodificado. Resultado é cacheado.
 */
export function getPesPreview(dataUrl: string): string | null {
  if (pesCache.has(dataUrl)) return pesCache.get(dataUrl) ?? null;
  let resultado: string | null = null;
  try {
    const bytes = dataUrlToBytes(dataUrl);
    const design = bytes ? decodePes(bytes) : null;
    const svg = design ? renderPesSvg(design) : null;
    resultado = svg
      ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
      : null;
  } catch {
    resultado = null;
  }
  pesCache.set(dataUrl, resultado);
  return resultado;
}
