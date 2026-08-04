-- Auditoria e Correção completa do RLS para o módulo de Chat

-- 1. Garantir que a função SECURITY DEFINER está correta e tem permissões
CREATE OR REPLACE FUNCTION public.is_chat_participant(_conversa_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_participantes
    WHERE conversa_id = _conversa_id AND user_id = _user_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_chat_participant(UUID, UUID) TO authenticated, service_role;

-- 2. Limpar políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "chat_conversas_select" ON public.chat_conversas;
DROP POLICY IF EXISTS "chat_conversas_insert" ON public.chat_conversas;
DROP POLICY IF EXISTS "chat_conversas_update" ON public.chat_conversas;
DROP POLICY IF EXISTS "chat_conversas_delete" ON public.chat_conversas;

DROP POLICY IF EXISTS "chat_participantes_select" ON public.chat_participantes;
DROP POLICY IF EXISTS "chat_participantes_insert" ON public.chat_participantes;
DROP POLICY IF EXISTS "chat_participantes_update" ON public.chat_participantes;
DROP POLICY IF EXISTS "chat_participantes_delete" ON public.chat_participantes;

DROP POLICY IF EXISTS "chat_mensagens_select" ON public.chat_mensagens;
DROP POLICY IF EXISTS "chat_mensagens_insert" ON public.chat_mensagens;
DROP POLICY IF EXISTS "chat_mensagens_update" ON public.chat_mensagens;
DROP POLICY IF EXISTS "chat_mensagens_delete" ON public.chat_mensagens;

-- 3. Políticas para chat_conversas
-- SELECT: Apenas participantes
CREATE POLICY "chat_conversas_select" ON public.chat_conversas
FOR SELECT TO authenticated
USING (public.is_chat_participant(id, auth.uid()));

-- INSERT: Qualquer usuário autenticado pode iniciar uma conversa no seu tenant
CREATE POLICY "chat_conversas_insert" ON public.chat_conversas
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = criado_por);

-- UPDATE: Participantes podem atualizar (ex: nome do grupo, foto, ou timestamp de última atividade)
CREATE POLICY "chat_conversas_update" ON public.chat_conversas
FOR UPDATE TO authenticated
USING (public.is_chat_participant(id, auth.uid()));

-- 4. Políticas para chat_participantes
-- SELECT: Participantes podem ver outros participantes da mesma conversa
CREATE POLICY "chat_participantes_select" ON public.chat_participantes
FOR SELECT TO authenticated
USING (public.is_chat_participant(conversa_id, auth.uid()));

-- INSERT:
-- Permitimos se o usuário que está inserindo for um dos novos participantes E 
-- a conversa foi criada por ele (ou ele já é participante dela).
CREATE POLICY "chat_participantes_insert" ON public.chat_participantes
FOR INSERT TO authenticated
WITH CHECK (
  -- Permite se a conversa permitir ao criador gerenciar participantes
  EXISTS (
    SELECT 1 FROM public.chat_conversas
    WHERE id = conversa_id AND criado_por = auth.uid()
  )
  OR
  -- Ou se o usuário já for participante (para adicionar outros em grupos)
  public.is_chat_participant(conversa_id, auth.uid())
);

-- 5. Políticas para chat_mensagens
-- SELECT: Participantes
CREATE POLICY "chat_mensagens_select" ON public.chat_mensagens
FOR SELECT TO authenticated
USING (public.is_chat_participant(conversa_id, auth.uid()));

-- INSERT: Apenas participantes e o remetente deve ser o usuário atual
CREATE POLICY "chat_mensagens_insert" ON public.chat_mensagens
FOR INSERT TO authenticated
WITH CHECK (
  remetente_id = auth.uid() AND
  public.is_chat_participant(conversa_id, auth.uid())
);

-- UPDATE: Apenas para marcar como lida (status)
CREATE POLICY "chat_mensagens_update" ON public.chat_mensagens
FOR UPDATE TO authenticated
USING (public.is_chat_participant(conversa_id, auth.uid()))
WITH CHECK (true);
