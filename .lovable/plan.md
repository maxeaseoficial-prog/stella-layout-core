# Plano de Simplificação Fiscal e Remoção de Integração Spedy

O objetivo é transformar o Stella ERP em um sistema com controle manual de emissão de notas fiscais, removendo a integração automática com a API Spedy e simplificando a interface para o usuário.

## 1. Alterações no Modelo de Dados (Frontend)

Atualizar o tipo `Pedido` para incluir o controle manual de emissão:

```typescript
// src/features/pedidos/types.ts
export interface Pedido {
  // ... campos existentes
  notaFiscalControle?: {
    emitida: boolean;
    emitidaEm?: string; // ISO timestamp
  };
}
```

## 2. Refatoração do Módulo Fiscal (`src/features/fiscal/`)

Transformar a aba Fiscal em uma central de controle manual:

- **FiscalLayout.tsx**: 
    - Remover botão "Emitir NF-e avulsa".
    - Simplificar as abas para: [Todos], [Pendentes], [Emitidas].
    - Remover abas: "NF-e Avulsas", "Categorias Fiscais", "Configurações Fiscais".
- **FiscalDashboard.tsx**:
    - Adaptar os cards de estatísticas para refletir apenas o status manual.
    - Remover métricas da Spedy (Rejeitadas, Erros de Config).
- **PedidosPendentesFiscal.tsx** (e novas listas):
    - Listar todos os pedidos com status `!notaFiscalControle.emitida`.
    - Adicionar botão "Marcar nota como emitida".
    - Adicionar busca por cliente e número do pedido.
    - Ao clicar no pedido, abrir o `PedidoViewDrawer` para conferência.
- **Remover componentes obsoletos**:
    - `ConfiguracoesFiscaisForm.tsx`
    - `CategoriasFiscaisManager.tsx`
    - `NfeAvulsaDrawer.tsx`
    - `RevisarEmissaoDialog.tsx`
    - `PayloadPreviewDialog.tsx`
    - `NotasAvulsasFiscal.tsx`

## 3. Alterações no Módulo de Pedidos (`src/features/pedidos/`)

Remover vestígios da integração fiscal da interface de pedidos:

- **PedidoViewDrawer.tsx**:
    - Remover a aba "Nota Fiscal" e o componente `NotaFiscalSection`.
    - Adicionar seção simples com status manual: "Nota Fiscal: [Pendente / Emitida em DD/MM]".
    - Adicionar botão "Marcar como emitida" / "Marcar como não emitida" (com confirmação).
    - Adicionar botão "Imprimir Pedido" (já existe, mas garantir que atenda aos requisitos de consulta).
- **PedidoFormDrawer.tsx**:
    - Remover qualquer menção a NCM ou aviso fiscal durante a criação/finalização.
- **usePedidos.ts**:
    - Implementar a função `marcarNotaEmitida(id: string, emitida: boolean)`.

## 4. Limpeza de Código e Segurança

- Manter as `server functions` e arquivos `*.server.ts` relacionados à Spedy intactos no sistema (conforme regra 9), mas remover todos os pontos de entrada na UI.
- Garantir que nenhuma chamada para a Spedy ocorra no fluxo de vida normal do usuário.

## 5. Relatório Final de Testes

Serão validados os seguintes pontos:
1. Criação de pedido -> aparece no Fiscal/Pendentes.
2. Marcar como emitida -> move para Fiscal/Emitidas e persiste após reload.
3. Desfazer marcação -> volta para Pendentes.
4. Busca e filtros operacionais.
5. Ausência total de campos "Spedy", "API Key", "NCM" na UI.
