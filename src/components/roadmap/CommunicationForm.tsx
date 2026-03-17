import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, X, AlertTriangle, Info, Pencil, Trash2, List } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
    deleteComunicacao: (id: string) => Promise<void>;
    updateComunicacao: (id: string, data: any) => Promise<void>;
    refetch: () => Promise<void>;
  };
}
export function CommunicationForm({
  supabaseData
}: CommunicationFormProps) {
  const {
    toast
  } = useToast();
  const {
    saveComunicacao
  } = useComunicacoes();
  const [formData, setFormData] = useState<ComunicacaoForm>({
    pessoa_id: '',
    nome_acao: '',
    categoria_id: '',
    instituicao_id: '',
    campanha_id: '',
    persona_ids: [],
    tipo_disparo: 'Pontual',
    data_inicio: '',
    data_fim: '',
    canal_ids: [],
    repiques: [],
    ativo: true,
    safras: [],
    modalidades: []
  });
  const [customRepique, setCustomRepique] = useState('');
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [showPersonManagement, setShowPersonManagement] = useState(false);
  const [newCategoria, setNewCategoria] = useState('');
  const [newCategoriaCor, setNewCategoriaCor] = useState('#3b82f6');
  const [showCategoriaForm, setShowCategoriaForm] = useState(false);
  const [newInstituicao, setNewInstituicao] = useState('');
  const [newInstituicaoCor, setNewInstituicaoCor] = useState('#1e40af');
  const [showInstituicaoForm, setShowInstituicaoForm] = useState(false);
  const [newPersona, setNewPersona] = useState('');
  const [newPersonaCor, setNewPersonaCor] = useState('#22c55e');
  const [newPersonaCategoria, setNewPersonaCategoria] = useState<'disponivel' | 'restrita'>('disponivel');
  const [showPersonaForm, setShowPersonaForm] = useState(false);
  const [newCanal, setNewCanal] = useState('');
  const [showCanalForm, setShowCanalForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState<ComunicacaoForm & { id: string } | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pessoa_id || !formData.categoria_id || !formData.instituicao_id || !formData.persona_ids?.length || !formData.safras?.length) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios (pessoa, categoria, instituição, persona e período)",
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
        ativo: true,
        safras: [],
        modalidades: []
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
        ativo: true,
        safras: [],
        modalidades: []
      });
    } catch (error) {
      // Error already handled in hook
    }
  };

  // Função para verificar conflitos de datas
  const checkDateConflicts = (targetDate: string) => {
    if (!targetDate) return {
      temConflito: false,
      marcos: [],
      comunicacoes: [],
      recomendacao: ''
    };

    // Verificar marcos acadêmicos que coincide com a data
    const marcos = []; // Em implementação real, buscar marcos do Supabase
    const comunicacoes = supabaseData.comunicacoes.filter(comm => comm.data_inicio === targetDate && comm.ativo);
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
    setFormData({
      ...formData,
      repiques: newRepiques
    });
  };
  const handleChannelChange = (canalId: string, checked: boolean) => {
    const updatedCanais = checked ? [...formData.canal_ids, canalId] : formData.canal_ids.filter(id => id !== canalId);
    setFormData({
      ...formData,
      canal_ids: updatedCanais
    });
  };
  const handlePersonaChange = (personaId: string, checked: boolean) => {
    const updatedPersonas = checked ? [...formData.persona_ids, personaId] : formData.persona_ids.filter(id => id !== personaId);
    setFormData({
      ...formData,
      persona_ids: updatedPersonas
    });

    // Verificar se adicionou personas "ausente" ou "sem foco"
    if (checked) {
      const persona = supabaseData.personas.find(p => p.id === personaId);
      const personaNome = persona?.nome?.toLowerCase() || '';
      if (personaNome.includes('ausente') || personaNome.includes('sem foco')) {
        toast({
          title: "⚠️ Atenção",
          description: `Persona "${persona?.nome}" selecionada. Recomenda-se evitar comunicações com esta persona em períodos de PROVA AV/AVS.`,
          variant: "default",
          duration: 5000
        });
      }
    }
  };
  const handleSelectAllPersonas = () => {
    const allPersonaIds = supabaseData.personas.map(p => p.id);
    setFormData({
      ...formData,
      persona_ids: allPersonaIds
    });
  };
  const handleSafraChange = (safra: string, checked: boolean) => {
    const updatedSafras = checked ? [...formData.safras, safra] : formData.safras.filter(s => s !== safra);
    setFormData({
      ...formData,
      safras: updatedSafras
    });
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

  const addCategoria = async () => {
    if (newCategoria.trim()) {
      try {
        const { data, error } = await (await import('@/integrations/supabase/client')).supabase
          .from('categorias').insert([{ nome: newCategoria.trim(), cor: newCategoriaCor }]).select().single();
        if (error) throw error;
        await supabaseData.refetch();
        setNewCategoria('');
        setShowCategoriaForm(false);
        toast({ title: "Sucesso", description: "Categoria adicionada" });
      } catch (e) { toast({ title: "Erro", description: "Não foi possível adicionar", variant: "destructive" }); }
    }
  };

  const addInstituicao = async () => {
    if (newInstituicao.trim()) {
      try {
        const { data, error } = await (await import('@/integrations/supabase/client')).supabase
          .from('instituicoes').insert([{ nome: newInstituicao.trim(), cor: newInstituicaoCor }]).select().single();
        if (error) throw error;
        await supabaseData.refetch();
        setNewInstituicao('');
        setShowInstituicaoForm(false);
        toast({ title: "Sucesso", description: "Instituição adicionada" });
      } catch (e) { toast({ title: "Erro", description: "Não foi possível adicionar", variant: "destructive" }); }
    }
  };

  const addPersona = async () => {
    if (newPersona.trim()) {
      try {
        const { data, error } = await (await import('@/integrations/supabase/client')).supabase
          .from('personas').insert([{ nome: newPersona.trim(), cor: newPersonaCor, categoria: newPersonaCategoria }]).select().single();
        if (error) throw error;
        await supabaseData.refetch();
        setNewPersona('');
        setShowPersonaForm(false);
        toast({ title: "Sucesso", description: "Persona adicionada" });
      } catch (e) { toast({ title: "Erro", description: "Não foi possível adicionar", variant: "destructive" }); }
    }
  };

  const addCanal = async () => {
    if (newCanal.trim()) {
      try {
        const { data, error } = await (await import('@/integrations/supabase/client')).supabase
          .from('canais').insert([{ nome: newCanal.trim() }]).select().single();
        if (error) throw error;
        await supabaseData.refetch();
        setNewCanal('');
        setShowCanalForm(false);
        toast({ title: "Sucesso", description: "Canal adicionado" });
      } catch (e) { toast({ title: "Erro", description: "Não foi possível adicionar", variant: "destructive" }); }
    }
  };
  if (supabaseData.loading) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>;
  }
  return <TooltipProvider>
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
                    <Select value={formData.pessoa_id} onValueChange={value => setFormData({
                    ...formData,
                    pessoa_id: value
                  })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar pessoa" />
                      </SelectTrigger>
                      <SelectContent>
                        {supabaseData.pessoas.map(pessoa => <SelectItem key={pessoa.id} value={pessoa.id}>
                            {pessoa.nome}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowPersonManagement(!showPersonManagement)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {showPersonManagement && <div className="space-y-2 p-4 border rounded">
                      <div className="flex gap-2">
                        <Input value={newPersonName} onChange={e => setNewPersonName(e.target.value)} placeholder="Nova pessoa" />
                        <Button type="button" onClick={addPerson} size="sm">
                          Adicionar
                        </Button>
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {supabaseData.pessoas.map(pessoa => <div key={pessoa.id} className="flex justify-between items-center p-2 border rounded">
                            <span>{pessoa.nome}</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removePerson(pessoa.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>)}
                      </div>
                    </div>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome_acao">Nome da Ação</Label>
                  <Input id="nome_acao" value={formData.nome_acao} onChange={e => setFormData({
                  ...formData,
                  nome_acao: e.target.value
                })} placeholder="Digite o nome da ação" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <div className="flex gap-2">
                    <Select value={formData.categoria_id} onValueChange={value => setFormData({
                    ...formData,
                    categoria_id: value
                  })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {supabaseData.categorias.map(categoria => <SelectItem key={categoria.id} value={categoria.id}>
                            {categoria.nome}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowCategoriaForm(!showCategoriaForm)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {showCategoriaForm && <div className="flex gap-2 p-3 border rounded">
                    <Input value={newCategoria} onChange={e => setNewCategoria(e.target.value)} placeholder="Nova categoria" className="flex-1" />
                    <Input type="color" value={newCategoriaCor} onChange={e => setNewCategoriaCor(e.target.value)} className="w-12 p-1 h-9" />
                    <Button type="button" onClick={addCategoria} size="sm">Adicionar</Button>
                  </div>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instituicao">Instituição *</Label>
                  <div className="flex gap-2">
                    <Select value={formData.instituicao_id} onValueChange={value => setFormData({
                    ...formData,
                    instituicao_id: value
                  })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar instituição" />
                      </SelectTrigger>
                      <SelectContent>
                        {supabaseData.instituicoes.map(instituicao => <SelectItem key={instituicao.id} value={instituicao.id}>
                            {instituicao.nome}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowInstituicaoForm(!showInstituicaoForm)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {showInstituicaoForm && <div className="flex gap-2 p-3 border rounded">
                    <Input value={newInstituicao} onChange={e => setNewInstituicao(e.target.value)} placeholder="Nova instituição" className="flex-1" />
                    <Input type="color" value={newInstituicaoCor} onChange={e => setNewInstituicaoCor(e.target.value)} className="w-12 p-1 h-9" />
                    <Button type="button" onClick={addInstituicao} size="sm">Adicionar</Button>
                  </div>}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Persona *</Label>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowPersonaForm(!showPersonaForm)}>
                        <Plus className="h-4 w-4 mr-1" /> Nova
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={handleSelectAllPersonas}>
                        Selecionar Todos
                      </Button>
                    </div>
                  </div>
                  {showPersonaForm && <div className="flex gap-2 p-3 border rounded flex-wrap">
                    <Input value={newPersona} onChange={e => setNewPersona(e.target.value)} placeholder="Nova persona" className="flex-1 min-w-[120px]" />
                    <Input type="color" value={newPersonaCor} onChange={e => setNewPersonaCor(e.target.value)} className="w-12 p-1 h-9" />
                    <Select value={newPersonaCategoria} onValueChange={v => setNewPersonaCategoria(v as any)}>
                      <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disponivel">Disponível</SelectItem>
                        <SelectItem value="restrita">Restrita</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" onClick={addPersona} size="sm">Adicionar</Button>
                  </div>}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {supabaseData.personas.map(persona => <div key={persona.id} className="flex items-center space-x-2">
                        <Checkbox id={persona.id} checked={formData.persona_ids.includes(persona.id)} onCheckedChange={checked => handlePersonaChange(persona.id, !!checked)} />
                        <Label htmlFor={persona.id} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{
                        backgroundColor: persona.cor
                      }} />
                          {persona.nome}
                        </Label>
                      </div>)}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Período*</Label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {['26.1', '26.2', '26.3', '26.4'].map(safra => <div key={safra} className="flex items-center space-x-2">
                        <Checkbox id={safra} checked={formData.safras.includes(safra)} onCheckedChange={checked => handleSafraChange(safra, !!checked)} />
                        <Label htmlFor={safra}>{safra}</Label>
                      </div>)}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Modalidade</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Ao Vivo', 'Presencial', 'Semi'].map(mod => <div key={mod} className="flex items-center space-x-2">
                        <Checkbox id={`mod-${mod}`} checked={formData.modalidades.includes(mod)} onCheckedChange={checked => {
                          const updated = checked ? [...formData.modalidades, mod] : formData.modalidades.filter(m => m !== mod);
                          setFormData({ ...formData, modalidades: updated });
                        }} />
                        <Label htmlFor={`mod-${mod}`}>{mod}</Label>
                      </div>)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo_disparo">Tipo de Disparo</Label>
                    <Select value={formData.tipo_disparo} onValueChange={value => setFormData({
                    ...formData,
                    tipo_disparo: value as any
                  })}>
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
                    <Input id="data_inicio" type="date" value={formData.data_inicio} onChange={e => setFormData({
                    ...formData,
                    data_inicio: e.target.value
                  })} />
                  </div>

                  {(formData.tipo_disparo === 'Régua Fechada' || formData.tipo_disparo === 'Régua Aberta') && <div className="space-y-2">
                      <Label htmlFor="data_fim">Data de Fim</Label>
                      <Input id="data_fim" type="date" value={formData.data_fim} onChange={e => setFormData({
                    ...formData,
                    data_fim: e.target.value
                  })} />
                    </div>}
                </div>

                {formData.tipo_disparo === 'Régua Fechada' && <div className="space-y-2">
                    <Label>Repiques</Label>
                    <div className="flex gap-2">
                      <Input value={customRepique} onChange={e => setCustomRepique(e.target.value)} placeholder="Ex: d+3, d+7, d+15" />
                      <Button type="button" onClick={addRepique} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.repiques.map((repique, index) => <Badge key={index} variant="secondary" className="gap-1">
                          {repique}
                          <button type="button" onClick={() => removeRepique(index)} className="ml-1 hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>)}
                    </div>
                  </div>}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Canais de Comunicação</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowCanalForm(!showCanalForm)}>
                      <Plus className="h-4 w-4 mr-1" /> Novo
                    </Button>
                  </div>
                  {showCanalForm && <div className="flex gap-2 p-3 border rounded">
                    <Input value={newCanal} onChange={e => setNewCanal(e.target.value)} placeholder="Novo canal" className="flex-1" />
                    <Button type="button" onClick={addCanal} size="sm">Adicionar</Button>
                  </div>}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {supabaseData.canais.map(canal => <div key={canal.id} className="flex items-center space-x-2">
                        <Checkbox id={canal.id} checked={formData.canal_ids.includes(canal.id)} onCheckedChange={checked => handleChannelChange(canal.id, !!checked)} />
                        <Label htmlFor={canal.id}>{canal.nome}</Label>
                      </div>)}
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

        {/* Lista de Comunicações Cadastradas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Comunicações Cadastradas ({supabaseData.comunicacoes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {supabaseData.comunicacoes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma comunicação cadastrada ainda.</p>
            ) : (
              <div className="space-y-2">
                {supabaseData.comunicacoes.map(com => (
                  <div key={com.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/30 transition-colors">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                      <div>
                        <div className="text-sm font-medium">{com.nome_acao || '—'}</div>
                        <div className="text-xs text-muted-foreground">{com.pessoa?.nome || 'N/A'}</div>
                      </div>
                      <div className="text-xs">
                        <Badge variant="outline" style={{ borderColor: com.categoria?.cor, color: com.categoria?.cor }}>
                          {com.categoria?.nome}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {com.data_inicio}{com.data_fim ? ` → ${com.data_fim}` : ''}
                      </div>
                      <div className="text-xs">
                        <Badge variant="secondary">{com.tipo_disparo}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(com.personas || []).slice(0, 3).map(p => (
                          <span key={p?.id} className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: p?.cor }} title={p?.nome} />
                        ))}
                        {(com.personas || []).length > 3 && <span className="text-xs text-muted-foreground">+{(com.personas || []).length - 3}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setEditData({
                            id: com.id,
                            pessoa_id: com.pessoa_id,
                            nome_acao: com.nome_acao,
                            categoria_id: com.categoria_id,
                            instituicao_id: com.instituicao_id,
                            persona_ids: (com.personas || []).map(p => p?.id).filter(Boolean) as string[],
                            tipo_disparo: com.tipo_disparo,
                            data_inicio: com.data_inicio,
                            data_fim: com.data_fim || '',
                            canal_ids: (com.canais || []).map(c => c?.id).filter(Boolean) as string[],
                            repiques: com.repiques || [],
                            ativo: com.ativo,
                            safras: com.safras || [],
                            modalidades: com.modalidades || [],
                          });
                          setEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                        onClick={() => supabaseData.deleteComunicacao(com.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Comunicação</DialogTitle>
            </DialogHeader>
            {editData && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pessoa</Label>
                    <Select value={editData.pessoa_id} onValueChange={v => setEditData({ ...editData, pessoa_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                      <SelectContent>
                        {supabaseData.pessoas.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nome da Ação</Label>
                    <Input value={editData.nome_acao} onChange={e => setEditData({ ...editData, nome_acao: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={editData.categoria_id} onValueChange={v => setEditData({ ...editData, categoria_id: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {supabaseData.categorias.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Instituição</Label>
                    <Select value={editData.instituicao_id} onValueChange={v => setEditData({ ...editData, instituicao_id: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {supabaseData.instituicoes.map(i => <SelectItem key={i.id} value={i.id}>{i.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Personas</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {supabaseData.personas.map(persona => (
                      <div key={persona.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={editData.persona_ids.includes(persona.id)}
                          onCheckedChange={checked => {
                            const ids = checked
                              ? [...editData.persona_ids, persona.id]
                              : editData.persona_ids.filter(id => id !== persona.id);
                            setEditData({ ...editData, persona_ids: ids });
                          }}
                        />
                        <Label className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: persona.cor }} />
                          {persona.nome}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Disparo</Label>
                    <Select value={editData.tipo_disparo} onValueChange={v => setEditData({ ...editData, tipo_disparo: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pontual">Pontual</SelectItem>
                        <SelectItem value="Régua Fechada">Régua Fechada</SelectItem>
                        <SelectItem value="Régua Aberta">Régua Aberta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Data Início</Label>
                    <Input type="date" value={editData.data_inicio} onChange={e => setEditData({ ...editData, data_inicio: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Fim</Label>
                    <Input type="date" value={editData.data_fim} onChange={e => setEditData({ ...editData, data_fim: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Período/Safra</Label>
                  <div className="flex gap-4">
                    {['26.1', '26.2', '26.3', '26.4'].map(s => (
                      <div key={s} className="flex items-center space-x-2">
                        <Checkbox
                          checked={editData.safras.includes(s)}
                          onCheckedChange={checked => {
                            const safras = checked ? [...editData.safras, s] : editData.safras.filter(x => x !== s);
                            setEditData({ ...editData, safras });
                          }}
                        />
                        <Label>{s}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Modalidade</Label>
                  <div className="flex gap-4">
                    {['Ao Vivo', 'Presencial', 'Semi'].map(mod => (
                      <div key={mod} className="flex items-center space-x-2">
                        <Checkbox
                          checked={editData.modalidades.includes(mod)}
                          onCheckedChange={checked => {
                            const modalidades = checked ? [...editData.modalidades, mod] : editData.modalidades.filter(m => m !== mod);
                            setEditData({ ...editData, modalidades });
                          }}
                        />
                        <Label>{mod}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Canais</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {supabaseData.canais.map(canal => (
                      <div key={canal.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={editData.canal_ids.includes(canal.id)}
                          onCheckedChange={checked => {
                            const ids = checked ? [...editData.canal_ids, canal.id] : editData.canal_ids.filter(id => id !== canal.id);
                            setEditData({ ...editData, canal_ids: ids });
                          }}
                        />
                        <Label>{canal.nome}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={editData.ativo}
                    onCheckedChange={checked => setEditData({ ...editData, ativo: !!checked })}
                  />
                  <Label>Ativo</Label>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
              <Button onClick={async () => {
                if (!editData) return;
                try {
                  await supabaseData.updateComunicacao(editData.id, editData);
                  setEditDialogOpen(false);
                  setEditData(null);
                } catch (e) { /* handled in hook */ }
              }}>
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>;
}