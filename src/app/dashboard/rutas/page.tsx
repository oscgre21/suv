
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


const routes = [
  { name: 'Ruta Charles de Gaulle', driver: 'Manuel Gonzalez', bus: 'Ficha 01 - Toyota Coaster', stops: 15 },
  { name: 'Ruta Autopista Duarte', driver: 'Ricardo Peralta', bus: 'Ficha 02 - Mitsubishi Rosa', stops: 12 },
  { name: 'Ruta Independencia', driver: 'Julia Martinez', bus: 'Ficha 04 - Hyundai County', stops: 18 },
  { name: 'Ruta 27 de Febrero', driver: 'Carlos Santana', bus: 'Ficha 05 - Toyota Coaster', stops: 22 },
];

export default function RutasPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Gestión de Rutas</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Nueva Ruta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Ruta</DialogTitle>
              <DialogDescription>
                Complete la información para registrar una nueva ruta en el sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input id="name" placeholder="Ej: Ruta Corredor Lincoln" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stops" className="text-right">
                  Paradas
                </Label>
                <Input id="stops" type="number" placeholder="Ej: 18" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Guardar Ruta</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Rutas Activas</CardTitle>
          <CardDescription>Listado de todas las rutas configuradas en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre de Ruta</TableHead>
                <TableHead>Chofer Asignado</TableHead>
                <TableHead>Bus Asignado</TableHead>
                <TableHead className="text-center">Paradas</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.name}>
                  <TableCell className="font-medium">{route.name}</TableCell>
                  <TableCell>{route.driver}</TableCell>
                  <TableCell>{route.bus}</TableCell>
                  <TableCell className="text-center">{route.stops}</TableCell>
                  <TableCell>
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem>Editar Ruta</DropdownMenuItem>
                          <DropdownMenuItem>Gestionar Paradas</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive">
                              Eliminar Ruta
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la ruta
                             <span className="font-semibold"> {route.name}</span> del sistema.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
