-- Create chat tables
CREATE TABLE public.chat_conversas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('privada', 'grupo')),
    nome TEXT,
    foto TEXT,
    criado_por UUID REFERENCES auth.users(id),
    criado_em TIMESTAMPTZ DEFAULT now() NOT NULL,
    atualizado_em TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.chat_participantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversa_id UUID REFERENCES public.chat_conversas(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(conversa_id, user_id)
);

CREATE TABLE public.chat_mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversa_id UUID REFERENCES public.chat_conversas(id) ON DELETE CASCADE NOT NULL,
    remetente_id UUID REFERENCES auth.users(id) NOT NULL,
    texto TEXT NOT NULL,
    tipo TEXT DEFAULT 'texto' NOT NULL,
    status TEXT DEFAULT 'enviada' NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    criado_em TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS and Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_conversas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_participantes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_mensagens TO authenticated;
GRANT ALL ON public.chat_conversas TO service_role;
GRANT ALL ON public.chat_participantes TO service_role;
GRANT ALL ON public.chat_mensagens TO service_role;

ALTER TABLE public.chat_conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_mensagens ENABLE ROW LEVEL SECURITY;

-- Simple policies for multi-tenancy
CREATE POLICY "Users can see conversations they belong to"
ON public.chat_conversas FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.chat_participantes
        WHERE conversa_id = public.chat_conversas.id
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can see participants of their conversations"
ON public.chat_participantes FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.chat_participantes p2
        WHERE p2.conversa_id = public.chat_participantes.conversa_id
        AND p2.user_id = auth.uid()
    )
);

CREATE POLICY "Users can see messages of their conversations"
ON public.chat_mensagens FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.chat_participantes
        WHERE conversa_id = public.chat_mensagens.conversa_id
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert messages in their conversations"
ON public.chat_mensagens FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.chat_participantes
        WHERE conversa_id = public.chat_mensagens.conversa_id
        AND user_id = auth.uid()
    )
);
