-- Enum para tipo de conversa
DO $$ BEGIN
    CREATE TYPE public.chat_tipo_conversa AS ENUM ('privada', 'grupo');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para tipo de mensagem
DO $$ BEGIN
    CREATE TYPE public.chat_tipo_mensagem AS ENUM ('texto', 'arquivo', 'sistema');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para status da mensagem
DO $$ BEGIN
    CREATE TYPE public.chat_status_mensagem AS ENUM ('enviada', 'entregue', 'lida');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabela de Conversas
CREATE TABLE IF NOT EXISTS public.chat_conversas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    tipo public.chat_tipo_conversa NOT NULL DEFAULT 'privada',
    nome TEXT, -- Apenas para grupos
    foto TEXT, -- Apenas para grupos
    criado_por UUID NOT NULL REFERENCES auth.users(id),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_conversas TO authenticated;
GRANT ALL ON public.chat_conversas TO service_role;

ALTER TABLE public.chat_conversas ENABLE ROW LEVEL SECURITY;

-- Tabela de Participantes
CREATE TABLE IF NOT EXISTS public.chat_participantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversa_id UUID NOT NULL REFERENCES public.chat_conversas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(conversa_id, user_id)
);

GRANT SELECT, INSERT, DELETE ON public.chat_participantes TO authenticated;
GRANT ALL ON public.chat_participantes TO service_role;

ALTER TABLE public.chat_participantes ENABLE ROW LEVEL SECURITY;

-- Policies for chat_conversas (using chat_participantes)
CREATE POLICY "Usuários podem ver conversas das quais participam"
ON public.chat_conversas FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.chat_participantes
        WHERE chat_participantes.conversa_id = chat_conversas.id
        AND chat_participantes.user_id = auth.uid()
    )
);

CREATE POLICY "Usuários podem criar conversas no seu tenant"
ON public.chat_conversas FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Participantes podem atualizar conversas"
ON public.chat_conversas FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.chat_participantes
        WHERE chat_participantes.conversa_id = chat_conversas.id
        AND chat_participantes.user_id = auth.uid()
    )
);

-- Policies for chat_participantes
CREATE POLICY "Participantes podem ver outros participantes da mesma conversa"
ON public.chat_participantes FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.chat_participantes p2
        WHERE p2.conversa_id = chat_participantes.conversa_id
        AND p2.user_id = auth.uid()
    )
);

CREATE POLICY "Usuários podem ser adicionados a conversas"
ON public.chat_participantes FOR INSERT
TO authenticated
WITH CHECK (true);

-- Tabela de Mensagens
CREATE TABLE IF NOT EXISTS public.chat_mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversa_id UUID NOT NULL REFERENCES public.chat_conversas(id) ON DELETE CASCADE,
    remetente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    texto TEXT,
    tipo public.chat_tipo_mensagem NOT NULL DEFAULT 'texto',
    status public.chat_status_mensagem NOT NULL DEFAULT 'enviada',
    metadata JSONB DEFAULT '{}'::jsonb,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.chat_mensagens TO authenticated;
GRANT ALL ON public.chat_mensagens TO service_role;

ALTER TABLE public.chat_mensagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participantes podem ver mensagens da conversa"
ON public.chat_mensagens FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.chat_participantes
        WHERE chat_participantes.conversa_id = chat_mensagens.conversa_id
        AND chat_participantes.user_id = auth.uid()
    )
);

CREATE POLICY "Participantes podem enviar mensagens"
ON public.chat_mensagens FOR INSERT
TO authenticated
WITH CHECK (
    remetente_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.chat_participantes
        WHERE chat_participantes.conversa_id = chat_mensagens.conversa_id
        AND chat_participantes.user_id = auth.uid()
    )
);

CREATE POLICY "Destinatários podem marcar mensagens como lidas"
ON public.chat_mensagens FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.chat_participantes
        WHERE chat_participantes.conversa_id = chat_mensagens.conversa_id
        AND chat_participantes.user_id = auth.uid()
    )
)
WITH CHECK (status = 'lida');
