import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { FiltrosCalendario } from '@/types/roadmap';
import { Marco } from '@/hooks/useMarcos';

interface AcademicCalendarProps {
  marcos: Marco[];
  onAddMarco: (marco: Omit<Marco, 'id'>) => Promise<Marco>;
  onDeleteMarco: (id: string) => Promise<void>;
}

export function AcademicCalendar({ marcos, onAddMarco, onDeleteMarco }: AcademicCalendarProps) {
  const [formData, setFormData] = useState({
    nome: '',
    data_inicio: '',
    data_fim: '',
    safra: '',
    modalidade: 'Presencial' as const,
    maturidade: 'Ambos' as const,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.data_inicio || !formData.data_fim || !formData.safra) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      await onAddMarco({
        nome: formData.nome,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim,
        safra: formData.safra,
        modalidade: formData.modalidade,
        maturidade: formData.maturidade,
        cor: formData.cor
      });
      
      setFormData({
        nome: '',
        data_inicio: '',
        data_fim: '',
        safra: '',
        modalidade: 'Presencial',
        maturidade: 'Ambos',
        cor: '#3b82f6'
      });
    } catch (error) {
      // Error already handled in the hook
    }
  };

  const getFilteredMarcos = () => {
    return marcos
      .filter(marco => {
        if (filters.safra !== 'Todos' && marco.safra !== filters.safra) return false;
        if (filters.modalidade !== 'Todos' && marco.modalidade !== filters.modalidade) return false;
        if (filters.maturidade !== 'Todos' && marco.maturidade !== filters.maturidade) return false;
        return true;
      })
      .sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Marco Acadêmico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Marco *</Label>
                <div className="flex gap-2">
                  <Select value={formData.nome} onValueChange={(value) => setFormData({...formData, nome: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar marco" />
                    </SelectTrigger>
                    <SelectContent>
                      {marcosAcademicos.map(marco => (
                        <SelectItem key={marco} value={marco}>
                          {marco}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Ou digite um nome personalizado"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="safra">Safra *</Label>
                <Input
                  id="safra"
                  value={formData.safra}
                  onChange={(e) => setFormData({...formData, safra: e.target.value})}
                  placeholder="Ex: 25.2"
                />
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

              <div className="space-y-2">
                <Label htmlFor="data_fim">Data de Fim *</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modalidade">Modalidade</Label>
                <Select value={formData.modalidade} onValueChange={(value) => setFormData({...formData, modalidade: value as any})}>
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
                <Select value={formData.maturidade} onValueChange={(value) => setFormData({...formData, maturidade: value as any})}>
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

            <div className="space-y-2">
              <Label htmlFor="cor">Cor</Label>
              <div className="flex gap-2">
                <Input
                  id="cor"
                  type="color"
                  value={formData.cor}
                  onChange={(e) => setFormData({...formData, cor: e.target.value})}
                  className="w-20"
                />
                <div 
                  className="w-10 h-10 rounded border"
                  style={{ backgroundColor: formData.cor }}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Marco
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Safra</Label>
              <Select value={filters.safra} onValueChange={(value) => setFilters({...filters, safra: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {Array.from(new Set(marcos.map(m => m.safra))).map(safra => (
                    <SelectItem key={safra} value={safra}>{safra}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Modalidade</Label>
              <Select value={filters.modalidade} onValueChange={(value) => setFilters({...filters, modalidade: value})}>
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
              <Select value={filters.maturidade} onValueChange={(value) => setFilters({...filters, maturidade: value})}>
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

      <Card>
        <CardHeader>
          <CardTitle>Marcos Acadêmicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {getFilteredMarcos().length > 0 ? (
              getFilteredMarcos().map(marco => (
                <div key={marco.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: marco.cor }}
                    />
                    <div>
                      <span className="font-medium">{marco.nome}</span> - {formatDate(marco.data_inicio)} a {formatDate(marco.data_fim)} - {marco.safra} - {marco.modalidade} - {marco.maturidade}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteMarco(marco.id)}
                      className="ml-auto text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhum marco acadêmico encontrado com os filtros aplicados.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}