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
      const comunicacoesToSave = [];

      if (formData.tipo_disparo === 'Régua Fechada') {
        // Para Régua Fechada: registrar na data início
        comunicacoesToSave.push({
          pessoa_id: formData.pessoa_id,
          nome_acao: formData.nome_acao,
          categoria_id: formData.categoria_id,
          instituicao_id: formData.instituicao_id,
          tipo_disparo: formData.tipo_disparo,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim,
          repiques: formData.repiques,
          ativo: formData.ativo
        });

        // Se tiver data fim, registrar também na data fim
        if (formData.data_fim) {
          comunicacoesToSave.push({
            pessoa_id: formData.pessoa_id,
            nome_acao: `${formData.nome_acao} (Fim)`,
            categoria_id: formData.categoria_id,
            instituicao_id: formData.instituicao_id,
            tipo_disparo: formData.tipo_disparo,
            data_inicio: formData.data_fim,
            data_fim: formData.data_fim,
            repiques: [],
            ativo: formData.ativo
          });
        }

        // Para cada repique, calcular a data e adicionar comunicação
        if (formData.repiques.length > 0 && formData.data_inicio) {
          const dataInicio = new Date(formData.data_inicio);
          
          formData.repiques.forEach(repique => {
            // Extrair o número de dias do repique (ex: "d+3" = 3 dias)
            const match = repique.match(/d\+(\d+)/);
            if (match) {
              const dias = parseInt(match[1]);
              const dataRepique = new Date(dataInicio);
              dataRepique.setDate(dataRepique.getDate() + dias);
              
              comunicacoesToSave.push({
                pessoa_id: formData.pessoa_id,
                nome_acao: `${formData.nome_acao} (${repique})`,
                categoria_id: formData.categoria_id,
                instituicao_id: formData.instituicao_id,
                tipo_disparo: formData.tipo_disparo,
                data_inicio: dataRepique.toISOString().split('T')[0],
                data_fim: null,
                repiques: [],
                ativo: formData.ativo
              });
            }
          });
        }
      } else {
        // Para Pontual e Régua Aberta: funcionamento normal
        comunicacoesToSave.push({
          pessoa_id: formData.pessoa_id,
          nome_acao: formData.nome_acao,
          categoria_id: formData.categoria_id,
          instituicao_id: formData.instituicao_id,
          tipo_disparo: formData.tipo_disparo,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim,
          repiques: formData.repiques,
          ativo: formData.ativo
        });
      }

      // Salvar todas as comunicações
      const { data: comunicacoes, error: comunicacaoError } = await supabase
        .from('comunicacoes')
        .insert(comunicacoesToSave)
        .select();

      if (comunicacaoError) throw comunicacaoError;

      // Para cada comunicação salva, inserir relacionamentos com personas e canais
      for (const comunicacao of comunicacoes) {
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
      }

      toast({
        title: "Sucesso",
        description: `${comunicacoes.length} comunicação(ões) salva(s) com sucesso`,
      });

      return comunicacoes;
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