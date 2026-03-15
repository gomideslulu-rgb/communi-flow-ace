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

// --- Helpers dinâmicos para meses ---
const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function generateMonthList(): string[] {
  // Gerar 18 meses: de Julho 2025 até Dezembro 2026
  const months: string[] = [];
  for (let y = 2025; y <= 2026; y++) {
    const startM = y === 2025 ? 6 : 0; // Julho 2025 em diante; Janeiro 2026 em diante
    const endM = 11;
    for (let m = startM; m <= endM; m++) {
      months.push(`${MONTH_NAMES[m]} ${y}`);
    }
  }
  return months;
}

function parseMonth(label: string): { year: number; month: number } {
  const parts = label.split(' ');
  const year = parseInt(parts[1], 10);
  const month = MONTH_NAMES.indexOf(parts[0]);
  return { year, month };
}

function getCurrentMonthLabel(meses: string[]): string {
  const now = new Date();
  const label = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
  if (meses.includes(label)) return label;
  return meses[0];
}

// --- Interfaces ---
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
  const meses = generateMonthList();
  
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthLabel(meses));
  const [filters, setFilters] = useState({
    pessoa: 'Todos',
    categoria: 'Todos'
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const pessoas = ['Todos', ...supabaseData.pessoas.map(p => p.nome)];
  const categorias = ['Todos', ...supabaseData.categorias.map(c => c.nome)];

  const handleDeleteComunicacao = async (comunicacaoId: string) => {
    try {
      await supabaseData.deleteComunicacao(comunicacaoId);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      // Error already handled in the hook
    }
  };

  const generateTimelineDays = () => {
    const { year, month } = parseMonth(selectedMonth);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const checkConflicts = (day: number, pessoa: string): ConflictInfoSupabase => {
    const { year, month } = parseMonth(selectedMonth);
    const targetDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const marcosDoDay = marcos.filter(marco => targetDate >= marco.data_inicio && targetDate <= (marco.data_fim || marco.data_inicio));

    const comunicacoesDoDay = supabaseData.comunicacoes.filter(comm => 
      comm.data_inicio === targetDate && 
      comm.ativo && 
      (pessoa === 'Todos' || comm.pessoa?.nome === pessoa)
    );

    let temConflito = false;
    
    if (comunicacoesDoDay.length > 1) {
      for (let i = 0; i < comunicacoesDoDay.length; i++) {
        for (let j = i + 1; j < comunicacoesDoDay.length; j++) {
          const comm1 = comunicacoesDoDay[i];
          const comm2 = comunicacoesDoDay[j];
          
          const safrasComum = (comm1.safras || []).some(s1 => 
            (comm2.safras || []).includes(s1)
          );
          const mesmaInstituicao = comm1.instituicao_id === comm2.instituicao_id;
          const personasComum = (comm1.personas || []).some(p1 => 
            (comm2.personas || []).some(p2 => p1?.id === p2?.id)
          );
          
          if (safrasComum && mesmaInstituicao && personasComum) {
            temConflito = true;
            break;
          }
        }
        if (temConflito) break;
      }
    }

    let recomendacao = '';
    if (temConflito) {
      recomendacao = 'Conflito: Múltiplas comunicações com mesmo período, instituição e persona neste dia.';
    } else if (marcosDoDay.some(m => ['PROVA AV', 'PROVA AVS'].includes(m.nome))) {
      recomendacao = 'Em momento de PROVA AV/AVS, recomenda-se evitar personas: ausente, sem foco, parado, interessado, evolução.';
    }
    
    return {
      temConflito,
      marcos: marcosDoDay,
      comunicacoes: comunicacoesDoDay,
      recomendacao
    };
  };

  const isWeekend = (day: number) => {
    const { year, month } = parseMonth(selectedMonth);
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const days = generateTimelineDays();
  // Filtrar comunicações e agrupar por nome_acao
  const filteredComunicacoes = supabaseData.comunicacoes.filter(c => {
    if (filters.pessoa !== 'Todos' && c.pessoa?.nome !== filters.pessoa) return false;
    if (filters.categoria !== 'Todos' && c.categoria?.nome !== filters.categoria) return false;
    return true;
  });

  const uniqueActions = Array.from(new Set(filteredComunicacoes.map(c => c.nome_acao))).sort();

  const getMarcoSpan = (marco: Marco, day: number) => {
    const { year, month } = parseMonth(selectedMonth);
    const startDate = new Date(marco.data_inicio);
    const endDate = new Date(marco.data_fim || marco.data_inicio);
    const currentDate = new Date(year, month, day);
    if (currentDate >= startDate && currentDate <= endDate) {
      const remainingDays = Math.min(Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) + 1, days.length - day + 1);
      return remainingDays > 1 ? remainingDays : 1;
    }
    return 0;
  };

  const getReguaSpan = (com: ComunicacaoDetalhada, day: number) => {
    const { year, month } = parseMonth(selectedMonth);
    const startDate = new Date(com.data_inicio);
    const monthEnd = new Date(year, month + 1, 0);
    const endDate = new Date(com.data_fim || monthEnd.toISOString().slice(0,10));
    const currentDate = new Date(year, month, day);

    if (currentDate >= startDate && currentDate <= endDate) {
      const remainingDays = Math.min(
        Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
        days.length - day + 1
      );
      return remainingDays > 1 ? remainingDays : 1;
    }
    return 0;
  };

  const isFirstVisibleDayRegua = (com: ComunicacaoDetalhada, day: number) => {
    const { year, month } = parseMonth(selectedMonth);
    const currentDateObj = new Date(year, month, day);
    const prevDateObj = new Date(year, month, day - 1);
    const startDate = new Date(com.data_inicio);
    const monthEnd = new Date(year, month + 1, 0);
    const endDate = new Date(com.data_fim || monthEnd.toISOString().slice(0,10));

    const isWithin = currentDateObj >= startDate && currentDateObj <= endDate;
    return isWithin && (day === 1 || prevDateObj < startDate);
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
                    const marcosDoDay = conflictInfo.marcos;
                    return <div key={day} className="min-h-[60px] relative border-r border-gray-200">
                          {marcosDoDay.map((marco, index) => {
                        const span = getMarcoSpan(marco, day);
                        if (span <= 0) return null;
                        
                        const { year, month } = parseMonth(selectedMonth);
                        const currentDateObj = new Date(year, month, day);
                        const prevDateObj = new Date(year, month, day - 1);
                        const startDate = new Date(marco.data_inicio);
                        const endDate = new Date(marco.data_fim || marco.data_inicio);
                        const isWithin = currentDateObj >= startDate && currentDateObj <= endDate;
                        const isFirstVisibleDay = isWithin && (day === 1 || prevDateObj < startDate);
                        
                        if (!isFirstVisibleDay) return null;
                        
                        return <Tooltip key={`${marco.id}-${day}`}>
                                <TooltipTrigger asChild>
                                  <div 
                                    className="absolute left-0 right-0 h-4 flex items-center justify-center text-xs font-medium cursor-pointer rounded"
                                    style={{
                                      backgroundColor: marco.cor,
                                      color: 'white',
                                      width: span > 1 ? `calc(${span * 100}% + ${(span - 1) * 4}px)` : '100%',
                                      top: `${2 + index * 16}px`,
                                      fontSize: '10px',
                                      zIndex: 10
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
                {uniqueActions.map(nomeAcao => {
                  const actionComunicacoes = filteredComunicacoes.filter(c => c.nome_acao === nomeAcao);
                  return <div key={nomeAcao} className="grid grid-cols-[200px_1fr] gap-0">
                    <div className="bg-red-50 p-2 font-medium border text-red-700 text-xs truncate" title={nomeAcao}>
                      {nomeAcao}
                    </div>
                    <div className="grid gap-0" style={{
                      gridTemplateColumns: `repeat(${days.length}, minmax(40px, 1fr))`
                    }}>
                      {days.map(day => {
                        const { year, month } = parseMonth(selectedMonth);
                        const targetDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const weekend = isWeekend(day);
                        
                        const comunicacoesDoDay = actionComunicacoes.filter(comm => {
                          if (comm.tipo_disparo === 'Régua Aberta' && comm.data_fim) {
                            return targetDate >= comm.data_inicio && targetDate <= comm.data_fim;
                          }
                          return comm.data_inicio === targetDate;
                        });

                        const available = !weekend && comunicacoesDoDay.length === 0;
                        const conflictInfo = checkConflicts(day, 'Todos');

                        return <Tooltip key={day}>
                          <TooltipTrigger asChild>
                            <div className={`
                              border border-gray-200 min-h-[40px] p-1 cursor-pointer relative
                              ${weekend ? 'bg-gray-100' : ''}
                              ${available ? 'hover:bg-green-50' : ''}
                            `}>
                              {comunicacoesDoDay.length > 0 && (
                                <>
                                  {comunicacoesDoDay
                                    .filter(c => c.tipo_disparo === 'Régua Aberta')
                                    .map((comunicacao, idx) => {
                                      const span = getReguaSpan(comunicacao, day);
                                      if (span <= 0) return null;
                                      if (!isFirstVisibleDayRegua(comunicacao, day)) return null;
                                      const color = supabaseData.personas.find(p => (comunicacao.personas || []).some(cp => cp?.nome === p.nome))?.cor || '#666';
                                      return (
                                        <div
                                          key={comunicacao.id}
                                          className="absolute left-0 h-2"
                                          style={{
                                            backgroundColor: color,
                                            width: span > 1 ? `calc(${span * 100}% + ${(span - 1) * 4}px)` : '100%',
                                            top: `${2 + idx * 8}px`,
                                            zIndex: 20,
                                            pointerEvents: 'none'
                                          }}
                                        />
                                      );
                                    })}
                                  <div className="flex flex-col gap-1 pt-3">
                                    {comunicacoesDoDay
                                      .filter(c => c.tipo_disparo !== 'Régua Aberta')
                                      .map((comunicacao) => (
                                        <div
                                          key={comunicacao.id}
                                          className="w-6 h-6 rounded text-white text-xs flex items-center justify-center font-bold"
                                          style={{
                                            backgroundColor: supabaseData.personas.find(p => (comunicacao.personas || []).some(cp => cp?.nome === p.nome))?.cor || '#666'
                                          }}
                                        >
                                          {comunicacao.nome_acao?.charAt(0) || '?'}
                                        </div>
                                      ))
                                    }
                                  </div>
                                </>
                              )}
                              {available && !weekend && <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full" />}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-2">
                              <div className="font-medium">
                                {nomeAcao} - Dia {day}
                              </div>
                              {weekend && <div className="text-sm text-gray-600">Fim de semana</div>}
                              {comunicacoesDoDay.length > 0 && <div>
                                <div className="font-medium text-green-600">
                                  Comunicaç{comunicacoesDoDay.length > 1 ? 'ões' : 'ão'}:
                                </div>
                                {comunicacoesDoDay.map(comunicacao => <div key={comunicacao.id} className="text-sm space-y-1 border-b border-gray-100 pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <div>• <strong>{comunicacao.nome_acao}</strong></div>
                                      <div className="text-xs text-gray-600 ml-2">
                                        Responsável: {comunicacao.pessoa?.nome || 'N/A'}<br />
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
                              </div>}
                              {conflictInfo.marcos.length > 0 && <div>
                                <div className="font-medium text-blue-600">Marcos Acadêmicos:</div>
                                {conflictInfo.marcos.map(marco => <div key={marco.id} className="text-sm">
                                  • {marco.nome} ({marco.modalidade} - {marco.maturidade})
                                </div>)}
                              </div>}
                              {available && !weekend && <div className="text-sm text-green-600">
                                ✓ Dia disponível para comunicação
                              </div>}
                            </div>
                          </TooltipContent>
                        </Tooltip>;
                      })}
                    </div>
                  </div>;
                })}
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
                const availableDays: number[] = [];
                const { year, month } = parseMonth(selectedMonth);
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                
                for (let day = 1; day <= daysInMonth; day++) {
                  const currentDate = new Date(year, month, day);
                  const dayOfWeek = currentDate.getDay();
                  const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
                  
                  const hasComm = filteredComunicacoes.some(c => c.data_inicio === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
                  
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
