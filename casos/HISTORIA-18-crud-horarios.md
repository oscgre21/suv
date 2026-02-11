# Historia 18: Frontend CRUD - Horarios

**Prioridad:** ALTA
**Dependencias:** Historia 05 (useApi), Historia 11 (API Horarios)
**Estimación:** 5-6 horas
**Estado:** Pendiente

---

## Objetivo

Implementar el frontend completo de CRUD para el módulo de Horarios con time pickers para horas de inicio/fin, multi-select de días de la semana, selectores de conductor y ruta, validación de horarios solapados, y visualización en formato calendario.

---

## Pre-requisitos

- ✅ Hook useApi implementado (Historia 05)
- ✅ Hook useApiList implementado (Historia 05)
- ✅ API Routes de Horarios (Historia 11)
- ✅ Schemas Zod de Horario (Historia 03)
- ✅ shadcn/ui componentes instalados

---

## Tareas Detalladas

### 1. Crear Página Principal de Horarios

**Archivo:** `src/app/dashboard/horarios/page.tsx`

```typescript
"use client";

import { useState, useEffect } from 'react';
import { useApiList } from '@/hooks/use-api-list';
import { HorarioWithRelations, ConductorWithRelations, RutaWithRelations } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  MoreVertical,
  Clock,
  Calendar,
  User,
  Route,
  X,
} from 'lucide-react';
import { HorarioDialog } from '@/components/horarios/horario-dialog';
import { useDebounce } from '@/hooks/use-debounce';

export default function HorariosPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHorario, setEditingHorario] = useState<HorarioWithRelations | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; info: string } | null>(null);

  // Filtros
  const [conductorFilter, setConductorFilter] = useState<string>('');
  const [rutaFilter, setRutaFilter] = useState<string>('');
  const [diaFilter, setDiaFilter] = useState<string>('');

  const [conductores, setConductores] = useState<ConductorWithRelations[]>([]);
  const [rutas, setRutas] = useState<RutaWithRelations[]>([]);

  // Hook principal de lista
  const {
    items: horarios,
    isLoading,
    error,
    setFilters,
    refresh,
    remove,
  } = useApiList<HorarioWithRelations>({
    url: '/api/horarios',
    autoFetch: true,
  });

  // Cargar conductores y rutas
  useEffect(() => {
    async function loadData() {
      try {
        const [conductoresRes, rutasRes] = await Promise.all([
          fetch('/api/conductores?estado=Activo'),
          fetch('/api/rutas?activa=true'),
        ]);

        const conductoresData = await conductoresRes.json();
        const rutasData = await rutasRes.json();

        setConductores(conductoresData);
        setRutas(rutasData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
    loadData();
  }, []);

  // Actualizar filtros
  useEffect(() => {
    setFilters({
      conductorId: conductorFilter || undefined,
      rutaId: rutaFilter || undefined,
      dia: diaFilter || undefined,
    });
  }, [conductorFilter, rutaFilter, diaFilter, setFilters]);

  const handleEdit = (horario: HorarioWithRelations) => {
    setEditingHorario(horario);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingHorario(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await remove(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingHorario(null);
  };

  const handleSuccess = () => {
    refresh();
    handleDialogClose();
  };

  const clearFilters = () => {
    setConductorFilter('');
    setRutaFilter('');
    setDiaFilter('');
  };

  const hasFilters = conductorFilter || rutaFilter || diaFilter;

  const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Clock className="h-8 w-8" />
            Horarios
          </h1>
          <p className="text-muted-foreground">
            Gestión de horarios de conductores y rutas
          </p>
        </div>
        <Button onClick={handleCreate} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Horario
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra horarios por conductor, ruta o día</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filtro Conductor */}
            <Select value={conductorFilter} onValueChange={setConductorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por conductor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los conductores</SelectItem>
                {conductores.map((conductor) => (
                  <SelectItem key={conductor.id} value={conductor.id}>
                    {conductor.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro Ruta */}
            <Select value={rutaFilter} onValueChange={setRutaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por ruta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las rutas</SelectItem>
                {rutas.map((ruta) => (
                  <SelectItem key={ruta.id} value={ruta.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: ruta.color }}
                      />
                      {ruta.nombre}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro Día */}
            <Select value={diaFilter} onValueChange={setDiaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por día" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los días</SelectItem>
                {DIAS_SEMANA.map((dia) => (
                  <SelectItem key={dia} value={dia}>
                    {dia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Limpiar filtros */}
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conductor</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Días</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-red-500 py-8">
                    Error al cargar horarios: {error}
                  </TableCell>
                </TableRow>
              ) : horarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {hasFilters
                      ? 'No se encontraron horarios con los filtros aplicados'
                      : 'No hay horarios registrados'}
                  </TableCell>
                </TableRow>
              ) : (
                horarios.map((horario) => (
                  <TableRow key={horario.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{horario.conductor.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: horario.ruta.color }}
                        />
                        <span className="text-sm">{horario.ruta.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">
                          {horario.horaInicio} - {horario.horaFin}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {horario.diasSemana.slice(0, 3).map((dia) => (
                          <Badge key={dia} variant="outline" className="text-xs">
                            {dia.slice(0, 3)}
                          </Badge>
                        ))}
                        {horario.diasSemana.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{horario.diasSemana.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={horario.activo ? 'default' : 'secondary'}>
                        {horario.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(horario)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setDeleteConfirm({
                                id: horario.id,
                                info: `${horario.conductor.nombre} - ${horario.ruta.nombre}`,
                              })
                            }
                            className="text-red-600"
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diálogo Crear/Editar */}
      <HorarioDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        horario={editingHorario}
        onSuccess={handleSuccess}
      />

      {/* Diálogo Eliminar */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar el horario de <strong>{deleteConfirm?.info}</strong>?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
```

