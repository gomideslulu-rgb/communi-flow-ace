-- 1) Tipos auxiliares
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'tipo_disparo_enum' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.tipo_disparo_enum AS ENUM ('Pontual', 'Régua Fechada', 'Régua Aberta');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'persona_categoria_enum' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.persona_categoria_enum AS ENUM ('disponivel', 'restrita');
  END IF;
END $$;

-- 2) Tabelas de configuração (globais)
CREATE TABLE IF NOT EXISTS public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  cor TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.instituicoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  cor TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  cor TEXT NOT NULL,
  categoria public.persona_categoria_enum NOT NULL DEFAULT 'disponivel',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.canais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marcos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  safra TEXT NOT NULL,
  modalidade TEXT NOT NULL,
  maturidade TEXT NOT NULL,
  cor TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Tabelas de operação (por usuário)
CREATE TABLE IF NOT EXISTS public.pessoas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pessoas_user_id ON public.pessoas(user_id);

CREATE TABLE IF NOT EXISTS public.comunicacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  nome_acao TEXT NOT NULL,
  categoria_id UUID NOT NULL REFERENCES public.categorias(id),
  instituicao_id UUID NOT NULL REFERENCES public.instituicoes(id),
  tipo_disparo public.tipo_disparo_enum NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  repiques TEXT[] NOT NULL DEFAULT '{}',
  ativo BOOLEAN NOT NULL DEFAULT true,
  safras TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comunicacoes_user_id ON public.comunicacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_comunicacoes_pessoa_id ON public.comunicacoes(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_comunicacoes_data_inicio ON public.comunicacoes(data_inicio);

CREATE TABLE IF NOT EXISTS public.comunicacao_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comunicacao_id UUID NOT NULL REFERENCES public.comunicacoes(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES public.personas(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (comunicacao_id, persona_id)
);

CREATE INDEX IF NOT EXISTS idx_comunicacao_personas_comunicacao_id ON public.comunicacao_personas(comunicacao_id);
CREATE INDEX IF NOT EXISTS idx_comunicacao_personas_persona_id ON public.comunicacao_personas(persona_id);

CREATE TABLE IF NOT EXISTS public.comunicacao_canais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comunicacao_id UUID NOT NULL REFERENCES public.comunicacoes(id) ON DELETE CASCADE,
  canal_id UUID NOT NULL REFERENCES public.canais(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (comunicacao_id, canal_id)
);

CREATE INDEX IF NOT EXISTS idx_comunicacao_canais_comunicacao_id ON public.comunicacao_canais(comunicacao_id);
CREATE INDEX IF NOT EXISTS idx_comunicacao_canais_canal_id ON public.comunicacao_canais(canal_id);

-- 4) Trigger de updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_categorias_updated_at ON public.categorias;
CREATE TRIGGER trg_categorias_updated_at
BEFORE UPDATE ON public.categorias
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_instituicoes_updated_at ON public.instituicoes;
CREATE TRIGGER trg_instituicoes_updated_at
BEFORE UPDATE ON public.instituicoes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_personas_updated_at ON public.personas;
CREATE TRIGGER trg_personas_updated_at
BEFORE UPDATE ON public.personas
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_canais_updated_at ON public.canais;
CREATE TRIGGER trg_canais_updated_at
BEFORE UPDATE ON public.canais
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_marcos_updated_at ON public.marcos;
CREATE TRIGGER trg_marcos_updated_at
BEFORE UPDATE ON public.marcos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_pessoas_updated_at ON public.pessoas;
CREATE TRIGGER trg_pessoas_updated_at
BEFORE UPDATE ON public.pessoas
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_comunicacoes_updated_at ON public.comunicacoes;
CREATE TRIGGER trg_comunicacoes_updated_at
BEFORE UPDATE ON public.comunicacoes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5) RLS
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instituicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marcos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicacao_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicacao_canais ENABLE ROW LEVEL SECURITY;

-- Configurações globais (autenticados)
DROP POLICY IF EXISTS categorias_select_auth ON public.categorias;
CREATE POLICY categorias_select_auth ON public.categorias
FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS categorias_insert_auth ON public.categorias;
CREATE POLICY categorias_insert_auth ON public.categorias
FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS categorias_update_auth ON public.categorias;
CREATE POLICY categorias_update_auth ON public.categorias
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS categorias_delete_auth ON public.categorias;
CREATE POLICY categorias_delete_auth ON public.categorias
FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS instituicoes_select_auth ON public.instituicoes;
CREATE POLICY instituicoes_select_auth ON public.instituicoes
FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS instituicoes_insert_auth ON public.instituicoes;
CREATE POLICY instituicoes_insert_auth ON public.instituicoes
FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS instituicoes_update_auth ON public.instituicoes;
CREATE POLICY instituicoes_update_auth ON public.instituicoes
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS instituicoes_delete_auth ON public.instituicoes;
CREATE POLICY instituicoes_delete_auth ON public.instituicoes
FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS personas_select_auth ON public.personas;
CREATE POLICY personas_select_auth ON public.personas
FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS personas_insert_auth ON public.personas;
CREATE POLICY personas_insert_auth ON public.personas
FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS personas_update_auth ON public.personas;
CREATE POLICY personas_update_auth ON public.personas
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS personas_delete_auth ON public.personas;
CREATE POLICY personas_delete_auth ON public.personas
FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS canais_select_auth ON public.canais;
CREATE POLICY canais_select_auth ON public.canais
FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS canais_insert_auth ON public.canais;
CREATE POLICY canais_insert_auth ON public.canais
FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS canais_update_auth ON public.canais;
CREATE POLICY canais_update_auth ON public.canais
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS canais_delete_auth ON public.canais;
CREATE POLICY canais_delete_auth ON public.canais
FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS marcos_select_auth ON public.marcos;
CREATE POLICY marcos_select_auth ON public.marcos
FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS marcos_insert_auth ON public.marcos;
CREATE POLICY marcos_insert_auth ON public.marcos
FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS marcos_update_auth ON public.marcos;
CREATE POLICY marcos_update_auth ON public.marcos
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS marcos_delete_auth ON public.marcos;
CREATE POLICY marcos_delete_auth ON public.marcos
FOR DELETE TO authenticated USING (true);

