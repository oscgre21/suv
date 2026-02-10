
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const statuses = [
  { id: 'status-01', name: 'Operativo', description: 'El vehículo está funcionando correctamente.', color: 'default' },
  { id: 'status-02', name: 'En Taller', description: 'El vehículo está en mantenimiento o reparación.', color: 'destructive' },
  { id: 'status-03', name: 'Fuera de Servicio', description: 'El vehículo no está disponible para operaciones.', color: 'secondary' },
  { id: 'status-04', name: 'En Espera', description: 'Vehículo disponible pero sin asignación actual.', color: 'outline' },
];

export default function EstatusVehiculoDataMasterPage() {
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
                    <h1 className="text-3xl font-bold font-headline">Data Master: Estatus de Vehículos</h1>
                </div>
                <Button className="bg-accent hover:bg-accent/90">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Estatus
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Estatus de Vehículos</CardTitle>
                    <CardDescription>Gestione los posibles estados de los vehículos de la flota.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre del Estatus</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {statuses.map((status) => (
                                <TableRow key={status.id}>
                                    <TableCell className="font-medium">
                                      <Badge variant={status.color as any}>{status.name}</Badge>
                                    </TableCell>
                                    <TableCell>{status.description}</TableCell>
                                    <TableCell>{status.id}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>Editar</DropdownMenuItem>
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
