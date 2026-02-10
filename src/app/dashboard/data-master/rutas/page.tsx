
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, ArrowLeft, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

const routes = [
  { 
    id: 'RUTA-01', 
    name: 'Ruta Charles de Gaulle', 
    stops: 15, 
    status: 'Activa',
    stopList: [
        "Parada 1: Av. Sabana Larga",
        "Parada 2: Puente Juan Carlos",
        "Parada 3: Estación Concepción Bona",
        "Parada 4: Carretera Mella Km 8"
    ]
  },
  { 
    id: 'RUTA-02', 
    name: 'Ruta Autopista Duarte', 
    stops: 12, 
    status: 'Activa',
    stopList: [
        "Parada 1: Km 9 Autopista Duarte",
        "Parada 2: Av. John F. Kennedy",
        "Parada 3: Plaza de la Bandera",
    ]
  },
  { 
    id: 'RUTA-03', 
    name: 'Ruta Independencia', 
    stops: 18, 
    status: 'Activa',
    stopList: [
        "Parada 1: Parque Independencia",
        "Parada 2: Malecón Center",
        "Parada 3: Feria Ganadera",
    ]
  },
  { 
    id: 'RUTA-04', 
    name: 'Ruta 27 de Febrero', 
    stops: 22, 
    status: 'Inactiva',
    stopList: [
        "Parada 1: Palacio Nacional",
        "Parada 2: Agora Mall",
        "Parada 3: Pinturas",
    ]
  },
];

export default function RutasDataMasterPage() {
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
                    <h1 className="text-3xl font-bold font-headline">Data Master: Rutas</h1>
                </div>
                <Button className="bg-accent hover:bg-accent/90">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Ruta
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Rutas</CardTitle>
                    <CardDescription>Gestione las rutas del sistema de transporte. Haz clic en una fila para ver las paradas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre de Ruta</TableHead>
                                <TableHead>ID Ruta</TableHead>
                                <TableHead>Nro. de Paradas</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead><span className="sr-only">Acciones</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {routes.map((route) => (
                                <Collapsible asChild key={route.id}>
                                    <>
                                        <CollapsibleTrigger asChild>
                                            <TableRow className="cursor-pointer hover:bg-muted/50 data-[state=open]:bg-muted/50">
                                                <TableCell className="font-medium">{route.name}</TableCell>
                                                <TableCell>{route.id}</TableCell>
                                                <TableCell>{route.stops}</TableCell>
                                                <TableCell>
                                                    <Badge variant={route.status === 'Activa' ? 'default' : 'secondary'}>{route.status}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Editar</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Gestionar Paradas</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive" onClick={(e) => e.stopPropagation()}>Eliminar</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent asChild>
                                             <TableRow>
                                                <TableCell colSpan={5} className="p-0">
                                                    <div className="p-6 bg-muted/30">
                                                        <h4 className="text-md font-semibold mb-3">Paradas de la Ruta</h4>
                                                        <ul className="space-y-2">
                                                            {route.stopList.map(stop => (
                                                                <li key={stop} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                    <MapPin className="h-4 w-4 text-primary/70" />
                                                                    <span>{stop}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
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
        </div>
    );
}
