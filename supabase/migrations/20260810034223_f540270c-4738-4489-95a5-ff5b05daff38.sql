
BEGIN;

-- 1. Remover o índice não-único existente para evitar redundância
DROP INDEX IF EXISTS public.idx_notas_fiscais_spedy_id;

-- 2. Criar o índice UNIQUE composto por tenant_id e spedy_id (necessário para onConflict multi-tenant)
-- Nota: se spedy_id for GLOBALMENTE único na Spedy, tenant_id + spedy_id continua seguro.
CREATE UNIQUE INDEX IF NOT EXISTS idx_notas_fiscais_spedy_id_unique ON public.notas_fiscais (tenant_id, spedy_id);

COMMIT;
