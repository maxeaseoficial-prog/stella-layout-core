import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import type { Cliente } from "@/features/clientes";
import { getClienteNome } from "@/features/clientes";
import type { DadosEmpresa } from "@/features/configuracoes/types";
import { usuarioAtual } from "@/features/auth/useAuth";

import type { ItemPedido, Pedido } from "./types";
import {
  LABEL_POSICAO_PERSONALIZACAO,
  LABEL_STATUS_PRODUCAO,
  LABEL_TIPO_PERSONALIZACAO,
} from "./types";
import { formatarDataBR } from "./utils";

const ROSA: [number, number, number] = [236, 72, 153];
const CINZA: [number, number, number] = [90, 90, 90];
const PRETO: [number, number, number] = [20, 20, 20];

export interface OrdemProducaoPDFResult {
  blob: Blob;
  dataUrl: string;
  nomeArquivo: string;
}

function personalizacoesDoItem(item: ItemPedido): string[] {
  const linhas: string[] = [];
  for (const p of item.personalizacoes ?? []) {
    const parte = `${LABEL_TIPO_PERSONALIZACAO[p.tipo]} — ${LABEL_POSICAO_PERSONALIZACAO[p.posicao]}`;
    const medida = p.medidas ? ` (${p.medidas})` : "";
    linhas.push(`${parte}${medida}`);
    if (p.observacoes) linhas.push(`   ↳ ${p.observacoes}`);
  }
  for (const a of item.adicionais ?? []) {
    linhas.push(a.nome);
  }
  return linhas;
}

