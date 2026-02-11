"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { horarioSchema, type HorarioFormData } from '@/lib/validations';
import { useApiList } from '@/hooks/use-api-list';
import { useToast } from '@/hooks/use-toast';
import type { HorarioWithRelations, RutaWithRelations, ConductorWithRelations } from '@/types';
import { DiasSemanaa } from '@/lib/validations';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, Calendar, Clock } from 'lucide-react';

export default function HorariosPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingHorario, setEditingHorario] = useState<HorarioWithRelations | null>(null);
  const [deletingHorarioId, setDeletingHorarioId] = useState<string | null>(null);
  const [rutas, setRutas] = useState<RutaWithRelations[]>([]);
  const [conductores, setConductores] = useState<ConductorWithRelations[]>([]);
  const { toast } = useToast();

  const {
    items: horarios,
    isLoading,
    createItem,
    updateItem,
    deleteItem,
  } = useApiList<HorarioWithRelations>({
    endpoint: '/api/horarios',
  });

  const form = useForm<HorarioFormData>({
    resolver: zodResolver(horarioSchema),
    defaultValues: {
      rutaId: '',
      conductorId: '',
      horaInicio: '06:00',
      horaFin: '18:00',
      diasSemana: [],
      activo: true,
    },
  });

  useEffect(() => {
    // Cargar rutas y conductores
    Promise.all([
      fetch('/api/rutas').then(res => res.json()),
      fetch('/api/conductores').then(res => res.json()),
    ])
      .then(([rutasData, conductoresData]) => {
        setRutas(rutasData);
        setConductores(conductoresData);
      })
      .catch(err => console.error('Error loading data:', err));
  }, []);

  const handleOpenDialog = (horario?: HorarioWithRelations) => {
    if (horario) {
      setEditingHorario(horario);
      form.reset({
        rutaId: horario.rutaId,
        conductorId: horario.conductorId,
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin,
        diasSemana: horario.diasSemana,
        activo: horario.activo,
      });
    } else {
      setEditingHorario(null);
      form.reset({
        rutaId: '',
        conductorId: '',
        horaInicio: '06:00',
        horaFin: '18:00',
        diasSemana: [],
        activo: true,
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: HorarioFormData) => {
    try {
      if (editingHorario) {
        await updateItem(editingHorario.id, data);
        toast({
          title: '✅ Horario actualizado',
          description: 'El horario ha sido actualizado exitosamente.',
        });
      } else {
        await createItem(data);
        toast({
          title: '✅ Horario creado',
          description: 'El horario ha sido registrado exitosamente.',
        });
      }

      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error saving horario:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingHorarioId) return;

    try {
      await deleteItem(deletingHorarioId);
      toast({
        title: '✅ Horario eliminado',
        description: 'El horario ha sido eliminado exitosamente.',
      });
      setIsDeleteDialogOpen(false);
      setDeletingHorarioId(null);
    } catch (error) {
      console.error('Error deleting horario:', error);
    }
  };

  const getDiasBadges = (dias: string[]) => {
    const abreviaturas: Record<string, string> = {
      'Lunes': 'L',
      'Martes': 'M',
      'Miércoles': 'X',
      'Jueves': 'J',
      'Viernes': 'V',
      'Sábado': 'S',
      'Domingo': 'D',
    };

    return (
      <div className="flex gap-1">
        {dias.map((dia) => (
          <Badge key={dia} variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
            {abreviaturas[dia]}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Gestión de Horarios</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-accent hover:bg-accent/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Horario
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingHorario ? 'Editar Horario' : 'Añadir Nuevo Horario'}
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rutaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ruta</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                    name="conductorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conductor</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona conductor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {conductores.map((conductor) => (
                              <SelectItem key={conductor.id} value={conductor.id}>
                                {conductor.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="horaInicio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora Inicio</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="horaFin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora Fin</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="diasSemana"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Días de la Semana</FormLabel>
                        <FormDescription>
                          Selecciona los días en que opera este horario
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {DiasSemanaa.map((dia) => (
                          <FormField
                            key={dia}
                            control={form.control}
                            name="diasSemana"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={dia}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(dia)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), dia])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== dia
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {dia}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
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
                        <FormLabel className="text-base">Horario Activo</FormLabel>
                        <FormDescription>
                          El horario está en operación
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
                  {editingHorario ? 'Actualizar Horario' : 'Guardar Horario'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Horarios Registrados</CardTitle>
          <CardDescription>Gestione los horarios de conductores y rutas.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : horarios.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay horarios registrados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Conductor</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead>Días</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {horarios.map((horario) => (
                  <TableRow key={horario.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: horario.ruta.color }}
                        />
                        {horario.ruta.nombre}
                      </div>
                    </TableCell>
                    <TableCell>{horario.conductor.nombre}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {horario.horaInicio} - {horario.horaFin}
                      </div>
                    </TableCell>
                    <TableCell>{getDiasBadges(horario.diasSemana)}</TableCell>
                    <TableCell>
                      <Badge variant={horario.activo ? 'default' : 'secondary'}>
                        {horario.activo ? 'Activo' : 'Inactivo'}
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
                          <DropdownMenuItem onClick={() => handleOpenDialog(horario)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setDeletingHorarioId(horario.id);
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
              Esta acción no se puede deshacer. El horario será eliminado permanentemente.
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
