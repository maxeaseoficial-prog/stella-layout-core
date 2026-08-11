# Plano: Implementação da Exclusão de Categorias Fiscais

O objetivo é adicionar a funcionalidade de exclusão para categorias fiscais na aba "Categorias Fiscais" do módulo Fiscal, permitindo que administradores removam registros desnecessários.

## Alterações

### Backend (Server Functions)
- Criar a server function `excluirCategoriaFiscal` em `src/features/fiscal/ncm.functions.ts`.
- A função verificará se o usuário é administrador fiscal, buscará o `tenant_id` do usuário e excluirá o registro da tabela `categorias_fiscais` com base no `id` e `tenant_id`.

### Frontend (Interface)
- Atualizar o componente `CategoriasFiscaisManager.tsx`:
    - Adicionar o botão de exclusão (ícone de lixeira) na coluna de "Ações" da tabela.
    - Implementar um modal de confirmação (`AlertDialog`) para evitar exclusões acidentais.
    - Integrar o botão com a nova server function `excluirCategoriaFiscal`.
    - Garantir que a lista seja atualizada e um toast de sucesso/erro seja exibido após a operação.

## Detalhes Técnicos
- O banco de dados Supabase já possui a tabela `categorias_fiscais` com políticas de RLS adequadas (baseadas em `tenant_id`).
- A exclusão será protegida pelo middleware `supabaseAuthMiddleware` e pela verificação `assertAdminFiscal`.
- Utilizaremos componentes do Shadcn/UI (`AlertDialog`, `Button`, `toast`) para manter a consistência visual.
