
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Star, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const specialRoutes = [
  { id: 'RUTA-ESP-01', name: 'Evento Aniversario', date: '2024-12-15', stops: 5, status: 'Programada' },
  { id: 'RUTA-ESP-02', name: 'Mantenimiento Zona Franca', date: '2024-08-10', stops: 3, status: 'Completada' },
  { id: 'RUTA-ESP-03', name: 'Visita Corporativa', date: '2024-09-01', stops: 2, status: 'Programada' },
];

export default function RutasEspecialesDataMasterPage() {
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
                    <h1 className="text-3xl font-bold font-headline">Data Master: Rutas Especiales</h1>
                </div>
                <Button className="bg-accent hover:bg-accent/90">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Ruta Especial
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Rutas Especiales</CardTitle>
                    <CardDescription>Gestione rutas temporales o para eventos específicos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre de Ruta</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Nro. de Paradas</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {specialRoutes.map((route) => (
                                <TableRow key={route.id}>
                                    <TableCell className="font-medium flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500"/>{route.name}</TableCell>
                                    <TableCell>{route.date}</TableCell>
                                    <TableCell>{route.stops}</TableCell>
                                    <TableCell>
                                        <Badge variant={route.status === 'Programada' ? 'default' : 'secondary'}>{route.status}</Badge>
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
                                                <DropdownMenuItem>Gestionar Paradas</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Cancelar Ruta</DropdownMenuItem>
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
