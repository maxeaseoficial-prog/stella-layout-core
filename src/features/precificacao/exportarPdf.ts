import { jsPDF } from "jspdf";

import { brl, pct } from "./calculos";
import type { PrecificacaoEntrada, PrecificacaoResultado } from "./types";

interface PdfContexto {
  entrada: PrecificacaoEntrada;
  resultado: PrecificacaoResultado;
  adminNome: string;
}

const ROSA: [number, number, number] = [226, 72, 106];
const CINZA: [number, number, number] = [110, 110, 120];
const TEXTO: [number, number, number] = [45, 45, 55];

function linhaRotuloValor(
  doc: jsPDF,
  rotulo: string,
  valor: string,
  y: number,
  opcoes?: { negrito?: boolean; cor?: [number, number, number] },
): number {
  doc.setFont("helvetica", opcoes?.negrito ? "bold" : "normal");
  doc.setFontSize(10);
  doc.setTextColor(...(opcoes?.cor ?? TEXTO));
  doc.text(rotulo, 20, y);
  doc.text(valor, 190, y, { align: "right" });
  return y + 6.5;
}

function tituloSessao(doc: jsPDF, texto: string, y: number): number {
  doc.setFillColor(...ROSA);
  doc.roundedRect(20, y - 4.5, 3, 5.5, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...TEXTO);
  doc.text(texto, 26, y);
  return y + 7;
}

function gerarPdf({ entrada: e, resultado: r, adminNome }: PdfContexto): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const agora = new Date();

  // Cabeçalho
  doc.setFillColor(...ROSA);
  doc.rect(0, 0, 210, 26, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text("Stella — Espaço dos Uniformes", 20, 11);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Formação de Preço", 20, 18);
  doc.setFontSize(9);
  doc.text(agora.toLocaleString("pt-BR"), 190, 11, { align: "right" });
  doc.text(adminNome, 190, 18, { align: "right" });

  let y = 38;

  // Informações financeiras
  y = tituloSessao(doc, "Informações Financeiras", y);
  y = linhaRotuloValor(doc, "Taxa de Cartão", e.taxaCartaoModo === "percentual" ? pct(e.taxaCartaoPct) : brl(e.taxaCartaoPct), y);
  y = linhaRotuloValor(doc, "Impostos", e.impostoModo === "percentual" ? pct(e.impostos) : brl(e.impostos), y);
  y = linhaRotuloValor(doc, "Lucro Desejado", e.lucroModo === "percentual" ? pct(e.lucroPct) : brl(e.lucroPct), y);
  y = linhaRotuloValor(doc, "Reinvestimento", e.reinvestimentoModo === "percentual" ? pct(e.reinvestimentoPct) : brl(e.reinvestimentoPct), y);
  y += 5;

  // Custos
  y = tituloSessao(doc, "Custos", y);
  y = linhaRotuloValor(doc, "Matéria-prima", brl(e.materiaPrima), y);
  y = linhaRotuloValor(doc, "Tempo de Produção", `${e.tempoProducaoHoras}h`, y);
  y = linhaRotuloValor(doc, "Custo da Mão de Obra", brl(e.maoDeObra), y);
  y = linhaRotuloValor(doc, "Outros Custos", brl(e.outrosCustos), y);
  y = linhaRotuloValor(doc, "Frete", brl(e.frete), y);
  y = linhaRotuloValor(doc, "Despesas Extras", brl(e.despesasExtras), y);
  y = linhaRotuloValor(doc, "Custo de Produção Total", brl(r.custoProducao), y, {
    negrito: true,
  });
  y += 5;

  // Resultado (DRE simplificado)
  y = tituloSessao(doc, "Resultado Financeiro", y);
  doc.setDrawColor(230, 230, 235);
  doc.setFillColor(252, 240, 244);
  doc.roundedRect(16, y - 5, 178, 12, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...ROSA);
  doc.text("Preço de Venda Sugerido", 20, y + 2.5);
  doc.text(brl(r.precoVenda), 190, y + 2.5, { align: "right" });
  y += 14;

  y = linhaRotuloValor(doc, "(-) Impostos", brl(r.valorImpostos), y, { cor: CINZA });
  y = linhaRotuloValor(doc, "(-) Taxa Cartão", brl(r.valorTaxaCartao), y, { cor: CINZA });
  y = linhaRotuloValor(doc, "(-) Custo Produção", brl(r.custoProducao), y, { cor: CINZA });
  doc.setDrawColor(200, 200, 210);
  doc.line(20, y - 3.5, 190, y - 3.5);
  y = linhaRotuloValor(doc, "Sobra", brl(r.sobra), y, { negrito: true });
  y = linhaRotuloValor(doc, "Lucro", brl(r.valorLucro), y);
  y = linhaRotuloValor(doc, "Reinvestimento", brl(r.valorReinvestimento), y);
  y += 5;

  // Indicadores
  y = tituloSessao(doc, "Indicadores", y);
  y = linhaRotuloValor(doc, "Margem Líquida", pct(r.margemLiquidaPct), y);
  y = linhaRotuloValor(doc, "Lucro sobre o Preço", pct(r.lucroSobrePrecoPct), y);
  linhaRotuloValor(doc, "Markup Aplicado", `${r.markup.toFixed(2)}x`, y);

  // Rodapé
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...CINZA);
  doc.text(
    "Documento gerado automaticamente pelo sistema Stella — Formação de Preço.",
    105,
    290,
    { align: "center" },
  );

  return doc;
}

export function exportarPdfCalculo(ctx: PdfContexto): void {
  gerarPdf(ctx).save(`formacao-de-preco-${Date.now()}.pdf`);
}

export function imprimirCalculo(ctx: PdfContexto): void {
  const doc = gerarPdf(ctx);
  doc.autoPrint();
  const url = doc.output("bloburl");
  window.open(url, "_blank");
}
