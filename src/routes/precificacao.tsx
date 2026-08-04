import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CircleDollarSign,
  Download,
  Landmark,
  Package,
  Printer,
  Save,
  ShieldAlert,
  Wallet,
} from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/toast";
import { useAuth } from "@/features/auth/useAuth";
import type { Produto } from "@/features/produtos/types";
import { useProdutos } from "@/features/produtos/useProdutos";
import {
  AplicarProdutoDialog,
  calcularPrecificacao,
  CampoValor,
  CenariosBloco,
  ENTRADA_PADRAO,
  exportarPdfCalculo,
  GraficoComposicao,
  HistoricoLista,
  imprimirCalculo,
  PainelResultado,
  parseNumero,
  usePrecificacaoHistorico,
  type PrecificacaoEntrada,
} from "@/features/precificacao";

export const Route = createFileRoute("/precificacao")({
  head: () => ({
    meta: [
      { title: "Formação de Preço — Stella" },
      {
        name: "description",
        content: "Calcule o preço de venda ideal dos produtos da Stella Espaço dos Uniformes.",
      },
    ],
  }),
  component: PrecificacaoPage,
});

type Campos = Record<keyof PrecificacaoEntrada, string>;

function paraCampos(e: PrecificacaoEntrada): Campos {
  return Object.fromEntries(
    Object.entries(e).map(([k, v]) => [k, v === 0 ? "" : String(v)]),
  ) as Campos;
}

function paraEntrada(c: Campos): PrecificacaoEntrada {
  return Object.fromEntries(
    Object.entries(c).map(([k, v]) => [k, k === "impostoModo" ? v : parseNumero(v)]),
  ) as unknown as PrecificacaoEntrada;
}

