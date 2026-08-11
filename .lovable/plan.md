# Plano de Refatoração: NF-e Avulsa (Tela Única)

Refatoração completa da interface de emissão de NF-e Avulsa para eliminar o sistema de "wizard" por etapas e consolidar tudo em uma única janela (Dialog/Drawer) de grande formato, garantindo a persistência absoluta da Classificação Fiscal.

## Alterações Propostas

### 1. Interface (UI/UX)
- **Eliminação do Wizard**: Remoção dos estados `step`, `nextStep`, `prevStep` e da navegação por etapas.
- **Tela Única (Single View)**: Implementação de um `Drawer` ou `Dialog` ocupando 90-95% da tela.
- **Estrutura de Seções**:
    - **Destinatário**: Seleção de cliente e exibição de dados de endereço/documento.
    - **Itens da Nota**: Tabela consolidada com Descrição, Classificação Fiscal, Qtd, Valor Unitário, Total e Ações.
    - **Valores/Operação**: Natureza da operação, frete, descontos e observações.
    - **Resumo**: Totais calculados e status de preenchimento.
- **Rodapé Fixo**: Ações de Cancelar, Pré-visualizar e Emitir sempre visíveis.

### 2. Persistência de Dados e Estado
- **Fonte de Verdade**: O array `itens` será a única fonte de verdade para a Classificação Fiscal (`categoriaFiscalId`).
- **Hidratação de Componentes**: Refatoração do `ClassificacaoFiscalPicker` para carregar o nome da categoria via ID se o objeto visual não estiver disponível em cache, evitando o texto "Selecionar...".
- **Merge Seguro**: Garantir que as atualizações de campos (quantidade, valor, etc.) utilizem spread operator `{...item, campo: valor}` para não perder o `categoriaFiscalId`.
- **Validação Localizada**: Exibição de erros de classificação diretamente na linha do item.

### 3. Integridade do Sistema
- **Sem Mudanças no Backend**: Nenhuma alteração em `fiscal.server.ts`, `fiscal.functions.ts` ou tabelas do banco de dados.
- **Preservação de Dados**: Não haverá modificação em cadastros existentes (Produtos, Categorias, NCM, Clientes).
- **Consistência Fiscal**: Manutenção das regras de cálculo de `unitTax`, `quantityTax` e lógica da Rejeição 630.

## Detalhes Técnicos
- **Arquivo Principal**: `src/features/fiscal/NfeAvulsaDrawer.tsx`.
- **Componentes Afetados**: `ClassificacaoFiscalPicker`, `ItensStep` (a ser fundido), `ValoresStep` (a ser fundido).
- **Gestão de Estado**: Uso de `useState` robusto para o formulário completo, sem perdas em re-renderizações.
- **Segurança**: Diálogo de confirmação personalizado ao tentar fechar a janela com dados preenchidos.

## Critérios de Sucesso
1. Classificação fiscal permanece visível após editar qualquer outro campo.
2. Classificação fiscal permanece visível após abrir e fechar o Preview.
3. Emissão validada apenas se `categoriaFiscalId` estiver presente em todos os itens.
4. Interface unificada sem botões "Próximo" ou "Voltar".
