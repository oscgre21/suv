"use client";

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { UsuarioProvider } from '@/app/usuario/usuario-provider';
import { AuthProvider } from '@/contexts/auth-context';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
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
        </AuthProvider>
    );
}
