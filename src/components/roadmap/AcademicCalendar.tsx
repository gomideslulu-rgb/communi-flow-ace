import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, GraduationCap } from 'lucide-react';
import { Marco } from '@/types/roadmap';
import { useToast } from '@/hooks/use-toast';

interface AcademicCalendarProps {
  marcos: Marco[];
  onDeleteMarco: (id: string) => void;
  onAddMarco: (marco: Marco) => void;
}

export function AcademicCalendar({ marcos, onDeleteMarco, onAddMarco }: AcademicCalendarProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Marco>>({
    nome: '',
    dataInicio: '',
    dataFim: '',
    safra: '25.2',
    modalidade: 'Presencial',
    maturidade: 'Ambos',
    cor: '#3b82f6'
  });

  const [filters, setFilters] = useState({
    safra: 'Todos',
    modalidade: 'Todos',
    maturidade: 'Todos'
  });

  const marcosAcademicos = [
    'Início das Aulas',
    'PROVA AV',
    'PROVA AVS',
    'Fim do Semestre',
    'Férias',
    'Matrícula',
    'Rematrícula',
    'Vestibular',
    'ENADE',
    'Colação de Grau'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.dataInicio) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o marco acadêmico e a data de início",
        variant: "destructive"
      });
      return;
    }

    const newMarco: Marco = {
      id: Date.now().toString(),
      nome: formData.nome,
      dataInicio: formData.dataInicio,
      dataFim: formData.dataFim || formData.dataInicio,
      safra: formData.safra || '25.2',
      modalidade: formData.modalidade || 'Presencial',
      maturidade: formData.maturidade || 'Ambos',
      cor: formData.cor || '#3b82f6'
    };

    onAddMarco(newMarco);
    
    toast({
      title: "Marco acadêmico cadastrado",
      description: "O marco foi adicionado ao calendário com sucesso",
    });

    // Reset form
    setFormData({
      nome: '',
      dataInicio: '',
      dataFim: '',
      safra: '25.2',
      modalidade: 'Presencial',
      maturidade: 'Ambos',
      cor: '#3b82f6'
    });
  };

  const deleteMarco = (id: string) => {
    onDeleteMarco(id);
    toast({
      title: "Marco removido",
      description: "O marco acadêmico foi removido do calendário",
    });
  };

  const getFilteredMarcos = () => {
    return marcos.filter(marco => {
      if (filters.safra !== 'Todos' && marco.safra !== filters.safra) return false;
      if (filters.modalidade !== 'Todos' && marco.modalidade !== filters.modalidade) return false;
      if (filters.maturidade !== 'Todos' && marco.maturidade !== filters.maturidade) return false;
      return true;
    }).sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Formulário */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Calendário Acadêmico
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marco">Marco Acadêmico *</Label>
              <Select value={formData.nome} onValueChange={(value) => setFormData(prev => ({ ...prev, nome: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um marco" />
                </SelectTrigger>
                <SelectContent>
                  {marcosAcademicos.map(marco => (
                    <SelectItem key={marco} value={marco}>{marco}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cor">Cor</Label>
              <Input
                id="cor"
                type="color"
                value={formData.cor}
                onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data de Início *</Label>
              <Input
                id="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => setFormData(prev => ({ ...prev, dataInicio: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFim">Data de Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={formData.dataFim}
                onChange={(e) => setFormData(prev => ({ ...prev, dataFim: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="safra">Safra</Label>
              <Select value={formData.safra} onValueChange={(value) => setFormData(prev => ({ ...prev, safra: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25.1">25.1</SelectItem>
                  <SelectItem value="25.2">25.2</SelectItem>
                  <SelectItem value="26.1">26.1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modalidade">Modalidade</Label>
              <Select value={formData.modalidade} onValueChange={(value) => setFormData(prev => ({ ...prev, modalidade: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Presencial">Presencial</SelectItem>
                  <SelectItem value="EAD">EAD</SelectItem>
                  <SelectItem value="Híbrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maturidade">Maturidade</Label>
              <Select value={formData.maturidade} onValueChange={(value) => setFormData(prev => ({ ...prev, maturidade: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Calouros">Calouros</SelectItem>
                  <SelectItem value="Veteranos">Veteranos</SelectItem>
                  <SelectItem value="Ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="min-w-[200px]">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Marco
            </Button>
          </div>
        </form>
      </CardContent>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Safra</Label>
              <Select value={filters.safra} onValueChange={(value) => setFilters(prev => ({ ...prev, safra: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="25.1">25.1</SelectItem>
                  <SelectItem value="25.2">25.2</SelectItem>
                  <SelectItem value="26.1">26.1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Modalidade</Label>
              <Select value={filters.modalidade} onValueChange={(value) => setFilters(prev => ({ ...prev, modalidade: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Presencial">Presencial</SelectItem>
                  <SelectItem value="EAD">EAD</SelectItem>
                  <SelectItem value="Híbrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Maturidade</Label>
              <Select value={filters.maturidade} onValueChange={(value) => setFilters(prev => ({ ...prev, maturidade: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Calouros">Calouros</SelectItem>
                  <SelectItem value="Veteranos">Veteranos</SelectItem>
                  <SelectItem value="Ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Marcos */}
      <Card>
        <CardHeader>
          <CardTitle>Marcos Cadastrados ({getFilteredMarcos().length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getFilteredMarcos().length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum marco acadêmico encontrado com os filtros aplicados
              </div>
            ) : (
              getFilteredMarcos().map(marco => (
                <div key={marco.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: marco.cor }}
                    />
                    <div>
                      <h4 className="font-medium">{marco.nome}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          {formatDate(marco.dataInicio)}
                          {marco.dataFim && marco.dataFim !== marco.dataInicio && 
                            ` - ${formatDate(marco.dataFim)}`
                          }
                        </span>
                        <Badge variant="outline">{marco.safra}</Badge>
                        <Badge variant="outline">{marco.modalidade}</Badge>
                        <Badge variant="outline">{marco.maturidade}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMarco(marco.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}