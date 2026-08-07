-- Estruturação da base fiscal para Stella
ALTER TABLE public.categorias_fiscais 
ADD COLUMN IF NOT EXISTS codigo text,
ADD COLUMN IF NOT EXISTS vigencia date,
ADD COLUMN IF NOT EXISTS rec_pis text,
ADD COLUMN IF NOT EXISTS rec_cofins text,
ADD COLUMN IF NOT EXISTS natureza_receita text,
ADD COLUMN IF NOT EXISTS tipo_contribuicao text DEFAULT 'Sem incidência';

-- Remover restrição antiga baseada apenas no NCM
ALTER TABLE public.categorias_fiscais DROP CONSTRAINT IF EXISTS categorias_fiscais_ncm_tenant_id_key;

-- Nova restrição única baseada em código, vigência e tenant
-- Note: we use COALESCE for optional fields if needed, but here we expect them to be set
ALTER TABLE public.categorias_fiscais ADD CONSTRAINT categorias_fiscais_codigo_vigencia_tenant_key UNIQUE (codigo, vigencia, tenant_id);

-- Garantir acesso
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categorias_fiscais TO authenticated;
GRANT ALL ON public.categorias_fiscais TO service_role;