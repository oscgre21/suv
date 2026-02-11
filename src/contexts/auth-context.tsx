'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { useRouter } from 'next/navigation';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  cedula: string;
  rutaAsignada: string | null;
  ruta: {
    id: string;
    nombre: string;
    color: string;
  } | null;
}

interface AuthContextType {
  usuario: Usuario | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { execute } = useApi();
  const router = useRouter();

  const fetchUsuario = async () => {
    try {
      const data = await execute('/api/auth/session', 'GET');
      setUsuario(data);
    } catch (error) {
      setUsuario(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuario();
  }, []);

  const logout = async () => {
    try {
      await execute('/api/auth/logout', 'POST');
      setUsuario(null);
      router.push('/');
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const refresh = async () => {
    await fetchUsuario();
  };

  return (
    <AuthContext.Provider value={{ usuario, isLoading, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
