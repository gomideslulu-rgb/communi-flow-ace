import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Calendar, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Marco } from '@/hooks/useMarcos';
import type { ComunicacaoDetalhada } from '@/hooks/useSupabaseData';

// --- Helpers ---
const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const MODALIDADE_COLORS: Record<string, string> = {
  'Ao Vivo': '#3b82f6',
  'Presencial': '#10b981',
  'Semi': '#f59e0b',
  'Digital': '#8b5cf6',
};

function getModalidadeColor(modalidades: string[]): string {
  if (!modalidades || modalidades.length === 0) return '#6b7280';
  return MODALIDADE_COLORS[modalidades[0]] || '#6b7280';
}

function generateMonthList(): string[] {
  const months: string[] = [];
  for (let y = 2025; y <= 2026; y++) {
    const startM = y === 2025 ? 6 : 0;
    for (let m = startM; m <= 11; m++) {
      months.push(`${MONTH_NAMES[m]} ${y}`);
    }
  }
  return months;
}

function parseMonth(label: string): { year: number; month: number } {
  const parts = label.split(' ');
  return { year: parseInt(parts[1], 10), month: MONTH_NAMES.indexOf(parts[0]) };
}

function getCurrentMonthLabel(meses: string[]): string {
  const now = new Date();
  const label = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
  return meses.includes(label) ? label : meses[0];
}

