"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { conductorSchema, type ConductorFormData } from '@/lib/validations';
import { useApiList } from '@/hooks/use-api-list';
import { useToast } from '@/hooks/use-toast';
import type { ConductorWithRelations } from '@/types';
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

export default function ConductoresPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingConductor, setEditingConductor] = useState<ConductorWithRelations | null>(null);
  const [deletingConductorId, setDeletingConductorId] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    items: conductores,
    isLoading,
    createItem,
    updateItem,
    deleteItem,
  } = useApiList<ConductorWithRelations>({
    endpoint: '/api/conductores',
  });

  const form = useForm<ConductorFormData>({
    resolver: zodResolver(conductorSchema),
    defaultValues: {
      nombre: '',
      cedula: '',
      licencia: '',
      telefono: '',
      email: '',
      turno: 'Matutino',
      estado: 'Activo',
      vehiculoId: null,
    },
  });

  const handleOpenDialog = (conductor?: ConductorWithRelations) => {
    if (conductor) {
      setEditingConductor(conductor);
      form.reset({
        nombre: conductor.nombre,
        cedula: conductor.cedula,
        licencia: conductor.licencia,
        telefono: conductor.telefono,
        email: conductor.email || '',
        turno: conductor.turno as any,
        estado: conductor.estado as any,
        vehiculoId: conductor.vehiculoId,
      });
    } else {
      setEditingConductor(null);
      form.reset({
        nombre: '',
        cedula: '',
        licencia: '',
        telefono: '',
        email: '',
        turno: 'Matutino',
        estado: 'Activo',
        vehiculoId: null,
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: ConductorFormData) => {
    try {
      if (editingConductor) {
        await updateItem(editingConductor.id, data);
        toast({
          title: '✅ Conductor actualizado',
          description: `${data.nombre} ha sido actualizado exitosamente.`,
        });
      } else {
        await createItem(data);
        toast({
          title: '✅ Conductor creado',
          description: `${data.nombre} ha sido registrado exitosamente.`,
        });
      }

      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error saving conductor:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingConductorId) return;

    try {
      await deleteItem(deletingConductorId);
      toast({
        title: '✅ Conductor eliminado',
        description: 'El conductor ha sido eliminado exitosamente.',
      });
      setIsDeleteDialogOpen(false);
      setDeletingConductorId(null);
    } catch (error) {
      console.error('Error deleting conductor:', error);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const variants = {
      Activo: 'default',
      Vacaciones: 'secondary',
      Inactivo: 'destructive',
    };
    return <Badge variant={variants[estado as keyof typeof variants] as any}>{estado}</Badge>;
  };

  const getTurnoBadge = (turno: string) => {
    const colors = {
      Matutino: 'bg-blue-100 text-blue-800',
      Vespertino: 'bg-orange-100 text-orange-800',
      Nocturno: 'bg-purple-100 text-purple-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[turno as keyof typeof colors]}`}>
        {turno}
      </span>
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
          <h1 className="text-3xl font-bold font-headline">Data Master: Conductores</h1>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-accent hover:bg-accent/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Conductor
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingConductor ? 'Editar Conductor' : 'Añadir Nuevo Conductor'}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Manuel Gonzalez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cedula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cédula</FormLabel>
                        <FormControl>
                          <Input placeholder="001-1234567-8" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="licencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Licencia</FormLabel>
                        <FormControl>
                          <Input placeholder="001-1234567-8" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="809-555-0101" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Opcional)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="conductor@cesac.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="turno"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Turno</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona turno" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Matutino">Matutino</SelectItem>
                            <SelectItem value="Vespertino">Vespertino</SelectItem>
                            <SelectItem value="Nocturno">Nocturno</SelectItem>
                          </SelectContent>
                        </Select>
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
                            <SelectItem value="Activo">Activo</SelectItem>
                            <SelectItem value="Vacaciones">Vacaciones</SelectItem>
                            <SelectItem value="Inactivo">Inactivo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editingConductor ? 'Actualizar Conductor' : 'Guardar Conductor'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conductores Registrados</CardTitle>
          <CardDescription>Gestione los registros de los conductores del sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : conductores.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay conductores registrados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cédula</TableHead>
                  <TableHead>Licencia</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conductores.map((conductor) => (
                  <TableRow key={conductor.id}>
                    <TableCell className="font-medium">{conductor.nombre}</TableCell>
                    <TableCell>{conductor.cedula}</TableCell>
                    <TableCell>{conductor.licencia}</TableCell>
                    <TableCell>{conductor.telefono}</TableCell>
                    <TableCell>{getTurnoBadge(conductor.turno)}</TableCell>
                    <TableCell>{getEstadoBadge(conductor.estado)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(conductor)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setDeletingConductorId(conductor.id);
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
              Esta acción no se puede deshacer. El conductor será eliminado permanentemente.
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
