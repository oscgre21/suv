
"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import {
  Map,
  Bell,
  Route,
  Users,
  Bus,
  BarChart3,
  Settings,
  LogOut,
  UserCircle,
  Smartphone,
  ChevronDown,
  Car,
  Database,
  GanttChartSquare,
  Star,
  Monitor,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { QrCodeDialog } from '@/components/qr-code-dialog';
import { usePathname } from 'next/navigation';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { LogoutDialog } from '@/components/logout-dialog';
import { ThemeToggle } from '@/components/theme-toggle';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [userViewUrl, setUserViewUrl] = useState('');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        setUserViewUrl(`${window.location.protocol}//${window.location.host}/usuario`);
    }
  }, []);
    
  const isGestionActive = pathname.startsWith('/dashboard/usuarios') || pathname.startsWith('/dashboard/choferes-y-vehiculos');
  const isConfigActive = pathname.startsWith('/dashboard/configuracion') || pathname.startsWith('/dashboard/data-master') || pathname.startsWith('/dashboard/usuario');
  
  const handleLogout = (e: React.MouseEvent<HTMLDivElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowLogoutDialog(true);
  };
  
  const getPageTitle = (path: string) => {
    if (path === '/dashboard') return 'Panel de control GPS';
    if (path.startsWith('/dashboard/solicitudes')) return 'Solicitudes y Paradas';
    if (path.startsWith('/dashboard/rutas')) return 'Gestión de Rutas';
    if (path.startsWith('/dashboard/usuarios')) return 'Gestión de Usuarios';
    if (path.startsWith('/dashboard/choferes-y-vehiculos')) return 'Choferes y Vehículos';
    if (path.startsWith('/dashboard/reportes')) return 'Reportes';
    if (path.startsWith('/dashboard/configuracion')) return 'Configuración';
    if (path.startsWith('/dashboard/data-master')) return 'Data Master';
    if (path.startsWith('/dashboard/perfil')) return 'Perfil de Usuario';
    if (path.startsWith('/vista-bus')) return 'Vista del Bus';
    if (path.startsWith('/dashboard/usuario')) return 'Vista Previa de Usuario';
    return '';
  }
  
  const pageTitle = getPageTitle(pathname);
  const isUsuarioPage = pathname === '/dashboard/usuario';

  return (
    <>
      <LogoutDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} />
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Icons.logo className="size-auto text-2xl text-sidebar-primary" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Monitoreo" isActive={pathname.startsWith('/dashboard/solicitudes') || pathname === '/dashboard'}>
                  <Link href="/dashboard">
                    <Map className="icon-monitoreo" />
                    <span>Monitoreo</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={pathname === '/dashboard/solicitudes'}>
                      <Link href="/dashboard/solicitudes">
                        <Bell className="icon-solicitudes" />
                        <span>Solicitudes y Paradas</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Rutas" isActive={pathname === '/dashboard/rutas'}>
                  <Link href="/dashboard/rutas">
                    <Route className="icon-rutas"/>
                    <span>Gestión de Rutas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <Collapsible asChild>
                <SidebarMenuItem className="collapsible-item">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Gestión" isActive={isGestionActive} className="justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="icon-gestion"/>
                          <span>Gestión</span>
                        </div>
                        <ChevronDown className="collapsible-chevron h-4 w-4" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/dashboard/usuarios'}>
                          <Link href="/dashboard/usuarios">
                            <Users className="icon-usuarios"/>
                            <span>Usuarios</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === '/dashboard/choferes-y-vehiculos'}>
                          <Link href="/dashboard/choferes-y-vehiculos">
                            <Car className="icon-choferes" />
                            <span>Choferes y Vehículos</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Reportes" isActive={pathname === '/dashboard/reportes'}>
                  <Link href="/dashboard/reportes">
                    <BarChart3 className="icon-reportes"/>
                    <span>Reportes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <Collapsible asChild>
                  <SidebarMenuItem className="collapsible-item">
                      <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip="Configuración" isActive={isConfigActive} className="justify-between">
                              <div className="flex items-center gap-2">
                                  <Settings className="icon-configuracion"/>
                                  <span>Configuración</span>
                              </div>
                              <ChevronDown className="collapsible-chevron h-4 w-4" />
                          </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                          <SidebarMenuSub>
                              <SidebarMenuSubItem>
                                  <SidebarMenuSubButton asChild isActive={pathname === '/dashboard/configuracion'}>
                                      <Link href="/dashboard/configuracion">
                                          <Settings className="icon-configuracion"/>
                                          <span>Preferencias</span>
                                      </Link>
                                  </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                  <SidebarMenuSubButton asChild isActive={pathname.startsWith('/dashboard/data-master')}>
                                      <Link href="/dashboard/data-master">
                                        <Database className="icon-datamaster"/>
                                        <span>Data Master</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                  <SidebarMenuSubButton asChild isActive={pathname === '/dashboard/usuario'}>
                                      <Link href="/dashboard/usuario">
                                        <Smartphone className="icon-configuracion" />
                                        <span>Vista Usuario</span>
                                      </Link>
                                  </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                  <SidebarMenuSubButton asChild isActive={pathname === '/vista-bus'}>
                                      <Link href="/vista-bus">
                                        <Monitor className="icon-configuracion" />
                                        <span>Vista del Bus</span>
                                      </Link>
                                  </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                          </SidebarMenuSub>
                      </CollapsibleContent>
                  </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleLogout} tooltip="Cerrar Sesión">
                      <LogOut />
                      <span>Cerrar Sesión</span>
                  </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="flex h-svh flex-col overflow-hidden">
            <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
              <SidebarTrigger className="md:hidden" />
              <div className="flex-1 font-bold text-xl">
                {pageTitle}
              </div>
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarImage src="https://placehold.co/40x40.png" />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard/configuracion" passHref>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/dashboard/perfil" passHref>
                    <DropdownMenuItem>
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </DropdownMenuItem>
                  </Link>
                  <a href={userViewUrl || '#'} target="_blank" rel="noopener noreferrer" className="block">
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={!userViewUrl}>
                          <Smartphone className="mr-2 h-4 w-4" />
                          <span>Vista Usuario (Pública)</span>
                      </DropdownMenuItem>
                  </a>
                  <QrCodeDialog 
                    qrValue={userViewUrl}
                    trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={!userViewUrl}>
                        <Smartphone className="mr-2 h-4 w-4" />
                        <span>Código Vista Usuario</span>
                      </DropdownMenuItem>
                    }
                  />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </header>
            <main className={cn(
              "flex-1 overflow-y-auto",
              isUsuarioPage ? "p-0" : "p-4 sm:p-6"
            )}>
              {children}
            </main>
            <footer className="shrink-0 border-t bg-background/95 p-2 text-center text-xs text-muted-foreground backdrop-blur-sm">
              Dirección de Tecnología y Comunicaciones del CESAC - Versión 1.0 - @ 2025
            </footer>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
