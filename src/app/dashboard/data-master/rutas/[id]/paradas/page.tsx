"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paradaSchema, type ParadaFormData } from '@/lib/validations';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { MapPickerLeaflet } from '@/components/map-picker-leaflet';
import type { Parada, Ruta } from '@prisma/client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, PlusCircle, MapPin, Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

export default function ParadasPage() {
  const params = useParams();
  const router = useRouter();
  const rutaId = params.id as string;
  const { toast } = useToast();

  const [paradas, setParadas] = useState<Parada[]>([]);
  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingParada, setEditingParada] = useState<Parada | null>(null);
  const [deletingParadaId, setDeletingParadaId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState({ lat: 18.4861, lng: -69.9312, address: '' });

  const { execute: fetchRuta, isLoading: isLoadingRuta } = useApi();
  const { execute: fetchParadas, isLoading: isLoadingParadas } = useApi();
  const { execute: saveParada, isLoading: isSaving } = useApi();
  const { execute: deleteParada } = useApi();

  const form = useForm<ParadaFormData>({
    resolver: zodResolver(paradaSchema),
    defaultValues: {
      nombre: '',
      direccion: '',
      latitud: 18.4861,
      longitud: -69.9312,
      orden: 1,
      rutaId,
      activa: true,
    },
  });

  useEffect(() => {
    loadData();
  }, [rutaId]);

  const loadData = async () => {
    try {
      const [rutaData, paradasData] = await Promise.all([
        fetchRuta(`/api/rutas/${rutaId}`, 'GET'),
        fetchRuta(`/api/rutas/${rutaId}/paradas`, 'GET'),
      ]);
      setRuta(rutaData);
      setParadas(paradasData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: '⚠️ Error',
        description: 'No se pudo cargar la información de la ruta',
        variant: 'destructive',
      });
    }
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedLocation({ lat, lng, address });
    form.setValue('latitud', lat);
    form.setValue('longitud', lng);
    form.setValue('direccion', address);
  };

  const handleOpenDialog = (parada?: Parada) => {
    if (parada) {
      setEditingParada(parada);
      form.reset({
        nombre: parada.nombre,
        direccion: parada.direccion,
        latitud: parada.latitud,
        longitud: parada.longitud,
        orden: parada.orden,
        rutaId: parada.rutaId,
        activa: parada.activa,
      });
      setSelectedLocation({
        lat: parada.latitud,
        lng: parada.longitud,
        address: parada.direccion,
      });
    } else {
      setEditingParada(null);
      const nextOrden = paradas.length > 0 ? Math.max(...paradas.map(p => p.orden)) + 1 : 1;
      form.reset({
        nombre: '',
        direccion: '',
        latitud: 18.4861,
        longitud: -69.9312,
        orden: nextOrden,
        rutaId,
        activa: true,
      });
      setSelectedLocation({ lat: 18.4861, lng: -69.9312, address: '' });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: ParadaFormData) => {
    try {
      if (editingParada) {
        await saveParada(`/api/paradas/${editingParada.id}`, 'PATCH', data);
        toast({
          title: '✅ Parada actualizada',
          description: `${data.nombre} ha sido actualizada exitosamente.`,
        });
      } else {
        await saveParada('/api/paradas', 'POST', data);
        toast({
          title: '✅ Parada creada',
          description: `${data.nombre} ha sido registrada exitosamente.`,
        });
      }
      setIsDialogOpen(false);
      form.reset();
      loadData();
    } catch (error) {
      console.error('Error saving parada:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingParadaId) return;

    try {
      await deleteParada(`/api/paradas/${deletingParadaId}`, 'DELETE');
      toast({
        title: '✅ Parada eliminada',
        description: 'La parada ha sido eliminada exitosamente.',
      });
      setIsDeleteDialogOpen(false);
      setDeletingParadaId(null);
      loadData();
    } catch (error) {
      console.error('Error deleting parada:', error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-headline">
              {isLoadingRuta ? 'Cargando...' : `Paradas de ${ruta?.nombre}`}
            </h1>
            <p className="text-muted-foreground">Gestiona las paradas de esta ruta</p>
          </div>
        </div>

        <Button onClick={() => handleOpenDialog()} className="bg-accent hover:bg-accent/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Parada
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paradas Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingParadas ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : paradas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay paradas registradas para esta ruta
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Coordenadas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paradas.map((parada) => (
                  <TableRow key={parada.id}>
                    <TableCell className="font-medium">{parada.orden}</TableCell>
                    <TableCell>{parada.nombre}</TableCell>
                    <TableCell className="max-w-xs truncate">{parada.direccion}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {parada.latitud.toFixed(4)}, {parada.longitud.toFixed(4)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={parada.activa ? 'default' : 'secondary'}>
                        {parada.activa ? 'Activa' : 'Inactiva'}
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
                          <DropdownMenuItem onClick={() => handleOpenDialog(parada)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setDeletingParadaId(parada.id);
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingParada ? 'Editar Parada' : 'Añadir Nueva Parada'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Parada</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Terminal Sabana Larga" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orden"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Orden en la Ruta</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="direccion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Selecciona en el mapa o escribe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Ubicación en el Mapa</label>
                <MapPickerLeaflet
                  initialLat={selectedLocation.lat}
                  initialLng={selectedLocation.lng}
                  onLocationSelect={handleLocationSelect}
                  height="400px"
                />
              </div>

              <FormField
                control={form.control}
                name="activa"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Parada Activa</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        La parada está disponible para solicitudes
                      </div>
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

              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  editingParada ? 'Actualizar Parada' : 'Guardar Parada'
                )}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La parada será eliminada permanentemente.
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
