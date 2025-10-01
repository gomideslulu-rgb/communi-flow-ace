import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ComunicacaoForm {
  pessoa_id: string;
  nome_acao: string;
  categoria_id: string;
  instituicao_id: string;
  persona_ids: string[];
  tipo_disparo: 'Pontual' | 'Régua Fechada' | 'Régua Aberta';
  data_inicio: string;
  data_fim?: string;
  repiques: string[];
  canal_ids: string[];
  ativo: boolean;
}

export function useComunicacoes() {
  const saveComunicacao = async (formData: ComunicacaoForm) => {
    try {
      // First, insert the communication
      const { data: comunicacao, error: comunicacaoError } = await supabase
        .from('comunicacoes')
        .insert([{
          pessoa_id: formData.pessoa_id,
          nome_acao: formData.nome_acao,
          categoria_id: formData.categoria_id,
          instituicao_id: formData.instituicao_id,
          tipo_disparo: formData.tipo_disparo,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim || null,
          repiques: formData.repiques,
          ativo: formData.ativo
        }])
        .select()
        .single();

      if (comunicacaoError) throw comunicacaoError;

      // Insert persona relationships
      if (formData.persona_ids.length > 0) {
        const personaRelations = formData.persona_ids.map(persona_id => ({
          comunicacao_id: comunicacao.id,
          persona_id
        }));

        const { error: personaError } = await supabase
          .from('comunicacao_personas')
          .insert(personaRelations);

        if (personaError) throw personaError;
      }

      // Insert canal relationships
      if (formData.canal_ids.length > 0) {
        const canalRelations = formData.canal_ids.map(canal_id => ({
          comunicacao_id: comunicacao.id,
          canal_id
        }));

        const { error: canalError } = await supabase
          .from('comunicacao_canais')
          .insert(canalRelations);

        if (canalError) throw canalError;
      }

      toast({
        title: "Sucesso",
        description: "Comunicação salva com sucesso",
      });

      return comunicacao;
    } catch (error) {
      console.error('Erro ao salvar comunicação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a comunicação",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    saveComunicacao,
  };
}