# Plano de Diagnóstico e Blindagem da NF-e (Rejeição 232)

O objetivo deste plano é identificar por que a Inscrição Estadual (IE) está sendo omitida no XML enviado à SEFAZ, apesar de estar presente no preview da Stella. Seguiremos um protocolo rigoroso de validação de contrato e telemetria.

## 1. Mapeamento de Contrato Spedy
Validar se os campos usados no `montarPayloadNfe` (src/lib/fiscal.server.ts) correspondem ao OpenAPI v1 da Spedy.
- **Hipótese:** A Spedy pode ter alterado `stateTaxNumber` para outro nome ou exigir uma estrutura diferente dentro de `receiver`.
- **Ação:** Consultar `docs.spedy.com.br` (via subagente de pesquisa) para confirmar os nomes exatos.

## 2. Telemetria de Emissão (Payload Real)
Implementar log de diagnóstico no servidor imediatamente antes do `fetch` na Spedy.
- **Arquivo:** `src/lib/fiscal.server.ts`
- **Alteração:** No `spedyFetch`, capturar o `body` serializado (sem segredos) e gerar um hash SHA-256 para comparação com o Preview.

## 3. Validação de Schema (Zod)
Criar um schema rigoroso para o destinatário Spedy no backend para evitar o envio de propriedades ignoradas ou malformadas.
- **Arquivo:** `src/features/fiscal/utils/preflight.server.ts`
- **Ação:** Adicionar `SpedyReceiverSchema` baseado na documentação oficial.

## 4. Inspeção de Histórico
Recuperar os dados da última nota rejeitada (232) no banco de dados para analisar o `payload_envio` persistido.
- **Ação:** Criar uma função de diagnóstico em `src/lib/debug.functions.ts`.

## Detalhes Técnicos
- **Diagnóstico de Payload:** `const bodyHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)));`
- **Segurança:** O log de diagnóstico no console do servidor (`[Fiscal Server] API_REQUEST_PAYLOAD`) deve omitir `X-Api-Key` mas incluir a estrutura completa do `receiver`.
- **Ambiente:** Testes obrigatórios em `sandbox` antes de qualquer nova tentativa em `produção`.

---

CORREÇÃO CRÍTICA DE AMBIENTES FISCAIS — DESCOBRIMOS UMA DIVERGÊNCIA ENTRE STELLA E SPEDY
[Detailed rules 1-12 regarding environment separation, API keys, and validation]
RELATÓRIO FINAL
[Checklist and requirements]
