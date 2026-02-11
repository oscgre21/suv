"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { estatusVehiculoSchema, type EstatusVehiculoFormData } from '@/lib/validations';
import { useApiList } from '@/hooks/use-api-list';
import { useToast } from '@/hooks/use-toast';
import type { EstatusVehiculo } from '@prisma/client';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, ArrowLeft } from 'lucide-react';

export default function EstatusVehiculoPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingEstatus, setEditingEstatus] = useState<EstatusVehiculo | null>(null);
  const [deletingEstatusId, setDeletingEstatusId] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    items: estatusVehiculos,
    isLoading,
    createItem,
    updateItem,
    deleteItem,
  } = useApiList<EstatusVehiculo>({
    endpoint: '/api/estatus-vehiculo',
  });

  const form = useForm<EstatusVehiculoFormData>({
    resolver: zodResolver(estatusVehiculoSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      color: '#3b82f6',
      activo: true,
    },
  });

  const handleOpenDialog = (estatus?: EstatusVehiculo) => {
    if (estatus) {
      setEditingEstatus(estatus);
      form.reset({
        nombre: estatus.nombre,
        descripcion: estatus.descripcion || '',
        color: estatus.color,
        activo: estatus.activo,
      });
    } else {
      setEditingEstatus(null);
      form.reset({
        nombre: '',
        descripcion: '',
        color: '#3b82f6',
        activo: true,
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: EstatusVehiculoFormData) => {
    try {
      if (editingEstatus) {
        await updateItem(editingEstatus.id, data);
        toast({
          title: '✅ Estatus actualizado',
          description: `${data.nombre} ha sido actualizado exitosamente.`,
        });
      } else {
        await createItem(data);
        toast({
          title: '✅ Estatus creado',
          description: `${data.nombre} ha sido registrado exitosamente.`,
        });
      }

      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error saving estatus:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingEstatusId) return;

    try {
      await deleteItem(deletingEstatusId);
      toast({
        title: '✅ Estatus eliminado',
        description: 'El estatus ha sido eliminado exitosamente.',
      });
      setIsDeleteDialogOpen(false);
      setDeletingEstatusId(null);
    } catch (error) {
      console.error('Error deleting estatus:', error);
    }
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
          <h1 className="text-3xl font-bold font-headline">Data Master: Estatus de Vehículos</h1>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-accent hover:bg-accent/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Estatus
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingEstatus ? 'Editar Estatus' : 'Añadir Nuevo Estatus'}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Estatus</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Operativo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descripción del estatus..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color (para visualización)</FormLabel>
                      <FormControl>
                        <div className="flex gap-2 items-center">
                          <Input type="color" {...field} className="w-20 h-10" />
                          <Input
                            type="text"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="#3b82f6"
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="activo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Estatus Activo</FormLabel>
                        <FormDescription>
                          El estatus está disponible para usar
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  {editingEstatus ? 'Actualizar Estatus' : 'Guardar Estatus'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estatus de Vehículos</CardTitle>
          <CardDescription>Gestione los posibles estados de los vehículos de la flota.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : estatusVehiculos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay estatus registrados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre del Estatus</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estatusVehiculos.map((estatus) => (
                  <TableRow key={estatus.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: estatus.color }}
                        />
                        {estatus.nombre}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {estatus.descripcion || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {estatus.color}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={estatus.activo ? 'default' : 'secondary'}>
                        {estatus.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(estatus)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setDeletingEstatusId(estatus.id);
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
              Esta acción no se puede deshacer. El estatus será eliminado permanentemente.
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
