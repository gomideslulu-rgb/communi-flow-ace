import React from 'react';
import { Card } from '@/components/ui/card';
import { CalendarView } from './CalendarView';
import { CommunicationForm } from './CommunicationForm';
import { AcademicCalendar } from './AcademicCalendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, GraduationCap, ArrowLeft } from 'lucide-react';
import { UserMenu } from '@/components/ui/user-menu';
import { useMarcos } from '@/hooks/useMarcos';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useNavigate } from 'react-router-dom';

interface RoadmapContainerProps {
  visitorMode?: boolean;
}

export function RoadmapContainer({ visitorMode = false }: RoadmapContainerProps) {
  const { marcos, addMarco, deleteMarco } = useMarcos();
  const supabaseData = useSupabaseData();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex justify-between items-start">
          {visitorMode && (
            <Button
              onClick={() => navigate('/auth')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          )}
          <div className={`text-center space-y-2 ${visitorMode ? 'flex-1' : 'flex-1'}`}>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Roadmap de Comunicação
            </h1>
            <p className="text-muted-foreground">
              {visitorMode 
                ? "Visualizando como visitante - Apenas leitura"
                : "Gerencie comunicações acadêmicas com inteligência e eficiência"
              }
            </p>
          </div>
          {!visitorMode && <UserMenu />}
        </header>

        {visitorMode ? (
          <CalendarView marcos={marcos} supabaseData={supabaseData} />
        ) : (
          <Tabs defaultValue="roadmap" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="roadmap" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Roadmap
              </TabsTrigger>
              <TabsTrigger value="calendario" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Calendário Acadêmico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="roadmap" className="space-y-6">
              <CalendarView marcos={marcos} supabaseData={supabaseData} />
            </TabsContent>

            <TabsContent value="calendario" className="space-y-6">
              <Card className="p-6">
                <AcademicCalendar marcos={marcos} onAddMarco={addMarco} onDeleteMarco={deleteMarco} />
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}