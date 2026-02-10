
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const vehicles = [
    { id: 'Ficha 01', model: 'Toyota Coaster 2022', plate: 'I098765', capacity: 30, status: 'Operativo' },
    { id: 'Ficha 02', model: 'Mitsubishi Rosa 2021', plate: 'I098766', capacity: 28, status: 'Operativo' },
    { id: 'Ficha 03', model: 'Hyundai H350 2020', plate: 'I098767', capacity: 16, status: 'En Taller' },
    { id: 'Ficha 04', model: 'Hyundai County 2023', plate: 'I098768', capacity: 29, status: 'Operativo' },
]

export default function VehiculosDataMasterPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                     <Button asChild variant="outline" size="icon">
                        <Link href="/dashboard/data-master">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Volver</span>
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold font-headline">Data Master: Vehículos</h1>
                </div>
                <Button className="bg-accent hover:bg-accent/90">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Vehículo
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Vehículos (Buses)</CardTitle>
                    <CardDescription>Gestione los vehículos de la flota.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ficha</TableHead>
                                <TableHead>Modelo</TableHead>
                                <TableHead>Placa</TableHead>
                                <TableHead>Capacidad</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vehicles.map((v) => (
                                <TableRow key={v.id}>
                                    <TableCell className="font-medium">{v.id}</TableCell>
                                    <TableCell>{v.model}</TableCell>
                                    <TableCell>{v.plate}</TableCell>
                                    <TableCell>{v.capacity} pasajeros</TableCell>
                                    <TableCell><Badge variant={v.status === 'Operativo' ? 'default' : 'destructive'}>{v.status}</Badge></TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>Editar</DropdownMenuItem>
                                                <DropdownMenuItem>Ver Documentación</DropdownMenuItem>
                                                <DropdownMenuItem>Registrar Mantenimiento</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
