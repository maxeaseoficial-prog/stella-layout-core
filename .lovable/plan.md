# Plano de Reparo e Diagnóstico de Acesso - Stella ERP

O objetivo deste plano é diagnosticar e corrigir a falha de login do Operador (e outros usuários), garantindo que o cadastro local, o Supabase Auth e o vínculo de empresa estejam sincronizados.

## Etapas Técnicas

### 1. Diagnóstico Real (Backend)
- Criar a Server Function `diagnosticarUsuario` em `src/lib/usuarios.functions.ts`.
- Implementar `obterDiagnosticoCompleto` em `src/lib/usuarios.server.ts` usando `supabaseAdmin` para verificar:
  - Presença no Supabase Auth.
  - Vínculo na tabela `empresa_usuarios`.
  - Consistência de metadados (`nome`, `usuario`, `papel`, `status`).
  - Coincidência de IDs entre Auth e Local.

### 2. Interface de Diagnóstico e Reparo (Frontend)
- Adicionar botão "Diagnosticar" na `UsuariosTable.tsx`.
- Criar o componente `DiagnosticoAcessoDialog.tsx` para exibir o estado real.
- Criar o componente `RepararAcessoDialog.tsx` para realizar as correções atômicas:
  - **Cenário A**: Criar conta no Auth + vínculo.
  - **Cenário B**: Criar apenas vínculo.
  - **Cenário C**: Corrigir ID local para bater com o Auth ID.
  - **Cenário D**: Atualizar metadados divergentes.
- Remover o uso de `window.prompt` e `window.alert`.

### 3. Correção da Lógica de Autenticação
- Refatorar `resolverEmailDeLogin` para retornar `null` em caso de falha (não retornar o input).
- Atualizar `useAuth.ts`:
  - `login()` deve validar o vínculo e o status *após* o `signInWithPassword` antes de retornar sucesso.
  - `sincronizarSessao()` não deve ter fallbacks para "caixa" ou "administrador" se não houver vínculo.
  - `useAuth()` deve retornar permissões vazias para usuários não autenticados/sem vínculo.
- Sincronizar a ativação/desativação de usuários com o metadado `status` no Supabase Auth.

### 4. Validação e Testes
- Diagnosticar o usuário "Operador" existente.
- Executar o reparo com nova senha temporária.
- Testar login por E-mail (Sucesso obrigatório).
- Testar login por Username (Sucesso obrigatório).
- Verificar se as permissões e papel carregados batem com o configurado.
- Executar `npm run build`.

## Detalhes de Segurança
- Nenhuma senha ou token será exposto no diagnóstico ou logs.
- O diagnóstico usará `supabaseAdmin` apenas no servidor.
