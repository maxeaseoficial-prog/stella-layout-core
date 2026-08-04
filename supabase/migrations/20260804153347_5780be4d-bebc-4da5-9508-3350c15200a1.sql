DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND 'caixa' = ANY(enum_range(NULL::app_role)::text[])) THEN
    ALTER TYPE public.app_role ADD VALUE 'caixa';
  END IF;
END $$;

ALTER TABLE public.empresa_usuarios ADD COLUMN IF NOT EXISTS permissoes jsonb;