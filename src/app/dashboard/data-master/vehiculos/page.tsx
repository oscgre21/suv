"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehiculoSchema, type VehiculoFormData } from '@/lib/validations';
import { useApiList } from '@/hooks/use-api-list';
import { useToast } from '@/hooks/use-toast';
import type { VehiculoWithRelations, RutaWithRelations } from '@/types';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, ArrowLeft } from 'lucide-react';

export default function VehiculosPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState<VehiculoWithRelations | null>(null);
  const [deletingVehiculoId, setDeletingVehiculoId] = useState<string | null>(null);
  const [rutas, setRutas] = useState<RutaWithRelations[]>([]);
  const { toast } = useToast();

  const {
    items: vehiculos,
    isLoading,
    createItem,
    updateItem,
    deleteItem,
  } = useApiList<VehiculoWithRelations>({
    endpoint: '/api/vehiculos',
  });

  const form = useForm<VehiculoFormData>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: {
      ficha: '',
      modelo: '',
      placa: '',
      capacidad: 20,
      estado: 'Operativo',
      rutaAsignada: null,
    },
  });

  useEffect(() => {
    // Cargar rutas para el selector
    fetch('/api/rutas')
      .then((res) => res.json())
      .then((data) => setRutas(data))
      .catch((err) => console.error('Error loading rutas:', err));
  }, []);

  const handleOpenDialog = (vehiculo?: VehiculoWithRelations) => {
    if (vehiculo) {
      setEditingVehiculo(vehiculo);
      form.reset({
        ficha: vehiculo.ficha,
        modelo: vehiculo.modelo,
        placa: vehiculo.placa,
        capacidad: vehiculo.capacidad,
        estado: vehiculo.estado as any,
        rutaAsignada: vehiculo.rutaAsignada,
      });
    } else {
      setEditingVehiculo(null);
      form.reset({
        ficha: '',
        modelo: '',
        placa: '',
        capacidad: 20,
        estado: 'Operativo',
        rutaAsignada: null,
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: VehiculoFormData) => {
    try {
      if (editingVehiculo) {
        await updateItem(editingVehiculo.id, data);
        toast({
          title: '✅ Vehículo actualizado',
          description: `Ficha ${data.ficha} ha sido actualizada exitosamente.`,
        });
      } else {
        await createItem(data);
        toast({
          title: '✅ Vehículo creado',
          description: `Ficha ${data.ficha} ha sido registrada exitosamente.`,
        });
      }

      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error saving vehiculo:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingVehiculoId) return;

    try {
      await deleteItem(deletingVehiculoId);
      toast({
        title: '✅ Vehículo eliminado',
        description: 'El vehículo ha sido eliminado exitosamente.',
      });
      setIsDeleteDialogOpen(false);
      setDeletingVehiculoId(null);
    } catch (error) {
      console.error('Error deleting vehiculo:', error);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const variants = {
      Operativo: 'default',
      EnTaller: 'secondary',
      FueraDeServicio: 'destructive',
    };
    return (
      <Badge variant={variants[estado as keyof typeof variants] as any}>
        {estado === 'EnTaller' ? 'En Taller' : estado === 'FueraDeServicio' ? 'Fuera de Servicio' : estado}
      </Badge>
    );
  };

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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-accent hover:bg-accent/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Vehículo
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingVehiculo ? 'Editar Vehículo' : 'Añadir Nuevo Vehículo'}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="ficha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ficha</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Ficha 01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="modelo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo</FormLabel>
                        <FormControl>
                          <Input placeholder="Toyota Coaster 2022" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="placa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placa</FormLabel>
                        <FormControl>
                          <Input placeholder="I098765" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="capacidad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacidad (Pasajeros)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={10}
                            max={100}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Operativo">Operativo</SelectItem>
                            <SelectItem value="EnTaller">En Taller</SelectItem>
                            <SelectItem value="FueraDeServicio">Fuera de Servicio</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="rutaAsignada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ruta Asignada (Opcional)</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "__none__" ? null : value)}
                        value={field.value || "__none__"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sin ruta asignada" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="__none__">Sin ruta</SelectItem>
                          {rutas.map((ruta) => (
                            <SelectItem key={ruta.id} value={ruta.id}>
                              {ruta.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  {editingVehiculo ? 'Actualizar Vehículo' : 'Guardar Vehículo'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehículos (Buses)</CardTitle>
          <CardDescription>Gestione los vehículos de la flota.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
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
                  <TableHead>Ruta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehiculos.map((vehiculo) => (
                  <TableRow key={vehiculo.id}>
                    <TableCell className="font-medium">{vehiculo.ficha}</TableCell>
                    <TableCell>{vehiculo.modelo}</TableCell>
                    <TableCell>{vehiculo.placa}</TableCell>
                    <TableCell>{vehiculo.capacidad} pasajeros</TableCell>
                    <TableCell>
                      {vehiculo.ruta ? (
                        <span className="text-sm">{vehiculo.ruta.nombre}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin asignar</span>
                      )}
                    </TableCell>
                    <TableCell>{getEstadoBadge(vehiculo.estado)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(vehiculo)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setDeletingVehiculoId(vehiculo.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El vehículo será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
