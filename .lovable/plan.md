# Plano de Refatoração: Interface de NF-e Avulsa em Tela Única

Refatorar o componente `NfeAvulsaDrawer.tsx` para eliminar o fluxo de wizard (4 passos) e consolidar todas as informações em uma única interface de modal/drawer grande (90-95vw/vh), garantindo a persistência absoluta da Classificação Fiscal.

## Alterações Propostas

### 1. Reestruturação da Interface (UI)
- **Remover o Wizard**: Eliminar o estado `etapa` e a navegação por passos.
- **Janela Única**: Alterar o `DialogContent` para ocupar aproximadamente 90-95vw e 90-95vh com scroll interno.
- **Layout Consolidado**:
  - **Cabeçalho Fixo**: Título "Emitir NF-e Avulsa" com botão de fechar.
  - **Conteúdo com Scroll**: Seções verticais para Destinatário, Itens, Valores e Resumo.
  - **Rodapé Fixo**: Botões "Cancelar", "Pré-visualizar" e "Emitir NF-e".

### 2. Gestão de Estado e Persistência
- **Classificação Fiscal**:
  - Garantir que `categoriaFiscalId` no objeto do item seja a única fonte de verdade.
  - Picker controlado diretamente pelo estado do item.
  - Hidratação automática do objeto de classificação.
- **Validação**:
  - Indicações visuais de erro diretamente nos campos obrigatórios.
  - Impedir fechamento em caso de erro de emissão.

### 3. Funcionalidades de Segurança
- **Confirmação de Descarte**: Dialog interno ao tentar cancelar com dados preenchidos.
- **Preservação**: Garantir que pré-visualização ou erros de API não limpem o formulário.

## Regras de Integridade
- **NÃO** alterar banco de dados, migrations ou dados já cadastrados.
- **NÃO** modificar lógica fiscal de backend ou cálculos de impostos (Rejeição 630).
- **NÃO** quebrar o sistema de polling e consulta de status.

## Detalhes Técnicos
- **Arquivo**: `src/features/fiscal/NfeAvulsaDrawer.tsx`.
- **Componentes**: Dialog, ScrollArea, AlertDialog.
