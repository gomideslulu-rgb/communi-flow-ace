import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Trash2, Calendar, MessageCircle, GraduationCap, Filter } from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Marco, Comunicacao } from '@/types/roadmap';
import { mockData } from '@/data/mockData';

interface CalendarViewProps {
  marcos: Marco[];
  comunicacoes: Comunicacao[];
  onDeleteMarco: (id: string) => void;
  onDeleteComunicacao: (id: string) => void;
}

export function CalendarView({ marcos, comunicacoes, onDeleteMarco, onDeleteComunicacao }: CalendarViewProps) {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filters, setFilters] = useState({
    safra: 'Todos',
    modalidade: 'Todos',
    pessoa: 'Todos',
    categoria: 'Todos'
  });

  const deleteComunicacao = (id: string) => {
    onDeleteComunicacao(id);
    toast({
      title: "Comunicação removida",
      description: "A comunicação foi removida com sucesso",
    });
  };

  const deleteMarco = (id: string) => {
    onDeleteMarco(id);
    toast({
      title: "Marco removido", 
      description: "O marco acadêmico foi removido com sucesso",
    });
  };

  const getEventsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');

    // Filtrar comunicações
    const comunicacoesFiltered = comunicacoes.filter(comunicacao => {
      if (filters.pessoa !== 'Todos' && comunicacao.pessoa !== filters.pessoa) return false;
      if (filters.categoria !== 'Todos' && comunicacao.categoria !== filters.categoria) return false;
      return comunicacao.dataInicio === dateString || 
        (comunicacao.dataFim && dateString >= comunicacao.dataInicio && dateString <= comunicacao.dataFim);
    }).map(comunicacao => ({
      ...comunicacao,
      tipo: 'comunicacao' as const
    }));

    // Filtrar marcos
    const marcosFiltered = marcos.filter(marco => {
      if (filters.safra !== 'Todos' && marco.safra !== filters.safra) return false;
      if (filters.modalidade !== 'Todos' && marco.modalidade !== filters.modalidade) return false;
      return dateString >= marco.dataInicio && dateString <= (marco.dataFim || marco.dataInicio);
    }).map(marco => ({
      ...marco,
      tipo: 'marco' as const
    }));

    return [...comunicacoesFiltered, ...marcosFiltered];
  };

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    return days.map(day => {
      const events = getEventsForDate(day);
      return {
        date: day,
        events,
        isToday: format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
      };
    });
  }, [currentDate, marcos, comunicacoes, filters]);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const firstDayOfMonth = startOfMonth(currentDate);
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const nextMonth = () => setCurrentDate(addDays(currentDate, 30));
  const prevMonth = () => setCurrentDate(addDays(currentDate, -30));

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros do Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Pessoa</Label>
              <Select value={filters.pessoa} onValueChange={(value) => setFilters(prev => ({ ...prev, pessoa: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {mockData.pessoas.map(pessoa => (
                    <SelectItem key={pessoa} value={pessoa}>{pessoa}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={filters.categoria} onValueChange={(value) => setFilters(prev => ({ ...prev, categoria: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {mockData.categorias.map(categoria => (
                    <SelectItem key={categoria.nome} value={categoria.nome}>{categoria.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
          </div>
        </CardContent>
      </Card>

      {/* Calendário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Roadmap - {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={prevMonth}>
                ←
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                →
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Header dos dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Grid do calendário */}
          <div className="grid grid-cols-7 gap-1">
            {/* Espaços vazios antes do primeiro dia */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={index} className="h-24" />
            ))}

            {/* Dias do mês */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`h-24 p-1 border rounded-md overflow-hidden ${
                  day.isToday ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm ${day.isToday ? 'font-bold text-primary' : ''}`}>
                    {format(day.date, 'd')}
                  </span>
                </div>

                {/* Eventos do dia */}
                <div className="space-y-0.5">
                  {day.events.slice(0, 3).map((item, itemIndex) => (
                    <div key={itemIndex} className="group relative">
                      <div 
                        className={`text-xs p-1 rounded truncate flex items-center justify-between ${
                          item.tipo === 'comunicacao' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        <div className="flex items-center gap-1 min-w-0 flex-1">
                          {item.tipo === 'comunicacao' ? (
                            <MessageCircle className="h-3 w-3 flex-shrink-0" />
                          ) : (
                            <GraduationCap className="h-3 w-3 flex-shrink-0" />
                          )}
                          <span className="truncate">
                            {item.tipo === 'comunicacao' ? item.nomeAcao || 'Comunicação' : item.nome}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.tipo === 'comunicacao' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteComunicacao(item.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                          {item.tipo === 'marco' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-red-100 hover:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMarco(item.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {day.events.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{day.events.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legendas */}
      <Card>
        <CardHeader>
          <CardTitle>Legendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Tipos de Evento</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-green-500 text-green-700">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Comunicação
                </Badge>
                <Badge variant="outline" className="border-blue-500 text-blue-700">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  Marco Acadêmico
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Personas</h4>
              <div className="flex flex-wrap gap-2">
                {mockData.personas.map(persona => (
                  <Badge 
                    key={persona.id} 
                    style={{ backgroundColor: persona.cor, color: 'white' }}
                  >
                    {persona.nome}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}