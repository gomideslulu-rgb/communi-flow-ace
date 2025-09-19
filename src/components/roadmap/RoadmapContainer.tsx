import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { CalendarView } from './CalendarView';
import { CommunicationForm } from './CommunicationForm';
import { AcademicCalendar } from './AcademicCalendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Plus, GraduationCap } from 'lucide-react';
import { mockData } from '@/data/mockData';
import { Marco, Comunicacao } from '@/types/roadmap';

export function RoadmapContainer() {
  const [marcos, setMarcos] = useState<Marco[]>(mockData.marcos);
  const [comunicacoes, setComunicacoes] = useState<Comunicacao[]>(mockData.comunicacoes);

  const deleteMarco = (id: string) => {
    setMarcos(prev => prev.filter(marco => marco.id !== id));
  };

  const addMarco = (marco: Marco) => {
    setMarcos(prev => [...prev, marco]);
  };

  const deleteComunicacao = (id: string) => {
    setComunicacoes(prev => prev.filter(com => com.id !== id));
  };

  const addComunicacao = (comunicacao: Comunicacao) => {
    setComunicacoes(prev => [...prev, comunicacao]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Roadmap de Comunicação
          </h1>
          <p className="text-muted-foreground">
            Gerencie comunicações acadêmicas com inteligência e eficiência
          </p>
        </header>

        <Tabs defaultValue="roadmap" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="roadmap" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Roadmap
            </TabsTrigger>
            <TabsTrigger value="comunicacao" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Comunicação
            </TabsTrigger>
            <TabsTrigger value="calendario" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Calendário Acadêmico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roadmap" className="space-y-6">
            <CalendarView 
              marcos={marcos}
              comunicacoes={comunicacoes}
              onDeleteMarco={deleteMarco}
              onDeleteComunicacao={deleteComunicacao}
            />
          </TabsContent>

          <TabsContent value="comunicacao" className="space-y-6">
            <Card className="p-6">
              <CommunicationForm onAddComunicacao={addComunicacao} />
            </Card>
          </TabsContent>

          <TabsContent value="calendario" className="space-y-6">
            <Card className="p-6">
              <AcademicCalendar 
                marcos={marcos}
                onDeleteMarco={deleteMarco}
                onAddMarco={addMarco}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}