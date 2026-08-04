DO $$ 
BEGIN
    -- Drop tables if they exist (CASCADE handles policies and dependent objects)
    DROP TABLE IF EXISTS public.chat_mensagens CASCADE;
    DROP TABLE IF EXISTS public.chat_participantes CASCADE;
    DROP TABLE IF EXISTS public.chat_conversas CASCADE;
    
    -- Also drop the helper function if it was created
    DROP FUNCTION IF EXISTS public.is_chat_participant(uuid, uuid) CASCADE;
END $$;