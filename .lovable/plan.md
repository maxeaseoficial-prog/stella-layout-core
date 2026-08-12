# Plano de Correção NF-e: Rejeição 232 (IE não informada)

Este plano resolve a rejeição da SEFAZ na emissão de NF-e para empresas contribuintes, garantindo que a Inscrição Estadual (IE) seja tratada de forma segura e síncrona, eliminando o fallback automático para "ISENTO" e inconsistências de sincronização entre o cadastro local e o servidor.

## Mudanças sugeridas

### 1. Modelo de Dados e Tipos
- Adicionar o campo `indicadorIe` ao tipo `ClienteEmpresa` em `src/features/clientes/types.ts`.
- Valores possíveis: `contribuinte` (ICMS), `isento`, `nao_contribuinte`.
- Atualizar a interface `NfeAvulsa` e `NfeAvulsaItem` se necessário para paridade.

### 2. Cadastro de Clientes (`ClienteFormDrawer.tsx`)
- Implementar o novo campo "Indicador de Inscrição Estadual" para empresas.
- Tornar o campo `inscricaoEstadual` **obrigatório** quando o indicador for `contribuinte`.
- Melhorar a busca automática de IE via CNPJ para considerar a UF e evitar preenchimentos silenciosos de IEs múltiplas ou inativas.

### 3. Lógica de Sincronização e Sincronicidade Fiscal
- Criar em `src/lib/fiscal.functions.ts` e `src/lib/fiscal-avulsa.functions.ts` uma garantia de persistência.
- Antes da emissão, realizar um `upsert` síncrono do cliente e aguardar a confirmação do banco de dados para evitar "condição de corrida" entre o cache local e o servidor Spedy.
- Refatorar o carregamento do cliente no servidor para garantir que os dados canônicos sejam validados imediatamente antes da montagem do payload.

### 4. Montagem de Payload (`fiscal.server.ts`)
- Remover o fallback `|| "ISENTO"` em `montarPayloadNfe` e `montarPayloadNfeAvulsa`.
- Implementar lógica baseada no `indicadorIe`:
    - `contribuinte`: Enviar `stateTaxNumber` obrigatório (se vazio, lança erro antes de transmitir).
    - `isento`: Enviar `stateTaxNumber: "ISENTO"`.
    - `nao_contribuinte`: Tratar conforme contrato Spedy (geralmente omitindo ou enviando vazio/isento dependendo da UF, validado pelo servidor).

### 5. Interface de Revisão Fiscal (`NfeAvulsaDrawer.tsx`)
- Adicionar bloco "DADOS FISCAIS DO DESTINATÁRIO" na revisão.
- Exibir Razão Social, CNPJ, Indicador IE e IE real que será transmitida.
- Bloquear o botão "Emitir" caso existam inconsistências (ex: marcado como contribuinte mas IE ausente).
- Integrar o `PayloadPreviewDialog.tsx` para permitir conferência manual do JSON de produção.

### 6. Diagnóstico e Logs
- Melhorar os logs em `fiscal.functions.ts` para incluir diagnóstico de IE (presença, tamanho e indicador) sem expor o valor completo.
- Adicionar relatório de diagnóstico para a NF-e 221 rejeitada (leitura do `payload_envio` persistido).

## Detalhes técnicos
- Alteração nos schemas Zod das server functions para incluir o novo campo de indicador.
- Migração de dados (opcional): se o banco já tiver clientes, o indicador pode ser inferido inicialmente (IE presente = contribuinte, IE vazia = nao_contribuinte) mas o usuário deverá validar no primeiro uso.
- Uso de `Promise.all` ou encadeamento síncrono em `handleEmitir` para garantir `salvarCliente -> emitir`.

## Riscos e Mitigações
- **Risco:** Clientes antigos sem o campo `indicadorIe`.
- **Mitigação:** Implementar fallback seguro no código: se não houver indicador, assume `contribuinte` se houver IE, ou `nao_contribuinte` se estiver vazio, forçando o usuário a revisar na tela de emissão.
- **Risco:** Novas rejeições por regras de UF específicas.
- **Mitigação:** Validação rigorosa no preflight comparando UF do emitente e destinatário.
