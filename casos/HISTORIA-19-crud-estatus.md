# Historia 19: Frontend CRUD - Estatus Vehículos (Catálogo Simple)

**Prioridad:** MEDIA
**Dependencias:** Historia 05 (useApi), Historia 12 (API Estatus)
**Estimación:** 2-3 horas
**Estado:** Pendiente

---

## Objetivo

Implementar un CRUD simple para el catálogo de Estatus de Vehículos con color picker, descripción opcional, y toggle activo/inactivo. Este es un módulo de catálogo básico sin relaciones complejas.

---

## Pre-requisitos

- ✅ Hook useApi implementado (Historia 05)
- ✅ Hook useApiList implementado (Historia 05)
- ✅ API Routes de EstatusVehiculo (Historia 12)
- ✅ Schemas Zod de EstatusVehiculo (Historia 03)

---

## Tareas Detalladas

### 1. Crear Página Simple de Estatus

**Archivo:** `src/app/dashboard/estatus-vehiculos/page.tsx`

```typescript
"use client";

import { useState } from 'react';
import { useApiList } from '@/hooks/use-api-list';
import { EstatusVehiculo } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Plus, MoreVertical, Tag, Palette } from 'lucide-react';
import { EstatusDialog } from '@/components/estatus/estatus-dialog';

export default function EstatusVehiculosPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEstatus, setEditingEstatus] = useState<EstatusVehiculo | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; nombre: string } | null>(
    null
  );

  // Hook principal de lista
  const {
    items: estatusVehiculos,
    isLoading,
    error,
    refresh,
    remove,
  } = useApiList<EstatusVehiculo>({
    url: '/api/estatus-vehiculos',
    autoFetch: true,
  });

  const handleEdit = (estatus: EstatusVehiculo) => {
    setEditingEstatus(estatus);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingEstatus(null);
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
    setEditingEstatus(null);
  };

  const handleSuccess = () => {
    refresh();
    handleDialogClose();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Tag className="h-8 w-8" />
            Estatus de Vehículos
          </h1>
          <p className="text-muted-foreground">
            Catálogo de estados para vehículos del sistema
          </p>
        </div>
        <Button onClick={handleCreate} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Estatus
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 text-sm">Acerca de este catálogo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-700">
            Este catálogo define los estados que puede tener un vehículo (Operativo, En Taller,
            Fuera de Servicio, etc). Los colores se usan para identificar visualmente cada estado.
          </p>
        </CardContent>
      </Card>

      {/* Tabla Simple */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Color</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-red-500 py-8">
                    Error al cargar estatus: {error}
                  </TableCell>
                </TableRow>
              ) : estatusVehiculos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No hay estatus registrados. Crea el primer estatus.
                  </TableCell>
                </TableRow>
              ) : (
                estatusVehiculos.map((estatus) => (
                  <TableRow key={estatus.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: estatus.color }}
                        />
                        <span className="text-xs font-mono text-muted-foreground">
                          {estatus.color}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{estatus.nombre}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {estatus.descripcion || 'Sin descripción'}
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
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(estatus)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setDeleteConfirm({ id: estatus.id, nombre: estatus.nombre })
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
      <EstatusDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        estatus={editingEstatus}
        onSuccess={handleSuccess}
      />

      {/* Diálogo Eliminar */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar el estatus <strong>{deleteConfirm?.nombre}</strong>?
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

### 2. Crear Componente de Diálogo Simple

**Archivo:** `src/components/estatus/estatus-dialog.tsx`

```typescript
"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { estatusVehiculoSchema, EstatusVehiculoFormData } from '@/lib/validations';
import { useApi } from '@/hooks/use-api';
import { EstatusVehiculo } from '@prisma/client';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, Palette } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface EstatusDialogProps {
  open: boolean;
  onClose: () => void;
  estatus: EstatusVehiculo | null;
  onSuccess: () => void;
}

