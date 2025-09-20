import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Pessoa {
  id: string;
  nome: string;
}

export interface Categoria {
  id: string;
  nome: string;
  cor: string;
}

export interface Instituicao {
  id: string;
  nome: string;
  cor: string;
}

export interface Persona {
  id: string;
  nome: string;
  cor: string;
  categoria: 'disponivel' | 'restrita';
}

export interface Canal {
  id: string;
  nome: string;
}

export interface ComunicacaoDetalhada {
  id: string;
  nome_acao: string;
  data_inicio: string;
  data_fim: string | null;
  tipo_disparo: 'Pontual' | 'Régua Fechada' | 'Régua Aberta';
  repiques: string[];
  ativo: boolean;
  pessoa: Pessoa;
  categoria: Categoria;
  instituicao: Instituicao;
  personas: Persona[];
  canais: Canal[];
}

export function useSupabaseData() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [personasData, setPersonasData] = useState<Persona[]>([]);
  const [canais, setCanais] = useState<Canal[]>([]);
  const [comunicacoes, setComunicacoes] = useState<ComunicacaoDetalhada[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [
        pessoasResult,
        categoriasResult,
        instituicoesResult,
        personasResult,
        canaisResult,
        comunicacoesResult
      ] = await Promise.all([
        supabase.from('pessoas').select('*'),
        supabase.from('categorias').select('*'),
        supabase.from('instituicoes').select('*'),
        supabase.from('personas').select('*'),
        supabase.from('canais').select('*'),
        supabase.from('comunicacoes').select(`
          *,
          pessoa:pessoas(*),
          categoria:categorias(*),
          instituicao:instituicoes(*),
          personas:comunicacao_personas(persona:personas(*)),
          canais:comunicacao_canais(canal:canais(*))
        `)
      ]);

      if (pessoasResult.error) throw pessoasResult.error;
      if (categoriasResult.error) throw categoriasResult.error;
      if (instituicoesResult.error) throw instituicoesResult.error;
      if (personasResult.error) throw personasResult.error;
      if (canaisResult.error) throw canaisResult.error;
      if (comunicacoesResult.error) throw comunicacoesResult.error;

      setPessoas(pessoasResult.data || []);
      setCategorias(categoriasResult.data || []);
      setInstituicoes(instituicoesResult.data || []);
      setPersonasData(personasResult.data || []);
      setCanais(canaisResult.data || []);
      
      // Transform comunicações data
      const comunicacoesTransformadas = comunicacoesResult.data?.map((com: any) => ({
        id: com.id,
        nome_acao: com.nome_acao,
        data_inicio: com.data_inicio,
        data_fim: com.data_fim,
        tipo_disparo: com.tipo_disparo,
        repiques: com.repiques,
        ativo: com.ativo,
        pessoa: com.pessoa,
        categoria: com.categoria,
        instituicao: com.instituicao,
        personas: com.personas?.map((p: any) => p.persona) || [],
        canais: com.canais?.map((c: any) => c.canal) || []
      })) || [];

      setComunicacoes(comunicacoesTransformadas);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPessoa = async (nome: string) => {
    try {
      const { data, error } = await supabase
        .from('pessoas')
        .insert([{ nome }])
        .select()
        .single();

      if (error) throw error;

      setPessoas(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Pessoa adicionada com sucesso",
      });
      return data;
    } catch (error) {
      console.error('Erro ao adicionar pessoa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a pessoa",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePessoa = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pessoas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPessoas(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Sucesso",
        description: "Pessoa removida com sucesso",
      });
    } catch (error) {
      console.error('Erro ao deletar pessoa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a pessoa",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteComunicacao = async (id: string) => {
    try {
      const { error } = await supabase
        .from('comunicacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setComunicacoes(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Sucesso",
        description: "Comunicação removida com sucesso",
      });
    } catch (error) {
      console.error('Erro ao deletar comunicação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a comunicação",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return {
    pessoas,
    categorias,
    instituicoes,
    personas: personasData,
    canais,
    comunicacoes,
    loading,
    addPessoa,
    deletePessoa,
    deleteComunicacao,
    refetch: fetchAllData,
  };
}