-- Adicionar campo safras (períodos) na tabela comunicacoes
ALTER TABLE comunicacoes ADD COLUMN IF NOT EXISTS safras TEXT[] DEFAULT '{}';

COMMENT ON COLUMN comunicacoes.safras IS 'Períodos letivos para a comunicação (ex: 25.2, 25.3, 25.4)';
