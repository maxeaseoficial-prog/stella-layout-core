# Plano de Correção: UUID e Reconciliação de Identidade de Usuário

Corrigir o erro "Expected parameter to be UUID" ao editar usuários (como o Operador Matriz) e garantir que IDs legados (como `seed_matriz`) sejam substituídos pelos UUIDs reais do Supabase Auth no cache local após a primeira sincronização/edição bem-sucedida.

## Alterações Técnicas

### 1. Servidor: Resolução Canônica de Usuário
- Criar `resolverAuthUser` em `src/lib/usuarios.server.ts` para localizar o UUID real via:
    1. Verificação de UUID válido.
    2. Busca por e-mail anterior/atual.
    3. Busca por metadados de username.
- Validar UUIDs usando regex real.
- Atualizar `atualizarAuthEMetadata` para receber dados de busca e retornar o UUID canônico.

### 2. Funções de Servidor: Retorno de ID
- Atualizar `atualizarUsuarioSistema` e `alternarStatusSistema` para retornar o `userId` real do Supabase Auth.
- Garantir que as operações administrativas (`updateUserById`) usem apenas o UUID resolvido.

### 3. Frontend: Reconciliação de ID
- Atualizar `atualizarUsuario` em `src/features/usuarios/useUsuarios.ts` para:
    - Enviar `emailAtual` e `usuarioAtual` explicitamente.
    - Se o `userId` retornado for diferente do ID local, atualizar o registro no `localStorage`.
- Corrigir `alternarStatus` e `redefinirSenha` para também realizarem a resolution de UUID no servidor.

## Plano de Teste Obrigatório (Informar Resultados Concretos)
- **Cenário**: Editar "Operador Matriz" que possui ID local `seed_matriz`.
- **Ação**: Alterar telefone e salvar.
- **Resultado Esperado**:
    - Sucesso sem erro de UUID.
    - O ID do usuário no cache local muda de `seed_matriz` para o UUID real do Supabase.
    - Login por username (`matriz`) continua funcionando.
