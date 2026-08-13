# Plano de Correção: Unificação de Chave API Spedy

O sistema foi recentemente alterado para suportar duas chaves API (Sandbox e Produção). No entanto, a conta operacional da Spedy utiliza uma única credencial, sendo o ambiente controlado pelo `environmentType` no payload. Esta alteração quebrou o cadastro e a persistência da chave.

## Alterações Propostas

### 1. Banco de Dados e Backend (Server-side)
- Restaurar `chave_api` como a coluna canônica na tabela `segredos_fiscais`.
- Corrigir `salvarSegredosFiscaisServer` para realizar o upsert diretamente na coluna `chave_api`.
- Garantir que erros de banco de dados sejam logados com detalhes no servidor para diagnóstico, retornando mensagens seguras ao frontend.
- Atualizar `carregarSegredosFiscaisServer` para retornar apenas o status e os últimos 4 dígitos da chave única.
- Ajustar `apiKeyParaAmbiente` para utilizar sempre a `chave_api` cadastrada, independentemente do ambiente selecionado (Sandbox/Produção).

### 2. Interface (Frontend)
- Simplificar o formulário em `ConfiguracoesFiscaisForm.tsx` para exibir apenas um campo: "Chave da API Spedy".
- Remover a distinção visual entre chaves de Sandbox e Produção no gerenciamento de segredos.
- Manter a seleção de "Ambiente Fiscal NF-e" (Homologação/Produção), pois ela ainda controla o comportamento da emissão na SEFAZ.
- Melhorar o feedback de erro ao salvar, exibindo mensagens mais úteis baseadas no retorno do servidor.

### 3. Funções de Servidor (RPC)
- Atualizar `carregarSegredosFiscais`, `salvarSegredoFiscal` e `removerSegredoFiscal` em `fiscal.functions.ts` para trabalharem com o modelo de chave única.

## Detalhes Técnicos
- **Tabela:** `public.segredos_fiscais`
- **Coluna Principal:** `chave_api` (TEXT NOT NULL)
- **Segurança:** A chave completa nunca deve ser enviada ao cliente.
- **Transição:** Caso existam dados em `chave_api_sandbox` ou `chave_api_producao`, eles serão preservados durante a migração interna se necessário, mas a interface focará na `chave_api`.

## Diagnóstico Inicial
- `chave_api` presente: SIM (verificado via query)
- `chave_api_producao` presente: SIM
- `chave_api_sandbox` presente: NÃO
- Causa do sumiço: A interface passou a buscar colunas específicas que podiam estar vazias ou desalinhadas com o registro legado `NOT NULL`.
