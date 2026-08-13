ALTER TABLE public.segredos_fiscais 
ADD COLUMN IF NOT EXISTS chave_api_sandbox text,
ADD COLUMN IF NOT EXISTS chave_api_producao text;

UPDATE public.segredos_fiscais 
SET chave_api_producao = chave_api 
WHERE chave_api_producao IS NULL AND chave_api IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.segredos_fiscais TO authenticated;
GRANT ALL ON public.segredos_fiscais TO service_role;
