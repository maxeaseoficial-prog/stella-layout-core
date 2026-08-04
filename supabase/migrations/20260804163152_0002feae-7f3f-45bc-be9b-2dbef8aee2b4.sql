-- Revogar acesso público padrão (anon) das funções SECURITY DEFINER
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_chat_participant(UUID, UUID) FROM PUBLIC;

-- Garantir acesso apenas para as roles necessárias
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_chat_participant(UUID, UUID) TO authenticated, service_role;
