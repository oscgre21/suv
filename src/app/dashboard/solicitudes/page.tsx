"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { solicitudParadaSchema, type SolicitudParadaFormData } from '@/lib/validations';
import { useApiList } from '@/hooks/use-api-list';
import { useToast } from '@/hooks/use-toast';
import type { SolicitudParadaWithRelations, RutaWithRelations, UsuarioWithRelations } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, MoreHorizontal, Check, X, Loader2, Clock } from 'lucide-react';

export default function SolicitudesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingSolicitudId, setDeletingSolicitudId] = useState<string | null>(null);
  const [rutas, setRutas] = useState<RutaWithRelations[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioWithRelations[]>([]);
  const [paradas, setParadas] = useState<any[]>([]);
  const [selectedRuta, setSelectedRuta] = useState<string>('');
  const { toast } = useToast();

  const {
    items: solicitudes,
    isLoading,
    createItem,
    updateItem,
    deleteItem,
  } = useApiList<SolicitudParadaWithRelations>({
    endpoint: '/api/solicitudes',
  });

  const form = useForm<SolicitudParadaFormData>({
    resolver: zodResolver(solicitudParadaSchema),
    defaultValues: {
      usuarioId: '',
      paradaId: '',
      rutaId: '',
      estado: 'Pendiente',
      notificado: false,
    },
  });

  useEffect(() => {
    // Cargar rutas y usuarios
    Promise.all([
      fetch('/api/rutas').then(res => res.json()),
      fetch('/api/usuarios').then(res => res.json()),
    ])
      .then(([rutasData, usuariosData]) => {
        setRutas(rutasData);
        setUsuarios(usuariosData);
      })
      .catch(err => console.error('Error loading data:', err));
  }, []);

  useEffect(() => {
    // Cargar paradas cuando se selecciona una ruta
    if (selectedRuta) {
      fetch(`/api/rutas/${selectedRuta}/paradas`)
        .then(res => res.json())
        .then(data => setParadas(data))
        .catch(err => console.error('Error loading paradas:', err));
    }
  }, [selectedRuta]);

  const handleOpenDialog = () => {
    form.reset({
      usuarioId: '',
      paradaId: '',
      rutaId: '',
      estado: 'Pendiente',
      notificado: false,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: SolicitudParadaFormData) => {
    try {
      await createItem(data);
      toast({
        title: '✅ Solicitud creada',
        description: 'La solicitud ha sido registrada exitosamente.',
      });
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error saving solicitud:', error);
    }
  };

  const handleUpdateEstado = async (id: string, nuevoEstado: string) => {
    try {
      await updateItem(id, { estado: nuevoEstado });
      toast({
        title: '✅ Estado actualizado',
        description: `La solicitud ha sido marcada como ${nuevoEstado}.`,
      });
    } catch (error) {
      console.error('Error updating estado:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingSolicitudId) return;

    try {
      await deleteItem(deletingSolicitudId);
      toast({
        title: '✅ Solicitud eliminada',
        description: 'La solicitud ha sido eliminada exitosamente.',
      });
      setIsDeleteDialogOpen(false);
      setDeletingSolicitudId(null);
    } catch (error) {
      console.error('Error deleting solicitud:', error);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, any> = {
      Pendiente: 'secondary',
      Confirmado: 'default',
      NoRecogido: 'destructive',
      Cancelado: 'outline',
    };
    const labels: Record<string, string> = {
      Pendiente: 'Pendiente',
      Confirmado: 'Confirmado',
      NoRecogido: 'No Recogido',
      Cancelado: 'Cancelado',
    };
    return <Badge variant={variants[estado]}>{labels[estado] || estado}</Badge>;
  };

  const solicitudesPorRuta = (rutaId: string) => {
    return Array.isArray(solicitudes) ? solicitudes.filter(s => s.rutaId === rutaId) : [];
  };

  const solicitudesPorEstado = (estado: string) => {
    return Array.isArray(solicitudes) ? solicitudes.filter(s => s.estado === estado) : [];
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Solicitudes y Paradas</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog} className="bg-accent hover:bg-accent/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Solicitud
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Solicitud</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="usuarioId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona usuario" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {usuarios.map((usuario) => (
                            <SelectItem key={usuario.id} value={usuario.id}>
                              {usuario.nombre}
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
                  name="rutaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ruta</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedRuta(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona ruta" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                  name="paradaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parada</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedRuta}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={selectedRuta ? "Selecciona parada" : "Primero selecciona una ruta"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paradas.map((parada) => (
                            <SelectItem key={parada.id} value={parada.id}>
                              {parada.nombre} - {parada.direccion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Registrar Solicitud
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="todas" className="w-full">
        <TabsList>
          <TabsTrigger value="todas">Todas ({Array.isArray(solicitudes) ? solicitudes.length : 0})</TabsTrigger>
          <TabsTrigger value="pendientes">
            Pendientes ({solicitudesPorEstado('Pendiente').length})
          </TabsTrigger>
          <TabsTrigger value="confirmadas">
            Confirmadas ({solicitudesPorEstado('Confirmado').length})
          </TabsTrigger>
          {rutas.slice(0, 2).map((ruta) => (
            <TabsTrigger key={ruta.id} value={ruta.id}>
              {ruta.nombre} ({solicitudesPorRuta(ruta.id).length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="todas">
          <Card>
            <CardHeader>
              <CardTitle>Todas las Solicitudes</CardTitle>
              <CardDescription>Solicitudes de paradas de empleados en tiempo real.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !Array.isArray(solicitudes) || solicitudes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay solicitudes registradas
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Ruta</TableHead>
                      <TableHead>Parada</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {solicitudes.map((solicitud) => (
                      <TableRow key={solicitud.id}>
                        <TableCell className="font-medium">{solicitud.usuario.nombre}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: solicitud.ruta.color }}
                            />
                            {solicitud.ruta.nombre}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{solicitud.parada.nombre}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(solicitud.horaSolicitud), 'PPp', { locale: es })}
                          </div>
                        </TableCell>
                        <TableCell>{getEstadoBadge(solicitud.estado)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {solicitud.estado === 'Pendiente' && (
                                <DropdownMenuItem onClick={() => handleUpdateEstado(solicitud.id, 'Confirmado')}>
                                  <Check className="mr-2 h-4 w-4" />
                                  Confirmar
                                </DropdownMenuItem>
                              )}
                              {solicitud.estado === 'Confirmado' && (
                                <DropdownMenuItem onClick={() => handleUpdateEstado(solicitud.id, 'NoRecogido')}>
                                  <X className="mr-2 h-4 w-4" />
                                  Marcar No Recogido
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setDeletingSolicitudId(solicitud.id);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Cancelar/Eliminar
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
        </TabsContent>

        <TabsContent value="pendientes">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Ruta</TableHead>
                    <TableHead>Parada</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitudesPorEstado('Pendiente').map((solicitud) => (
                    <TableRow key={solicitud.id}>
                      <TableCell className="font-medium">{solicitud.usuario.nombre}</TableCell>
                      <TableCell>{solicitud.ruta.nombre}</TableCell>
                      <TableCell>{solicitud.parada.nombre}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(solicitud.horaSolicitud), 'PPp', { locale: es })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateEstado(solicitud.id, 'Confirmado')}
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Confirmar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confirmadas">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes Confirmadas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Ruta</TableHead>
                    <TableHead>Parada</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitudesPorEstado('Confirmado').map((solicitud) => (
                    <TableRow key={solicitud.id}>
                      <TableCell className="font-medium">{solicitud.usuario.nombre}</TableCell>
                      <TableCell>{solicitud.ruta.nombre}</TableCell>
                      <TableCell>{solicitud.parada.nombre}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(solicitud.horaSolicitud), 'PPp', { locale: es })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {rutas.slice(0, 2).map((ruta) => (
          <TabsContent key={ruta.id} value={ruta.id}>
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes - {ruta.nombre}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Parada</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {solicitudesPorRuta(ruta.id).map((solicitud) => (
                      <TableRow key={solicitud.id}>
                        <TableCell className="font-medium">{solicitud.usuario.nombre}</TableCell>
                        <TableCell>{solicitud.parada.nombre}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(solicitud.horaSolicitud), 'PPp', { locale: es })}
                        </TableCell>
                        <TableCell>{getEstadoBadge(solicitud.estado)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cancelará la solicitud. Si está pendiente, se marcará como cancelada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
