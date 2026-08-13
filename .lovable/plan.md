# Plano de Correção: Persistência de Ambientes Fiscais

Correção do bug de interface onde as alterações nos seletores de "Ambiente Fiscal NF-e" e "Ambiente da API (Spedy)" não são persistidas por falta de um gatilho de salvamento específico no card de API.

## Alterações

### Frontend
- **ConfiguracoesFiscaisForm.tsx**:
    - Adicionar estado para detectar mudanças nos campos `ambienteFiscal` e `ambienteApi`.
    - Adicionar botão "Salvar configurações" no card "API NOTA FISCAL" que chama `handleSalvar()`.
    - Exibir aviso visual ("Alterações não salvas") quando houver mudanças pendentes.
    - Desabilitar o botão "Testar conexão" se houver alterações não salvas para garantir que o teste ocorra com o ambiente pretendido.

## Critérios de Aceite
- Ao alterar um ambiente e clicar em "Salvar configurações", os valores devem persistir após recarregar a página ou trocar de aba.
- O botão "Salvar" da credencial deve continuar funcionando apenas para a chave da API.
- O teste de conexão deve refletir o ambiente configurado no banco.

## Detalhes Técnicos
- A função `salvar(form)` do hook `useFiscalConfig` já lida com a persistência de `ambienteApi` e `ambienteFiscal` no Supabase. O problema é puramente a ausência do botão no contexto correto do formulário.
