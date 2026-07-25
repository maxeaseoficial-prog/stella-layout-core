import {
  FileArchive,
  FileCode2,
  FileImage,
  FileText,
  FileType2,
  Layers,
  type LucideIcon,
} from "lucide-react";

import {
  isImagem,
  LABEL_TIPO_APLICACAO,
  LABEL_TIPO_ARQUIVO,
  labelPosicao,
  type Arquivo,
} from "./types";

export function iconePorExtensao(ext: string): LucideIcon {
  const e = ext.toLowerCase();
  if (isImagem(e)) return FileImage;
  if (e === "pdf") return FileText;
  if (["dst", "pes", "emb"].includes(e)) return Layers;
  if (["ai", "cdr", "svg"].includes(e)) return FileCode2;
  if (["zip", "rar"].includes(e)) return FileArchive;
  return FileType2;
}

export function extensaoDoNome(nome: string): string {
  return (nome.split(".").pop() ?? "").toLowerCase();
}

/**
 * Formata as informações cadastradas de uma Matriz/Logo em um bloco de texto
 * pronto para ser copiado às observações do produto no pedido.
 */
export function arquivoParaObservacoes(a: Arquivo): string {
  const linhas: string[] = [];
  linhas.push(`▸ ${a.nome}`);
  linhas.push(`  • Tipo: ${LABEL_TIPO_ARQUIVO[a.tipo]}`);
  if (a.tipoAplicacao) {
    linhas.push(`  • Aplicação: ${LABEL_TIPO_APLICACAO[a.tipoAplicacao]}`);
  }
  if (a.posicaoAplicacao) {
    linhas.push(`  • Posição: ${labelPosicao(a.posicaoAplicacao)}`);
  }
  if (a.descricaoAplicacao) {
    linhas.push(`  • Descrição da aplicação: ${a.descricaoAplicacao}`);
  }
  if (a.larguraCm || a.alturaCm) {
    const l = a.larguraCm != null ? `${a.larguraCm}` : "?";
    const h = a.alturaCm != null ? `${a.alturaCm}` : "?";
    linhas.push(`  • Tamanho: ${l} x ${h} cm`);
  }
  const cores = (a.cores ?? []).filter((c) => c.nome || c.numero);
  if (cores.length > 0) {
    linhas.push(`  • Quantidade de cores: ${cores.length}`);
    const detalhe = cores
      .map((c) => {
        const nome = c.nome?.trim() || "—";
        const num = c.numero?.trim();
        return num ? `${nome} (${num})` : nome;
      })
      .join(", ");
    linhas.push(`  • Cores: ${detalhe}`);
  }
  if (a.descricao) {
    linhas.push(`  • Observações: ${a.descricao}`);
  }
  if (a.valor != null && a.valor > 0) {
    linhas.push(
      `  • Valor: ${a.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
    );
  }
  return linhas.join("\n");
}

