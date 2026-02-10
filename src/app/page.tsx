
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, ChevronsRight } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // Temporalmente, redirigir directamente al dashboard sin autenticación
    router.push('/dashboard');
  };

  return (
    <div 
      className="flex min-h-screen flex-col bg-background p-4 font-body"
    >
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(https://i.postimg.cc/jjnmbq64/fondo10101.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in-50 slide-in-from-bottom-10 duration-500 bg-background/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/10">
          
          <div className="text-center">
            <Image
              src="https://i.postimg.cc/SNWKyqdx/LOG_APP_VEHICULOS.png"
              alt="Logo S.U.V"
              width={128}
              height={128}
              className="mx-auto rounded-2xl mb-4 shadow-lg"
            />
            <h1 className="text-3xl font-bold text-primary tracking-tight">S.U.V</h1>
            <p className="text-muted-foreground">Control de Ubicación Vehicular</p>
            <p className="text-sm text-muted-foreground mt-2">Cuerpo Especializado en Seguridad Aeroportuaria y de la Aviación Civil - CESAC</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="text-left">
              <h2 className="text-2xl font-semibold text-foreground">Acceso al Panel</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo o Cédula</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Ingrese su correo o cédula" 
                    required 
                    className="pl-10" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={true}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                 <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Ingrese su contraseña" 
                    required 
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={true}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
               <Button type="submit" className="w-full h-12 text-base font-bold" disabled={isLoading}>
                {isLoading ? 'Accediendo...' : 'Acceder al Panel Principal'}
              </Button>
                <Button variant="outline" className="w-full h-12 text-base font-bold" type="button">
                    <User className="mr-2 h-5 w-5" />
                    Continuar como Invitado
                </Button>
            </div>
           
            <div className="text-center text-sm">
              <Link href="/usuario" className="font-medium text-primary hover:underline flex items-center justify-center gap-1">
                Vista de Usuario Móvil <ChevronsRight className="h-4 w-4" />
              </Link>
            </div>
          </form>
        </div>
      </main>
      <footer className="relative z-10 p-2 text-center text-xs text-white/80 bg-black/20 backdrop-blur-sm rounded-t-lg">
        Dirección de Tecnología y Comunicaciones del CESAC - by Kendy Qualey - Versión 1.0 - @ 2025
      </footer>
    </div>
  );
}
