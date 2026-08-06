-- Remover restrições antigas se existirem e criar a nova composta
ALTER TABLE public.categorias_fiscais DROP CONSTRAINT IF EXISTS categorias_fiscais_ncm_key;
ALTER TABLE public.categorias_fiscais DROP CONSTRAINT IF EXISTS categorias_fiscais_ncm_tenant_id_key;

-- Criar constraint única para NCM por Empresa
-- Se tenant_id for nulo (global), também deve ser único
ALTER TABLE public.categorias_fiscais ADD CONSTRAINT categorias_fiscais_ncm_tenant_id_key UNIQUE (ncm, tenant_id);
