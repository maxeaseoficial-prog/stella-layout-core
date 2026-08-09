-- Migration for notas_fiscais table to persist all fiscal emissions (including NFe Avulsa)
CREATE TABLE public.notas_fiscais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    cliente_id TEXT, -- Incompatible with public.clientes(id) which is TEXT
    pedido_id TEXT,  -- Incompatible with public.pedidos(id) which is TEXT
    tipo_emissao TEXT NOT NULL CHECK (tipo_emissao IN ('pedido', 'avulsa')),
    spedy_id TEXT NOT NULL,
    ambiente TEXT NOT NULL CHECK (ambiente IN ('sandbox', 'producao')),
    status TEXT NOT NULL,
    numero INTEGER,
    serie TEXT,
    chave_acesso TEXT,
    protocolo TEXT,
    valor_total NUMERIC(15, 2),
    data_emissao TIMESTAMPTZ,
    data_autorizacao TIMESTAMPTZ,
    external_id TEXT,
    mensagem_sefaz TEXT,
    payload_envio JSONB,
    resumo_destinatario JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notas_fiscais_tenant_id ON public.notas_fiscais(tenant_id);
CREATE INDEX idx_notas_fiscais_cliente_id ON public.notas_fiscais(cliente_id);
CREATE INDEX idx_notas_fiscais_pedido_id ON public.notas_fiscais(pedido_id);
CREATE INDEX idx_notas_fiscais_chave_acesso ON public.notas_fiscais(chave_acesso);
CREATE INDEX idx_notas_fiscais_spedy_id ON public.notas_fiscais(spedy_id);

ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notas_fiscais TO authenticated;
GRANT ALL ON public.notas_fiscais TO service_role;

CREATE POLICY "Users can view their tenant's fiscal notes"
ON public.notas_fiscais
FOR SELECT
TO authenticated
USING (
    tenant_id IN (
        SELECT empresa_id FROM public.empresa_usuarios WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert fiscal notes for their tenant"
ON public.notas_fiscais
FOR INSERT
TO authenticated
WITH CHECK (
    tenant_id IN (
        SELECT empresa_id FROM public.empresa_usuarios WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update fiscal notes for their tenant"
ON public.notas_fiscais
FOR UPDATE
TO authenticated
USING (
    tenant_id IN (
        SELECT empresa_id FROM public.empresa_usuarios WHERE user_id = auth.uid()
    )
);
