"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Link from "next/link";
import { useApiList } from "@/hooks/use-api-list";
import type { ConductorWithRelations, VehiculoWithRelations } from "@/types";

export default function ChoferesVehiculosPage() {
    const {
        items: conductores,
        isLoading: isLoadingConductores,
    } = useApiList<ConductorWithRelations>({
        endpoint: '/api/conductores',
    });

    const {
        items: vehiculos,
        isLoading: isLoadingVehiculos,
    } = useApiList<VehiculoWithRelations>({
        endpoint: '/api/vehiculos',
    });

    const getEstadoBadge = (estado: string) => {
        const variants: Record<string, "default" | "outline" | "secondary"> = {
            'Activo': 'default',
            'Vacaciones': 'outline',
            'Inactivo': 'secondary',
        };
        return <Badge variant={variants[estado] || 'outline'}>{estado}</Badge>;
    };

    const getEstadoVehiculoBadge = (estado: string) => {
        const variants: Record<string, "default" | "destructive" | "secondary"> = {
            'Operativo': 'default',
            'EnTaller': 'destructive',
            'FueraDeServicio': 'secondary',
        };
        const labels: Record<string, string> = {
            'Operativo': 'Operativo',
            'EnTaller': 'En Taller',
            'FueraDeServicio': 'Fuera de Servicio',
        };
        return <Badge variant={variants[estado] || 'outline'}>{labels[estado] || estado}</Badge>;
    };

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
                            <CardDescription>
                                Información y estado de los choferes del sistema. Haz clic en una fila para ver detalles.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingConductores ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : conductores.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    No hay conductores registrados
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Cédula</TableHead>
                                            <TableHead>Turno</TableHead>
                                            <TableHead>Bus Asignado</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead><span className="sr-only">Acciones</span></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {conductores.map(conductor => (
                                            <Collapsible key={conductor.id} asChild>
                                                <>
                                                    <CollapsibleTrigger asChild>
                                                        <TableRow className="cursor-pointer hover:bg-muted/50 data-[state=open]:bg-muted/50">
                                                            <TableCell className="font-medium">{conductor.nombre}</TableCell>
                                                            <TableCell>{conductor.cedula}</TableCell>
                                                            <TableCell>{conductor.turno}</TableCell>
                                                            <TableCell>
                                                                {conductor.vehiculo ? conductor.vehiculo.ficha : 'Sin asignar'}
                                                            </TableCell>
                                                            <TableCell>{getEstadoBadge(conductor.estado)}</TableCell>
                                                            <TableCell>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            className="h-8 w-8 p-0"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                window.location.href = `/dashboard/data-master/conductores`;
                                                                            }}
                                                                        >
                                                                            Ver/Editar Detalles
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                                                            Asignar Turno/Vehículo
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent asChild>
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="p-0">
                                                                <div className="p-6 bg-muted/20">
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <div>
                                                                            <h4 className="font-semibold mb-2">Información de Contacto</h4>
                                                                            <div className="space-y-1 text-sm">
                                                                                <p><span className="font-medium">Teléfono:</span> {conductor.telefono}</p>
                                                                                <p><span className="font-medium">Email:</span> {conductor.email || 'No registrado'}</p>
                                                                                <p><span className="font-medium">Licencia:</span> {conductor.licencia}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-semibold mb-2">Asignación Actual</h4>
                                                                            <div className="space-y-1 text-sm">
                                                                                <p><span className="font-medium">Vehículo:</span> {conductor.vehiculo ? `${conductor.vehiculo.ficha} - ${conductor.vehiculo.modelo}` : 'Sin asignar'}</p>
                                                                                <p><span className="font-medium">Turno:</span> {conductor.turno}</p>
                                                                                <p><span className="font-medium">Horarios activos:</span> {conductor.horarios?.length || 0}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {conductor.horarios && conductor.horarios.length > 0 && (
                                                                        <div className="mt-4">
                                                                            <h4 className="font-semibold mb-2">Rutas Asignadas</h4>
                                                                            <div className="space-y-1 text-sm">
                                                                                {conductor.horarios.map((horario: any, idx: number) => (
                                                                                    <p key={idx}>
                                                                                        <span className="font-medium">{horario.ruta.nombre}:</span> {horario.horaInicio} - {horario.horaFin}
                                                                                    </p>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    </CollapsibleContent>
                                                </>
                                            </Collapsible>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
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
                            {isLoadingVehiculos ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : vehiculos.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    No hay vehículos registrados
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Ficha</TableHead>
                                            <TableHead>Modelo</TableHead>
                                            <TableHead>Placa</TableHead>
                                            <TableHead>Capacidad</TableHead>
                                            <TableHead>Conductor</TableHead>
                                            <TableHead>Ruta</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead><span className="sr-only">Acciones</span></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {vehiculos.map(vehiculo => (
                                            <TableRow key={vehiculo.id}>
                                                <TableCell className="font-medium">{vehiculo.ficha}</TableCell>
                                                <TableCell>{vehiculo.modelo}</TableCell>
                                                <TableCell>{vehiculo.placa}</TableCell>
                                                <TableCell>{vehiculo.capacidad} pasajeros</TableCell>
                                                <TableCell>
                                                    {vehiculo.conductor ? vehiculo.conductor.nombre : 'Sin asignar'}
                                                </TableCell>
                                                <TableCell>
                                                    {vehiculo.ruta ? vehiculo.ruta.nombre : 'Sin asignar'}
                                                </TableCell>
                                                <TableCell>{getEstadoVehiculoBadge(vehiculo.estado)}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    window.location.href = `/dashboard/data-master/vehiculos`;
                                                                }}
                                                            >
                                                                Ver/Editar Detalles
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>Asignar Ruta</DropdownMenuItem>
                                                            <DropdownMenuItem>Historial de Viajes</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