interface CalendarViewProps {
  marcos: Marco[];
  supabaseData: {
    pessoas: any[];
    categorias: any[];
    instituicoes: any[];
    personas: any[];
    canais: any[];
    campanhas: any[];
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
  const [filters, setFilters] = useState({ pessoa: 'Todos', categoria: 'Todos', campanha: 'Todos' });
  const [refreshKey, setRefreshKey] = useState(0);

  const pessoas = ['Todos', ...supabaseData.pessoas.map(p => p.nome)];
  const categorias = ['Todos', ...supabaseData.categorias.map(c => c.nome)];
  const campanhasFilter = ['Todos', ...supabaseData.campanhas.map(c => c.nome)];

  const handleDeleteComunicacao = async (comunicacaoId: string) => {
    try {
      await supabaseData.deleteComunicacao(comunicacaoId);
      setRefreshKey(prev => prev + 1);
    } catch (error) {}
  };

  const generateTimelineDays = () => {
    const { year, month } = parseMonth(selectedMonth);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const isWeekend = (day: number) => {
    const { year, month } = parseMonth(selectedMonth);
    const date = new Date(year, month, day);
    return date.getDay() === 0 || date.getDay() === 6;
  };

  const days = generateTimelineDays();

  // Filter communications
  const filteredComunicacoes = supabaseData.comunicacoes.filter(c => {
    if (filters.pessoa !== 'Todos' && c.pessoa?.nome !== filters.pessoa) return false;
    if (filters.categoria !== 'Todos' && c.categoria?.nome !== filters.categoria) return false;
    if (filters.campanha !== 'Todos' && c.campanha?.nome !== filters.campanha) return false;
    return true;
  });

  // Group by campanha
  const campanhaGroups = supabaseData.campanhas.map(campanha => ({
    campanha,
    comunicacoes: filteredComunicacoes
      .filter(c => c.campanha_id === campanha.id)
      .sort((a, b) => a.nome_acao.localeCompare(b.nome_acao))
  })).filter(g => g.comunicacoes.length > 0);

  // Communications without campanha
  const semCampanha = filteredComunicacoes
    .filter(c => !c.campanha_id)
    .sort((a, b) => a.nome_acao.localeCompare(b.nome_acao));

  // Check if a communication is active on a given day (covers the date range)
  const isComunicacaoActiveOnDay = (com: ComunicacaoDetalhada, day: number) => {
    const { year, month } = parseMonth(selectedMonth);
    const targetDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const endDate = com.data_fim || com.data_inicio;
    return targetDate >= com.data_inicio && targetDate <= endDate;
  };

  // Get the span (number of remaining days) for a bar starting on `day`
  const getBarSpan = (com: ComunicacaoDetalhada, day: number) => {
    const { year, month } = parseMonth(selectedMonth);
    const endDate = new Date(com.data_fim || com.data_inicio);
    const currentDate = new Date(year, month, day);
    const monthEnd = new Date(year, month + 1, 0);
    const clampedEnd = endDate > monthEnd ? monthEnd : endDate;
    return Math.max(1, Math.ceil((clampedEnd.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  };

  // Is this the first visible day of the bar in this month?
  const isFirstVisibleDay = (com: ComunicacaoDetalhada, day: number) => {
    const { year, month } = parseMonth(selectedMonth);
    const currentDate = new Date(year, month, day);
    const startDate = new Date(com.data_inicio);
    const endDate = new Date(com.data_fim || com.data_inicio);
    const isWithin = currentDate >= startDate && currentDate <= endDate;
    if (!isWithin) return false;
    if (day === 1) return true;
    const prevDate = new Date(year, month, day - 1);
    return prevDate < startDate;
  };

  // Marco helpers
  const getMarcoSpan = (marco: Marco, day: number) => {
    const { year, month } = parseMonth(selectedMonth);
    const startDate = new Date(marco.data_inicio);
    const endDate = new Date(marco.data_fim || marco.data_inicio);
    const currentDate = new Date(year, month, day);
    if (currentDate >= startDate && currentDate <= endDate) {
      return Math.min(
        Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
        days.length - day + 1
      );
    }
    return 0;
  };

  const isMarcoFirstVisible = (marco: Marco, day: number) => {
    const { year, month } = parseMonth(selectedMonth);
    const currentDate = new Date(year, month, day);
    const prevDate = new Date(year, month, day - 1);
    const startDate = new Date(marco.data_inicio);
    const endDate = new Date(marco.data_fim || marco.data_inicio);
    const isWithin = currentDate >= startDate && currentDate <= endDate;
    return isWithin && (day === 1 || prevDate < startDate);
  };

  // Conflict check
  const checkConflicts = (day: number) => {
    const { year, month } = parseMonth(selectedMonth);
    const targetDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const marcosDoDay = marcos.filter(m => targetDate >= m.data_inicio && targetDate <= (m.data_fim || m.data_inicio));
    return { marcos: marcosDoDay };
  };

  return (
    <TooltipProvider>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mês</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {meses.map(mes => <SelectItem key={mes} value={mes}>{mes}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pessoa</label>
                <Select value={filters.pessoa} onValueChange={value => setFilters(prev => ({ ...prev, pessoa: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {pessoas.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Produto</label>
                <Select value={filters.categoria} onValueChange={value => setFilters(prev => ({ ...prev, categoria: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Campanha</label>
                <Select value={filters.campanha} onValueChange={value => setFilters(prev => ({ ...prev, campanha: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {campanhasFilter.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legendas */}
        <Card>
          <CardHeader><CardTitle>Legendas</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Modalidades</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(MODALIDADE_COLORS).map(([nome, cor]) => (
                    <Badge key={nome} style={{ backgroundColor: cor, color: 'white' }}>
                      {nome}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Personas</h4>
                <div className="flex flex-wrap gap-2">
                  {supabaseData.personas.map(persona => (
                    <Badge key={persona.id} style={{ backgroundColor: persona.cor, color: 'white' }}>
                      {persona.nome}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Status</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-green-500 text-green-700">Dia Disponível</Badge>
                  <Badge variant="outline" className="border-blue-500 text-blue-700">Marco Acadêmico</Badge>
                  <Badge variant="outline" className="border-gray-500 text-gray-700">Fim de Semana</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roadmap Timeline */}
        <Card>
          <CardHeader><CardTitle>Roadmap de {selectedMonth}</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header */}
                <div className="grid grid-cols-[200px_1fr] gap-0 mb-2">
                  <div className="bg-muted p-2 font-medium border text-xs">AÇÃO</div>
                  <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(32px, 1fr))` }}>
                    {days.map(day => (
                      <div key={day} className={`p-1 text-center text-[10px] font-medium border ${isWeekend(day) ? 'bg-muted/60 text-muted-foreground' : 'bg-background'}`}>
                        {day}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Marcos */}
                <div className="grid grid-cols-[200px_1fr] gap-0 mb-2">
                  <div className="bg-blue-50 p-2 font-medium border text-blue-700 text-xs">MARCOS</div>
                  <div className="grid gap-0 relative" style={{
                    gridTemplateColumns: `repeat(${days.length}, minmax(32px, 1fr))`,
                    minHeight: '40px'
                  }}>
                    {days.map(day => {
                      const { marcos: marcosDoDay } = checkConflicts(day);
                      return (
                        <div key={day} className="min-h-[40px] relative border-r border-border/30">
                          {marcosDoDay.map((marco, index) => {
                            if (!isMarcoFirstVisible(marco, day)) return null;
                            const span = getMarcoSpan(marco, day);
                            if (span <= 0) return null;
                            return (
                              <Tooltip key={marco.id}>
                                <TooltipTrigger asChild>
                                  <div
                                    className="absolute left-0 h-4 flex items-center justify-center text-[9px] font-medium cursor-pointer rounded-sm"
                                    style={{
                                      backgroundColor: marco.cor,
                                      color: 'white',
                                      width: span > 1 ? `${span * 100}%` : '100%',
                                      top: `${4 + index * 18}px`,
                                      zIndex: 10
                                    }}
                                  >
                                    <span className="truncate px-1">{marco.nome}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    <div className="font-medium">{marco.nome}</div>
                                    <div className="text-xs">{marco.modalidade} - {marco.maturidade}</div>
                                    <div className="text-xs">{marco.data_inicio} até {marco.data_fim}</div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Comunicações agrupadas por Campanha */}
                {campanhaGroups.map(({ campanha, comunicacoes: comms }) => (
                  <div key={campanha.id} className="mt-3">
                    {/* Campanha Header */}
                    <div className="grid grid-cols-[200px_1fr] gap-0 mb-[2px]">
                      <div className="px-2 py-1.5 font-bold border text-xs rounded-tl-sm" style={{ backgroundColor: campanha.cor, color: 'white' }}>
                        {campanha.nome.toUpperCase()}
                      </div>
                      <div className="border-b" style={{ borderColor: campanha.cor }} />
                    </div>

                    {/* Comunicações dentro da campanha */}
                    <div className="space-y-[2px]">
                      {comms.map((comunicacao) => {
                        const categoriaColor = comunicacao.categoria?.cor || '#6b7280';
                        const personaColor = supabaseData.personas.find(
                          p => (comunicacao.personas || []).some(cp => cp?.id === p.id)
                        )?.cor || campanha.cor;

                        return (
                          <div
                            key={comunicacao.id}
                            className="grid grid-cols-[200px_1fr] gap-0 rounded-sm overflow-hidden"
                            style={{ borderLeft: `3px solid ${categoriaColor}` }}
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="bg-muted/50 px-2 py-1 font-medium border border-l-0 flex items-center min-h-[28px] cursor-pointer">
                                  <span className="text-[11px] text-foreground truncate" title={comunicacao.nome_acao}>
                                    {comunicacao.nome_acao}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs">
                                <div className="space-y-1 text-xs">
                                  <div className="font-medium text-sm">{comunicacao.nome_acao}</div>
                                  <div><strong>Responsável:</strong> {comunicacao.pessoa?.nome || 'N/A'}</div>
                                  <div><strong>Tipo:</strong> {comunicacao.tipo_disparo}</div>
                                  <div><strong>Período:</strong> {comunicacao.data_inicio}{comunicacao.data_fim && comunicacao.data_fim !== comunicacao.data_inicio ? ` até ${comunicacao.data_fim}` : ''}</div>
                                  <div><strong>Persona:</strong> {(comunicacao.personas || []).map(p => p?.nome).filter(Boolean).join(', ')}</div>
                                  <div><strong>Produto:</strong> {comunicacao.categoria?.nome}</div>
                                  <div><strong>Campanha:</strong> {comunicacao.campanha?.nome || 'N/A'}</div>
                                  <div><strong>Instituição:</strong> {comunicacao.instituicao?.nome}</div>
                                  {comunicacao.repiques?.length > 0 && (
                                    <div><strong>Repiques:</strong> {comunicacao.repiques.join(', ')}</div>
                                  )}
                                  {(comunicacao.canais || []).length > 0 && (
                                    <div><strong>Canais:</strong> {(comunicacao.canais || []).map(c => c?.nome).filter(Boolean).join(', ')}</div>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-auto px-1 text-destructive hover:text-destructive/80 hover:bg-destructive/10 mt-1"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteComunicacao(comunicacao.id); }}
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    <span className="text-[10px]">Excluir</span>
                                  </Button>
                                </div>
                              </TooltipContent>
                            </Tooltip>

                            <div className="grid gap-0 relative" style={{
                              gridTemplateColumns: `repeat(${days.length}, minmax(32px, 1fr))`
                            }}>
                              {days.map(day => {
                                const weekend = isWeekend(day);
                                const active = isComunicacaoActiveOnDay(comunicacao, day);

                                if (active && isFirstVisibleDay(comunicacao, day)) {
                                  const span = getBarSpan(comunicacao, day);
                                  const isPontual = comunicacao.tipo_disparo === 'Pontual' && (!comunicacao.data_fim || comunicacao.data_fim === comunicacao.data_inicio);

                                  return (
                                    <div key={day} className={`min-h-[28px] relative border-r border-border/20 ${weekend ? 'bg-muted/20' : ''}`}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div
                                            className={`absolute left-0 flex items-center cursor-pointer ${isPontual ? 'justify-center' : ''}`}
                                            style={{
                                              width: isPontual ? '100%' : `${span * 100}%`,
                                              top: '50%',
                                              transform: 'translateY(-50%)',
                                              zIndex: 20,
                                              height: isPontual ? '22px' : '10px',
                                              backgroundColor: campanha.cor,
                                              borderRadius: isPontual ? '4px' : '3px',
                                              opacity: 0.9,
                                            }}
                                          >
                                            {!isPontual && span > 3 && (
                                              <span className="text-white text-[9px] font-medium truncate px-2">
                                                {comunicacao.nome_acao}
                                              </span>
                                            )}
                                            {isPontual && (
                                              <span className="text-white text-[9px] font-bold">
                                                {comunicacao.tipo_disparo.charAt(0)}
                                              </span>
                                            )}
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-xs">
                                          <div className="space-y-1 text-xs">
                                            <div className="font-medium text-sm">{comunicacao.nome_acao}</div>
                                            <div><strong>Responsável:</strong> {comunicacao.pessoa?.nome || 'N/A'}</div>
                                            <div><strong>Tipo:</strong> {comunicacao.tipo_disparo}</div>
                                            <div><strong>Período:</strong> {comunicacao.data_inicio}{comunicacao.data_fim && comunicacao.data_fim !== comunicacao.data_inicio ? ` até ${comunicacao.data_fim}` : ''}</div>
                                            <div><strong>Produto:</strong> {comunicacao.categoria?.nome}</div>
                                            <div><strong>Campanha:</strong> {campanha.nome}</div>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                  );
                                }

                                return (
                                  <div
                                    key={day}
                                    className={`min-h-[28px] border-r border-border/20 ${weekend ? 'bg-muted/20' : ''}`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Comunicações sem campanha */}
                {semCampanha.length > 0 && (
                  <div className="mt-3">
                    <div className="grid grid-cols-[200px_1fr] gap-0 mb-[2px]">
                      <div className="bg-muted px-2 py-1.5 font-bold border text-xs text-muted-foreground">
                        SEM CAMPANHA
                      </div>
                      <div className="border-b border-muted" />
                    </div>
                    <div className="space-y-[2px]">
                      {semCampanha.map((comunicacao) => {
                        const categoriaColor = comunicacao.categoria?.cor || '#6b7280';
                        return (
                          <div
                            key={comunicacao.id}
                            className="grid grid-cols-[200px_1fr] gap-0 rounded-sm overflow-hidden"
                            style={{ borderLeft: `3px solid ${categoriaColor}` }}
                          >
                            <div className="bg-muted/50 px-2 py-1 font-medium border border-l-0 flex items-center min-h-[28px]">
                              <span className="text-[11px] text-foreground truncate">{comunicacao.nome_acao}</span>
                            </div>
                            <div className="grid gap-0 relative" style={{
                              gridTemplateColumns: `repeat(${days.length}, minmax(32px, 1fr))`
                            }}>
                              {days.map(day => {
                                const weekend = isWeekend(day);
                                const active = isComunicacaoActiveOnDay(comunicacao, day);
                                if (active && isFirstVisibleDay(comunicacao, day)) {
                                  const span = getBarSpan(comunicacao, day);
                                  return (
                                    <div key={day} className={`min-h-[28px] relative border-r border-border/20 ${weekend ? 'bg-muted/20' : ''}`}>
                                      <div
                                        className="absolute left-0 flex items-center cursor-pointer"
                                        style={{
                                          width: `${span * 100}%`,
                                          top: '50%',
                                          transform: 'translateY(-50%)',
                                          zIndex: 20,
                                          height: '10px',
                                          backgroundColor: categoriaColor,
                                          borderRadius: '3px',
                                          opacity: 0.9,
                                        }}
                                      >
                                        {span > 3 && (
                                          <span className="text-white text-[9px] font-medium truncate px-2">
                                            {comunicacao.nome_acao}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                }
                                return (
                                  <div key={day} className={`min-h-[28px] border-r border-border/20 ${weekend ? 'bg-muted/20' : ''}`} />
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dias Disponíveis */}
        <Card>
          <CardHeader><CardTitle>Próximos Dias Disponíveis</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {(() => {
                const { year, month } = parseMonth(selectedMonth);
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const availableDays: number[] = [];
                for (let day = 1; day <= daysInMonth; day++) {
                  const date = new Date(year, month, day);
                  if (date.getDay() === 0 || date.getDay() === 6) continue;
                  const targetDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const hasComm = filteredComunicacoes.some(c => {
                    const end = c.data_fim || c.data_inicio;
                    return targetDate >= c.data_inicio && targetDate <= end;
                  });
                  if (!hasComm) availableDays.push(day);
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
    </TooltipProvider>
  );
}
