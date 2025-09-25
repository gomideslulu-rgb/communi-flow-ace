import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, X, AlertTriangle, Info } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { ComunicacaoDetalhada } from '@/hooks/useSupabaseData';
import { useComunicacoes, type ComunicacaoForm } from '@/hooks/useComunicacoes';

interface CommunicationFormProps {
  supabaseData: {
    pessoas: any[];
    categorias: any[];
    instituicoes: any[];
    personas: any[];
    canais: any[];
    comunicacoes: ComunicacaoDetalhada[];
    loading: boolean;
    addPessoa: (nome: string) => Promise<any>;
    deletePessoa: (id: string) => Promise<void>;
    refetch: () => Promise<void>;
  };
}

export function CommunicationForm({ supabaseData }: CommunicationFormProps) {
  const { toast } = useToast();
  const { saveComunicacao } = useComunicacoes();
  const [formData, setFormData] = useState<ComunicacaoForm>({
    pessoa_id: '',
    nome_acao: '',
    categoria_id: '',
    instituicao_id: '',
    persona_ids: [],
    tipo_disparo: 'Pontual',
    data_inicio: '',
    data_fim: '',
    canal_ids: [],
    repiques: [],
    ativo: true
  });

  const [customRepique, setCustomRepique] = useState('');
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [showPersonManagement, setShowPersonManagement] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pessoa_id || !formData.categoria_id || !formData.instituicao_id || !formData.persona_ids?.length) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Verificar conflitos
    const conflictInfo = checkDateConflicts(formData.data_inicio);
    
    if (conflictInfo.temConflito) {
      setConflictDialogOpen(true);
      return;
    }

    try {
      await saveComunicacao(formData);
      await supabaseData.refetch();
      
      // Reset form
      setFormData({
        pessoa_id: '',
        nome_acao: '',
        categoria_id: '',
        instituicao_id: '',
        persona_ids: [],
        tipo_disparo: 'Pontual',
        data_inicio: '',
        data_fim: '',
        canal_ids: [],
        repiques: [],
        ativo: true
      });
    } catch (error) {
      // Error already handled in hook
    }
  };

  const saveWithConflict = async () => {
    try {
      await saveComunicacao(formData);
      await supabaseData.refetch();
      setConflictDialogOpen(false);
      
      // Reset form
      setFormData({
        pessoa_id: '',
        nome_acao: '',
        categoria_id: '',
        instituicao_id: '',
        persona_ids: [],
        tipo_disparo: 'Pontual',
        data_inicio: '',
        data_fim: '',
        canal_ids: [],
        repiques: [],
        ativo: true
      });
    } catch (error) {
      // Error already handled in hook
    }
  };

  // Função para verificar conflitos de datas
  const checkDateConflicts = (targetDate: string) => {
    if (!targetDate) return { temConflito: false, marcos: [], comunicacoes: [], recomendacao: '' };

    // Verificar marcos acadêmicos que coincide com a data
    const marcos = []; // Em implementação real, buscar marcos do Supabase
    const comunicacoes = supabaseData.comunicacoes.filter(
      comm => comm.data_inicio === targetDate && comm.ativo
    );

    const temConflito = false; // Lógica de conflito seria implementada aqui
    const recomendacao = '';

    return {
      temConflito,
      marcos,
      comunicacoes,
      recomendacao
    };
  };

  const addRepique = () => {
    if (customRepique) {
      setFormData({
        ...formData,
        repiques: [...formData.repiques, customRepique]
      });
      setCustomRepique('');
    }
  };

  const removeRepique = (index: number) => {
    const newRepiques = formData.repiques.filter((_, i) => i !== index);
    setFormData({ ...formData, repiques: newRepiques });
  };

  const handleChannelChange = (canalId: string, checked: boolean) => {
    const updatedCanais = checked
      ? [...formData.canal_ids, canalId]
      : formData.canal_ids.filter(id => id !== canalId);
    
    setFormData({ ...formData, canal_ids: updatedCanais });
  };

  const handlePersonaChange = (personaId: string, checked: boolean) => {
    const updatedPersonas = checked
      ? [...formData.persona_ids, personaId]
      : formData.persona_ids.filter(id => id !== personaId);
    
    setFormData({ ...formData, persona_ids: updatedPersonas });
  };

  const addPerson = async () => {
    if (newPersonName.trim()) {
      try {
        await supabaseData.addPessoa(newPersonName.trim());
        setNewPersonName('');
        setShowPersonManagement(false);
      } catch (error) {
        // Error already handled in hook
      }
    }
  };

  const removePerson = async (pessoaId: string) => {
    try {
      await supabaseData.deletePessoa(pessoaId);
    } catch (error) {
      // Error already handled in hook
    }
  };

  if (supabaseData.loading) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>;
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Nova Comunicação</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pessoa">Pessoa *</Label>
                  <div className="flex gap-2">
                    <Select value={formData.pessoa_id} onValueChange={(value) => setFormData({...formData, pessoa_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar pessoa" />
                      </SelectTrigger>
                      <SelectContent>
                        {supabaseData.pessoas.map(pessoa => (
                          <SelectItem key={pessoa.id} value={pessoa.id}>
                            {pessoa.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPersonManagement(!showPersonManagement)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {showPersonManagement && (
                    <div className="space-y-2 p-4 border rounded">
                      <div className="flex gap-2">
                        <Input
                          value={newPersonName}
                          onChange={(e) => setNewPersonName(e.target.value)}
                          placeholder="Nova pessoa"
                        />
                        <Button type="button" onClick={addPerson} size="sm">
                          Adicionar
                        </Button>
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {supabaseData.pessoas.map(pessoa => (
                          <div key={pessoa.id} className="flex justify-between items-center p-2 border rounded">
                            <span>{pessoa.nome}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removePerson(pessoa.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome_acao">Nome da Ação</Label>
                  <Input
                    id="nome_acao"
                    value={formData.nome_acao}
                    onChange={(e) => setFormData({...formData, nome_acao: e.target.value})}
                    placeholder="Digite o nome da ação"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select value={formData.categoria_id} onValueChange={(value) => setFormData({...formData, categoria_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {supabaseData.categorias.map(categoria => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instituicao">Instituição *</Label>
                  <Select value={formData.instituicao_id} onValueChange={(value) => setFormData({...formData, instituicao_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar instituição" />
                    </SelectTrigger>
                    <SelectContent>
                      {supabaseData.instituicoes.map(instituicao => (
                        <SelectItem key={instituicao.id} value={instituicao.id}>
                          {instituicao.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Persona *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {supabaseData.personas.map(persona => (
                      <div key={persona.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={persona.id}
                          checked={formData.persona_ids.includes(persona.id)}
                          onCheckedChange={(checked) => handlePersonaChange(persona.id, !!checked)}
                        />
                        <Label htmlFor={persona.id} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: persona.cor }}
                          />
                          {persona.nome}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo_disparo">Tipo de Disparo</Label>
                    <Select value={formData.tipo_disparo} onValueChange={(value) => setFormData({...formData, tipo_disparo: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pontual">Pontual</SelectItem>
                        <SelectItem value="Régua Fechada">Régua Fechada</SelectItem>
                        <SelectItem value="Régua Aberta">Régua Aberta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_inicio">Data de Início *</Label>
                    <Input
                      id="data_inicio"
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                    />
                  </div>

                  {(formData.tipo_disparo === 'Régua Fechada' || formData.tipo_disparo === 'Régua Aberta') && (
                    <div className="space-y-2">
                      <Label htmlFor="data_fim">Data de Fim</Label>
                      <Input
                        id="data_fim"
                        type="date"
                        value={formData.data_fim}
                        onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                {formData.tipo_disparo === 'Régua Fechada' && (
                  <div className="space-y-2">
                    <Label>Repiques</Label>
                    <div className="flex gap-2">
                      <Input
                        value={customRepique}
                        onChange={(e) => setCustomRepique(e.target.value)}
                        placeholder="Ex: d+3, d+7, d+15"
                      />
                      <Button type="button" onClick={addRepique} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.repiques.map((repique, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {repique}
                          <button
                            type="button"
                            onClick={() => removeRepique(index)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Canais de Comunicação</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {supabaseData.canais.map(canal => (
                      <div key={canal.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={canal.id}
                          checked={formData.canal_ids.includes(canal.id)}
                          onCheckedChange={(checked) => handleChannelChange(canal.id, !!checked)}
                        />
                        <Label htmlFor={canal.id}>{canal.nome}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="submit" className="px-8">
                  Salvar Comunicação
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <AlertDialog open={conflictDialogOpen} onOpenChange={setConflictDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Conflito Detectado
              </AlertDialogTitle>
              <AlertDialogDescription>
                Foi detectado um conflito com marcos acadêmicos ou outras comunicações na data selecionada. Deseja continuar mesmo assim?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={saveWithConflict}>
                Salvar Mesmo Assim
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}