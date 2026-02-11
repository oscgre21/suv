# Historia 14: Frontend CRUD - Vehículos

**Prioridad:** ALTA
**Dependencias:** Historia 05 (useApi), Historia 07 (API Vehículos)
**Estimación:** 4-5 horas
**Estado:** Pendiente

---

## Objetivo

Implementar el frontend completo de CRUD para el módulo de Vehículos con asignación de conductor y ruta, badges de estado personalizados, capacidad de pasajeros, y gestión de fichas vehiculares.

---

## Pre-requisitos

- ✅ Hook useApi implementado (Historia 05)
- ✅ Hook useApiList implementado (Historia 05)
- ✅ API Routes de Vehículos (Historia 07)
- ✅ Schemas Zod de Vehículo (Historia 03)
- ✅ shadcn/ui componentes instalados

---

## Tareas Detalladas

### 1. Crear Página Principal de Vehículos

**Archivo:** `src/app/dashboard/vehiculos/page.tsx`

```typescript
"use client";

import { useState, useEffect } from 'react';
import { useApiList } from '@/hooks/use-api-list';
import { useApi } from '@/hooks/use-api';
import { VehiculoWithRelations, ConductorWithRelations, RutaWithRelations } from '@/types';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { MoreVertical, Plus, Search, X, Bus } from 'lucide-react';
import { VehiculoDialog } from '@/components/vehiculos/vehiculo-dialog';
import { useDebounce } from '@/hooks/use-debounce';

export default function VehiculosPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState<VehiculoWithRelations | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; ficha: string } | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('');

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Hook principal de lista
  const {
    items: vehiculos,
    isLoading,
    error,
    filters,
    setFilters,
    refresh,
    remove,
  } = useApiList<VehiculoWithRelations>({
    url: '/api/vehiculos',
    autoFetch: true,
  });

  // Actualizar filtros
  useEffect(() => {
    setFilters({
      search: debouncedSearch || undefined,
      estado: estadoFilter || undefined,
    });
  }, [debouncedSearch, estadoFilter, setFilters]);

  const handleEdit = (vehiculo: VehiculoWithRelations) => {
    setEditingVehiculo(vehiculo);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingVehiculo(null);
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
    setEditingVehiculo(null);
  };

  const handleSuccess = () => {
    refresh();
    handleDialogClose();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setEstadoFilter('');
  };

  const hasFilters = searchTerm || estadoFilter;

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      Operativo: { variant: 'default', label: 'Operativo' },
      EnTaller: { variant: 'secondary', label: 'En Taller' },
      FueraDeServicio: { variant: 'destructive', label: 'Fuera de Servicio' },
    };

    const config = variants[estado] || { variant: 'outline', label: estado };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bus className="h-8 w-8" />
            Vehículos
          </h1>
          <p className="text-muted-foreground">
            Gestión de vehículos de la flota de transporte
          </p>
        </div>
        <Button onClick={handleCreate} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Vehículo
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra vehículos por búsqueda o estado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ficha, placa, modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filtro Estado */}
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Operativo">Operativo</SelectItem>
                <SelectItem value="EnTaller">En Taller</SelectItem>
                <SelectItem value="FueraDeServicio">Fuera de Servicio</SelectItem>
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
                <TableHead>Ficha</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Conductor</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-red-500 py-8">
                    Error al cargar vehículos: {error}
                  </TableCell>
                </TableRow>
              ) : vehiculos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    {hasFilters
                      ? 'No se encontraron vehículos con los filtros aplicados'
                      : 'No hay vehículos registrados'}
                  </TableCell>
                </TableRow>
              ) : (
                vehiculos.map((vehiculo) => (
                  <TableRow key={vehiculo.id}>
                    <TableCell className="font-medium">{vehiculo.ficha}</TableCell>
                    <TableCell className="font-mono text-sm">{vehiculo.placa}</TableCell>
                    <TableCell>{vehiculo.modelo}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{vehiculo.capacidad} pas.</Badge>
                    </TableCell>
                    <TableCell>{getEstadoBadge(vehiculo.estado)}</TableCell>
                    <TableCell>
                      {vehiculo.conductor ? (
                        <span className="text-sm">{vehiculo.conductor.nombre}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin asignar</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {vehiculo.ruta ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: vehiculo.ruta.color }}
                          />
                          <span className="text-sm">{vehiculo.ruta.nombre}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin ruta</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(vehiculo)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setDeleteConfirm({ id: vehiculo.id, ficha: vehiculo.ficha })
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
      <VehiculoDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        vehiculo={editingVehiculo}
        onSuccess={handleSuccess}
      />

      {/* Diálogo Eliminar */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar el vehículo <strong>{deleteConfirm?.ficha}</strong>?
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

### 2. Crear Componente de Diálogo Vehículo

**Archivo:** `src/components/vehiculos/vehiculo-dialog.tsx`

```typescript
"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vehiculoSchema, VehiculoFormData } from '@/lib/validations';
import { useApi } from '@/hooks/use-api';
import { VehiculoWithRelations, ConductorWithRelations, RutaWithRelations } from '@/types';
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
import { Loader2 } from 'lucide-react';

