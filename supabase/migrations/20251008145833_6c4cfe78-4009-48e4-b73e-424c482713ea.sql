-- Ajustar políticas RLS para permitir usuários autenticados
-- Tabela: comunicacoes
DROP POLICY IF EXISTS "Only admins can insert into comunicacoes" ON comunicacoes;
DROP POLICY IF EXISTS "Only admins can update comunicacoes" ON comunicacoes;
DROP POLICY IF EXISTS "Only admins can delete from comunicacoes" ON comunicacoes;

CREATE POLICY "Authenticated users can insert comunicacoes"
  ON comunicacoes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update comunicacoes"
  ON comunicacoes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete comunicacoes"
  ON comunicacoes
  FOR DELETE
  TO authenticated
  USING (true);

-- Tabela: comunicacao_personas
DROP POLICY IF EXISTS "Only admins can insert into comunicacao_personas" ON comunicacao_personas;
DROP POLICY IF EXISTS "Only admins can update comunicacao_personas" ON comunicacao_personas;
DROP POLICY IF EXISTS "Only admins can delete from comunicacao_personas" ON comunicacao_personas;

CREATE POLICY "Authenticated users can insert comunicacao_personas"
  ON comunicacao_personas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update comunicacao_personas"
  ON comunicacao_personas
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete comunicacao_personas"
  ON comunicacao_personas
  FOR DELETE
  TO authenticated
  USING (true);

-- Tabela: comunicacao_canais
DROP POLICY IF EXISTS "Only admins can insert into comunicacao_canais" ON comunicacao_canais;
DROP POLICY IF EXISTS "Only admins can update comunicacao_canais" ON comunicacao_canais;
DROP POLICY IF EXISTS "Only admins can delete from comunicacao_canais" ON comunicacao_canais;

CREATE POLICY "Authenticated users can insert comunicacao_canais"
  ON comunicacao_canais
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update comunicacao_canais"
  ON comunicacao_canais
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete comunicacao_canais"
  ON comunicacao_canais
  FOR DELETE
  TO authenticated
  USING (true);