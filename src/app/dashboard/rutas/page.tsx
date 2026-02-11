"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { rutaSchema, type RutaFormData } from '@/lib/validations';
import { useApiList } from '@/hooks/use-api-list';
import { useToast } from '@/hooks/use-toast';
import type { RutaWithRelations } from '@/types';
import { useRouter } from 'next/navigation';

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
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, MapPin } from 'lucide-react';

export default function RutasPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRuta, setEditingRuta] = useState<RutaWithRelations | null>(null);
  const [deletingRutaId, setDeletingRutaId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const {
    items: rutas,
    isLoading,
    createItem,
    updateItem,
    deleteItem,
  } = useApiList<RutaWithRelations>({
    endpoint: '/api/rutas',
  });

  const form = useForm<RutaFormData>({
    resolver: zodResolver(rutaSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      color: '#3b82f6',
      activa: true,
      esEspecial: false,
    },
  });

  const handleOpenDialog = (ruta?: RutaWithRelations) => {
    if (ruta) {
      setEditingRuta(ruta);
      form.reset({
        nombre: ruta.nombre,
        descripcion: ruta.descripcion || '',
        color: ruta.color,
        activa: ruta.activa,
        esEspecial: ruta.esEspecial,
      });
    } else {
      setEditingRuta(null);
      form.reset({
        nombre: '',
        descripcion: '',
        color: '#3b82f6',
        activa: true,
        esEspecial: false,
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: RutaFormData) => {
    try {
      if (editingRuta) {
        await updateItem(editingRuta.id, data);
        toast({
          title: '✅ Ruta actualizada',
          description: `${data.nombre} ha sido actualizada exitosamente.`,
        });
      } else {
        await createItem(data);
        toast({
          title: '✅ Ruta creada',
          description: `${data.nombre} ha sido registrada exitosamente.`,
        });
      }

      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error saving ruta:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingRutaId) return;

    try {
      await deleteItem(deletingRutaId);
      toast({
        title: '✅ Ruta eliminada',
        description: 'La ruta ha sido eliminada exitosamente.',
      });
      setIsDeleteDialogOpen(false);
      setDeletingRutaId(null);
    } catch (error) {
      console.error('Error deleting ruta:', error);
    }
  };

  const getEstadoBadge = (activa: boolean) => {
    return (
      <Badge variant={activa ? 'default' : 'secondary'}>
        {activa ? 'Activa' : 'Inactiva'}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Gestión de Rutas</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-accent hover:bg-accent/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Nueva Ruta
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingRuta ? 'Editar Ruta' : 'Crear Nueva Ruta'}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Ruta</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Ruta Charles de Gaulle" {...field} />
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
                          placeholder="Descripción de la ruta..."
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
                      <FormLabel>Color (para visualización en mapa)</FormLabel>
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="activa"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Ruta Activa</FormLabel>
                          <FormDescription>
                            La ruta está en operación
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

                  <FormField
                    control={form.control}
                    name="esEspecial"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Ruta Especial</FormLabel>
                          <FormDescription>
                            Ruta temporal o especial
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
                </div>

                <Button type="submit" className="w-full">
                  {editingRuta ? 'Actualizar Ruta' : 'Guardar Ruta'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rutas Activas</CardTitle>
          <CardDescription>Listado de todas las rutas configuradas en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : rutas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay rutas registradas
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Paradas</TableHead>
                  <TableHead>Vehículos</TableHead>
                  <TableHead>Usuarios</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rutas.map((ruta) => (
                  <TableRow key={ruta.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: ruta.color }}
                        />
                        {ruta.nombre}
                        {ruta.esEspecial && (
                          <Badge variant="outline" className="ml-2">Especial</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {ruta.descripcion || '-'}
                    </TableCell>
                    <TableCell>{ruta._count?.paradas || 0} paradas</TableCell>
                    <TableCell>{ruta._count?.vehiculos || 0} vehículos</TableCell>
                    <TableCell>{ruta._count?.usuarios || 0} usuarios</TableCell>
                    <TableCell>{getEstadoBadge(ruta.activa)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(ruta)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/dashboard/rutas/${ruta.id}/paradas`)}
                          >
                            <MapPin className="mr-2 h-4 w-4" />
                            Gestionar Paradas
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setDeletingRutaId(ruta.id);
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
              Esta acción no se puede deshacer. La ruta será eliminada permanentemente junto con todas sus paradas.
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
