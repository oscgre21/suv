"use client";

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { UsuarioProvider } from '@/app/usuario/usuario-provider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <UsuarioProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
                <Toaster />
            </ThemeProvider>
        </UsuarioProvider>
    );
}
