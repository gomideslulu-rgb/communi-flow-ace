-- Update RLS policies to allow read access for anonymous users (guests)

-- Update marcos table policies
DROP POLICY IF EXISTS "All authenticated users can manage marcos" ON public.marcos;

CREATE POLICY "Authenticated users can manage marcos"
ON public.marcos
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Anonymous users can read marcos"
ON public.marcos
FOR SELECT
TO anonymous
USING (true);

-- Update comunicacoes table policies  
DROP POLICY IF EXISTS "All authenticated users can manage comunicacoes" ON public.comunicacoes;

CREATE POLICY "Authenticated users can manage comunicacoes"
ON public.comunicacoes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Anonymous users can read comunicacoes"
ON public.comunicacoes
FOR SELECT
TO anonymous
USING (true);

-- Update categorias table policies
DROP POLICY IF EXISTS "All authenticated users can manage categorias" ON public.categorias;

CREATE POLICY "Authenticated users can manage categorias"
ON public.categorias
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Anonymous users can read categorias"
ON public.categorias
FOR SELECT
TO anonymous
USING (true);

-- Update instituicoes table policies
DROP POLICY IF EXISTS "All authenticated users can manage instituicoes" ON public.instituicoes;

CREATE POLICY "Authenticated users can manage instituicoes"
ON public.instituicoes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Anonymous users can read instituicoes"
ON public.instituicoes
FOR SELECT
TO anonymous
USING (true);

-- Update personas table policies
DROP POLICY IF EXISTS "All authenticated users can manage personas" ON public.personas;

CREATE POLICY "Authenticated users can manage personas"
ON public.personas
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Anonymous users can read personas"
ON public.personas
FOR SELECT
TO anonymous
USING (true);

-- Update canais table policies
DROP POLICY IF EXISTS "All authenticated users can manage canais" ON public.canais;

CREATE POLICY "Authenticated users can manage canais"
ON public.canais
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Anonymous users can read canais"
ON public.canais
FOR SELECT
TO anonymous
USING (true);

-- Update pessoas table policies
DROP POLICY IF EXISTS "All authenticated users can manage pessoas" ON public.pessoas;

CREATE POLICY "Authenticated users can manage pessoas"
ON public.pessoas
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Anonymous users can read pessoas"
ON public.pessoas
FOR SELECT
TO anonymous
USING (true);

-- Update comunicacao_personas table policies
DROP POLICY IF EXISTS "All authenticated users can manage comunicacao_personas" ON public.comunicacao_personas;

CREATE POLICY "Authenticated users can manage comunicacao_personas"
ON public.comunicacao_personas
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Anonymous users can read comunicacao_personas"
ON public.comunicacao_personas
FOR SELECT
TO anonymous
USING (true);

-- Update comunicacao_canais table policies
DROP POLICY IF EXISTS "All authenticated users can manage comunicacao_canais" ON public.comunicacao_canais;

CREATE POLICY "Authenticated users can manage comunicacao_canais"
ON public.comunicacao_canais
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Anonymous users can read comunicacao_canais"
ON public.comunicacao_canais
FOR SELECT
TO anonymous
USING (true);