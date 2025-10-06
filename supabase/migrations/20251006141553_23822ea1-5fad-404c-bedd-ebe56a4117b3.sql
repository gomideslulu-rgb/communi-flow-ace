-- 1) Create roles enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END$$;

-- 2) Create user_roles table for assigning roles to users
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own roles; admins can read all via has_role
DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 3) Security definer helper to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- 4) Replace overly-permissive policies across business tables
-- Helper: drop existing permissive policies that allow everything
-- canais
DROP POLICY IF EXISTS "Authenticated users can read canais" ON public.canais;
DROP POLICY IF EXISTS "Authenticated users can insert canais" ON public.canais;
DROP POLICY IF EXISTS "Authenticated users can update canais" ON public.canais;
DROP POLICY IF EXISTS "Authenticated users can delete canais" ON public.canais;

-- categorias
DROP POLICY IF EXISTS "Authenticated users can read categorias" ON public.categorias;
DROP POLICY IF EXISTS "Authenticated users can insert categorias" ON public.categorias;
DROP POLICY IF EXISTS "Authenticated users can update categorias" ON public.categorias;
DROP POLICY IF EXISTS "Authenticated users can delete categorias" ON public.categorias;

-- comunicacao_canais
DROP POLICY IF EXISTS "Authenticated users can read comunicacao_canais" ON public.comunicacao_canais;
DROP POLICY IF EXISTS "Authenticated users can insert comunicacao_canais" ON public.comunicacao_canais;
DROP POLICY IF EXISTS "Authenticated users can update comunicacao_canais" ON public.comunicacao_canais;
DROP POLICY IF EXISTS "Authenticated users can delete comunicacao_canais" ON public.comunicacao_canais;

-- comunicacao_personas
DROP POLICY IF EXISTS "Authenticated users can read comunicacao_personas" ON public.comunicacao_personas;
DROP POLICY IF EXISTS "Authenticated users can insert comunicacao_personas" ON public.comunicacao_personas;
DROP POLICY IF EXISTS "Authenticated users can update comunicacao_personas" ON public.comunicacao_personas;
DROP POLICY IF EXISTS "Authenticated users can delete comunicacao_personas" ON public.comunicacao_personas;

-- comunicacoes
DROP POLICY IF EXISTS "Authenticated users can read comunicacoes" ON public.comunicacoes;
DROP POLICY IF EXISTS "Authenticated users can insert comunicacoes" ON public.comunicacoes;
DROP POLICY IF EXISTS "Authenticated users can update comunicacoes" ON public.comunicacoes;
DROP POLICY IF EXISTS "Authenticated users can delete comunicacoes" ON public.comunicacoes;

-- instituicoes
DROP POLICY IF EXISTS "Authenticated users can read instituicoes" ON public.instituicoes;
DROP POLICY IF EXISTS "Authenticated users can insert instituicoes" ON public.instituicoes;
DROP POLICY IF EXISTS "Authenticated users can update instituicoes" ON public.instituicoes;
DROP POLICY IF EXISTS "Authenticated users can delete instituicoes" ON public.instituicoes;

-- marcos
DROP POLICY IF EXISTS "Authenticated users can read marcos" ON public.marcos;
DROP POLICY IF EXISTS "Authenticated users can insert marcos" ON public.marcos;
DROP POLICY IF EXISTS "Authenticated users can update marcos" ON public.marcos;
DROP POLICY IF EXISTS "Authenticated users can delete marcos" ON public.marcos;

-- personas
DROP POLICY IF EXISTS "Authenticated users can read personas" ON public.personas;
DROP POLICY IF EXISTS "Authenticated users can insert personas" ON public.personas;
DROP POLICY IF EXISTS "Authenticated users can update personas" ON public.personas;
DROP POLICY IF EXISTS "Authenticated users can delete personas" ON public.personas;

-- pessoas
DROP POLICY IF EXISTS "Authenticated users can read pessoas" ON public.pessoas;
DROP POLICY IF EXISTS "Authenticated users can insert pessoas" ON public.pessoas;
DROP POLICY IF EXISTS "Authenticated users can update pessoas" ON public.pessoas;
DROP POLICY IF EXISTS "Authenticated users can delete pessoas" ON public.pessoas;

-- 5) New restrictive policies: public read, admin-only writes
-- canais
CREATE POLICY "Public can read canais"
ON public.canais
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Only admins can insert into canais"
ON public.canais
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update canais"
ON public.canais
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete from canais"
ON public.canais
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- categorias
CREATE POLICY "Public can read categorias"
ON public.categorias
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Only admins can insert into categorias"
ON public.categorias
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update categorias"
ON public.categorias
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete from categorias"
ON public.categorias
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- comunicacao_canais
CREATE POLICY "Public can read comunicacao_canais"
ON public.comunicacao_canais
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Only admins can insert into comunicacao_canais"
ON public.comunicacao_canais
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update comunicacao_canais"
ON public.comunicacao_canais
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete from comunicacao_canais"
ON public.comunicacao_canais
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- comunicacao_personas
CREATE POLICY "Public can read comunicacao_personas"
ON public.comunicacao_personas
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Only admins can insert into comunicacao_personas"
ON public.comunicacao_personas
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update comunicacao_personas"
ON public.comunicacao_personas
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete from comunicacao_personas"
ON public.comunicacao_personas
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- comunicacoes
CREATE POLICY "Public can read comunicacoes"
ON public.comunicacoes
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Only admins can insert into comunicacoes"
ON public.comunicacoes
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update comunicacoes"
ON public.comunicacoes
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete from comunicacoes"
ON public.comunicacoes
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- instituicoes
CREATE POLICY "Public can read instituicoes"
ON public.instituicoes
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Only admins can insert into instituicoes"
ON public.instituicoes
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update instituicoes"
ON public.instituicoes
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete from instituicoes"
ON public.instituicoes
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- marcos
CREATE POLICY "Public can read marcos"
ON public.marcos
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Only admins can insert into marcos"
ON public.marcos
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update marcos"
ON public.marcos
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete from marcos"
ON public.marcos
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- personas
CREATE POLICY "Public can read personas"
ON public.personas
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Only admins can insert into personas"
ON public.personas
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update personas"
ON public.personas
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete from personas"
ON public.personas
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- pessoas
CREATE POLICY "Public can read pessoas"
ON public.pessoas
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Only admins can insert into pessoas"
ON public.pessoas
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update pessoas"
ON public.pessoas
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete from pessoas"
ON public.pessoas
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));