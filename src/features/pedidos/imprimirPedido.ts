import type { Cliente } from "@/features/clientes";
import { getClienteNome } from "@/features/clientes";

import type { Pedido } from "./types";
import {
  LABEL_POSICAO_PERSONALIZACAO,
  LABEL_STATUS_FINANCEIRO,
  LABEL_STATUS_PRODUCAO,
  LABEL_TIPO_PERSONALIZACAO,
} from "./types";
import {
  calcularSubtotalItem,
  formatarDataBR,
  formatarDataHoraBR,
  formatarMoeda,
} from "./utils";

function esc(s: string | undefined | null): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function imprimirPedido(pedido: Pedido, cliente?: Cliente | null) {
  if (typeof window === "undefined") return;
  const w = window.open("", "_blank", "width=900,height=1000");
  if (!w) return;

  const clienteNome = cliente ? esc(getClienteNome(cliente)) : "—";
  const clienteTel = cliente ? esc(cliente.telefone) : "";
  const clienteExtra =
    cliente && cliente.tipo === "empresa"
      ? `<div><strong>Responsável:</strong> ${esc(cliente.responsavel)}</div>`
      : "";

  const itensHtml = pedido.itens
    .map(
      (i) => `
      <tr>
        <td>
          <div class="produto">${esc(i.produto)}</div>
          ${
            i.personalizacoes.length
              ? `<ul class="pers">${i.personalizacoes
                  .map(
                    (p) => `
                <li>
                  <strong>${esc(LABEL_TIPO_PERSONALIZACAO[p.tipo])}</strong> •
                  ${esc(LABEL_POSICAO_PERSONALIZACAO[p.posicao])}
                  ${p.medidas ? `• ${esc(p.medidas)}` : ""}
                  ${p.observacoes ? `<div class="obs">${esc(p.observacoes)}</div>` : ""}
                </li>`,
                  )
                  .join("")}</ul>`
              : ""
          }
        </td>
        <td class="c">${i.quantidade}</td>
        <td class="r">${esc(formatarMoeda(i.valorUnitario))}</td>
        <td class="r">${esc(formatarMoeda(calcularSubtotalItem(i)))}</td>
      </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8" />
<title>${esc(pedido.numero)} — Stella Espaço dos Uniformes</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Plus Jakarta Sans', -apple-system, Segoe UI, Roboto, sans-serif; color: #1a1a1a; margin: 0; padding: 32px; background: #fff; }
  h1 { font-size: 22px; margin: 0; }
  h2 { font-size: 14px; text-transform: uppercase; letter-spacing: .04em; color: #6b6b6b; margin: 24px 0 8px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #ec4899; padding-bottom: 16px; }
  .brand { color: #ec4899; font-weight: 700; }
  .meta { text-align: right; font-size: 12px; color: #555; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; font-size: 13px; }
  .card { border: 1px solid #e5e5e5; border-radius: 10px; padding: 12px 14px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12.5px; }
  th, td { padding: 8px 10px; border-bottom: 1px solid #eee; vertical-align: top; text-align: left; }
  th { background: #f7f7f7; text-transform: uppercase; font-size: 11px; letter-spacing: .04em; }
  td.c { text-align: center; }
  td.r, th.r { text-align: right; white-space: nowrap; }
  .produto { font-weight: 600; }
  .pers { margin: 6px 0 0; padding-left: 16px; font-size: 12px; color: #444; }
  .pers .obs { color: #666; font-style: italic; }
  .totais { margin-left: auto; margin-top: 12px; width: 260px; font-size: 13px; }
  .totais .row { display: flex; justify-content: space-between; padding: 4px 0; }
  .totais .total { border-top: 2px solid #ec4899; margin-top: 6px; padding-top: 8px; font-weight: 700; font-size: 16px; color: #ec4899; }
  .status { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; background: #f3f3f3; }
  .obs-box { border: 1px dashed #bbb; padding: 10px 12px; border-radius: 8px; font-size: 12.5px; color: #333; white-space: pre-wrap; }
  .assinaturas { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 64px; }
  .assinaturas .linha { border-top: 1px solid #333; padding-top: 6px; text-align: center; font-size: 12px; color: #555; }
  @media print { body { padding: 16mm; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1><span class="brand">Stella</span> Espaço dos Uniformes</h1>
      <div style="font-size:12px;color:#666;margin-top:4px">Pedido de produção</div>
    </div>
    <div class="meta">
      <div><strong>Pedido:</strong> ${esc(pedido.numero)}</div>
      <div><strong>Data:</strong> ${esc(formatarDataHoraBR(pedido.criadoEm))}</div>
      ${
        pedido.previsaoEntrega
          ? `<div><strong>Previsão:</strong> ${esc(formatarDataBR(pedido.previsaoEntrega))}</div>`
          : ""
      }
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <h2 style="margin-top:0">Cliente</h2>
      <div><strong>${clienteNome}</strong></div>
      ${clienteTel ? `<div>${clienteTel}</div>` : ""}
      ${clienteExtra}
    </div>
    <div class="card">
      <h2 style="margin-top:0">Status</h2>
      <div>Produção: <span class="status">${esc(LABEL_STATUS_PRODUCAO[pedido.statusProducao])}</span></div>
      <div style="margin-top:6px">Financeiro: <span class="status">${esc(LABEL_STATUS_FINANCEIRO[pedido.statusFinanceiro])}</span></div>
    </div>
  </div>

  <h2>Produtos</h2>
  <table>
    <thead>
      <tr>
        <th>Produto / personalizações</th>
        <th class="c">Qtd</th>
        <th class="r">Valor unit.</th>
        <th class="r">Subtotal</th>
      </tr>
    </thead>
    <tbody>${itensHtml}</tbody>
  </table>

  <div class="totais">
    <div class="row"><span>Subtotal</span><span>${esc(formatarMoeda(pedido.subtotal))}</span></div>
    <div class="row"><span>Desconto</span><span>− ${esc(formatarMoeda(pedido.desconto))}</span></div>
    <div class="row"><span>Frete</span><span>+ ${esc(formatarMoeda(pedido.frete))}</span></div>
    <div class="row total"><span>Total</span><span>${esc(formatarMoeda(pedido.total))}</span></div>
    <div class="row"><span>Recebido</span><span>${esc(formatarMoeda(pedido.totalPago))}</span></div>
    <div class="row"><span>Restante</span><span>${esc(formatarMoeda(Math.max(0, pedido.total - pedido.totalPago)))}</span></div>
  </div>

  ${
    pedido.observacoes
      ? `<h2>Observações</h2><div class="obs-box">${esc(pedido.observacoes)}</div>`
      : ""
  }

  <div class="assinaturas">
    <div class="linha">Cliente</div>
    <div class="linha">Stella Espaço dos Uniformes</div>
  </div>

  <script>
    window.onload = function() { setTimeout(function(){ window.print(); }, 250); };
  </script>
</body>
</html>`;

  w.document.open();
  w.document.write(html);
  w.document.close();
}
