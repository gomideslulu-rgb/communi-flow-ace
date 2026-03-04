import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type Modalidade = 'Presencial' | 'EAD' | 'Híbrido';
type Maturidade = 'Calouros' | 'Veteranos' | 'Ambos';

export interface Marco {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim: string;
  safra: string;
  modalidade: Modalidade;
  maturidade: Maturidade;
  cor: string;
}

const MODALIDADES: Modalidade[] = ['Presencial', 'EAD', 'Híbrido'];
const MATURIDADES: Maturidade[] = ['Calouros', 'Veteranos', 'Ambos'];

const normalizeMarco = (value: any): Marco => ({
  id: value.id,
  nome: value.nome,
  data_inicio: value.data_inicio,
  data_fim: value.data_fim,
  safra: value.safra,
  modalidade: MODALIDADES.includes(value.modalidade as Modalidade)
    ? (value.modalidade as Modalidade)
    : 'Presencial',
  maturidade: MATURIDADES.includes(value.maturidade as Maturidade)
    ? (value.maturidade as Maturidade)
    : 'Ambos',
  cor: value.cor,
});

export function useMarcos() {
  const [marcos, setMarcos] = useState<Marco[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMarcos = async () => {
    try {
      const { data, error } = await supabase
        .from('marcos')
        .select('*')
        .order('data_inicio');

      if (error) throw error;

      setMarcos((data || []).map(normalizeMarco));
    } catch (error) {
      console.error('Erro ao buscar marcos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os marcos acadêmicos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMarco = async (marco: Omit<Marco, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('marcos')
        .insert([marco])
        .select()
        .single();

      if (error) throw error;

      const marcoNormalizado = normalizeMarco(data);
      setMarcos(prev => [...prev, marcoNormalizado]);
      toast({
        title: "Sucesso",
        description: "Marco acadêmico adicionado com sucesso",
      });
      return marcoNormalizado;
    } catch (error) {
      console.error('Erro ao adicionar marco:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o marco acadêmico",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteMarco = async (id: string) => {
    try {
      const { error } = await supabase
        .from('marcos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMarcos(prev => prev.filter(m => m.id !== id));
      toast({
        title: "Sucesso",
        description: "Marco acadêmico removido com sucesso",
      });
    } catch (error) {
      console.error('Erro ao deletar marco:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o marco acadêmico",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchMarcos();
  }, []);

  return {
    marcos,
    loading,
    addMarco,
    deleteMarco,
    refetch: fetchMarcos,
  };
}