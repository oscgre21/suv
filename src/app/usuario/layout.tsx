
"use client";

import { Home, Calendar, User, History, Bus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Skeleton } from '@/components/ui/skeleton';
import { useUsuario } from './usuario-provider';

// --- PAGE TITLE ---
const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/usuario/historial/')) {
      return 'Detalles del Viaje';
    }
    switch (pathname) {
        case '/usuario':
            return 'Inicio';
        case '/usuario/horarios':
            return 'Horarios';
        case '/usuario/historial':
            return 'Historial de Viajes';
        case '/usuario/perfil':
            return 'Perfil';
        default:
            return 'Mi Ruta';
    }
};

// --- NAV ITEMS ---
const navItems = [
    { href: '/usuario', icon: Home, label: 'Inicio' },
    { href: '/usuario/horarios', icon: Calendar, label: 'Horarios' },
    { href: '/usuario/historial', icon: History, label: 'Historial' },
    { href: '/usuario/perfil', icon: User, label: 'Perfil' },
];

const HeaderCountdown = () => {
    const { countdownSeconds } = useUsuario();
    const minutes = Math.floor(countdownSeconds / 60);
    const seconds = countdownSeconds % 60;

    return (
        <Link href="/usuario" className="flex items-center gap-2 text-sm font-medium text-primary rounded-lg p-2 hover:bg-muted">
            <Bus className="h-5 w-5 animate-pulse" />
            <span className="font-mono">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
        </Link>
    );
};

// --- INNER LAYOUT COMPONENT ---
function UsuarioLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pageTitle, setPageTitle] = useState('');
  const { notified } = useUsuario();
  
  useEffect(() => {
    setPageTitle(getPageTitle(pathname));
  }, [pathname]);

  return (
    <div className="flex h-screen flex-col bg-muted/20 font-body">
        <header className="sticky top-0 z-10 w-full border-b bg-background p-4 shadow-sm flex justify-between items-center">
            <div className="flex-1">
                {pageTitle ? (
                    <h1 className="text-xl font-bold text-center">{pageTitle}</h1>
                ) : (
                    <Skeleton className="h-6 w-32 mx-auto" />
                )}
            </div>
            <div className="flex items-center gap-2">
                {notified && <HeaderCountdown />}
                <ThemeToggle />
            </div>
        </header>
        
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div key={pathname} className="animate-fade-in-up h-full flex-1 flex flex-col">
            {children}
          </div>
        </main>

        <footer className="sticky bottom-0 z-10 w-full border-t bg-background">
            <nav className="flex items-center justify-around h-16">
                {navItems.map(item => (
                    <Link 
                        key={item.href} 
                        href={item.href} 
                        className={cn(
                            "flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors",
                            (pathname === item.href || (item.href !== '/usuario' && pathname.startsWith(item.href))) && "text-primary"
                        )}
                    >
                        <div className="transition-transform duration-200 ease-out hover:scale-110 active:scale-95">
                          <item.icon className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>
            <div className="pb-2 text-center text-xs text-muted-foreground">
                Dirección de Tecnología y Comunicaciones del CESAC - by Kendy Qualey - Versión 1.0 - @ 2025
            </div>
        </footer>
    </div>
  );
}


// --- MAIN LAYOUT EXPORT ---
export default function UsuarioLayout({ children }: { children: React.ReactNode }) {
  // We no longer need a provider here, as it's handled by the GlobalStateProvider in the root layout.
  return <UsuarioLayoutContent>{children}</UsuarioLayoutContent>
}
