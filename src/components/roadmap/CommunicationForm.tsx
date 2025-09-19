import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Calendar } from 'lucide-react';
import { mockData } from '@/data/mockData';
import { Comunicacao } from '@/types/roadmap';
import { useToast } from '@/hooks/use-toast';

interface CommunicationFormProps {
  onAddComunicacao: (comunicacao: Comunicacao) => void;
}

export function CommunicationForm({ onAddComunicacao }: CommunicationFormProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pessoa || !formData.categoria || !formData.instituicao || !formData.persona?.length || !formData.dataInicio) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

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
      repiques: formData.repiques || [],
      ativo: true
    };

    onAddComunicacao(novaComunicacao);
    
    toast({
      title: "Comunicação cadastrada",
      description: "A comunicação foi adicionada ao roadmap com sucesso",
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
    setCustomRepique('');
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

  const togglePersona = (personaNome: string) => {
    const currentPersonas = formData.persona || [];
    const isSelected = currentPersonas.includes(personaNome);
    
    setFormData(prev => ({ 
      ...prev, 
      persona: isSelected 
        ? currentPersonas.filter(p => p !== personaNome)
        : [...currentPersonas, personaNome]
    }));
  };

  return (
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
              <Label htmlFor="pessoa">Pessoa *</Label>
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
          </div>

          {/* Personas */}
          <div className="space-y-2">
            <Label>Personas * (Selecione uma ou mais)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 border rounded">
              {mockData.personas.map(persona => (
                <div 
                  key={persona.id}
                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                    formData.persona?.includes(persona.nome) 
                      ? 'bg-primary/10 border border-primary' 
                      : 'hover:bg-muted border border-transparent'
                  }`}
                  onClick={() => togglePersona(persona.nome)}
                >
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
                    style={{ backgroundColor: persona.cor }}
                  />
                  <Label className="text-sm font-normal cursor-pointer flex-1">
                    {persona.nome}
                  </Label>
                  {formData.persona?.includes(persona.nome) && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
              ))}
            </div>
            
            {formData.persona && formData.persona.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.persona.map(personaNome => {
                  const persona = mockData.personas.find(p => p.nome === personaNome);
                  return (
                    <Badge 
                      key={personaNome}
                      style={{ backgroundColor: persona?.cor || '#666', color: 'white' }}
                      className="text-xs"
                    >
                      {personaNome}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tipo de Disparo */}
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

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data de Início *</Label>
              <Input
                id="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => setFormData(prev => ({ ...prev, dataInicio: e.target.value }))}
              />
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
              
              {formData.repiques && formData.repiques.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.repiques.map(repique => (
                    <Badge key={repique} variant="secondary" className="flex items-center gap-1">
                      {repique}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-500" 
                        onClick={() => removeRepique(repique)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
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
                    checked={formData.canais?.includes(canal) || false}
                    onCheckedChange={(checked) => handleChannelChange(canal, checked as boolean)}
                  />
                  <Label htmlFor={canal} className="text-sm cursor-pointer">
                    {canal}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Botão de Submit */}
          <div className="flex justify-end">
            <Button type="submit" className="min-w-[200px]">
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Comunicação
            </Button>
          </div>
        </form>
      </CardContent>
    </div>
  );
}