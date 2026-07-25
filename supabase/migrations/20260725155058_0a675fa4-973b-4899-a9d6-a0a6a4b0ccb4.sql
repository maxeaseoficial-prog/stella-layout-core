
revoke execute on function public.empresa_do_usuario(uuid) from public, anon;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
revoke execute on function public.papel_do_usuario(uuid) from public, anon;
grant execute on function public.empresa_do_usuario(uuid) to authenticated;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.papel_do_usuario(uuid) to authenticated;
