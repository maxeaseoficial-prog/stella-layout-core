DO $$ 
BEGIN
    -- Ensure schema usage
    GRANT USAGE ON SCHEMA public TO authenticated;
    GRANT USAGE ON SCHEMA public TO service_role;

    -- Drop all current policies to ensure a clean slate
    DROP POLICY IF EXISTS chat_conversas_select ON public.chat_conversas;
    DROP POLICY IF EXISTS chat_conversas_insert ON public.chat_conversas;
    DROP POLICY IF EXISTS chat_conversas_update ON public.chat_conversas;
    DROP POLICY IF EXISTS chat_conversas_delete ON public.chat_conversas;

    DROP POLICY IF EXISTS chat_participantes_select ON public.chat_participantes;
    DROP POLICY IF EXISTS chat_participantes_insert ON public.chat_participantes;
    DROP POLICY IF EXISTS chat_participantes_delete ON public.chat_participantes;

    DROP POLICY IF EXISTS chat_mensagens_select ON public.chat_mensagens;
    DROP POLICY IF EXISTS chat_mensagens_insert ON public.chat_mensagens;
    DROP POLICY IF EXISTS chat_mensagens_update ON public.chat_mensagens;

    -- Table: chat_conversas
    ALTER TABLE public.chat_conversas ENABLE ROW LEVEL SECURITY;
    GRANT ALL ON public.chat_conversas TO authenticated;
    GRANT ALL ON public.chat_conversas TO service_role;

    CREATE POLICY chat_conversas_select ON public.chat_conversas FOR SELECT TO authenticated USING (true);
    CREATE POLICY chat_conversas_insert ON public.chat_conversas FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY chat_conversas_update ON public.chat_conversas FOR UPDATE TO authenticated USING (true);
    CREATE POLICY chat_conversas_delete ON public.chat_conversas FOR DELETE TO authenticated USING (true);

    -- Table: chat_participantes
    ALTER TABLE public.chat_participantes ENABLE ROW LEVEL SECURITY;
    GRANT ALL ON public.chat_participantes TO authenticated;
    GRANT ALL ON public.chat_participantes TO service_role;

    CREATE POLICY chat_participantes_select ON public.chat_participantes FOR SELECT TO authenticated USING (true);
    CREATE POLICY chat_participantes_insert ON public.chat_participantes FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY chat_participantes_delete ON public.chat_participantes FOR DELETE TO authenticated USING (true);

    -- Table: chat_mensagens
    ALTER TABLE public.chat_mensagens ENABLE ROW LEVEL SECURITY;
    GRANT ALL ON public.chat_mensagens TO authenticated;
    GRANT ALL ON public.chat_mensagens TO service_role;

    CREATE POLICY chat_mensagens_select ON public.chat_mensagens FOR SELECT TO authenticated USING (true);
    CREATE POLICY chat_mensagens_insert ON public.chat_mensagens FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY chat_mensagens_update ON public.chat_mensagens FOR UPDATE TO authenticated USING (true);

END $$;