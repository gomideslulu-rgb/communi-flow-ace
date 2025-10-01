-- Drop all public read policies that expose data to unauthenticated users
DROP POLICY IF EXISTS "Public can read canais" ON public.canais;
DROP POLICY IF EXISTS "Public can read categorias" ON public.categorias;
DROP POLICY IF EXISTS "Public can read comunicacao_canais" ON public.comunicacao_canais;
DROP POLICY IF EXISTS "Public can read comunicacao_personas" ON public.comunicacao_personas;
DROP POLICY IF EXISTS "Public can read comunicacoes" ON public.comunicacoes;
DROP POLICY IF EXISTS "Public can read instituicoes" ON public.instituicoes;
DROP POLICY IF EXISTS "Public can read marcos" ON public.marcos;
DROP POLICY IF EXISTS "Public can read personas" ON public.personas;
DROP POLICY IF EXISTS "Public can read pessoas" ON public.pessoas;

-- Drop the overly permissive "Authenticated users can manage" policies
DROP POLICY IF EXISTS "Authenticated users can manage canais" ON public.canais;
DROP POLICY IF EXISTS "Authenticated users can manage categorias" ON public.categorias;
DROP POLICY IF EXISTS "Authenticated users can manage comunicacao_canais" ON public.comunicacao_canais;
DROP POLICY IF EXISTS "Authenticated users can manage comunicacao_personas" ON public.comunicacao_personas;
DROP POLICY IF EXISTS "Authenticated users can manage comunicacoes" ON public.comunicacoes;
DROP POLICY IF EXISTS "Authenticated users can manage instituicoes" ON public.instituicoes;
DROP POLICY IF EXISTS "Authenticated users can manage marcos" ON public.marcos;
DROP POLICY IF EXISTS "Authenticated users can manage personas" ON public.personas;
DROP POLICY IF EXISTS "Authenticated users can manage pessoas" ON public.pessoas;

-- Create proper authentication-based policies for canais
CREATE POLICY "Authenticated users can read canais" ON public.canais
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert canais" ON public.canais
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update canais" ON public.canais
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete canais" ON public.canais
  FOR DELETE TO authenticated
  USING (true);

-- Create proper authentication-based policies for categorias
CREATE POLICY "Authenticated users can read categorias" ON public.categorias
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert categorias" ON public.categorias
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categorias" ON public.categorias
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categorias" ON public.categorias
  FOR DELETE TO authenticated
  USING (true);

-- Create proper authentication-based policies for comunicacao_canais
CREATE POLICY "Authenticated users can read comunicacao_canais" ON public.comunicacao_canais
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert comunicacao_canais" ON public.comunicacao_canais
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update comunicacao_canais" ON public.comunicacao_canais
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete comunicacao_canais" ON public.comunicacao_canais
  FOR DELETE TO authenticated
  USING (true);

-- Create proper authentication-based policies for comunicacao_personas
CREATE POLICY "Authenticated users can read comunicacao_personas" ON public.comunicacao_personas
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert comunicacao_personas" ON public.comunicacao_personas
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update comunicacao_personas" ON public.comunicacao_personas
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete comunicacao_personas" ON public.comunicacao_personas
  FOR DELETE TO authenticated
  USING (true);

-- Create proper authentication-based policies for comunicacoes
CREATE POLICY "Authenticated users can read comunicacoes" ON public.comunicacoes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert comunicacoes" ON public.comunicacoes
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update comunicacoes" ON public.comunicacoes
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete comunicacoes" ON public.comunicacoes
  FOR DELETE TO authenticated
  USING (true);

-- Create proper authentication-based policies for instituicoes
CREATE POLICY "Authenticated users can read instituicoes" ON public.instituicoes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert instituicoes" ON public.instituicoes
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update instituicoes" ON public.instituicoes
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete instituicoes" ON public.instituicoes
  FOR DELETE TO authenticated
  USING (true);

-- Create proper authentication-based policies for marcos
CREATE POLICY "Authenticated users can read marcos" ON public.marcos
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert marcos" ON public.marcos
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update marcos" ON public.marcos
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete marcos" ON public.marcos
  FOR DELETE TO authenticated
  USING (true);

-- Create proper authentication-based policies for personas
CREATE POLICY "Authenticated users can read personas" ON public.personas
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert personas" ON public.personas
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update personas" ON public.personas
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete personas" ON public.personas
  FOR DELETE TO authenticated
  USING (true);

-- Create proper authentication-based policies for pessoas
CREATE POLICY "Authenticated users can read pessoas" ON public.pessoas
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert pessoas" ON public.pessoas
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update pessoas" ON public.pessoas
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete pessoas" ON public.pessoas
  FOR DELETE TO authenticated
  USING (true);