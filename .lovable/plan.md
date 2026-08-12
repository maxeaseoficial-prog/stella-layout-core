# Plano de Correção Final da Arquitetura de Usuários Stella

Este plano remove as dependências de códigos fixos (hardcoded) para autenticação, garantindo que a fonte da verdade seja exclusivamente o Supabase Auth e o banco de dados.

## Alterações Técnicas

### 1. Servidor: Resolução Dinâmica de Username
- **Arquivo**: `src/lib/usuarios.server.ts`
- **Ação**: Remover o objeto `APELIDOS_LEGACY`.
- **Mudança**: Alterar `buscarEmailPorUsername` para consultar o Supabase Auth em tempo real, filtrando por `user_metadata->>usuario`.

### 2. Frontend: Limpeza de Credenciais de Teste
- **Arquivo**: `src/features/auth/useAuth.ts`
- **Ação**: Remover `CONTA_TESTE` e `APELIDOS_EMAIL`.
- **Mudança**: Remover a lógica de mapeamento local de apelidos em `identificadorParaEmail`. O servidor fará esse trabalho de forma dinâmica.

### 3. Persistência: Segurança e Integridade do Seed
- **Arquivo**: `src/features/usuarios/useUsuarios.ts`
- **Ação**: 
    - Remover senhas do objeto `Usuario` e do `localStorage`.
    - Ajustar `garantirSeed` para não sobrescrever dados se o usuário já estiver sincronizado com o Supabase (verificando o ID real).
    - Remover a heurística `isRealUser` baseada no tamanho do ID.

### 4. Interface: Edição com Troca de Senha Opcional
- **Arquivo**: `src/features/usuarios/UsuarioFormDrawer.tsx`
- **Ação**: Adicionar campos de "Nova Senha" e "Confirmar Senha" na edição de usuários.
- **Mudança**: Atualizar o `submit` para enviar a nova senha opcional para a Server Function.

### 5. Operação Atômica de Atualização
- **Arquivo**: `src/lib/usuarios.functions.ts` e `src/lib/usuarios.server.ts`
- **Ação**: Refatorar `atualizarUsuarioSistema` para receber `novaSenha` opcional e atualizar o Auth e o banco de dados em uma única transação lógica no servidor.

## Relatório de Verificação (Pós-implementação)

| Item | Status |
| :--- | :--- |
| Alias hardcoded de matriz removido | Pendente |
| Alias hardcoded de administrador removido | Pendente |
| CONTA_TESTE fora do login real | Pendente |
| Senhas removidas do armazenamento local | Pendente |
| Heurística de ID removida | Pendente |
| Login novo e-mail (após troca) | Pendente |
| Login username sem cache | Pendente |