function PrecificacaoPage() {
  const { user, capacidades } = useAuth();
  const isAdmin = capacidades.configuracoes.admin;

  const [campos, setCampos] = useState<Campos>(() => paraCampos(ENTRADA_PADRAO));
  const [dialogAberto, setDialogAberto] = useState(false);

  const { historico, adicionar, remover } = usePrecificacaoHistorico();
  const { buscarPorId, atualizar } = useProdutos();

  const entrada = useMemo(() => paraEntrada(campos), [campos]);
  const resultado = useMemo(() => calcularPrecificacao(entrada), [entrada]);
  const adminNome = user?.nome ?? "Administrador";

  if (!isAdmin) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Card className="max-w-md shadow-[var(--shadow-soft)]">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary">
              <ShieldAlert className="h-6 w-6" />
            </span>
            <h1 className="font-display text-lg font-bold text-foreground">Acesso restrito</h1>
            <p className="text-sm text-muted-foreground">
              A Formação de Preço é exclusiva do perfil Administrador.
            </p>
            <Button asChild variant="outline" className="mt-2">
              <Link to="/">Voltar ao Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const setCampo = (campo: keyof Campos, valor: string) =>
    setCampos((prev) => ({ ...prev, [campo]: valor }));

  const salvarCalculo = () => {
    if (!resultado.valido) {
      toast.error("Preencha os custos antes de salvar o cálculo.");
      return;
    }
    adicionar({ adminNome, tipo: "calculo", entrada, resultado });
    toast.success("Cálculo salvo no histórico.");
  };

  const exportarPdf = () => {
    if (!resultado.valido) {
      toast.error("Preencha os custos antes de exportar.");
      return;
    }
    exportarPdfCalculo({ entrada, resultado, adminNome });
    toast.success("PDF exportado.");
  };

  const imprimir = () => {
    if (!resultado.valido) {
      toast.error("Preencha os custos antes de imprimir.");
      return;
    }
    imprimirCalculo({ entrada, resultado, adminNome });
  };

  const aplicarAoProduto = (produto: Produto) => {
    const atual = buscarPorId(produto.id);
    if (!atual) {
      toast.error("Produto não encontrado.");
      return;
    }
    const { id: _id, criadoEm: _c, atualizadoEm: _a, ...input } = atual;
    atualizar(atual.id, { ...input, precoBase: resultado.precoVenda });
    adicionar({
      adminNome,
      tipo: "aplicacao_produto",
      entrada,
      resultado,
      produtoAplicado: {
        id: atual.id,
        nome: atual.nome,
        precoAnterior: atual.precoBase,
      },
    });
    toast.success(`Preço de “${atual.nome}” atualizado com sucesso.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Formação de Preço"
        description="Calcule o preço de venda ideal considerando custos, taxas, impostos e lucro — e aplique direto no produto."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {/* Coluna esquerda — entradas */}
        <div className="space-y-6">
          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Landmark className="h-4 w-4 text-primary" />
                Informações Financeiras
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Percentuais que incidem sobre o preço de venda.
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <CampoValor
                label="Taxa de Cartão"
                tipo="percentual"
                valor={campos.taxaCartaoPct}
                onChange={(v: string) => setCampo("taxaCartaoPct", v)}
              />
              <CampoValor
                label="Impostos"
                tipo={campos.impostoModo === "percentual" ? "percentual" : "moeda"}
                valor={campos.impostos}
                onChange={(v: string) => setCampo("impostos", v)}
                onToggleTipo={() =>
                  setCampos((p) => ({
                    ...p,
                    impostoModo: p.impostoModo === "percentual" ? "valor" : "percentual",
                  }))
                }
              />
              <CampoValor
                label="Lucro Desejado"
                tipo="percentual"
                valor={campos.lucroPct}
                onChange={(v: string) => setCampo("lucroPct", v)}
              />
              <CampoValor
                label="Reinvestimento"
                tipo="percentual"
                valor={campos.reinvestimentoPct}
                onChange={(v: string) => setCampo("reinvestimentoPct", v)}
              />
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Wallet className="h-4 w-4 text-primary" />
                Custos
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Valores em reais que compõem o custo de produção da peça.
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <CampoValor
                label="Matéria-prima"
                tipo="moeda"
                valor={campos.materiaPrima}
                onChange={(v: string) => setCampo("materiaPrima", v)}
              />
              <CampoValor
                label="Tempo de Produção"
                tipo="tempo"
                valor={campos.tempoProducaoHoras}
                onChange={(v: string) => setCampo("tempoProducaoHoras", v)}
              />
              <CampoValor
                label="Custo da Mão de Obra"
                tipo="moeda"
                valor={campos.maoDeObra}
                onChange={(v: string) => setCampo("maoDeObra", v)}
              />
              <CampoValor
                label="Outros Custos"
                tipo="moeda"
                valor={campos.outrosCustos}
                onChange={(v: string) => setCampo("outrosCustos", v)}
              />
              <CampoValor
                label="Frete"
                tipo="moeda"
                valor={campos.frete}
                onChange={(v: string) => setCampo("frete", v)}
              />
              <CampoValor
                label="Despesas Extras"
                tipo="moeda"
                valor={campos.despesasExtras}
                onChange={(v: string) => setCampo("despesasExtras", v)}
              />
            </CardContent>
          </Card>

          <CenariosBloco
            valores={{
              lucroPct: campos.lucroPct,
              taxaCartaoPct: campos.taxaCartaoPct,
              impostos: campos.impostos,
            }}
            onAplicar={setCampo}
          />

          <HistoricoLista
            historico={historico}
            onRestaurar={(e: PrecificacaoEntrada) => {
              setCampos(paraCampos(e));
              toast.success("Valores restaurados do histórico.");
            }}
            onRemover={remover}
          />
        </div>

        {/* Coluna direita — resultado */}
        <div className="space-y-6">
          <PainelResultado resultado={resultado} />
          <GraficoComposicao entrada={entrada} resultado={resultado} />

          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <CircleDollarSign className="h-4 w-4 text-primary" />
                Ações
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={salvarCalculo}
              >
                <Save className="h-4 w-4" />
                Salvar Cálculo
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={exportarPdf}>
                <Download className="h-4 w-4" />
                Exportar PDF
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={imprimir}>
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 border-primary/40 text-primary hover:bg-primary-soft hover:text-primary"
                onClick={() => setDialogAberto(true)}
                disabled={!resultado.valido}
              >
                <Package className="h-4 w-4" />
                Aplicar ao Produto
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AplicarProdutoDialog
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        precoVenda={resultado.precoVenda}
        onConfirmar={aplicarAoProduto}
      />
    </div>
  );
}
