import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import type { Cliente } from "@/features/clientes";
import { getClienteNome } from "@/features/clientes";
import type { DadosEmpresa } from "@/features/configuracoes/types";

import type { ItemAdicional, Pedido } from "./types";
import { LABEL_STATUS_PRODUCAO } from "./types";
import {
  calcularSubtotalItem,
  formatarDataBR,
  formatarMoeda,
} from "./utils";

const ROSA: [number, number, number] = [236, 72, 153];
const CINZA: [number, number, number] = [90, 90, 90];

function somenteDigitos(s: string | undefined | null): string {
  return (s ?? "").replace(/\D/g, "");
}

/** Normaliza um telefone BR para o formato aceito pelo wa.me (com DDI 55). */
export function telefoneParaWhatsapp(telefone: string): string {
  const d = somenteDigitos(telefone);
  if (!d) return "";
  if (d.startsWith("55")) return d;
  return `55${d}`;
}

function subtotalAdicional(a: ItemAdicional): number {
  return a.pendencia ? 0 : a.valor || 0;
}

export interface OrcamentoPDFResult {
  blob: Blob;
  dataUrl: string;
  nomeArquivo: string;
}

export async function gerarOrcamentoPDF(
  pedido: Pedido,
  cliente: Cliente | null | undefined,
  empresa: DadosEmpresa,
): Promise<OrcamentoPDFResult> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const larg = doc.internal.pageSize.getWidth();
  const margem = 40;
  let y = margem;

  // Logo (opcional) — centralizado
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
      y += alturaLogo + 8;
    } catch {
      /* ignora logo inválida */
    }
  }

  // Nome da empresa
  const nomeEmpresa = empresa.nomeFantasia || empresa.nome || "Stella Espaço dos Uniformes";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...ROSA);
  doc.text(nomeEmpresa, larg / 2, y + 14, { align: "center" });
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...CINZA);
  doc.text("Orçamento", larg / 2, y + 10, { align: "center" });
  y += 22;

  // Linha rosa
  doc.setDrawColor(...ROSA);
  doc.setLineWidth(1.2);
  doc.line(margem, y, larg - margem, y);
  y += 14;

  // Meta (pedido / data / status) — duas colunas
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  const emissao = new Date().toLocaleString("pt-BR");
  doc.setFont("helvetica", "bold");
  doc.text("Pedido:", margem, y);
  doc.setFont("helvetica", "normal");
  doc.text(pedido.numero, margem + 50, y);
  doc.setFont("helvetica", "bold");
  doc.text("Emissão:", larg / 2, y);
  doc.setFont("helvetica", "normal");
  doc.text(emissao, larg / 2 + 55, y);
  y += 14;
  doc.setFont("helvetica", "bold");
  doc.text("Status:", margem, y);
  doc.setFont("helvetica", "normal");
  doc.text(LABEL_STATUS_PRODUCAO[pedido.statusProducao], margem + 50, y);
  y += 20;

  // Dados do cliente
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...ROSA);
  doc.text("Dados do cliente", margem, y);
  y += 12;
  doc.setDrawColor(230);
  doc.line(margem, y, larg - margem, y);
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  if (cliente) {
    const linhas: string[] = [];
    linhas.push(`Nome: ${getClienteNome(cliente)}`);
    if (cliente.tipo === "empresa") {
      linhas.push(`Empresa: ${cliente.nomeEmpresa}`);
      linhas.push(`Responsável: ${cliente.responsavel}`);
    }
    linhas.push(`Telefone / WhatsApp: ${cliente.telefone || "—"}`);
    if (cliente.email) linhas.push(`E-mail: ${cliente.email}`);
    linhas.forEach((l) => {
      doc.text(l, margem, y);
      y += 13;
    });
  } else {
    doc.text("Cliente não informado.", margem, y);
    y += 13;
  }
  y += 8;

  // Produtos
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...ROSA);
  doc.text("Produtos", margem, y);
  y += 10;

  for (const item of pedido.itens) {
    if (y > 720) {
      doc.addPage();
      y = margem;
    }
    const subtotalItem = calcularSubtotalItem(item);
    const valorBase = item.valorUnitario * item.quantidade;

    const linhas: Array<[string, string]> = [];
    linhas.push([
      `Produto — ${item.produto} (Qtd: ${item.quantidade})`,
      formatarMoeda(valorBase),
    ]);
    for (const ad of item.adicionais ?? []) {
      const rotulo = ad.pendencia
        ? `+ ${ad.nome} — pendente de orçamento`
        : ad.unico
          ? `+ ${ad.nome} (valor único)`
          : `+ ${ad.nome}`;
      const valorLinha = ad.pendencia
        ? 0
        : ad.unico
          ? ad.valor || 0
          : subtotalAdicional(ad) * item.quantidade;
      linhas.push([
        rotulo,
        ad.pendencia ? "—" : formatarMoeda(valorLinha),
      ]);
    }
    linhas.push(["Subtotal do produto", formatarMoeda(subtotalItem)]);

    autoTable(doc, {
      startY: y,
      margin: { left: margem, right: margem },
      body: linhas,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 6,
        lineColor: [230, 230, 230],
        textColor: [30, 30, 30],
      },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 110, halign: "right" },
      },
      didParseCell: (data) => {
        if (data.row.index === 0) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [253, 242, 248];
        }
        if (data.row.index === linhas.length - 1) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.textColor = ROSA;
        }
      },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  if (y > 680) {
    doc.addPage();
    y = margem;
  }

  // Resumo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...ROSA);
  doc.text("Resumo", margem, y);
  y += 10;

  autoTable(doc, {
    startY: y,
    margin: { left: larg / 2, right: margem },
    body: [
      ["Subtotal", formatarMoeda(pedido.subtotal)],
      ["Descontos", `- ${formatarMoeda(pedido.desconto)}`],
      ["Frete", `+ ${formatarMoeda(pedido.frete)}`],
      ["Valor total", formatarMoeda(pedido.total)],
    ],
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: "right", cellWidth: 110 },
    },
    didParseCell: (data) => {
      if (data.row.index === 3) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = ROSA;
        data.cell.styles.fontSize = 13;
      }
    },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 16;

  if (pedido.previsaoEntrega) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...CINZA);
    doc.text(
      `Previsão de entrega: ${formatarDataBR(pedido.previsaoEntrega)}`,
      margem,
      y,
    );
    y += 16;
  }

  if (pedido.observacoes) {
    if (y > 720) {
      doc.addPage();
      y = margem;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...ROSA);
    doc.text("Observações", margem, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    const textos = doc.splitTextToSize(pedido.observacoes, larg - margem * 2);
    doc.text(textos, margem, y);
    y += textos.length * 12 + 8;
  }

  // Rodapé em todas as páginas
  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    const alturaPag = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...ROSA);
    doc.setLineWidth(0.8);
    doc.line(margem, alturaPag - 56, larg - margem, alturaPag - 56);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...ROSA);
    doc.text(nomeEmpresa, larg / 2, alturaPag - 42, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...CINZA);
    const contato: string[] = [];
    if (empresa.telefone || empresa.whatsapp)
      contato.push(`Tel: ${empresa.telefone || empresa.whatsapp}`);
    if (empresa.email) contato.push(empresa.email);
    if (empresa.site) contato.push(empresa.site);
    if (contato.length) {
      doc.text(contato.join("  •  "), larg / 2, alturaPag - 28, {
        align: "center",
      });
    }
    doc.text(
      `Página ${i} de ${totalPaginas}`,
      larg - margem,
      alturaPag - 14,
      { align: "right" },
    );
  }

  const blob = doc.output("blob");
  const dataUrl = doc.output("datauristring");
  const nomeArquivo = `Orcamento-${pedido.numero}.pdf`;
  return { blob, dataUrl, nomeArquivo };
}

/** Baixa o PDF no navegador do operador. */
export function baixarPDF(blob: Blob, nomeArquivo: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function mensagemPadraoOrcamento(
  pedido: Pedido,
  cliente: Cliente | null | undefined,
): string {
  const nome = cliente ? getClienteNome(cliente).split(" ")[0] : "cliente";
  return [
    `Olá, ${nome}!`,
    "",
    "Segue o orçamento do seu pedido.",
    "",
    "Qualquer dúvida, estamos à disposição.",
  ].join("\n");
}

/** Abre o WhatsApp (wa.me) já preparado para envio ao cliente. */
export function abrirWhatsApp(numero: string, mensagem: string) {
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
