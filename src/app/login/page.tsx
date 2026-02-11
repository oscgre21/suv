'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { execute } = useApi();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Por favor complete todos los campos',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await execute('/api/auth/login', 'POST', {
        email,
        password,
      });

      if (response.success) {
        toast({
          title: 'Bienvenido',
          description: `Sesión iniciada como ${response.usuario.nombre}`,
        });
        router.push('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Credenciales inválidas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center space-y-2">
          <Icons.logo className="h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
          <p className="text-sm text-muted-foreground">Sistema de Ubicación Vehicular - CESAC</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          <p>Usuario de prueba: juan.perez@empresa.com</p>
          <p>Contraseña: password123</p>
        </div>
      </div>
    </div>
  );
}
