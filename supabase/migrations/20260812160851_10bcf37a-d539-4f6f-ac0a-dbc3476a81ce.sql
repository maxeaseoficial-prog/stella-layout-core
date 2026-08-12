REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

REVOKE EXECUTE ON FUNCTION public.papel_do_usuario(uuid) FROM PUBLIC, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.papel_do_usuario(uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.empresa_do_usuario(uuid) FROM PUBLIC, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.empresa_do_usuario(uuid) TO service_role;