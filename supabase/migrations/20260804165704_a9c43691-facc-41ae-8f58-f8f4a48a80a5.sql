-- Tentando restaurar a funcionalidade via OWNER
-- Às vezes o problema é que o usuário 'authenticated' não tem permissão de USAGE no schema public ou algo similar

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO service_role;

GRANT ALL ON public.chat_conversas TO authenticated;
GRANT ALL ON public.chat_participantes TO authenticated;
GRANT ALL ON public.chat_mensagens TO authenticated;

-- Garantindo GRANTs para service_role (usado em server functions se necessário)
GRANT ALL ON public.chat_conversas TO service_role;
GRANT ALL ON public.chat_participantes TO service_role;
GRANT ALL ON public.chat_mensagens TO service_role;

-- Reforçar políticas RLS
DROP POLICY IF EXISTS "chat_conversas_insert" ON public.chat_conversas;
CREATE POLICY "chat_conversas_insert" ON public.chat_conversas FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "chat_participantes_insert" ON public.chat_participantes;
CREATE POLICY "chat_participantes_insert" ON public.chat_participantes FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "chat_mensagens_insert" ON public.chat_mensagens;
CREATE POLICY "chat_mensagens_insert" ON public.chat_mensagens FOR INSERT TO authenticated WITH CHECK (remetente_id = auth.uid());
