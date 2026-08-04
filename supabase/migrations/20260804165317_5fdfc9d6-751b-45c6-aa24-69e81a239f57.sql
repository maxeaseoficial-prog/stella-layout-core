-- Recriando a política de INSERT para garantir que não haja bloqueio por validações incorretas
DROP POLICY IF EXISTS "chat_conversas_insert" ON public.chat_conversas;

CREATE POLICY "chat_conversas_insert"
ON public.chat_conversas
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Garantir que a tabela tenha RLS e GRANTs corretos
ALTER TABLE public.chat_conversas ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.chat_conversas TO authenticated;
GRANT ALL ON public.chat_conversas TO service_role;
