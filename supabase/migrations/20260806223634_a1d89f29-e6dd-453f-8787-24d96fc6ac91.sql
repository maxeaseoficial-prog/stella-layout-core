-- Adicionar colunas faltantes à categorias_fiscais
ALTER TABLE public.categorias_fiscais ADD COLUMN IF NOT EXISTS unidade_comercial text DEFAULT 'UN';
ALTER TABLE public.categorias_fiscais ADD COLUMN IF NOT EXISTS unidade_tributavel text DEFAULT 'UN';
ALTER TABLE public.categorias_fiscais ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.empresas(id);

-- Atualizar RLS para categorias_fiscais (já que agora tem tenant_id)
ALTER TABLE public.categorias_fiscais ENABLE ROW LEVEL SECURITY;

-- Garantir acesso
GRANT ALL ON public.categorias_fiscais TO authenticated;
GRANT ALL ON public.categorias_fiscais TO service_role;

-- Políticas de RLS
DROP POLICY IF EXISTS "Usuários podem ver categorias da sua empresa" ON public.categorias_fiscais;
CREATE POLICY "Usuários podem ver categorias da sua empresa"
ON public.categorias_fiscais
FOR SELECT
TO authenticated
USING (tenant_id IS NULL OR tenant_id IN (
    SELECT empresa_id FROM public.empresa_usuarios WHERE user_id = auth.uid()
));

DROP POLICY IF EXISTS "Admins podem gerenciar categorias" ON public.categorias_fiscais;
CREATE POLICY "Admins podem gerenciar categorias"
ON public.categorias_fiscais
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'administrador'))
WITH CHECK (public.has_role(auth.uid(), 'administrador'));
