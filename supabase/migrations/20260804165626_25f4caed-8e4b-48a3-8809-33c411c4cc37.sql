-- Corrigindo GRANTs ausentes que causam erro de permissão (42501)
-- O erro 42501 pode ocorrer se o usuário 'authenticated' não tiver permissão de INSERT, mesmo com RLS favorável.

GRANT ALL ON public.chat_conversas TO authenticated;
GRANT ALL ON public.chat_conversas TO service_role;

GRANT ALL ON public.chat_participantes TO authenticated;
GRANT ALL ON public.chat_participantes TO service_role;

GRANT ALL ON public.chat_mensagens TO authenticated;
GRANT ALL ON public.chat_mensagens TO service_role;

-- Reforçar políticas de INSERT para evitar qualquer bloqueio residual
DROP POLICY IF EXISTS "chat_conversas_insert" ON public.chat_conversas;
CREATE POLICY "chat_conversas_insert" ON public.chat_conversas FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "chat_participantes_insert" ON public.chat_participantes;
CREATE POLICY "chat_participantes_insert" ON public.chat_participantes FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "chat_mensagens_insert" ON public.chat_mensagens;
CREATE POLICY "chat_mensagens_insert" ON public.chat_mensagens FOR INSERT TO authenticated WITH CHECK (remetente_id = auth.uid());
