import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Calendar, AlertTriangle, Info, X } from 'lucide-react';
import { ConflictoInfo } from '@/types/roadmap';
import { useToast } from '@/hooks/use-toast';
import { Marco } from '@/hooks/useMarcos';
import type { ComunicacaoDetalhada } from '@/hooks/useSupabaseData';

interface ConflictInfoSupabase {
  temConflito: boolean;
  marcos: Marco[];
  comunicacoes: ComunicacaoDetalhada[];
  recomendacao?: string;
}

interface CalendarViewProps {
  marcos: Marco[];
  supabaseData: {
    pessoas: any[];
    categorias: any[];
    instituicoes: any[];
    personas: any[];
    canais: any[];
    comunicacoes: ComunicacaoDetalhada[];
    loading: boolean;
    deleteComunicacao: (id: string) => Promise<void>;
  };
}

export function CalendarView({ marcos, supabaseData }: CalendarViewProps) {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState('Setembro 2025');
  const [filters, setFilters] = useState({
    pessoa: 'Todos',
    categoria: 'Todos'
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const meses = ['Julho 2025', 'Agosto 2025', 'Setembro 2025', 'Outubro 2025', 'Novembro 2025', 'Dezembro 2025'];
  const pessoas = ['Todos', ...supabaseData.pessoas.map(p => p.nome)];
  const categorias = ['Todos', ...supabaseData.categorias.map(c => c.nome)];

  // Função para excluir comunicação
  const handleDeleteComunicacao = async (comunicacaoId: string) => {
    try {
      await supabaseData.deleteComunicacao(comunicacaoId);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      // Error already handled in the hook
    }
  };

  // Função para gerar os dias do mês
  const generateTimelineDays = () => {
    const monthMap: {
      [key: string]: {
        year: number;
        month: number;
      };
    } = {
      'Julho 2025': {
        year: 2025,
        month: 6
      },
      'Agosto 2025': {
        year: 2025,
        month: 7
      },
      'Setembro 2025': {
        year: 2025,
        month: 8
      },
      'Outubro 2025': {
        year: 2025,
        month: 9
      },
      'Novembro 2025': {
        year: 2025,
        month: 10
      },
      'Dezembro 2025': {
        year: 2025,
        month: 11
      }
    };
    const {
      year,
      month
    } = monthMap[selectedMonth];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({
      length: daysInMonth
    }, (_, i) => i + 1);
  };

  // Função para verificar conflitos
  const checkConflicts = (day: number, pessoa: string): ConflictInfoSupabase => {
    const {
      year,
      month
    } = {
      'Julho 2025': {
        year: 2025,
        month: 6
      },
      'Agosto 2025': {
        year: 2025,
        month: 7
      },
      'Setembro 2025': {
        year: 2025,
        month: 8
      },
      'Outubro 2025': {
        year: 2025,
        month: 9
      },
      'Novembro 2025': {
        year: 2025,
        month: 10
      },
      'Dezembro 2025': {
        year: 2025,
        month: 11
      }
    }[selectedMonth];
    const targetDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Verificar marcos acadêmicos
    const marcosDoDay = marcos.filter(marco => targetDate >= marco.data_inicio && targetDate <= (marco.data_fim || marco.data_inicio));

    // Verificar comunicações existentes para a pessoa específica
    const comunicacoesDoDay = supabaseData.comunicacoes.filter(comm => comm.data_inicio === targetDate && comm.ativo && (pessoa === 'Todos' || comm.pessoa?.nome === pessoa));
    const temConflito = marcosDoDay.some(marco => ['PROVA AV', 'PROVA AVS'].includes(marco.nome) && comunicacoesDoDay.some(comm => 
      (comm.personas || []).some(p => ['ausente', 'sem foco', 'parado', 'interessado', 'evolução'].includes(p?.nome?.toLowerCase() || ''))
    ));
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
    const {
      year,
      month
    } = {
      'Julho 2025': {
        year: 2025,
        month: 6
      },
      'Agosto 2025': {
        year: 2025,
        month: 7
      },
      'Setembro 2025': {
        year: 2025,
        month: 8
      },
      'Outubro 2025': {
        year: 2025,
        month: 9
      },
      'Novembro 2025': {
        year: 2025,
        month: 10
      },
      'Dezembro 2025': {
        year: 2025,
        month: 11
      }
    }[selectedMonth];
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };
  const days = generateTimelineDays();
  const filteredPessoas = filters.pessoa === 'Todos' ? supabaseData.pessoas.map(p => p.nome) : [filters.pessoa];

  // Função para obter marcos que se estendem por múltiplos dias
  const getMarcoSpan = (marco: Marco, day: number) => {
    const {
      year,
      month
    } = {
      'Julho 2025': {
        year: 2025,
        month: 6
      },
      'Agosto 2025': {
        year: 2025,
        month: 7
      },
      'Setembro 2025': {
        year: 2025,
        month: 8
      },
      'Outubro 2025': {
        year: 2025,
        month: 9
      },
      'Novembro 2025': {
        year: 2025,
        month: 10
      },
      'Dezembro 2025': {
        year: 2025,
        month: 11
      }
    }[selectedMonth];
    const startDate = new Date(marco.data_inicio);
    const endDate = new Date(marco.data_fim || marco.data_inicio);
    const currentDate = new Date(year, month, day);
    if (currentDate >= startDate && currentDate <= endDate) {
      // Calcular quantos dias o marco se estende a partir deste dia
      const remainingDays = Math.min(Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) + 1, days.length - day + 1);
      return remainingDays > 1 ? remainingDays : 1;
    }
    return 0;
  };
  return <TooltipProvider>
      <div className="space-y-6">
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
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
                    {meses.map(mes => <SelectItem key={mes} value={mes}>{mes}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pessoa</label>
                <Select value={filters.pessoa} onValueChange={value => setFilters(prev => ({
                ...prev,
                pessoa: value
              }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pessoas.map(pessoa => <SelectItem key={pessoa} value={pessoa}>{pessoa}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Select value={filters.categoria} onValueChange={value => setFilters(prev => ({
                ...prev,
                categoria: value
              }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(categoria => <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>)}
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
                  {supabaseData.personas.map(persona => <Badge key={persona.id} style={{
                  backgroundColor: persona.cor,
                  color: 'white'
                }}>
                      {persona.nome}
                    </Badge>)}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Status</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-green-500 text-green-700">
                    Dia Disponível
                  </Badge>
                  <Badge variant="outline" className="border-blue-500 text-blue-700">
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

        {/* Roadmap Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Roadmap de {selectedMonth}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header com os dias */}
                <div className="grid grid-cols-[200px_1fr] gap-0 mb-4">
                  <div className="bg-muted p-2 font-medium border">DIAS</div>
                  <div className="grid gap-0" style={{
                  gridTemplateColumns: `repeat(${days.length}, minmax(40px, 1fr))`
                }}>
                    {days.map(day => <div key={day} className={`p-2 text-center text-xs font-medium border ${isWeekend(day) ? 'bg-gray-100 text-gray-500' : 'bg-background'}`}>
                        {day}
                      </div>)}
                  </div>
                </div>

                {/* Marcos Acadêmicos */}
                <div className="grid grid-cols-[200px_1fr] gap-0 mb-4">
                  <div className="bg-blue-50 p-2 font-medium border text-blue-700">
                    MARCOS
                  </div>
                  <div className="grid gap-0 relative" style={{
                  gridTemplateColumns: `repeat(${days.length}, minmax(40px, 1fr))`,
                  minHeight: '60px'
                }}>
                  {days.map(day => {
                    const conflictInfo = checkConflicts(day, 'Todos');
                    const marcos = conflictInfo.marcos;
                    return <div key={day} className="border border-gray-200 min-h-[60px] relative">
                          {marcos.map((marco, index) => {
                        const span = getMarcoSpan(marco, day);
                        if (span <= 0) return null;
                        return <Tooltip key={`${marco.id}-${day}`}>
                                <TooltipTrigger asChild>
                                  <div 
                                    className="absolute left-0 right-0 h-4 flex items-center justify-center text-xs font-medium cursor-pointer rounded"
                                    style={{
                                      backgroundColor: marco.cor,
                                      color: 'white',
                                      width: span > 1 ? `calc(${span * 100}% + ${(span - 1) * 4}px)` : '100%',
                                      top: `${2 + index * 16}px`,
                                      fontSize: '10px'
                                    }}
                                  >
                                    <span className="truncate px-1">
                                      {marco.nome}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    <div className="font-medium">{marco.nome}</div>
                                    <div className="text-sm">
                                      {marco.modalidade} - {marco.maturidade}
                                    </div>
                                    <div className="text-sm">
                                      {marco.data_inicio} {marco.data_fim && marco.data_fim !== marco.data_inicio && `até ${marco.data_fim}`}
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>;
                      })}
                        </div>;
                  })}
                  </div>
                </div>

                {/* Pessoas */}
                {filteredPessoas.map(pessoa => <div key={pessoa} className="grid grid-cols-[200px_1fr] gap-0">
                    <div className="bg-red-50 p-2 font-medium border text-red-700">
                      {pessoa}
                    </div>
                    <div className="grid gap-0" style={{
                  gridTemplateColumns: `repeat(${days.length}, minmax(40px, 1fr))`
                }}>
                      {days.map(day => {
                    const conflictInfo = checkConflicts(day, pessoa);
                    const comunicacoes = conflictInfo.comunicacoes;
                    const weekend = isWeekend(day);
                    const hasMarcos = conflictInfo.marcos.length > 0;
                    const available = !weekend && comunicacoes.length === 0;
                    return <Tooltip key={day}>
                            <TooltipTrigger asChild>
                              <div className={`
                                  border border-gray-200 min-h-[40px] p-1 cursor-pointer relative
                                  ${weekend ? 'bg-gray-100' : ''}
                                  ${available ? 'hover:bg-green-50' : ''}
                                `}>
                                {/* Comunicações */}
                                {conflictInfo.comunicacoes.length > 0 && <div className="flex flex-wrap gap-1">
                                    {conflictInfo.comunicacoes.slice(0, 2).map((comunicacao, index) => <div key={comunicacao.id} className="w-6 h-6 rounded text-white text-xs flex items-center justify-center font-bold relative" style={{
                              backgroundColor: supabaseData.personas.find(p => (comunicacao.personas || []).some(cp => cp?.nome === p.nome))?.cor || '#666'
                            }}>
                                        {comunicacao.pessoa?.nome?.charAt(0) || '?'}
                                        {conflictInfo.comunicacoes.length > 1 && index === 0 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                                            {conflictInfo.comunicacoes.length}
                                          </div>}
                                      </div>)}
                                  </div>}

                                {/* Marcos Acadêmicos - posicionados abaixo das comunicações */}
                                {hasMarcos && <div className={`absolute bottom-1 left-1 right-1 ${conflictInfo.comunicacoes.length > 0 ? 'top-8' : 'top-1'}`}>
                                    {conflictInfo.marcos.slice(0, 2).map((marco, index) => <div key={marco.id} className="h-1 rounded mb-0.5" style={{
                              backgroundColor: marco.cor
                            }} title={marco.nome} />)}
                                  </div>}

                                {conflictInfo.temConflito && <AlertTriangle className="absolute top-1 right-1 h-3 w-3 text-red-500" />}

                                {available && !hasMarcos && <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full" />}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <div className="space-y-2">
                                <div className="font-medium">
                                  {pessoa} - Dia {day}
                                </div>
                                
                                {weekend && <div className="text-sm text-gray-600">Fim de semana</div>}

                                {conflictInfo.comunicacoes.length > 0 && <div>
                                    <div className="font-medium text-green-600">
                                      Comunicaç{conflictInfo.comunicacoes.length > 1 ? 'ões' : 'ão'}:
                                    </div>
                                    {conflictInfo.comunicacoes.map(comunicacao => <div key={comunicacao.id} className="text-sm space-y-1 border-b border-gray-100 pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                                         <div className="flex items-start justify-between gap-2">
                                           <div className="flex-1">
                                             <div>• <strong>{comunicacao.nome_acao}</strong></div>
                                             <div className="text-xs text-gray-600 ml-2">
                                               Persona: {(comunicacao.personas || []).map(p => p?.nome).filter(Boolean).join(', ')}<br />
                                               Categoria: {comunicacao.categoria?.nome}<br />
                                               Instituição: {comunicacao.instituicao?.nome}<br />
                                               Tipo: {comunicacao.tipo_disparo}
                                               {(comunicacao.canais || []).length > 0 && <><br />Canais: {(comunicacao.canais || []).map(c => c?.nome).filter(Boolean).join(', ')}</>}
                                             </div>
                                           </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteComunicacao(comunicacao.id);
                                            }}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>)}
                                    {conflictInfo.comunicacoes.length > 1 && <div className="text-xs text-orange-600 mt-1">
                                        ⚠️ Múltiplas comunicações no mesmo dia
                                      </div>}
                                  </div>}

                                {conflictInfo.marcos.length > 0 && <div>
                                    <div className="font-medium text-blue-600">Marcos Acadêmicos:</div>
                                    {conflictInfo.marcos.map(marco => <div key={marco.id} className="text-sm">
                                        • {marco.nome} ({marco.modalidade} - {marco.maturidade})
                                      </div>)}
                                  </div>}

                                {conflictInfo.recomendacao && <div className="p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                                    <Info className="inline h-3 w-3 mr-1" />
                                    {conflictInfo.recomendacao}
                                  </div>}

                                {available && !hasMarcos && <div className="text-sm text-green-600">
                                    ✓ Dia disponível para comunicação
                                  </div>}
                              </div>
                            </TooltipContent>
                          </Tooltip>;
                  })}
                    </div>
                  </div>)}
              </div>
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
              {(() => {
                const availableDays = [];
                const today = new Date();
                const currentMonth = today.getMonth();
                const currentYear = today.getFullYear();
                const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                
                // Começar do dia atual e ir até o final do mês
                for (let day = today.getDate(); day <= daysInMonth; day++) {
                  const currentDate = new Date(currentYear, currentMonth, day);
                  const dayOfWeek = currentDate.getDay();
                  const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
                  
                  const hasComm = filteredPessoas.some(pessoa => checkConflicts(day, pessoa).comunicacoes.length > 0);
                  
                  if (!isWeekendDay && !hasComm) {
                    availableDays.push(day);
                  }
                }
                
                return availableDays.map(day => (
                  <Badge key={day} variant="outline" className="p-2 justify-center border-green-500 text-green-700">
                    Dia {day}
                  </Badge>
                ));
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>;
}