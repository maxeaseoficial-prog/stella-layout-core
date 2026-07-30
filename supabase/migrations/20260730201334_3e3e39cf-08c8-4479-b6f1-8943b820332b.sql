CREATE TABLE public.configuracoes_fiscais (
  id text PRIMARY KEY,
  tenant_id uuid NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.configuracoes_fiscais TO authenticated;
GRANT ALL ON public.configuracoes_fiscais TO service_role;

ALTER TABLE public.configuracoes_fiscais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_select_configuracoes_fiscais"
  ON public.configuracoes_fiscais FOR SELECT TO authenticated
  USING (tenant_id = empresa_do_usuario(auth.uid()) AND has_role(auth.uid(), 'administrador'));

CREATE POLICY "admin_insert_configuracoes_fiscais"
  ON public.configuracoes_fiscais FOR INSERT TO authenticated
  WITH CHECK (tenant_id = empresa_do_usuario(auth.uid()) AND has_role(auth.uid(), 'administrador'));

CREATE POLICY "admin_update_configuracoes_fiscais"
  ON public.configuracoes_fiscais FOR UPDATE TO authenticated
  USING (tenant_id = empresa_do_usuario(auth.uid()) AND has_role(auth.uid(), 'administrador'))
  WITH CHECK (tenant_id = empresa_do_usuario(auth.uid()) AND has_role(auth.uid(), 'administrador'));

CREATE POLICY "admin_delete_configuracoes_fiscais"
  ON public.configuracoes_fiscais FOR DELETE TO authenticated
  USING (tenant_id = empresa_do_usuario(auth.uid()) AND has_role(auth.uid(), 'administrador'));

CREATE TRIGGER update_configuracoes_fiscais_updated_at
  BEFORE UPDATE ON public.configuracoes_fiscais
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();