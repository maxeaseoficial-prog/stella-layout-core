# Plano de Ajuste de Integridade e Segurança de Usuários

Corrigir a persistência de credenciais no localStorage, remover heurísticas de ID legadas e garantir que o Supabase Auth seja a única fonte de verdade para autenticação e gestão de usuários.

## Alterações Técnicas

### 1. Refatoração de Tipos (src/features/usuarios/types.ts)
- Remover campo `senha` da interface `Usuario`.
- Criar `CriarUsuarioInput` e `AtualizarUsuarioInput` para lidar com campos transitórios de senha.

### 2. Sanitização do LocalStorage (src/features/usuarios/storage.ts)
- Implementar sanitização na leitura (`carregarUsuarios`) para remover propriedades sensíveis (`senha`, `novaSenha`, etc.).
- Garantir que a migração não apague usuários, apenas limpe os dados sensíveis.

### 3. Ajustes no Hook de Gestão (src/features/usuarios/useUsuarios.ts)
- **Criação**: Desestruturar explicitamente a senha do input antes de persistir no cache local.
- **Edição**: Remover `novaSenha` e campos de confirmação do patch antes de atualizar o cache local.
- **Redefinição de Senha**: Remover `senha: novaSenha` da função `redefinirSenha`. Persistir apenas metadados de controle.
- **Troca de Senha Própria**: Atualizar para usar Supabase Auth (via server function ou `supabase.auth.updateUser`) e não persistir a senha localmente.
- **Heurística de ID**: Remover `isRealUser` em `alternarStatus`. Usar UUID check ou consultar o servidor.
- **Seed**: Impedir que o SEED sobrescreva dados reais do servidor ou apareça quando o servidor já tem dados.

### 4. Melhoria nas Server Functions (src/lib/usuarios.functions.ts & usuarios.server.ts)
- **Vínculo**: Validar `vinculo.ok` em todas as funções que chamam `vincularUsuarioEmpresa`.
- **Username**: Garantir que a resolução de username seja 100% dinâmica no servidor.

### 5. Ajustes na UI (src/features/usuarios/UsuarioFormDrawer.tsx)
- Garantir que o formulário utilize os novos tipos de input.
- Validar campos obrigatórios (E-mail e Usuário) conforme solicitado anteriormente, mas agora integrado à nova arquitetura.

### 6. Verificação e Testes
- Validar login por e-mail e username.
- Inspecionar `stella.usuarios.v1` no localStorage para confirmar ausência de senhas.

## Relatório Final Esperado
- Login dinâmico preservado: SIM
- Senhas removidas do localStorage: SIM
- Campo senha removido de Usuario: SIM
- novaSenha não persistida: SIM
- Heurística de ID removida totalmente: SIM
- Vinculo.ok verificado: SIM
- Usuários carregados do servidor: SIM
- E-mail alterado aparece em outro navegador: SIM
