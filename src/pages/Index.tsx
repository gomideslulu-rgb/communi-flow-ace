import { useState } from 'react';
import { RoadmapContainer } from '@/components/roadmap/RoadmapContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [isVisitor, setIsVisitor] = useState(false);
  const navigate = useNavigate();

  if (isVisitor) {
    return <RoadmapContainer visitorMode={true} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Roadmap de Comunicação</CardTitle>
            <CardDescription>
              Gerencie comunicações acadêmicas com inteligência e eficiência
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => navigate('/auth')}
            className="w-full"
            size="lg"
          >
            Entrar no Sistema
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou
              </span>
            </div>
          </div>

          <Button
            onClick={() => setIsVisitor(true)}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Eye className="mr-2 h-4 w-4" />
            Visualizar como Visitante
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
