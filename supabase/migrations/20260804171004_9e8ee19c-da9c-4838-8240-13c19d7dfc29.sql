DO $$ 
BEGIN
    DROP TYPE IF EXISTS public.chat_status_mensagem;
    DROP TYPE IF EXISTS public.chat_tipo_conversa;
    DROP TYPE IF EXISTS public.chat_tipo_mensagem;
END $$;