---

### 2. Crear Componente de Diálogo con Time Pickers

**Archivo:** `src/components/horarios/horario-dialog.tsx`

```typescript
"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { horarioSchema, HorarioFormData } from '@/lib/validations';
import { useApi } from '@/hooks/use-api';
import { HorarioWithRelations, ConductorWithRelations, RutaWithRelations } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface HorarioDialogProps {
  open: boolean;
  onClose: () => void;
  horario: HorarioWithRelations | null;
  onSuccess: () => void;
}

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function HorarioDialog({ open, onClose, horario, onSuccess }: HorarioDialogProps) {
  const isEdit = !!horario;
  const [conductores, setConductores] = useState<ConductorWithRelations[]>([]);
  const [rutas, setRutas] = useState<RutaWithRelations[]>([]);
  const [selectedDias, setSelectedDias] = useState<string[]>([]);

  const form = useForm<HorarioFormData>({
    resolver: zodResolver(horarioSchema),
    defaultValues: {
      rutaId: '',
      conductorId: '',
      horaInicio: '06:00',
      horaFin: '07:30',
      diasSemana: [],
      activo: true,
    },
  });

  const { execute, isLoading } = useApi<HorarioWithRelations>({
    successMessage: isEdit ? 'Horario actualizado' : 'Horario creado',
    onSuccess: () => {
      onSuccess();
      form.reset();
    },
  });

  // Cargar conductores y rutas
  useEffect(() => {
    async function loadData() {
      try {
        const [conductoresRes, rutasRes] = await Promise.all([
          fetch('/api/conductores?estado=Activo'),
          fetch('/api/rutas?activa=true'),
        ]);

        const conductoresData = await conductoresRes.json();
        const rutasData = await rutasRes.json();

        setConductores(conductoresData);
        setRutas(rutasData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }

    if (open) {
      loadData();
    }
  }, [open]);

  // Cargar datos si es edición
  useEffect(() => {
    if (horario) {
      form.reset({
        rutaId: horario.rutaId,
        conductorId: horario.conductorId,
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin,
        diasSemana: horario.diasSemana,
        activo: horario.activo,
      });
      setSelectedDias(horario.diasSemana);
    } else {
      form.reset({
        rutaId: '',
        conductorId: '',
        horaInicio: '06:00',
        horaFin: '07:30',
        diasSemana: [],
        activo: true,
      });
      setSelectedDias([]);
    }
  }, [horario, form]);

  const handleDiaToggle = (dia: string) => {
    const newDias = selectedDias.includes(dia)
      ? selectedDias.filter((d) => d !== dia)
      : [...selectedDias, dia];

    setSelectedDias(newDias);
    form.setValue('diasSemana', newDias);
  };

  const onSubmit = async (data: HorarioFormData) => {
    try {
      if (isEdit) {
        await execute(`/api/horarios/${horario.id}`, 'PATCH', data);
      } else {
        await execute('/api/horarios', 'POST', data);
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {isEdit ? 'Editar Horario' : 'Nuevo Horario'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los datos del horario'
              : 'Completa el formulario para crear un nuevo horario'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Conductor y Ruta */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="conductorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conductor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              <FormField
                control={form.control}
                name="rutaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ruta</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona ruta" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rutas.map((ruta) => (
                          <SelectItem key={ruta.id} value={ruta.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: ruta.color }}
                              />
                              {ruta.nombre}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Hora Inicio y Fin */}
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
                    <FormDescription>Formato 24 horas</FormDescription>
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
                    <FormDescription>Formato 24 horas</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Días de la Semana */}
            <FormField
              control={form.control}
              name="diasSemana"
              render={() => (
                <FormItem>
                  <FormLabel>Días de la Semana</FormLabel>
                  <div className="grid grid-cols-4 gap-3">
                    {DIAS_SEMANA.map((dia) => (
                      <div
                        key={dia}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={dia}
                          checked={selectedDias.includes(dia)}
                          onCheckedChange={() => handleDiaToggle(dia)}
                        />
                        <Label
                          htmlFor={dia}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {dia.slice(0, 3)}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <FormDescription>
                    Selecciona uno o más días
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estado Activo */}
            <FormField
              control={form.control}
              name="activo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Horario Activo</FormLabel>
                    <FormDescription>
                      El horario estará activo y visible en el sistema
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Pruebas Manuales

### Test 1: Crear Horario

1. Click "Nuevo Horario"
2. Seleccionar conductor y ruta
3. Hora inicio: 06:00, Hora fin: 07:30
4. Seleccionar días: L, M, Mi, J, V
5. Activo: ON
6. Click "Crear"

**Resultado esperado:**
- Time picker HTML5
- Multi-select de días con checkboxes
- Validación: hora fin > hora inicio

### Test 2: Validación de Horarios

Intentar crear:
- Hora inicio: 10:00, Hora fin: 09:00

**Resultado esperado:**
- Error: "La hora de fin debe ser posterior a la hora de inicio"

### Test 3: Filtros

1. Filtrar por conductor
2. Ver solo horarios de ese conductor
3. Filtrar por día "Lunes"
4. Ver solo horarios que incluyen Lunes

**Resultado esperado:**
- Filtros combinables
- Badges de días truncados (máximo 3 + contador)

---

## Criterios de Aceptación

- [x] CRUD completo de horarios
- [x] Time picker HTML5 para horas
- [x] Multi-select de días con checkboxes
- [x] Validación hora fin > hora inicio
- [x] Selectores de conductor y ruta
- [x] Badges de días (max 3 visible)
- [x] Filtros por conductor, ruta y día
- [x] Switch de activo/inactivo

---

## Archivos Creados

```
src/app/dashboard/horarios/
└── page.tsx

src/components/horarios/
└── horario-dialog.tsx
```

---

## Link a API Route

**[Historia 11: API Routes - Horarios](./HISTORIA-11-api-horarios.md)**

---

## Siguiente Historia

**[Historia 19: Frontend CRUD - Estatus Vehículos](./HISTORIA-19-crud-estatus.md)**

---

**Fecha de creación:** 2025-02-10
**Última actualización:** 2025-02-10
