
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DriverProfileCard } from "@/components/driver-profile-card";
import type { Driver } from "@/components/driver-profile-card";
import React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import Link from "next/link";


const drivers: Driver[] = [
  { 
    id: 1, 
    name: 'Manuel Gonzalez', 
    employeeId: 'CESAC-CH-001',
    shift: 'Matutino', 
    bus: 'Ficha 01', 
    status: 'Activo',
    avatarUrl: 'https://placehold.co/96x96.png',
    currentRoute: 'Ruta Charles de Gaulle',
    recentTrips: 42,
    passengersTransported: 1250,
    routeHistory: [
      { date: '2024-07-22', route: 'Ruta Charles de Gaulle', bus: 'Ficha 01', schedule: '06:00 - 15:00' },
      { date: '2024-07-21', route: 'Ruta Charles de Gaulle', bus: 'Ficha 01', schedule: '06:00 - 15:00' },
      { date: '2024-07-20', route: 'Ruta 27 de Febrero', bus: 'Ficha 05', schedule: '06:00 - 15:00' },
    ]
  },
  { 
    id: 2, 
    name: 'Ricardo Peralta', 
    employeeId: 'CESAC-CH-002',
    shift: 'Matutino', 
    bus: 'Ficha 02', 
    status: 'Activo',
    avatarUrl: 'https://placehold.co/96x96.png',
    currentRoute: 'Ruta Autopista Duarte',
    recentTrips: 38,
    passengersTransported: 1100,
     routeHistory: [
      { date: '2024-07-22', route: 'Ruta Autopista Duarte', bus: 'Ficha 02', schedule: '06:00 - 15:00' },
      { date: '2024-07-21', route: 'Ruta Autopista Duarte', bus: 'Ficha 02', schedule: '06:00 - 15:00' },
      { date: '2024-07-20', route: 'Ruta Autopista Duarte', bus: 'Ficha 02', schedule: '06:00 - 15:00' },
    ]
  },
  { 
    id: 3, 
    name: 'Julia Martinez', 
    employeeId: 'CESAC-CH-003',
    shift: 'Vespertino', 
    bus: 'Ficha 04', 
    status: 'Activo',
    avatarUrl: 'https://placehold.co/96x96.png',
    currentRoute: 'Ruta Independencia',
    recentTrips: 51,
    passengersTransported: 1400,
    routeHistory: [
      { date: '2024-07-22', route: 'Ruta Independencia', bus: 'Ficha 04', schedule: '14:00 - 23:00' },
      { date: '2024-07-21', route: 'Ruta Independencia', bus: 'Ficha 04', schedule: '14:00 - 23:00' },
      { date: '2024-07-19', route: 'Ruta Independencia', bus: 'Ficha 04', schedule: '14:00 - 23:00' },
    ]
  },
  { 
    id: 4, 
    name: 'Carlos Santana', 
    employeeId: 'CESAC-CH-004',
    shift: 'Matutino', 
    bus: 'Ficha 05', 
    status: 'Vacaciones',
    avatarUrl: 'https://placehold.co/96x96.png',
    currentRoute: 'N/A',
    recentTrips: 30,
    passengersTransported: 980,
    routeHistory: [
      { date: '2024-07-15', route: 'Ruta 27 de Febrero', bus: 'Ficha 05', schedule: '06:00 - 15:00' },
      { date: '2024-07-14', route: 'Ruta 27 de Febrero', bus: 'Ficha 05', schedule: '06:00 - 15:00' },
      { date: '2024-07-13', route: 'Ruta 27 de Febrero', bus: 'Ficha 05', schedule: '06:00 - 15:00' },
    ]
  },
];

const vehicles = [
    { id: 'Ficha 01', model: 'Toyota Coaster 2022', plate: 'I098765', status: 'Operativo', maintenance: '20/08/2024' },
    { id: 'Ficha 02', model: 'Mitsubishi Rosa 2021', plate: 'I098766', status: 'Operativo', maintenance: '15/09/2024' },
    { id: 'Ficha 03', model: 'Hyundai H350 2020', plate: 'I098767', status: 'En Taller', maintenance: 'N/A' },
    { id: 'Ficha 04', model: 'Hyundai County 2023', plate: 'I098768', status: 'Operativo', maintenance: '30/07/2024' },
]


export default function ChoferesVehiculosPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-headline">Gestión de Choferes y Vehículos</h1>

            <Tabs defaultValue="choferes">
                <div className="flex justify-between items-center">
                    <TabsList>
                        <TabsTrigger value="choferes">Choferes</TabsTrigger>
                        <TabsTrigger value="vehiculos">Vehículos</TabsTrigger>
                    </TabsList>
                    <Button asChild className="bg-accent hover:bg-accent/90">
                      <Link href="/dashboard/data-master/conductores">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir Nuevo
                      </Link>
                    </Button>
                </div>
                <TabsContent value="choferes">
                    <Card>
                        <CardHeader>
                            <CardTitle>Registro de Choferes</CardTitle>
                            <CardDescription>Información y estado de los choferes del sistema. Haz clic en una fila para ver detalles.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Turno</TableHead>
                                        <TableHead>Bus Asignado</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead><span className="sr-only">Acciones</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {drivers.map(driver => (
                                        <Collapsible key={driver.id} asChild>
                                            <>
                                                <CollapsibleTrigger asChild>
                                                    <TableRow className="cursor-pointer hover:bg-muted/50 data-[state=open]:bg-muted/50">
                                                        <TableCell className="font-medium">{driver.name}</TableCell>
                                                        <TableCell>{driver.shift}</TableCell>
                                                        <TableCell>{driver.bus}</TableCell>
                                                        <TableCell><Badge variant={driver.status === 'Activo' ? 'default' : 'outline'}>{driver.status}</Badge></TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Asignar Turno/Vehículo</DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent asChild>
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="p-0">
                                                            <div className="p-6 bg-muted/20">
                                                                <DriverProfileCard driver={driver} />
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                </CollapsibleContent>
                                            </>
                                        </Collapsible>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="vehiculos">
                    <Card>
                        <CardHeader>
                            <CardTitle>Registro de Vehículos</CardTitle>
                            <CardDescription>Información y estado de la flota de buses.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ficha</TableHead>
                                        <TableHead>Modelo</TableHead>
                                        <TableHead>Placa</TableHead>
                                        <TableHead>Estado Mecánico</TableHead>
                                        <TableHead>Próx. Mant.</TableHead>
                                        <TableHead><span className="sr-only">Acciones</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vehicles.map(v => (
                                        <TableRow key={v.id}>
                                            <TableCell className="font-medium">{v.id}</TableCell>
                                            <TableCell>{v.model}</TableCell>
                                            <TableCell>{v.plate}</TableCell>
                                            <TableCell><Badge variant={v.status === 'Operativo' ? 'default' : 'destructive'}>{v.status}</Badge></TableCell>
                                            <TableCell>{v.maintenance}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>Ver Documentación</DropdownMenuItem>
                                                        <DropdownMenuItem>Registrar Mantenimiento</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