const PRESET_COLORS = [
  '#10b981', // green - operativo
  '#f59e0b', // amber - en taller
  '#ef4444', // red - fuera de servicio
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export function EstatusDialog({ open, onClose, estatus, onSuccess }: EstatusDialogProps) {
  const isEdit = !!estatus;
  const [selectedColor, setSelectedColor] = useState('#10b981');

  const form = useForm<EstatusVehiculoFormData>({
    resolver: zodResolver(estatusVehiculoSchema),
    defaultValues: {
      nombre: '',
      color: '#10b981',
      descripcion: '',
      activo: true,
    },
  });

  const { execute, isLoading } = useApi<EstatusVehiculo>({
    successMessage: isEdit ? 'Estatus actualizado' : 'Estatus creado',
    onSuccess: () => {
      onSuccess();
      form.reset();
    },
  });

  // Cargar datos si es edición
  useEffect(() => {
    if (estatus) {
      form.reset({
        nombre: estatus.nombre,
        color: estatus.color,
        descripcion: estatus.descripcion || '',
        activo: estatus.activo,
      });
      setSelectedColor(estatus.color);
    } else {
      form.reset({
        nombre: '',
        color: '#10b981',
        descripcion: '',
        activo: true,
      });
      setSelectedColor('#10b981');
    }
  }, [estatus, form]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    form.setValue('color', color);
  };

  const onSubmit = async (data: EstatusVehiculoFormData) => {
    try {
      if (isEdit) {
        await execute(`/api/estatus-vehiculos/${estatus.id}`, 'PATCH', data);
      } else {
        await execute('/api/estatus-vehiculos', 'POST', data);
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Estatus' : 'Nuevo Estatus'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los datos del estatus'
              : 'Completa el formulario para crear un nuevo estatus'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombre */}
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Estatus</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Operativo, En Taller, Fuera de Servicio" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Color Picker */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color Identificador</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            type="button"
                          >
                            <div
                              className="h-6 w-6 rounded-full border mr-2"
                              style={{ backgroundColor: selectedColor }}
                            />
                            {selectedColor}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium mb-2">Colores sugeridos</p>
                              <div className="grid grid-cols-4 gap-2">
                                {PRESET_COLORS.map((color) => (
                                  <button
                                    key={color}
                                    type="button"
                                    className="h-10 w-10 rounded-full border-2 hover:scale-110 transition-transform"
                                    style={{
                                      backgroundColor: color,
                                      borderColor:
                                        selectedColor === color ? '#000' : 'transparent',
                                    }}
                                    onClick={() => handleColorChange(color)}
                                  />
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-2">Color personalizado</p>
                              <Input
                                type="color"
                                value={selectedColor}
                                onChange={(e) => handleColorChange(e.target.value)}
                                className="h-12 cursor-pointer"
                              />
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Palette className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Color para identificar visualmente este estatus
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción */}
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción breve del estatus"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Switch Activo */}
            <FormField
              control={form.control}
              name="activo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Estatus Activo</FormLabel>
                    <FormDescription>
                      El estatus estará disponible para asignación
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

### Test 1: Crear Estatus Básicos

Crear estos estatus:

1. **Operativo**
   - Nombre: "Operativo"
   - Color: Verde (#10b981)
   - Descripción: "Vehículo en perfecto estado operativo"
   - Activo: Sí

2. **En Taller**
   - Nombre: "En Taller"
   - Color: Amber (#f59e0b)
   - Descripción: "Vehículo en mantenimiento o reparación"
   - Activo: Sí

3. **Fuera de Servicio**
   - Nombre: "Fuera de Servicio"
   - Color: Rojo (#ef4444)
   - Descripción: "Vehículo no disponible"
   - Activo: Sí

**Resultado esperado:**
- 3 estatus creados con colores distintos
- Círculos de color visible en tabla

### Test 2: Color Picker

1. Click en botón de color
2. Probar colores predefinidos
3. Probar selector personalizado

**Resultado esperado:**
- 8 colores sugeridos
- Input type="color" funcional

---

## Criterios de Aceptación

- [x] CRUD simple sin filtros complejos
- [x] Color picker con colores sugeridos
- [x] Tabla muestra círculo de color + código hex
- [x] Descripción opcional
- [x] Toggle activo/inactivo
- [x] Info card explicativa
- [x] Sin relaciones con otros módulos

---

## Archivos Creados

```
src/app/dashboard/estatus-vehiculos/
└── page.tsx

src/components/estatus/
└── estatus-dialog.tsx
```

---

## Link a API Route

**[Historia 12: API Routes - Estatus Vehículos](./HISTORIA-12-api-estatus-vehiculos.md)**

---

## Siguiente Historia

**[Historia 20: Actualizar Solicitudes](./HISTORIA-20-actualizar-solicitudes.md)**

---

**Fecha de creación:** 2025-02-10
**Última actualización:** 2025-02-10
