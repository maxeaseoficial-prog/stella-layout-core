CREATE TABLE public.precificacao_historico (
  id text not null primary key,
  tenant_id uuid not null references public.empresas(id),
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.precificacao_historico TO authenticated;
GRANT ALL ON public.precificacao_historico TO service_role;

ALTER TABLE public.precificacao_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_select_precificacao" ON public.precificacao_historico
  FOR SELECT TO authenticated
  USING (tenant_id = public.empresa_do_usuario(auth.uid()));

CREATE POLICY "tenant_insert_precificacao" ON public.precificacao_historico
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.empresa_do_usuario(auth.uid()));

CREATE POLICY "tenant_update_precificacao" ON public.precificacao_historico
  FOR UPDATE TO authenticated
  USING (tenant_id = public.empresa_do_usuario(auth.uid()))
  WITH CHECK (tenant_id = public.empresa_do_usuario(auth.uid()));

CREATE POLICY "tenant_delete_precificacao" ON public.precificacao_historico
  FOR DELETE TO authenticated
  USING (tenant_id = public.empresa_do_usuario(auth.uid()));

CREATE TRIGGER update_precificacao_historico_updated_at
  BEFORE UPDATE ON public.precificacao_historico
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();