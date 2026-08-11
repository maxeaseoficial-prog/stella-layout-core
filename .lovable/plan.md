# Plano de Correção e Atualização do Catálogo de Produtos

O objetivo é remover produtos duplicados no catálogo mestre e adicionar os produtos "Infantis" e as tabelas especiais que foram solicitadas anteriormente, mas não foram persistidas corretamente no arquivo de sementes (seed).

## Detalhes Técnicos

1.  **Limpeza do Catálogo Mestre:** Revisar `src/features/produtos/data/produto-seed-new.ts` para remover entradas duplicadas e SKUs conflitantes.
2.  **Inclusão de Produtos Faltantes:** Adicionar os produtos "Infantis" e as variantes de Tabela B que foram descritas em mensagens anteriores (#395 e #399).
3.  **Normalização de SKUs:** Garantir que cada produto no catálogo mestre tenha um SKU único e padronizado.
4.  **Sincronização de Estado:** Após a atualização do arquivo, o usuário poderá clicar em "Sincronizar" no painel de produtos para aplicar as mudanças ao armazenamento local sem perder dados de pedidos existentes.

## Etapas de Implementação

1.  **Atualizar `src/features/produtos/data/produto-seed-new.ts`:**
    *   Remover duplicatas da linha "Cosmos" e "Estampada".
    *   Adicionar: Camiseta Curta Infantil, Camiseta Longa Infantil, Bermuda Masculina Infantil, Bermuda Leg Infantil, Calça Masculina Infantil, Calça Leg Infantil, Blusa de Moletom Infantil, Jaqueta Infantil.
    *   Adicionar: Calça Masculina — Tabela B, Bermuda Masculina — Tabela B, Short Saia, Bermuda Leg — Tabela B.
2.  **Verificar Vínculos Fiscais:** Garantir que os novos produtos infantis apontem para o NCM correto (6109.10.00 ou similar conforme o catálogo fiscal mestre).
3.  **Teste de Sincronismo:** Validar se o botão de sincronizar no frontend detecta os novos itens e ignora as duplicatas já existentes no localStorage.