interface VehiculoDialogProps {
  open: boolean;
  onClose: () => void;
  vehiculo: VehiculoWithRelations | null;
  onSuccess: () => void;
}

export function VehiculoDialog({
  open,
  onClose,
  vehiculo,
  onSuccess,
}: VehiculoDialogProps) {
  const isEdit = !!vehiculo;
  const [conductores, setConductores] = useState<ConductorWithRelations[]>([]);
  const [rutas, setRutas] = useState<RutaWithRelations[]>([]);

  const form = useForm<VehiculoFormData>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: {
      ficha: '',
      modelo: '',
      placa: '',
      capacidad: 40,
      estado: 'Operativo',
      rutaAsignada: null,
    },
  });

  const { execute, isLoading } = useApi<VehiculoWithRelations>({
    successMessage: isEdit ? 'Vehículo actualizado' : 'Vehículo creado',
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
          fetch('/api/conductores'),
          fetch('/api/rutas'),
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
    if (vehiculo) {
      form.reset({
        ficha: vehiculo.ficha,
        modelo: vehiculo.modelo,
        placa: vehiculo.placa,
        capacidad: vehiculo.capacidad,
        estado: vehiculo.estado,
        rutaAsignada: vehiculo.rutaAsignada,
      });
    } else {
      form.reset({
        ficha: '',
        modelo: '',
        placa: '',
        capacidad: 40,
        estado: 'Operativo',
        rutaAsignada: null,
      });
    }
  }, [vehiculo, form]);

  const onSubmit = async (data: VehiculoFormData) => {
    try {
      if (isEdit) {
        await execute(`/api/vehiculos/${vehiculo.id}`, 'PATCH', data);
      } else {
        await execute('/api/vehiculos', 'POST', data);
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Vehículo' : 'Nuevo Vehículo'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los datos del vehículo'
              : 'Completa el formulario para agregar un vehículo a la flota'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Ficha y Placa */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ficha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ficha</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 001" {...field} />
                    </FormControl>
                    <FormDescription>Número de ficha del vehículo</FormDescription>
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
                    <FormDescription>Formato: I098765</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Modelo */}
            <FormField
              control={form.control}
              name="modelo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Toyota Coaster 2020" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Capacidad y Estado */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="capacidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidad</FormLabel>
                    <FormControl>
                      <Input type="number" min="10" max="100" {...field} />
                    </FormControl>
                    <FormDescription>Número de pasajeros</FormDescription>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            {/* Ruta Asignada */}
            <FormField
              control={form.control}
              name="rutaAsignada"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ruta Asignada (Opcional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una ruta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Sin ruta</SelectItem>
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

### Test 1: Listar Vehículos

1. Navegar a `/dashboard/vehiculos`
2. Verificar tabla con columnas de ficha, placa, modelo
3. Verificar badge de estado con colores
4. Verificar conductor asignado
5. Verificar ruta con color preview

**Resultado esperado:**
- Tabla completa con todos los vehículos
- Estados: Operativo (verde), En Taller (gris), Fuera de Servicio (rojo)
- Dot de color junto al nombre de ruta

### Test 2: Crear Vehículo

1. Click en "Nuevo Vehículo"
2. Llenar:
   - Ficha: "TEST-001"
   - Placa: "I098765"
   - Modelo: "Toyota Coaster 2022"
   - Capacidad: 45
   - Estado: "Operativo"
   - Ruta: Seleccionar una ruta
3. Click "Crear"

**Resultado esperado:**
- Validación de placa formato correcto
- Capacidad entre 10-100
- Select de rutas con preview de color

### Test 3: Validación de Placa

Intentar placas inválidas:
- "I12345" (muy corta)
- "ABC1234" (formato incorrecto)
- "i098765" (minúscula)

**Resultado esperado:**
- Error: "Formato de placa inválido (Ej: I098765)"

---

## Criterios de Aceptación

- [x] Página `/dashboard/vehiculos` operativa
- [x] Filtros de búsqueda y estado
- [x] Badge de estado con 3 variantes de color
- [x] Selector de ruta con preview de color
- [x] Validación de placa vehicular
- [x] Capacidad con min/max (10-100)
- [x] Conductor asignado visible en tabla
- [x] Ruta con color dot en tabla

---

## Archivos Creados

```
src/app/dashboard/vehiculos/
└── page.tsx

src/components/vehiculos/
└── vehiculo-dialog.tsx
```

---

## Link a API Route

**[Historia 07: API Routes - Vehículos](./HISTORIA-07-api-vehiculos.md)**

---

## Siguiente Historia

**[Historia 15: Frontend CRUD - Rutas](./HISTORIA-15-crud-rutas.md)**

---

**Fecha de creación:** 2025-02-10
**Última actualización:** 2025-02-10
