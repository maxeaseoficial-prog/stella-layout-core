# Plano de Correção: Persistência da Classificação Fiscal no Wizard de NF-e Avulsa

O objetivo é garantir que o campo `categoriaFiscalId` de cada item na NF-e Avulsa seja a única fonte de verdade e que seu valor persista ao navegar entre as etapas (Voltar/Próximo) do assistente.

## Alterações

### 1. Refatoração do Estado no Wizard (`src/features/fiscal/NfeAvulsaDrawer.tsx`)
- Garantir que `adicionarItem` capture corretamente `categoriaFiscalId` de produtos existentes.
- Garantir que `itens` no estado do `NfeAvulsaDrawer` mantenham a propriedade `categoriaFiscalId` sem reinicialização indesejada.

### 2. Componente de Seleção (`ClassificacaoFiscalPicker`)
- Consertar a lógica de sincronização: o componente deve priorizar o `value` (`categoriaFiscalId`) vindo do item.
- Implementar hidratação robusta: ao montar, se o `value` existir mas o objeto visual (`selectedCategory`) não, buscar a categoria no backend pelo ID imediatamente.
- Garantir que o `onChange` atualize o estado principal do wizard com o `id` da categoria selecionada.

### 3. Validação e Emissão
- Ajustar a validação do Passo 2 e do botão Final para checar especificamente o `categoriaFiscalId` do item.

## Confirmação de Segurança
Nenhum dado cadastrado, banco, categoria fiscal, produto, pedido ou configuração do Stella será alterado.
