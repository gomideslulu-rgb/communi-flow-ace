import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Calendar, Users } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, user, continueAsGuest } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Erro no login',
        description: error.message === 'Invalid login credentials' 
          ? 'Email ou senha incorretos' 
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo de volta.',
      });
      navigate('/');
    }

    setLoading(false);
  };

  const handleGuestAccess = () => {
    continueAsGuest();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gradient">
            Roadmap de Comunicação
          </h1>
          <p className="text-muted-foreground">
            Acesse sua conta ou visualize como visitante
          </p>
        </div>

        <Card className="shadow-elegant">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Bem-vindo</CardTitle>
            <CardDescription className="text-center">
              Faça login para acessar todas as funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  ou
                </span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleGuestAccess}
            >
              <Users className="mr-2 h-4 w-4" />
              Continuar como Visitante
            </Button>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <Calendar className="w-4 h-4" />
            Como visitante, você pode visualizar o roadmap
          </p>
        </div>
      </div>
    </div>
  );
}