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
    updateComunicacao?: (id: string, data: any) => Promise<void>;
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

  // Each communication gets its own row (no merging by name)
  const sortedComunicacoes = [...filteredComunicacoes].sort((a, b) => a.nome_acao.localeCompare(b.nome_acao));

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

                {/* Ações */}
                <div className="space-y-1 mt-2">
                {uniqueActions.map((nomeAcao, actionIndex) => {
                  const actionComunicacoes = filteredComunicacoes.filter(c => c.nome_acao === nomeAcao);
                  const categoriaColor = actionComunicacoes[0]?.categoria?.cor || '#6b7280';
                  
                  return <div key={nomeAcao} className="grid grid-cols-[200px_1fr] gap-0 rounded-sm overflow-hidden" style={{ borderLeft: `3px solid ${categoriaColor}` }}>
                    <div className="bg-muted/50 p-2 font-medium border border-l-0 flex items-center gap-2 min-h-[44px]">
                      <span className="text-xs text-foreground truncate" title={nomeAcao}>
                        {nomeAcao}
                      </span>
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

                        const comunicacaoRepresentativa = comunicacoesDoDay.length > 0 ? comunicacoesDoDay[0] : null;
                        const hasActivity = comunicacoesDoDay.length > 0;
                        const conflictInfo = checkConflicts(day, 'Todos');
                        const personaColor = comunicacaoRepresentativa 
                          ? supabaseData.personas.find(p => (comunicacaoRepresentativa.personas || []).some(cp => cp?.nome === p.nome))?.cor || '#6b7280'
                          : undefined;

                        const reguaAberta = comunicacoesDoDay.find(c => c.tipo_disparo === 'Régua Aberta');
                        const isRegua = !!reguaAberta;

                        const cellContent = (
                          <div className={`
                            border-r border-b border-border/40 min-h-[44px] cursor-pointer relative flex items-center justify-center
                            ${weekend ? 'bg-muted/30' : 'bg-background'}
                            ${hasActivity ? 'hover:opacity-80' : 'hover:bg-accent/20'}
                            transition-colors duration-150
                          `}>
                            {isRegua && reguaAberta && (() => {
                              const span = getReguaSpan(reguaAberta, day);
                              if (span <= 0) return null;
                              if (!isFirstVisibleDayRegua(reguaAberta, day)) {
                                return <div className="absolute inset-0 flex items-center">
                                  <div className="w-full h-2 rounded-none" style={{ backgroundColor: personaColor, opacity: 0.6 }} />
                                </div>;
                              }
                              return <div
                                className="absolute left-0 h-2 rounded-r"
                                style={{
                                  backgroundColor: personaColor,
                                  width: span > 1 ? `calc(${span * 100}% + ${(span - 1) * 0}px)` : '100%',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  zIndex: 20,
                                  pointerEvents: 'none'
                                }}
                              />;
                            })()}

                            {hasActivity && !isRegua && (
                              <div
                                className="w-7 h-7 rounded-md text-white text-[10px] flex items-center justify-center font-semibold shadow-sm"
                                style={{ backgroundColor: personaColor }}
                                title={comunicacaoRepresentativa?.tipo_disparo}
                              >
                                {comunicacoesDoDay.length > 1 ? `${comunicacoesDoDay.length}` : comunicacaoRepresentativa?.tipo_disparo?.charAt(0) || '•'}
                              </div>
                            )}

                            {conflictInfo.temConflito && hasActivity && (
                              <AlertTriangle className="absolute top-0.5 right-0.5 h-3 w-3 text-destructive" />
                            )}
                          </div>
                        );

                        if (!hasActivity) {
                          return <div key={day}>{cellContent}</div>;
                        }

                        return <Tooltip key={day}>
                          <TooltipTrigger asChild>
                            {cellContent}
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-2">
                              <div className="font-medium text-sm">
                                {nomeAcao} — Dia {day}
                              </div>
                              {weekend && <div className="text-xs text-muted-foreground">Fim de semana</div>}
                              <div className="space-y-1.5">
                                {comunicacoesDoDay.map(comunicacao => <div key={comunicacao.id} className="text-xs space-y-0.5 border-b border-border/50 pb-1.5 last:border-b-0 last:pb-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 space-y-0.5">
                                      <div className="text-muted-foreground">
                                        <strong>Responsável:</strong> {comunicacao.pessoa?.nome || 'N/A'}
                                      </div>
                                      <div className="text-muted-foreground">
                                        <strong>Persona:</strong> {(comunicacao.personas || []).map(p => p?.nome).filter(Boolean).join(', ')}
                                      </div>
                                      <div className="text-muted-foreground">
                                        <strong>Categoria:</strong> {comunicacao.categoria?.nome}
                                      </div>
                                      <div className="text-muted-foreground">
                                        <strong>Instituição:</strong> {comunicacao.instituicao?.nome}
                                      </div>
                                      <div className="text-muted-foreground">
                                        <strong>Tipo:</strong> {comunicacao.tipo_disparo}
                                      </div>
                                      {(comunicacao.canais || []).length > 0 && (
                                        <div className="text-muted-foreground">
                                          <strong>Canais:</strong> {(comunicacao.canais || []).map(c => c?.nome).filter(Boolean).join(', ')}
                                        </div>
                                      )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10 shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteComunicacao(comunicacao.id);
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>)}
                              </div>
                              {conflictInfo.marcos.length > 0 && <div>
                                <div className="font-medium text-xs text-blue-600">Marcos Acadêmicos:</div>
                                {conflictInfo.marcos.map(marco => <div key={marco.id} className="text-xs text-muted-foreground">
                                  • {marco.nome} ({marco.modalidade} - {marco.maturidade})
                                </div>)}
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
