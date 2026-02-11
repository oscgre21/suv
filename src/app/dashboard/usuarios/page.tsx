"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usuarioSchema, type UsuarioFormData } from '@/lib/validations';
import { useApiList } from '@/hooks/use-api-list';
import { useToast } from '@/hooks/use-toast';
import type { UsuarioWithRelations, RutaWithRelations } from '@/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, FileDown } from 'lucide-react';

export default function UsuariosPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<UsuarioWithRelations | null>(null);
  const [deletingUsuarioId, setDeletingUsuarioId] = useState<string | null>(null);
  const [rutas, setRutas] = useState<RutaWithRelations[]>([]);
  const { toast } = useToast();

  const {
    items: usuarios,
    isLoading,
    createItem,
    updateItem,
    deleteItem,
  } = useApiList<UsuarioWithRelations>({
    endpoint: '/api/usuarios',
  });

  const form = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nombre: '',
      cedula: '',
      email: '',
      telefono: '',
      direccion: '',
      rutaAsignada: null,
      estado: 'Activo',
    },
  });

  useEffect(() => {
    // Cargar rutas para el selector
    fetch('/api/rutas')
      .then((res) => res.json())
      .then((data) => setRutas(data))
      .catch((err) => console.error('Error loading rutas:', err));
  }, []);

  const handleOpenDialog = (usuario?: UsuarioWithRelations) => {
    if (usuario) {
      setEditingUsuario(usuario);
      form.reset({
        nombre: usuario.nombre,
        cedula: usuario.cedula,
        email: usuario.email,
        telefono: usuario.telefono || '',
        direccion: usuario.direccion || '',
        rutaAsignada: usuario.rutaAsignada,
        estado: usuario.estado as any,
      });
    } else {
      setEditingUsuario(null);
      form.reset({
        nombre: '',
        cedula: '',
        email: '',
        telefono: '',
        direccion: '',
        rutaAsignada: null,
        estado: 'Activo',
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: UsuarioFormData) => {
    try {
      if (editingUsuario) {
        await updateItem(editingUsuario.id, data);
        toast({
          title: '✅ Usuario actualizado',
          description: `${data.nombre} ha sido actualizado exitosamente.`,
        });
      } else {
        await createItem(data);
        toast({
          title: '✅ Usuario creado',
          description: `${data.nombre} ha sido registrado exitosamente.`,
        });
      }

      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error saving usuario:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingUsuarioId) return;

    try {
      await deleteItem(deletingUsuarioId);
      toast({
        title: '✅ Usuario eliminado',
        description: 'El usuario ha sido eliminado exitosamente.',
      });
      setIsDeleteDialogOpen(false);
      setDeletingUsuarioId(null);
    } catch (error) {
      console.error('Error deleting usuario:', error);
    }
  };

  const getEstadoBadge = (estado: string) => {
    return (
      <Badge variant={estado === 'Activo' ? 'default' : 'secondary'}>
        {estado}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Gestión de Usuarios</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Exportar
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="bg-accent hover:bg-accent/90">
                <PlusCircle className="mr-2 h-4 w-4" />
                Registrar Empleado
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingUsuario ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
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
                          <Input placeholder="Ej: Juan Perez" {...field} />
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
                            <Input placeholder="002-1234567-9" {...field} />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="usuario@empresa.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="809-555-1001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="direccion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Dirección del domicilio..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="rutaAsignada"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ruta Asignada</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ''}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sin ruta" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Sin ruta</SelectItem>
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
                              <SelectItem value="Inactivo">Inactivo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    {editingUsuario ? 'Actualizar Usuario' : 'Guardar Usuario'}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Empleados Registrados</CardTitle>
          <CardDescription>Listado de empleados con acceso al servicio de transporte.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : usuarios.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay usuarios registrados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cédula</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ruta Asignada</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.nombre}</TableCell>
                    <TableCell>{usuario.cedula}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      {usuario.ruta ? (
                        <span className="text-sm">{usuario.ruta.nombre}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin asignar</span>
                      )}
                    </TableCell>
                    <TableCell>{getEstadoBadge(usuario.estado)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(usuario)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setDeletingUsuarioId(usuario.id);
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
              Esta acción no se puede deshacer. El usuario será eliminado permanentemente.
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
