-- Endurecer políticas globais para evitar políticas permissivas
-- e tipar campos de marcos com enums para alinhar com o frontend.

-- 1) Enums de marcos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'modalidade_enum' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.modalidade_enum AS ENUM ('Presencial', 'EAD', 'Híbrido');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'maturidade_enum' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.maturidade_enum AS ENUM ('Calouros', 'Veteranos', 'Ambos');
  END IF;
END $$;

-- 2) Converter colunas existentes para enum (com fallback seguro)
ALTER TABLE public.marcos
  ALTER COLUMN modalidade TYPE public.modalidade_enum
  USING (
    CASE
      WHEN modalidade IN ('Presencial', 'EAD', 'Híbrido') THEN modalidade::public.modalidade_enum
      ELSE 'Presencial'::public.modalidade_enum
    END
  );

ALTER TABLE public.marcos
  ALTER COLUMN maturidade TYPE public.maturidade_enum
  USING (
    CASE
      WHEN maturidade IN ('Calouros', 'Veteranos', 'Ambos') THEN maturidade::public.maturidade_enum
      ELSE 'Ambos'::public.maturidade_enum
    END
  );

-- 3) Políticas globais menos permissivas
-- categorias
DROP POLICY IF EXISTS categorias_select_auth ON public.categorias;
CREATE POLICY categorias_select_auth ON public.categorias
FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS categorias_insert_auth ON public.categorias;
CREATE POLICY categorias_insert_auth ON public.categorias
FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS categorias_update_auth ON public.categorias;
CREATE POLICY categorias_update_auth ON public.categorias
FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS categorias_delete_auth ON public.categorias;
CREATE POLICY categorias_delete_auth ON public.categorias
FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- instituicoes
DROP POLICY IF EXISTS instituicoes_select_auth ON public.instituicoes;
CREATE POLICY instituicoes_select_auth ON public.instituicoes
FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS instituicoes_insert_auth ON public.instituicoes;
CREATE POLICY instituicoes_insert_auth ON public.instituicoes
FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS instituicoes_update_auth ON public.instituicoes;
CREATE POLICY instituicoes_update_auth ON public.instituicoes
FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS instituicoes_delete_auth ON public.instituicoes;
CREATE POLICY instituicoes_delete_auth ON public.instituicoes
FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- personas
DROP POLICY IF EXISTS personas_select_auth ON public.personas;
CREATE POLICY personas_select_auth ON public.personas
FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS personas_insert_auth ON public.personas;
CREATE POLICY personas_insert_auth ON public.personas
FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS personas_update_auth ON public.personas;
CREATE POLICY personas_update_auth ON public.personas
FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS personas_delete_auth ON public.personas;
CREATE POLICY personas_delete_auth ON public.personas
FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- canais
DROP POLICY IF EXISTS canais_select_auth ON public.canais;
CREATE POLICY canais_select_auth ON public.canais
FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS canais_insert_auth ON public.canais;
CREATE POLICY canais_insert_auth ON public.canais
FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS canais_update_auth ON public.canais;
CREATE POLICY canais_update_auth ON public.canais
FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS canais_delete_auth ON public.canais;
CREATE POLICY canais_delete_auth ON public.canais
FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- marcos
DROP POLICY IF EXISTS marcos_select_auth ON public.marcos;
CREATE POLICY marcos_select_auth ON public.marcos
FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS marcos_insert_auth ON public.marcos;
CREATE POLICY marcos_insert_auth ON public.marcos
FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS marcos_update_auth ON public.marcos;
CREATE POLICY marcos_update_auth ON public.marcos
FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS marcos_delete_auth ON public.marcos;
CREATE POLICY marcos_delete_auth ON public.marcos
FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);