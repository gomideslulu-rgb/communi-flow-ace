import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { CalendarView } from './CalendarView';
import { CommunicationForm } from './CommunicationForm';
import { AcademicCalendar } from './AcademicCalendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Plus, GraduationCap } from 'lucide-react';
import { mockData } from '@/data/mockData';

export function RoadmapContainer() {
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
            <CalendarView />
          </TabsContent>

          <TabsContent value="comunicacao" className="space-y-6">
            <Card className="p-6">
              <CommunicationForm />
            </Card>
          </TabsContent>

          <TabsContent value="calendario" className="space-y-6">
            <Card className="p-6">
              <AcademicCalendar />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}