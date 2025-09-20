import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Marco {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim: string;
  safra: string;
  modalidade: 'Presencial' | 'EAD' | 'Híbrido';
  maturidade: 'Calouros' | 'Veteranos' | 'Ambos';
  cor: string;
}

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

      setMarcos(data || []);
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

      setMarcos(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Marco acadêmico adicionado com sucesso",
      });
      return data;
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