CREATE TABLE IF NOT EXISTS public.segredos_fiscais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    chave_api TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id)
);

-- Grant access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.segredos_fiscais TO authenticated;
GRANT ALL ON public.segredos_fiscais TO service_role;

-- Enable RLS
ALTER TABLE public.segredos_fiscais ENABLE ROW LEVEL SECURITY;

-- Only admins of the tenant can access
CREATE POLICY "Admins can manage fiscal secrets" 
ON public.segredos_fiscais
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    ) AND 
    tenant_id IN (
        SELECT empresa_id FROM public.empresa_usuarios WHERE user_id = auth.uid()
    )
);
