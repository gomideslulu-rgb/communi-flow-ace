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
import { mockData } from '@/data/mockData';
import { Comunicacao } from '@/types/roadmap';
import { useToast } from '@/hooks/use-toast';

export function CommunicationForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Comunicacao>>({
    pessoa: '',
    nomeAcao: '',
    categoria: '',
    instituicao: '',
    persona: [],
    tipoDisparo: 'Pontual',
    dataInicio: '',
    dataFim: '',
    canais: [],
    repiques: [],
    ativo: true
  });

  const [customRepique, setCustomRepique] = useState('');
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [showPersonManagement, setShowPersonManagement] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pessoa || !formData.categoria || !formData.instituicao || !formData.persona?.length) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Verificar conflitos
    const conflictInfo = checkDateConflicts(formData.dataInicio!);
    
    if (conflictInfo.temConflito) {
      setConflictDialogOpen(true);
      return;
    }

    saveCommuication();
  };

  const saveCommuication = () => {
    // Verificar se já existe comunicação no mesmo dia para a mesma pessoa
    const comunicacoesNoMesmoDia = mockData.comunicacoes.filter(comm => 
      comm.dataInicio === formData.dataInicio && 
      comm.pessoa === formData.pessoa &&
      comm.ativo
    );

    // Adicionar a nova comunicação (em uma implementação real, seria salvo no backend)
    const novaComunicacao: Comunicacao = {
      id: Date.now().toString(),
      pessoa: formData.pessoa!,
      nomeAcao: formData.nomeAcao || 'Comunicação',
      categoria: formData.categoria!,
      instituicao: formData.instituicao!,
      persona: formData.persona!,
      tipoDisparo: formData.tipoDisparo!,
      dataInicio: formData.dataInicio!,
      dataFim: formData.dataFim,
      canais: formData.canais || [],
      repiques: formData.repiques,
      ativo: true
    };

    mockData.comunicacoes.push(novaComunicacao);

    toast({
      title: "Comunicação cadastrada",
      description: comunicacoesNoMesmoDia.length > 0 
        ? `Comunicação adicionada. Atenção: ${comunicacoesNoMesmoDia.length + 1} comunicações no mesmo dia.`
        : "A comunicação foi adicionada ao roadmap com sucesso",
    });

    // Reset form
    setFormData({
      pessoa: '',
      nomeAcao: '',
      categoria: '',
      instituicao: '',
      persona: [],
      tipoDisparo: 'Pontual',
      dataInicio: '',
      dataFim: '',
      canais: [],
      repiques: [],
      ativo: true
    });
    setConflictDialogOpen(false);
  };

  const checkDateConflicts = (data: string) => {
    if (!data) return { temConflito: false, recomendacao: '' };

    // Verificar marcos acadêmicos na data
    const marcosNaData = mockData.marcos.filter(marco => 
      data >= marco.dataInicio && data <= (marco.dataFim || marco.dataInicio)
    );

    const temProva = marcosNaData.some(marco => 
      ['PROVA AV', 'PROVA AVS'].includes(marco.nome)
    );

    const personasRestritas = ['ausente', 'sem foco', 'parado', 'interessado', 'evolução'];
    const personaRestrita = formData.persona?.some(p => personasRestritas.includes(p?.toLowerCase() || ''));

    const temConflito = temProva && personaRestrita;
    
    let recomendacao = '';
    if (temProva) {
      recomendacao = 'Em momento de PROVA AV/AVS, recomenda-se evitar personas: ausente, sem foco, parado, interessado, evolução.';
    }

    return { temConflito, marcos: marcosNaData, recomendacao };
  };

  const addRepique = () => {
    if (customRepique && !formData.repiques?.includes(customRepique)) {
      setFormData(prev => ({
        ...prev,
        repiques: [...(prev.repiques || []), customRepique]
      }));
      setCustomRepique('');
    }
  };

  const removeRepique = (repique: string) => {
    setFormData(prev => ({
      ...prev,
      repiques: prev.repiques?.filter(r => r !== repique) || []
    }));
  };

  const handleChannelChange = (channel: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      canais: checked 
        ? [...(prev.canais || []), channel]
        : prev.canais?.filter(c => c !== channel) || []
    }));
  };

  const addPerson = () => {
    if (newPersonName && !mockData.pessoas.includes(newPersonName)) {
      mockData.pessoas.push(newPersonName);
      setNewPersonName('');
      toast({
        title: "Pessoa adicionada",
        description: `${newPersonName} foi adicionado à lista de pessoas.`
      });
    }
  };

  const removePerson = (pessoa: string) => {
    const index = mockData.pessoas.indexOf(pessoa);
    if (index > -1) {
      mockData.pessoas.splice(index, 1);
      toast({
        title: "Pessoa removida",
        description: `${pessoa} foi removido da lista de pessoas.`
      });
    }
  };

  const conflictInfo = formData.dataInicio ? checkDateConflicts(formData.dataInicio) : null;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nova Comunicação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pessoa">Pessoa *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPersonManagement(!showPersonManagement)}
                  >
                    Gerenciar Pessoas
                  </Button>
                </div>
                
                {showPersonManagement && (
                  <div className="p-3 border rounded space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nome da nova pessoa"
                        value={newPersonName}
                        onChange={(e) => setNewPersonName(e.target.value)}
                      />
                      <Button type="button" onClick={addPerson} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Pessoas existentes:</Label>
                      <div className="max-h-24 overflow-y-auto space-y-1">
                        {mockData.pessoas.map(pessoa => (
                          <div key={pessoa} className="flex items-center justify-between bg-muted p-2 rounded">
                            <span className="text-sm">{pessoa}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removePerson(pessoa)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                <Select value={formData.pessoa} onValueChange={(value) => setFormData(prev => ({ ...prev, pessoa: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma pessoa" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockData.pessoas.map(pessoa => (
                      <SelectItem key={pessoa} value={pessoa}>{pessoa}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomeAcao">Nome da Ação</Label>
                <Input
                  id="nomeAcao"
                  value={formData.nomeAcao}
                  onChange={(e) => setFormData(prev => ({ ...prev, nomeAcao: e.target.value }))}
                  placeholder="Nome da ação de comunicação"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockData.categorias.map(categoria => (
                      <SelectItem key={categoria.nome} value={categoria.nome}>{categoria.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instituicao">Instituição *</Label>
                <Select value={formData.instituicao} onValueChange={(value) => setFormData(prev => ({ ...prev, instituicao: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma instituição" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockData.instituicoes.map(instituicao => (
                      <SelectItem key={instituicao.nome} value={instituicao.nome}>{instituicao.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="persona">Persona *</Label>
                <div className={`grid grid-cols-2 gap-2 p-3 border rounded ${conflictInfo?.temConflito ? 'border-red-500' : ''}`}>
                  {mockData.personas.map(persona => (
                    <Tooltip key={persona.nome}>
                      <TooltipTrigger asChild>
                        <div 
                          className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                            formData.persona?.includes(persona.nome) 
                              ? 'bg-primary/10 border border-primary' 
                              : 'hover:bg-muted border border-transparent'
                          }`}
                          onClick={() => {
                            const currentPersonas = formData.persona || [];
                            const isSelected = currentPersonas.includes(persona.nome);
                            setFormData(prev => ({ 
                              ...prev, 
                              persona: isSelected 
                                ? currentPersonas.filter(p => p !== persona.nome)
                                : [...currentPersonas, persona.nome]
                            }));
                          }}
                        >
                          <div 
                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
                            style={{ backgroundColor: persona.cor }}
                          />
                          <Label 
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {persona.nome}
                          </Label>
                          {formData.persona?.includes(persona.nome) && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <div className="font-medium">{persona.nome}</div>
                          <div className="text-xs opacity-75">
                            Categoria: {persona.categoria}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                {conflictInfo?.temConflito && (
                  <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                    <div className="text-sm text-red-700">
                      <div className="font-medium">Conflito Identificado</div>
                      <div>{conflictInfo.recomendacao}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoDisparo">Tipo de Disparo</Label>
                <Select value={formData.tipoDisparo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipoDisparo: value as any }))}>
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
            </div>

            {/* Datas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data de Início *</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={formData.dataInicio}
                      onChange={(e) => setFormData(prev => ({ ...prev, dataInicio: e.target.value }))}
                      className={conflictInfo?.temConflito ? 'border-red-500' : ''}
                    />
                  </TooltipTrigger>
                  {conflictInfo && (
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-2">
                        {conflictInfo.marcos && conflictInfo.marcos.length > 0 && (
                          <div>
                            <div className="font-medium text-yellow-600">Marcos Acadêmicos nesta data:</div>
                            {conflictInfo.marcos.map(marco => (
                              <div key={marco.id} className="text-sm">
                                • {marco.nome} ({marco.modalidade} - {marco.maturidade})
                              </div>
                            ))}
                          </div>
                        )}
                        {conflictInfo.recomendacao && (
                          <div className="flex items-start gap-2 p-2 bg-orange-50 border border-orange-200 rounded">
                            <Info className="h-3 w-3 mt-0.5" />
                            <div className="text-sm">{conflictInfo.recomendacao}</div>
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>

              {(formData.tipoDisparo === 'Régua Aberta') && (
                <div className="space-y-2">
                  <Label htmlFor="dataFim">Data de Fim</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={formData.dataFim}
                    onChange={(e) => setFormData(prev => ({ ...prev, dataFim: e.target.value }))}
                  />
                </div>
              )}
            </div>

            {/* Repiques para Régua Fechada */}
            {formData.tipoDisparo === 'Régua Fechada' && (
              <div className="space-y-4">
                <Label>Repiques</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: d+3, d+7, d+15"
                    value={customRepique}
                    onChange={(e) => setCustomRepique(e.target.value)}
                  />
                  <Button type="button" onClick={addRepique} variant="outline">
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.repiques?.map(repique => (
                    <Badge key={repique} variant="secondary" className="gap-1">
                      {repique}
                      <button
                        type="button"
                        onClick={() => removeRepique(repique)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Canais */}
            <div className="space-y-4">
              <Label>Canais de Comunicação</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mockData.canais.map(canal => (
                  <div key={canal} className="flex items-center space-x-2">
                    <Checkbox
                      id={canal}
                      checked={formData.canais?.includes(canal)}
                      onCheckedChange={(checked) => handleChannelChange(canal, checked as boolean)}
                    />
                    <Label htmlFor={canal} className="text-sm font-normal">
                      {canal}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Botão de Envio */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="min-w-[200px]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Comunicação
              </Button>
            </div>

            {/* Dialog de Conflito */}
            <AlertDialog open={conflictDialogOpen} onOpenChange={setConflictDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Conflito Identificado
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <div>
                      Foi identificado um conflito com as regras de negócio para a data selecionada:
                    </div>
                    
                    {conflictInfo?.marcos && conflictInfo.marcos.length > 0 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <div className="font-medium text-blue-700 mb-2">Marcos Acadêmicos na data:</div>
                        {conflictInfo.marcos.map(marco => (
                          <div key={marco.id} className="text-sm text-blue-600">
                            • {marco.nome} ({marco.modalidade} - {marco.maturidade})
                          </div>
                        ))}
                      </div>
                    )}

                    {conflictInfo?.recomendacao && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-orange-700">
                            {conflictInfo.recomendacao}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-sm text-gray-600">
                      Deseja prosseguir com o cadastro mesmo assim?
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={saveCommuication} className="bg-red-600 hover:bg-red-700">
                    Sim, Cadastrar Mesmo Assim
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </form>
        </CardContent>
      </div>
    </TooltipProvider>
  );
}