export async function gerarOrdemProducaoPDF(
  pedido: Pedido,
  cliente: Cliente | null | undefined,
  empresa: DadosEmpresa,
): Promise<OrdemProducaoPDFResult> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const larg = doc.internal.pageSize.getWidth();
  const margem = 40;
  let y = margem;

  // Logo centralizada
  if (empresa.logo) {
    try {
      const propsImg = doc.getImageProperties(empresa.logo);
      const alturaLogo = 56;
      const larguraLogo = (propsImg.width / propsImg.height) * alturaLogo;
      doc.addImage(
        empresa.logo,
        "PNG",
        (larg - larguraLogo) / 2,
        y,
        larguraLogo,
        alturaLogo,
      );
      y += alturaLogo + 10;
    } catch {
      /* ignora logo inválida */
    }
  }

  // Título grande
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...ROSA);
  doc.text("ORDEM DE PRODUÇÃO", larg / 2, y + 16, { align: "center" });
  y += 30;

  doc.setDrawColor(...ROSA);
  doc.setLineWidth(1.4);
  doc.line(margem, y, larg - margem, y);
  y += 18;

  // Cabeçalho — infos do pedido
  const emissao = new Date().toLocaleString("pt-BR");
  const responsavelPedido = usuarioAtual()?.nome ?? "—";
  const nomeCliente = cliente ? getClienteNome(cliente) : "—";
  const empresaCliente =
    cliente && cliente.tipo === "empresa" ? cliente.nomeEmpresa : "—";

  doc.setFontSize(11);
  doc.setTextColor(...PRETO);

  const colEsq = margem;
  const colDir = larg / 2 + 10;

  function linhaInfo(coluna: number, label: string, valor: string, cursorY: number) {
    doc.setFont("helvetica", "bold");
    const labelTxt = `${label}:`;
    doc.text(labelTxt, coluna, cursorY);
    doc.setFont("helvetica", "normal");
    const larguraLabel = doc.getTextWidth(labelTxt) + 4;
    doc.text(valor, coluna + larguraLabel, cursorY);
  }

  linhaInfo(colEsq, "Pedido", pedido.numero, y);
  linhaInfo(colDir, "Data", emissao, y);
  y += 16;
  linhaInfo(colEsq, "Cliente", nomeCliente, y);
  linhaInfo(colDir, "Empresa", empresaCliente, y);
  y += 16;
  linhaInfo(colEsq, "Responsável", responsavelPedido, y);
  linhaInfo(
    colDir,
    "Previsão de entrega",
    pedido.previsaoEntrega ? formatarDataBR(pedido.previsaoEntrega) : "—",
    y,
  );
  y += 16;
  linhaInfo(colEsq, "Status", LABEL_STATUS_PRODUCAO[pedido.statusProducao], y);
  y += 22;

  doc.setDrawColor(220);
  doc.setLineWidth(0.6);
  doc.line(margem, y, larg - margem, y);
  y += 16;

  // Seção: Produtos
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...ROSA);
  doc.text("Produtos", margem, y);
  y += 14;

  const EXT_IMG_RASTER = ["png", "jpg", "jpeg", "webp"];

  function formatoJsPDF(ext: string): "PNG" | "JPEG" | "WEBP" | null {
    const e = ext.toLowerCase();
    if (e === "png") return "PNG";
    if (e === "jpg" || e === "jpeg") return "JPEG";
    if (e === "webp") return "WEBP";
    return null;
  }

  async function dimensoesImagem(dataUrl: string): Promise<{ w: number; h: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
      img.onerror = () => resolve({ w: 1, h: 1 });
      img.src = dataUrl;
    });
  }

  for (const item of pedido.itens) {
    const personalizacoes = personalizacoesDoItem(item);
    const arquivos = pedido.arquivos;
    const imagens = arquivos.filter((a) => EXT_IMG_RASTER.includes(a.extensao.toLowerCase()));
    const vetoriais = arquivos.filter((a) => !EXT_IMG_RASTER.includes(a.extensao.toLowerCase()));

    // Estimar altura do bloco para quebra de página
    const alturaImg = imagens.length > 0 ? 200 : 0;
    const alturaEstim =
      60 +
      alturaImg +
      (personalizacoes.length ? 20 + personalizacoes.length * 16 : 0) +
      (vetoriais.length ? 20 + vetoriais.length * 16 : 0);
    if (y + alturaEstim > 760) {
      doc.addPage();
      y = margem;
    }

    // Card do produto
    autoTable(doc, {
      startY: y,
      margin: { left: margem, right: margem },
      body: [
        [
          {
            content: item.produto,
            styles: {
              fontStyle: "bold",
              fontSize: 13,
              textColor: PRETO,
              fillColor: [253, 242, 248],
            },
          },
          {
            content: `Qtd: ${item.quantidade}`,
            styles: {
              halign: "right",
              fontStyle: "bold",
              fontSize: 12,
              textColor: ROSA,
              fillColor: [253, 242, 248],
            },
          },
        ],
      ],
      theme: "grid",
      styles: {
        cellPadding: 8,
        lineColor: [230, 230, 230],
      },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 120 },
      },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

    // Imagens (logo / arte) — pré-visualização
    if (imagens.length > 0) {
      y += 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...CINZA);
      doc.text("Logo / Arte", margem, y);
      y += 10;

      const maxLarg = larg - margem * 2;
      const alturaMaxima = 180;
      let cursorX = margem;
      let alturaLinha = 0;

      for (const arq of imagens) {
        const fmt = formatoJsPDF(arq.extensao);
        if (!fmt) continue;
        try {
          const { w, h } = await dimensoesImagem(arq.dataUrl);
          const ratio = w / h;
          let renderH = alturaMaxima;
          let renderW = renderH * ratio;
          const maxW = Math.min(260, maxLarg);
          if (renderW > maxW) {
            renderW = maxW;
            renderH = renderW / ratio;
          }
          if (cursorX + renderW > margem + maxLarg) {
            y += alturaLinha + 8;
            cursorX = margem;
            alturaLinha = 0;
            if (y + renderH > 760) {
              doc.addPage();
              y = margem;
            }
          }
          doc.addImage(arq.dataUrl, fmt, cursorX, y, renderW, renderH, undefined, "SLOW");
          cursorX += renderW + 10;
          alturaLinha = Math.max(alturaLinha, renderH);
        } catch {
          /* ignora imagem inválida */
        }
      }
      y += alturaLinha + 8;
    }

    // Personalizações / adicionais
    if (personalizacoes.length > 0) {
      autoTable(doc, {
        startY: y,
        margin: { left: margem, right: margem },
        head: [["Personalizações / Adicionais"]],
        body: personalizacoes.map((l) => [l]),
        theme: "grid",
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: CINZA,
          fontStyle: "bold",
          fontSize: 10,
          lineColor: [230, 230, 230],
        },
        styles: {
          fontSize: 11,
          cellPadding: 6,
          textColor: PRETO,
          lineColor: [235, 235, 235],
        },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    }

    // Arquivos vetoriais / não-visualizáveis
    if (vetoriais.length > 0) {
      autoTable(doc, {
        startY: y,
        margin: { left: margem, right: margem },
        head: [["Arquivo", "Tipo"]],
        body: vetoriais.map((a) => [
          a.nome,
          `Arquivo ${a.extensao.toUpperCase()} (vetorial — abrir no software gráfico)`,
        ]),
        theme: "grid",
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: CINZA,
          fontStyle: "bold",
          fontSize: 10,
          lineColor: [230, 230, 230],
        },
        styles: {
          fontSize: 11,
          cellPadding: 6,
          textColor: PRETO,
          lineColor: [235, 235, 235],
        },
        columnStyles: {
          0: { cellWidth: "auto", fontStyle: "bold" },
          1: { cellWidth: 240, textColor: CINZA },
        },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    }


    // Divisória entre produtos
    y += 14;
    doc.setDrawColor(240);
    doc.setLineWidth(0.6);
    doc.line(margem, y, larg - margem, y);
    y += 14;
  }

  // Observações gerais
  if (pedido.observacoes) {
    if (y + 80 > 760) {
      doc.addPage();
      y = margem;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...ROSA);
    doc.text("Observações Gerais", margem, y);
    y += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...PRETO);
    const textos = doc.splitTextToSize(pedido.observacoes, larg - margem * 2);
    doc.text(textos, margem, y);
    y += textos.length * 14 + 8;
  }

  // Rodapé em todas as páginas — sem valores
  const nomeEmpresa =
    empresa.nomeFantasia || empresa.nome || "Stella Espaço dos Uniformes";
  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    const alturaPag = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...ROSA);
    doc.setLineWidth(0.8);
    doc.line(margem, alturaPag - 40, larg - margem, alturaPag - 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...ROSA);
    doc.text(nomeEmpresa, margem, alturaPag - 24);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...CINZA);
    doc.text(
      `Página ${i} de ${totalPaginas}`,
      larg - margem,
      alturaPag - 24,
      { align: "right" },
    );
  }

  const blob = doc.output("blob");
  const dataUrl = doc.output("datauristring");
  const nomeArquivo = `OrdemProducao-${pedido.numero}.pdf`;
  return { blob, dataUrl, nomeArquivo };
}

/** Abre a visualização de impressão do PDF em uma nova aba. */
export function abrirImpressaoPDF(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const janela = window.open(url, "_blank", "noopener,noreferrer");
  if (janela) {
    janela.addEventListener("load", () => {
      try {
        janela.focus();
        janela.print();
      } catch {
        /* alguns navegadores bloqueiam o print automático */
      }
    });
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
