
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const drivers = [
    { id: 'CESAC-CH-001', name: 'Manuel Gonzalez', license: '001-1234567-8', status: 'Activo' },
    { id: 'CESAC-CH-002', name: 'Ricardo Peralta', license: '001-8765432-1', status: 'Activo' },
    { id: 'CESAC-CH-003', name: 'Julia Martinez', license: '001-2345678-9', status: 'Activo' },
    { id: 'CESAC-CH-004', name: 'Carlos Santana', license: '001-9876543-2', status: 'Vacaciones' },
];

export default function ConductoresDataMasterPage() {
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
                    <h1 className="text-3xl font-bold font-headline">Data Master: Conductores</h1>
                </div>
                <Button className="bg-accent hover:bg-accent/90">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Conductor
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Conductores</CardTitle>
                    <CardDescription>Gestione los registros de los conductores del sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre Completo</TableHead>
                                <TableHead>ID Empleado</TableHead>
                                <TableHead>Cédula/Licencia</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {drivers.map((driver) => (
                                <TableRow key={driver.id}>
                                    <TableCell className="font-medium">{driver.name}</TableCell>
                                    <TableCell>{driver.id}</TableCell>
                                    <TableCell>{driver.license}</TableCell>
                                    <TableCell>
                                        <Badge variant={driver.status === 'Activo' ? 'default' : 'outline'}>{driver.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>Editar</DropdownMenuItem>
                                                <DropdownMenuItem>Ver Documentación</DropdownMenuItem>
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
