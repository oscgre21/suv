import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const users = [
    { id: 'CESAC-001', name: 'Juan Perez', route: 'Ruta Charles de Gaulle', status: 'Activo' },
    { id: 'CESAC-002', name: 'Maria Rodriguez', route: 'Ruta Charles de Gaulle', status: 'Activo' },
    { id: 'CESAC-003', name: 'Carlos Gomez', route: 'Ruta Autopista Duarte', status: 'Activo' },
    { id: 'CESAC-004', name: 'Ana Martinez', route: 'Ruta Independencia', status: 'Inactivo' },
    { id: 'CESAC-005', name: 'Pedro Jimenez', route: 'Ruta Autopista Duarte', status: 'Activo' },
];

export default function UsuariosPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-headline">Gestión de Usuarios</h1>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <FileDown className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>
                    <Button className="bg-accent hover:bg-accent/90">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Registrar Empleado
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Empleados Registrados</CardTitle>
                    <CardDescription>Listado de empleados con acceso al servicio de transporte.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre Completo</TableHead>
                                <TableHead>ID Empleado</TableHead>
                                <TableHead>Ruta Asignada</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>
                                    <span className="sr-only">Acciones</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell>{user.route}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === 'Activo' ? 'default' : 'secondary'}>{user.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem>Ver Historial de Viajes</DropdownMenuItem>
                                                <DropdownMenuItem>Editar Usuario</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">Desactivar Usuario</DropdownMenuItem>
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
