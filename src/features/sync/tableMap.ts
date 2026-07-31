/**
 * Mapeia cada chave de localStorage do app a uma tabela no Supabase.
 * A camada de sync (tenantSync.ts) usa esse mapa para:
 *  - baixar dados remotos → gravar em localStorage
 *  - interceptar setItem local → refletir upserts/deletes no Supabase
 *  - reagir a mudanças em tempo real via Postgres Changes
 */

export type SyncKind = "collection" | "singleton";

export interface CollectionDescriptor {
  key: string;                 // localStorage key
  table: string;               // Supabase table (public.<table>)
  kind: SyncKind;              // "collection": array com {id}; "singleton": objeto único
  events: string[];            // custom events a disparar após atualizar localStorage
}

export const COLLECTIONS: CollectionDescriptor[] = [
  { key: "stella.clientes.v1",              table: "clientes",              kind: "collection", events: ["stella:clientes:updated"] },
  { key: "stella.produtos.v1",              table: "produtos",              kind: "collection", events: ["stella:produtos:updated"] },
  { key: "stella.adicionais.v1",            table: "adicionais",            kind: "collection", events: ["stella:adicionais:updated"] },
  { key: "stella.fornecedores.v1",          table: "fornecedores",          kind: "collection", events: ["stella:fornecedores:updated"] },
  { key: "stella.arquivos.v1",              table: "arquivos",              kind: "collection", events: ["stella:arquivos:updated"] },
  { key: "stella.pedidos.v1",               table: "pedidos",               kind: "collection", events: ["stella:pedidos:updated"] },
  { key: "stella.caixa.movimentacoes.v1",   table: "caixa_movimentacoes",   kind: "collection", events: ["stella:caixa:updated"] },
  { key: "stella.caixa.fechamentos.v1",     table: "caixa_fechamentos",     kind: "collection", events: ["stella:caixa:updated"] },
  { key: "stella.estoque.itens.v1",         table: "itens_estoque",         kind: "collection", events: ["stella:estoque:updated"] },
  { key: "stella.estoque.movimentacoes.v1", table: "movimentacoes_estoque", kind: "collection", events: ["stella:estoque:updated"] },
  { key: "stella.configuracoes.v1",         table: "configuracoes",         kind: "singleton",  events: ["stella:configuracoes:updated"] },
  { key: "stella.precificacao.historico.v1", table: "precificacao_historico", kind: "collection", events: ["stella:precificacao:updated"] },
];

export function byKey(key: string): CollectionDescriptor | undefined {
  return COLLECTIONS.find((c) => c.key === key);
}