-- Pessoas (por usuário)
DROP POLICY IF EXISTS pessoas_select_own ON public.pessoas;
CREATE POLICY pessoas_select_own ON public.pessoas
FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS pessoas_insert_own ON public.pessoas;
CREATE POLICY pessoas_insert_own ON public.pessoas
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS pessoas_update_own ON public.pessoas;
CREATE POLICY pessoas_update_own ON public.pessoas
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS pessoas_delete_own ON public.pessoas;
CREATE POLICY pessoas_delete_own ON public.pessoas
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Comunicações (por usuário)
DROP POLICY IF EXISTS comunicacoes_select_own ON public.comunicacoes;
CREATE POLICY comunicacoes_select_own ON public.comunicacoes
FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS comunicacoes_insert_own ON public.comunicacoes;
CREATE POLICY comunicacoes_insert_own ON public.comunicacoes
FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.pessoas p
    WHERE p.id = pessoa_id
      AND p.user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS comunicacoes_update_own ON public.comunicacoes;
CREATE POLICY comunicacoes_update_own ON public.comunicacoes
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS comunicacoes_delete_own ON public.comunicacoes;
CREATE POLICY comunicacoes_delete_own ON public.comunicacoes
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Tabelas de junção (baseadas na comunicação do usuário)
DROP POLICY IF EXISTS comunicacao_personas_select_own ON public.comunicacao_personas;
CREATE POLICY comunicacao_personas_select_own ON public.comunicacao_personas
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.comunicacoes c
    WHERE c.id = comunicacao_id
      AND c.user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS comunicacao_personas_insert_own ON public.comunicacao_personas;
CREATE POLICY comunicacao_personas_insert_own ON public.comunicacao_personas
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.comunicacoes c
    WHERE c.id = comunicacao_id
      AND c.user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS comunicacao_personas_delete_own ON public.comunicacao_personas;
CREATE POLICY comunicacao_personas_delete_own ON public.comunicacao_personas
FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.comunicacoes c
    WHERE c.id = comunicacao_id
      AND c.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS comunicacao_canais_select_own ON public.comunicacao_canais;
CREATE POLICY comunicacao_canais_select_own ON public.comunicacao_canais
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.comunicacoes c
    WHERE c.id = comunicacao_id
      AND c.user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS comunicacao_canais_insert_own ON public.comunicacao_canais;
CREATE POLICY comunicacao_canais_insert_own ON public.comunicacao_canais
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.comunicacoes c
    WHERE c.id = comunicacao_id
      AND c.user_id = auth.uid()
  )
);
DROP POLICY IF EXISTS comunicacao_canais_delete_own ON public.comunicacao_canais;
CREATE POLICY comunicacao_canais_delete_own ON public.comunicacao_canais
FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.comunicacoes c
    WHERE c.id = comunicacao_id
      AND c.user_id = auth.uid()
  )
);

-- 6) Carga inicial mínima para o app funcionar (upsert para idempotência)
INSERT INTO public.categorias (nome, cor)
VALUES
  ('Captação', 'hsl(210 90% 56%)'),
  ('Relacionamento', 'hsl(142 72% 40%)'),
  ('Conversão', 'hsl(24 95% 53%)')
ON CONFLICT (nome) DO UPDATE SET cor = EXCLUDED.cor;

INSERT INTO public.instituicoes (nome, cor)
VALUES
  ('Universidade A', 'hsl(262 83% 58%)'),
  ('Universidade B', 'hsl(346 87% 43%)')
ON CONFLICT (nome) DO UPDATE SET cor = EXCLUDED.cor;

INSERT INTO public.personas (nome, cor, categoria)
VALUES
  ('Leads Frios', 'hsl(220 14% 46%)', 'disponivel'),
  ('Leads Quentes', 'hsl(12 76% 61%)', 'disponivel'),
  ('Inadimplentes', 'hsl(0 84% 60%)', 'restrita')
ON CONFLICT (nome) DO UPDATE SET cor = EXCLUDED.cor, categoria = EXCLUDED.categoria;

INSERT INTO public.canais (nome)
VALUES
  ('Email'),
  ('WhatsApp'),
  ('SMS')
ON CONFLICT (nome) DO NOTHING;