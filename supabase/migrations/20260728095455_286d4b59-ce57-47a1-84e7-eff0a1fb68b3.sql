
CREATE TABLE public.tarefas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  prioridade TEXT NOT NULL DEFAULT 'media' CHECK (prioridade IN ('baixa','media','alta')),
  tipo TEXT NOT NULL DEFAULT 'tarefa' CHECK (tipo IN ('tarefa','checklist')),
  itens JSONB NOT NULL DEFAULT '[]'::jsonb,
  concluida BOOLEAN NOT NULL DEFAULT false,
  concluida_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX tarefas_user_id_idx ON public.tarefas(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tarefas TO authenticated;
GRANT ALL ON public.tarefas TO service_role;

ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tarefas_select_own" ON public.tarefas
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "tarefas_insert_own" ON public.tarefas
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tarefas_update_own" ON public.tarefas
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tarefas_delete_own" ON public.tarefas
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_tarefas_updated_at
  BEFORE UPDATE ON public.tarefas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.tarefas;
ALTER TABLE public.tarefas REPLICA IDENTITY FULL;
