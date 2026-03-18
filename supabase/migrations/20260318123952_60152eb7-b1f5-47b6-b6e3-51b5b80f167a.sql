
-- 1. comunicacoes: all authenticated can SELECT, anon can SELECT for visitor mode
DROP POLICY IF EXISTS "comunicacoes_select_own" ON public.comunicacoes;
CREATE POLICY "comunicacoes_select_auth" ON public.comunicacoes FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "comunicacoes_select_anon" ON public.comunicacoes FOR SELECT TO anon USING (true);

-- 2. comunicacao_canais: all authenticated can SELECT, anon can SELECT
DROP POLICY IF EXISTS "comunicacao_canais_select_own" ON public.comunicacao_canais;
CREATE POLICY "comunicacao_canais_select_auth" ON public.comunicacao_canais FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "comunicacao_canais_select_anon" ON public.comunicacao_canais FOR SELECT TO anon USING (true);

-- 3. comunicacao_personas: all authenticated can SELECT, anon can SELECT
DROP POLICY IF EXISTS "comunicacao_personas_select_own" ON public.comunicacao_personas;
CREATE POLICY "comunicacao_personas_select_auth" ON public.comunicacao_personas FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "comunicacao_personas_select_anon" ON public.comunicacao_personas FOR SELECT TO anon USING (true);

-- 4. pessoas: all authenticated can SELECT, anon can SELECT
DROP POLICY IF EXISTS "pessoas_select_own" ON public.pessoas;
CREATE POLICY "pessoas_select_auth" ON public.pessoas FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "pessoas_select_anon" ON public.pessoas FOR SELECT TO anon USING (true);

-- 5. Add anon SELECT to remaining tables for visitor mode
CREATE POLICY "categorias_select_anon" ON public.categorias FOR SELECT TO anon USING (true);
CREATE POLICY "instituicoes_select_anon" ON public.instituicoes FOR SELECT TO anon USING (true);
CREATE POLICY "campanhas_select_anon" ON public.campanhas FOR SELECT TO anon USING (true);
CREATE POLICY "canais_select_anon" ON public.canais FOR SELECT TO anon USING (true);
CREATE POLICY "personas_select_anon" ON public.personas FOR SELECT TO anon USING (true);
CREATE POLICY "marcos_select_anon" ON public.marcos FOR SELECT TO anon USING (true);
