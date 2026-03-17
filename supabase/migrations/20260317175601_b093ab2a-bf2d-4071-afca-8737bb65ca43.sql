
-- Create campanhas table
CREATE TABLE public.campanhas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cor text NOT NULL DEFAULT '#6b7280',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campanhas ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "campanhas_select_auth" ON public.campanhas FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "campanhas_insert_auth" ON public.campanhas FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "campanhas_update_auth" ON public.campanhas FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "campanhas_delete_auth" ON public.campanhas FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- Seed default campanhas
INSERT INTO public.campanhas (nome, cor) VALUES
  ('Ongoing', '#3b82f6'),
  ('Onboarding', '#10b981'),
  ('Engajamento', '#f59e0b'),
  ('Financeiro', '#ef4444'),
  ('Renovação', '#8b5cf6');

-- Add campanha_id to comunicacoes
ALTER TABLE public.comunicacoes ADD COLUMN campanha_id uuid REFERENCES public.campanhas(id);
