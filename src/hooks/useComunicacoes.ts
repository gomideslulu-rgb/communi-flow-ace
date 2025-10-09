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
  safras: string[];
}

export function useComunicacoes() {
  const saveComunicacao = async (formData: ComunicacaoForm) => {
    try {
      // Calcular as datas das comunicações com base no tipo de disparo
      const comunicacoesParaInserir = [];

      if (formData.tipo_disparo === 'Régua Fechada' && formData.data_fim) {
        // Régua Fechada: comunicação no início, nos repiques e no fim
        const dataInicio = new Date(formData.data_inicio);
        const dataFim = new Date(formData.data_fim);

        // Comunicação na data de início
        comunicacoesParaInserir.push({
          pessoa_id: formData.pessoa_id,
          nome_acao: formData.nome_acao,
          categoria_id: formData.categoria_id,
          instituicao_id: formData.instituicao_id,
          tipo_disparo: formData.tipo_disparo,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim,
          repiques: formData.repiques,
          ativo: formData.ativo,
          safras: formData.safras
        });

        // Comunicações nos repiques (data início + X dias)
        formData.repiques.forEach(repique => {
          // Extrair o número do repique (ex: "d+3" -> 3)
          const dias = parseInt(repique.replace(/\D/g, ''));
          if (!isNaN(dias)) {
            const dataRepique = new Date(dataInicio);
            dataRepique.setDate(dataRepique.getDate() + dias);
            
            // Formatar a data como YYYY-MM-DD
            const dataRepiqueFormatada = dataRepique.toISOString().split('T')[0];

            comunicacoesParaInserir.push({
              pessoa_id: formData.pessoa_id,
              nome_acao: `${formData.nome_acao} (${repique})`,
              categoria_id: formData.categoria_id,
              instituicao_id: formData.instituicao_id,
              tipo_disparo: formData.tipo_disparo,
              data_inicio: dataRepiqueFormatada,
              data_fim: formData.data_fim,
              repiques: formData.repiques,
              ativo: formData.ativo,
              safras: formData.safras
            });
          }
        });

        // Comunicação na data de fim (apenas se for diferente da data de início)
        if (formData.data_fim !== formData.data_inicio) {
          comunicacoesParaInserir.push({
            pessoa_id: formData.pessoa_id,
            nome_acao: `${formData.nome_acao} (Final)`,
            categoria_id: formData.categoria_id,
            instituicao_id: formData.instituicao_id,
            tipo_disparo: formData.tipo_disparo,
            data_inicio: formData.data_fim,
            data_fim: formData.data_fim,
            repiques: formData.repiques,
            ativo: formData.ativo,
            safras: formData.safras
          });
        }
      } else if (formData.tipo_disparo === 'Régua Aberta' && formData.data_fim) {
        // Régua Aberta: comunicação para cada dia entre data início e data fim
        const dataInicio = new Date(formData.data_inicio);
        const dataFim = new Date(formData.data_fim);
        
        // Iterar sobre cada dia entre início e fim
        const currentDate = new Date(dataInicio);
        while (currentDate <= dataFim) {
          const dataFormatada = currentDate.toISOString().split('T')[0];
          
          comunicacoesParaInserir.push({
            pessoa_id: formData.pessoa_id,
            nome_acao: formData.nome_acao,
            categoria_id: formData.categoria_id,
            instituicao_id: formData.instituicao_id,
            tipo_disparo: formData.tipo_disparo,
            data_inicio: dataFormatada,
            data_fim: formData.data_fim,
            repiques: formData.repiques,
            ativo: formData.ativo,
            safras: formData.safras
          });
          
          // Avançar para o próximo dia
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        // Pontual: apenas uma comunicação
        comunicacoesParaInserir.push({
          pessoa_id: formData.pessoa_id,
          nome_acao: formData.nome_acao,
          categoria_id: formData.categoria_id,
          instituicao_id: formData.instituicao_id,
          tipo_disparo: formData.tipo_disparo,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim || null,
          repiques: formData.repiques,
          ativo: formData.ativo,
          safras: formData.safras
        });
      }

      // Inserir todas as comunicações
      const { data: comunicacoes, error: comunicacaoError } = await supabase
        .from('comunicacoes')
        .insert(comunicacoesParaInserir)
        .select();

      if (comunicacaoError) throw comunicacaoError;

      // Pegar a primeira comunicação para os relacionamentos
      const comunicacaoPrincipal = comunicacoes[0];

      // Insert persona relationships para todas as comunicações criadas
      if (formData.persona_ids.length > 0) {
        const personaRelations: any[] = [];
        comunicacoes.forEach(comunicacao => {
          formData.persona_ids.forEach(persona_id => {
            personaRelations.push({
              comunicacao_id: comunicacao.id,
              persona_id
            });
          });
        });

        const { error: personaError } = await supabase
          .from('comunicacao_personas')
          .insert(personaRelations);

        if (personaError) throw personaError;
      }

      // Insert canal relationships para todas as comunicações criadas
      if (formData.canal_ids.length > 0) {
        const canalRelations: any[] = [];
        comunicacoes.forEach(comunicacao => {
          formData.canal_ids.forEach(canal_id => {
            canalRelations.push({
              comunicacao_id: comunicacao.id,
              canal_id
            });
          });
        });

        const { error: canalError } = await supabase
          .from('comunicacao_canais')
          .insert(canalRelations);

        if (canalError) throw canalError;
      }

      const mensagem = formData.tipo_disparo === 'Régua Fechada' 
        ? `${comunicacoes.length} comunicações criadas com sucesso (início, ${formData.repiques.length} repique(s) e fim)`
        : formData.tipo_disparo === 'Régua Aberta'
        ? `${comunicacoes.length} comunicações criadas com sucesso (do início ao fim)`
        : "Comunicação salva com sucesso";

      toast({
        title: "Sucesso",
        description: mensagem,
      });

      return comunicacaoPrincipal;
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