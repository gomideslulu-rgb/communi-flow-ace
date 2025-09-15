import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarDays, AlertTriangle, Info } from 'lucide-react';
import { mockData } from '@/data/mockData';
import { ConflictoInfo } from '@/types/roadmap';

export function CalendarView() {
  const [selectedMonth, setSelectedMonth] = useState('Setembro 2025');
  const [filters, setFilters] = useState({
    pessoa: 'Todos',
    categoria: 'Todos'
  });

  const meses = [
    'Julho 2025', 'Agosto 2025', 'Setembro 2025', 'Outubro 2025', 'Novembro 2025', 'Dezembro 2025'
  ];

  const pessoas = ['Todos', ...mockData.pessoas];
  const categorias = ['Todos', ...mockData.categorias.map(c => c.nome)];

  // Função para gerar os dias do mês
  const generateCalendarDays = () => {
    const monthMap: { [key: string]: { year: number; month: number } } = {
      'Julho 2025': { year: 2025, month: 6 },
      'Agosto 2025': { year: 2025, month: 7 },
      'Setembro 2025': { year: 2025, month: 8 },
      'Outubro 2025': { year: 2025, month: 9 },
      'Novembro 2025': { year: 2025, month: 10 },
      'Dezembro 2025': { year: 2025, month: 11 }
    };

    const { year, month } = monthMap[selectedMonth];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  // Função para verificar conflitos
  const checkConflicts = (day: number): ConflictoInfo => {
    const { year, month } = {
      'Julho 2025': { year: 2025, month: 6 },
      'Agosto 2025': { year: 2025, month: 7 },
      'Setembro 2025': { year: 2025, month: 8 },
      'Outubro 2025': { year: 2025, month: 9 },
      'Novembro 2025': { year: 2025, month: 10 },
      'Dezembro 2025': { year: 2025, month: 11 }
    }[selectedMonth];

    const targetDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Verificar marcos acadêmicos
    const marcosDoDay = mockData.marcos.filter(marco => 
      targetDate >= marco.dataInicio && targetDate <= (marco.dataFim || marco.dataInicio)
    );

    // Verificar comunicações existentes
    const comunicacoesDoDay = mockData.comunicacoes.filter(comm => 
      comm.dataInicio === targetDate && comm.ativo
    );

    const temConflito = marcosDoDay.some(marco => 
      ['PROVA AV', 'PROVA AVS'].includes(marco.nome) && 
      comunicacoesDoDay.some(comm => 
        ['ausente', 'sem foco', 'parado', 'interessado', 'evolução'].includes(comm.persona.toLowerCase())
      )
    );

    let recomendacao = '';
    if (marcosDoDay.some(m => ['PROVA AV', 'PROVA AVS'].includes(m.nome))) {
      recomendacao = 'Em momento de PROVA AV/AVS, recomenda-se evitar personas: ausente, sem foco, parado, interessado, evolução.';
    }

    return {
      temConflito,
      marcos: marcosDoDay,
      comunicacoes: comunicacoesDoDay,
      recomendacao
    };
  };

  // Função para verificar se é fim de semana
  const isWeekend = (day: number) => {
    const { year, month } = {
      'Julho 2025': { year: 2025, month: 6 },
      'Agosto 2025': { year: 2025, month: 7 },
      'Setembro 2025': { year: 2025, month: 8 },
      'Outubro 2025': { year: 2025, month: 9 },
      'Novembro 2025': { year: 2025, month: 10 },
      'Dezembro 2025': { year: 2025, month: 11 }
    }[selectedMonth];

    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const days = generateCalendarDays();

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Filtros do Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mês</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map(mes => (
                      <SelectItem key={mes} value={mes}>{mes}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pessoa</label>
                <Select value={filters.pessoa} onValueChange={(value) => setFilters(prev => ({ ...prev, pessoa: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pessoas.map(pessoa => (
                      <SelectItem key={pessoa} value={pessoa}>{pessoa}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Select value={filters.categoria} onValueChange={(value) => setFilters(prev => ({ ...prev, categoria: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(categoria => (
                      <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                <h4 className="font-medium mb-2">Personas</h4>
                <div className="flex flex-wrap gap-2">
                  {mockData.personas.map(persona => (
                    <Badge key={persona.id} style={{ backgroundColor: persona.cor, color: 'white' }}>
                      {persona.nome}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Status</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-green-500 text-green-700">
                    Dia Disponível
                  </Badge>
                  <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                    Marco Acadêmico
                  </Badge>
                  <Badge variant="outline" className="border-red-500 text-red-700">
                    Conflito Identificado
                  </Badge>
                  <Badge variant="outline" className="border-gray-500 text-gray-700">
                    Fim de Semana
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendário */}
        <Card>
          <CardHeader>
            <CardTitle>Calendário de {selectedMonth}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {/* Cabeçalho dos dias da semana */}
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
                <div key={dia} className="p-2 text-center font-medium text-muted-foreground border-b">
                  {dia}
                </div>
              ))}
              
              {/* Dias do mês */}
              {days.map(day => {
                const conflictInfo = checkConflicts(day);
                const weekend = isWeekend(day);
                const hasMarcos = conflictInfo.marcos.length > 0;
                const hasCommunications = conflictInfo.comunicacoes.length > 0;
                const available = !weekend && !hasCommunications;

                return (
                  <Tooltip key={day}>
                    <TooltipTrigger asChild>
                      <div 
                        className={`
                          relative p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md min-h-[80px]
                          ${weekend ? 'bg-gray-100 text-gray-500' : ''}
                          ${available ? 'bg-green-50 border-green-200 hover:bg-green-100' : ''}
                          ${hasMarcos ? 'bg-yellow-50 border-yellow-200' : ''}
                          ${conflictInfo.temConflito ? 'bg-red-50 border-red-200' : ''}
                        `}
                      >
                        <div className="font-medium text-sm">{day}</div>
                        
                        {/* Indicadores de marcos */}
                        {conflictInfo.marcos.map((marco, index) => (
                          <div 
                            key={marco.id}
                            className="w-full h-1 rounded mt-1"
                            style={{ backgroundColor: marco.cor }}
                          />
                        ))}

                        {/* Indicadores de comunicações */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {conflictInfo.comunicacoes.map(comm => {
                            const persona = mockData.personas.find(p => p.nome === comm.persona);
                            return (
                              <div
                                key={comm.id}
                                className="w-3 h-3 rounded-full text-[8px] flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: persona?.cor || '#666' }}
                              >
                                {comm.pessoa.charAt(0)}
                              </div>
                            );
                          })}
                        </div>

                        {/* Indicador de conflito */}
                        {conflictInfo.temConflito && (
                          <AlertTriangle className="absolute top-1 right-1 h-4 w-4 text-red-500" />
                        )}

                        {/* Indicador de dia disponível */}
                        {available && (
                          <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="space-y-2">
                        <div className="font-medium">
                          Dia {day} - {weekend ? 'Fim de Semana' : available ? 'Disponível' : 'Ocupado'}
                        </div>
                        
                        {conflictInfo.marcos.length > 0 && (
                          <div>
                            <div className="font-medium text-yellow-600">Marcos Acadêmicos:</div>
                            {conflictInfo.marcos.map(marco => (
                              <div key={marco.id} className="text-sm">
                                • {marco.nome} ({marco.modalidade} - {marco.maturidade})
                              </div>
                            ))}
                          </div>
                        )}

                        {conflictInfo.comunicacoes.length > 0 && (
                          <div>
                            <div className="font-medium text-blue-600">Comunicações:</div>
                            {conflictInfo.comunicacoes.map(comm => (
                              <div key={comm.id} className="text-sm">
                                • {comm.nomeAcao} ({comm.pessoa} - {comm.persona})
                              </div>
                            ))}
                          </div>
                        )}

                        {conflictInfo.recomendacao && (
                          <div className="p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                            <Info className="inline h-3 w-3 mr-1" />
                            {conflictInfo.recomendacao}
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Dias Disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Dias Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {days
                .filter(day => !isWeekend(day) && checkConflicts(day).comunicacoes.length === 0)
                .slice(0, 10)
                .map(day => (
                  <Badge key={day} variant="outline" className="p-2 justify-center border-green-500 text-green-700">
                    Dia {day}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}