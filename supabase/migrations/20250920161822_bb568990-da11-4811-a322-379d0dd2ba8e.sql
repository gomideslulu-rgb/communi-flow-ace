-- Create enums for better data consistency
CREATE TYPE modalidade_tipo AS ENUM ('Presencial', 'EAD', 'Híbrido');
CREATE TYPE maturidade_tipo AS ENUM ('Calouros', 'Veteranos', 'Ambos');
CREATE TYPE categoria_persona AS ENUM ('disponivel', 'restrita');
CREATE TYPE tipo_disparo AS ENUM ('Pontual', 'Régua Fechada', 'Régua Aberta');

-- Create instituicoes table
CREATE TABLE public.instituicoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cor TEXT NOT NULL DEFAULT '#1e40af',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create personas table
CREATE TABLE public.personas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cor TEXT NOT NULL DEFAULT '#22c55e',
  categoria categoria_persona NOT NULL DEFAULT 'disponivel',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marcos table
CREATE TABLE public.marcos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  safra TEXT NOT NULL,
  modalidade modalidade_tipo NOT NULL DEFAULT 'Presencial',
  maturidade maturidade_tipo NOT NULL DEFAULT 'Ambos',
  cor TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pessoas table
CREATE TABLE public.pessoas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categorias table
CREATE TABLE public.categorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cor TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create canais table
CREATE TABLE public.canais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comunicacoes table
CREATE TABLE public.comunicacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  nome_acao TEXT NOT NULL,
  categoria_id UUID NOT NULL REFERENCES public.categorias(id) ON DELETE CASCADE,
  instituicao_id UUID NOT NULL REFERENCES public.instituicoes(id) ON DELETE CASCADE,
  tipo_disparo tipo_disparo NOT NULL DEFAULT 'Pontual',
  data_inicio DATE NOT NULL,
  data_fim DATE NULL,
  repiques TEXT[] DEFAULT '{}',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Junction table for comunicacoes and personas (many-to-many)
CREATE TABLE public.comunicacao_personas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comunicacao_id UUID NOT NULL REFERENCES public.comunicacoes(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
  UNIQUE(comunicacao_id, persona_id)
);

-- Junction table for comunicacoes and canais (many-to-many)
CREATE TABLE public.comunicacao_canais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comunicacao_id UUID NOT NULL REFERENCES public.comunicacoes(id) ON DELETE CASCADE,
  canal_id UUID NOT NULL REFERENCES public.canais(id) ON DELETE CASCADE,
  UNIQUE(comunicacao_id, canal_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.instituicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marcos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicacao_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicacao_canais ENABLE ROW LEVEL SECURITY;

-- Create policies for all authenticated users to read and write
CREATE POLICY "All authenticated users can manage instituicoes" ON public.instituicoes
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "All authenticated users can manage personas" ON public.personas
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "All authenticated users can manage marcos" ON public.marcos
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "All authenticated users can manage pessoas" ON public.pessoas
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "All authenticated users can manage categorias" ON public.categorias
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "All authenticated users can manage canais" ON public.canais
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "All authenticated users can manage comunicacoes" ON public.comunicacoes
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "All authenticated users can manage comunicacao_personas" ON public.comunicacao_personas
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "All authenticated users can manage comunicacao_canais" ON public.comunicacao_canais
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_instituicoes_updated_at BEFORE UPDATE ON public.instituicoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_personas_updated_at BEFORE UPDATE ON public.personas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_marcos_updated_at BEFORE UPDATE ON public.marcos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pessoas_updated_at BEFORE UPDATE ON public.pessoas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON public.categorias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_canais_updated_at BEFORE UPDATE ON public.canais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comunicacoes_updated_at BEFORE UPDATE ON public.comunicacoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial data
-- Insert instituições
INSERT INTO public.instituicoes (nome, cor) VALUES 
('UNINASSAU', '#1e40af'),
('UNIFACS', '#dc2626'),
('UNAMA', '#059669'),
('FAMETRO', '#7c3aed');

-- Insert personas
INSERT INTO public.personas (nome, cor, categoria) VALUES 
('Interessado', '#22c55e', 'disponivel'),
('Engajado', '#3b82f6', 'disponivel'),
('Ativo', '#8b5cf6', 'disponivel'),
('Focado', '#06b6d4', 'disponivel'),
('Dedicado', '#10b981', 'disponivel'),
('Ausente', '#ef4444', 'restrita'),
('Sem Foco', '#f59e0b', 'restrita'),
('Parado', '#6b7280', 'restrita'),
('Evolução', '#ec4899', 'restrita'),
('Base Externa', '#14b8a6', 'disponivel');

-- Insert categorias
INSERT INTO public.categorias (nome, cor) VALUES 
('Matrícula', '#3b82f6'),
('Acadêmica', '#10b981'),
('Financeira', '#f59e0b'),
('Marketing', '#ef4444'),
('Vestibular', '#8b5cf6'),
('Eventos', '#06b6d4');

-- Insert pessoas
INSERT INTO public.pessoas (nome) VALUES 
('Ana Silva'),
('Bruno Santos'),
('Carla Oliveira'),
('Diego Ferreira'),
('Elena Costa'),
('Felipe Rocha');

-- Insert canais
INSERT INTO public.canais (nome) VALUES 
('E-mail'),
('WhatsApp'),
('SMS'),
('Push Notification'),
('Redes Sociais'),
('Portal do Aluno'),
('Telefone'),
('Aplicativo');

-- Insert marcos acadêmicos
INSERT INTO public.marcos (nome, data_inicio, data_fim, safra, modalidade, maturidade, cor) VALUES 
('Início das Aulas', '2025-09-01', '2025-09-07', '25.2', 'Presencial', 'Ambos', '#3b82f6'),
('PROVA AV', '2025-09-15', '2025-09-20', '25.2', 'Presencial', 'Ambos', '#ef4444'),
('PROVA AVS', '2025-09-25', '2025-09-30', '25.2', 'Presencial', 'Ambos', '#dc2626'),
('Matrícula', '2025-10-01', '2025-10-15', '25.2', 'Presencial', 'Calouros', '#10b981');