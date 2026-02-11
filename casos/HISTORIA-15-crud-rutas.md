# Historia 15: Frontend CRUD - Rutas

**Prioridad:** ALTA
**Dependencias:** Historia 05 (useApi), Historia 08 (API Rutas)
**Estimación:** 4-5 horas
**Estado:** Pendiente

---

## Objetivo

Implementar el frontend completo de CRUD para el módulo de Rutas con selector de color (color picker), preview de paradas asociadas, toggle de ruta especial, y visualización de estadísticas por ruta.

---

## Pre-requisitos

- ✅ Hook useApi implementado (Historia 05)
- ✅ Hook useApiList implementado (Historia 05)
- ✅ API Routes de Rutas (Historia 08)
- ✅ Schemas Zod de Ruta (Historia 03)
- ✅ shadcn/ui componentes instalados
- ✅ Color picker component

---

## Tareas Detalladas

### 1. Crear Página Principal de Rutas

**Archivo:** `src/app/dashboard/rutas/page.tsx`

```typescript
"use client";

import { useState, useEffect } from 'react';
import { useApiList } from '@/hooks/use-api-list';
import { RutaWithRelations } from '@/types';
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
  MoreVertical,
  Plus,
  Search,
  X,
  Route,
  MapPin,
  Star,
  Check,
  XCircle,
} from 'lucide-react';
import { RutaDialog } from '@/components/rutas/ruta-dialog';
import { useDebounce } from '@/hooks/use-debounce';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function RutasPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRuta, setEditingRuta] = useState<RutaWithRelations | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; nombre: string } | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [activaFilter, setActivaFilter] = useState<boolean | undefined>(undefined);
  const [especialFilter, setEspecialFilter] = useState<boolean | undefined>(undefined);

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Hook principal de lista
  const {
    items: rutas,
    isLoading,
    error,
    setFilters,
    refresh,
    remove,
  } = useApiList<RutaWithRelations>({
    url: '/api/rutas',
    autoFetch: true,
  });

  // Actualizar filtros
  useEffect(() => {
    setFilters({
      search: debouncedSearch || undefined,
      activa: activaFilter,
      esEspecial: especialFilter,
    });
  }, [debouncedSearch, activaFilter, especialFilter, setFilters]);

  const handleEdit = (ruta: RutaWithRelations) => {
    setEditingRuta(ruta);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingRuta(null);
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
    setEditingRuta(null);
  };

  const handleSuccess = () => {
    refresh();
    handleDialogClose();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActivaFilter(undefined);
    setEspecialFilter(undefined);
  };

  const hasFilters = searchTerm || activaFilter !== undefined || especialFilter !== undefined;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Route className="h-8 w-8" />
            Rutas
          </h1>
          <p className="text-muted-foreground">
            Gestión de rutas del sistema de transporte
          </p>
        </div>
        <Button onClick={handleCreate} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Ruta
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra rutas por búsqueda, estado o tipo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Toggle Activa */}
            <div className="flex items-center space-x-2">
              <Switch
                id="filter-activa"
                checked={activaFilter === true}
                onCheckedChange={(checked) => setActivaFilter(checked ? true : undefined)}
              />
              <Label htmlFor="filter-activa">Solo activas</Label>
            </div>

            {/* Toggle Especial */}
            <div className="flex items-center space-x-2">
              <Switch
                id="filter-especial"
                checked={especialFilter === true}
                onCheckedChange={(checked) => setEspecialFilter(checked ? true : undefined)}
              />
              <Label htmlFor="filter-especial">Solo especiales</Label>
            </div>
          </div>

          {hasFilters && (
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              <X className="mr-2 h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Color</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Paradas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-red-500 py-8">
                    Error al cargar rutas: {error}
                  </TableCell>
                </TableRow>
              ) : rutas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {hasFilters
                      ? 'No se encontraron rutas con los filtros aplicados'
                      : 'No hay rutas registradas'}
                  </TableCell>
                </TableRow>
              ) : (
                rutas.map((ruta) => (
                  <TableRow key={ruta.id}>
                    <TableCell>
                      <div
                        className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: ruta.color }}
                        title={ruta.color}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{ruta.nombre}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ruta.descripcion || 'Sin descripción'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {ruta.paradas?.length || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {ruta.activa ? (
                        <Badge variant="default" className="gap-1">
                          <Check className="h-3 w-3" />
                          Activa
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Inactiva
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {ruta.esEspecial ? (
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          Especial
                        </Badge>
                      ) : (
                        <Badge variant="outline">Regular</Badge>
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
                          <DropdownMenuItem onClick={() => handleEdit(ruta)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setDeleteConfirm({ id: ruta.id, nombre: ruta.nombre })
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
      <RutaDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        ruta={editingRuta}
        onSuccess={handleSuccess}
      />

      {/* Diálogo Eliminar */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar la ruta <strong>{deleteConfirm?.nombre}</strong>?
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

### 2. Crear Componente de Diálogo Ruta con Color Picker

**Archivo:** `src/components/rutas/ruta-dialog.tsx`

```typescript
"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { rutaSchema, RutaFormData } from '@/lib/validations';
import { useApi } from '@/hooks/use-api';
import { RutaWithRelations } from '@/types';
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

interface RutaDialogProps {
  open: boolean;
  onClose: () => void;
  ruta: RutaWithRelations | null;
  onSuccess: () => void;
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#a855f7', // purple
];

export function RutaDialog({ open, onClose, ruta, onSuccess }: RutaDialogProps) {
  const isEdit = !!ruta;
  const [selectedColor, setSelectedColor] = useState('#3b82f6');

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

  const { execute, isLoading } = useApi<RutaWithRelations>({
    successMessage: isEdit ? 'Ruta actualizada' : 'Ruta creada',
    onSuccess: () => {
      onSuccess();
      form.reset();
    },
  });

  // Cargar datos si es edición
  useEffect(() => {
    if (ruta) {
      form.reset({
        nombre: ruta.nombre,
        descripcion: ruta.descripcion || '',
        color: ruta.color,
        activa: ruta.activa,
        esEspecial: ruta.esEspecial,
      });
      setSelectedColor(ruta.color);
    } else {
      form.reset({
        nombre: '',
        descripcion: '',
        color: '#3b82f6',
        activa: true,
        esEspecial: false,
      });
      setSelectedColor('#3b82f6');
    }
  }, [ruta, form]);

  const onSubmit = async (data: RutaFormData) => {
    try {
      if (isEdit) {
        await execute(`/api/rutas/${ruta.id}`, 'PATCH', data);
      } else {
        await execute('/api/rutas', 'POST', data);
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    form.setValue('color', color);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Ruta' : 'Nueva Ruta'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los datos de la ruta'
              : 'Completa el formulario para crear una nueva ruta'}
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
                  <FormLabel>Nombre de la Ruta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Ruta Centro - Universidad" {...field} />
                  </FormControl>
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
                      placeholder="Descripción breve de la ruta y sus puntos principales"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
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
                  <FormLabel>Color de la Ruta</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-[200px] justify-start"
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
                              <p className="text-sm font-medium mb-2">Colores predefinidos</p>
                              <div className="grid grid-cols-5 gap-2">
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
                    Este color se usará para identificar la ruta en el mapa
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Switches */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="activa"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ruta Activa</FormLabel>
                      <FormDescription>
                        La ruta estará disponible para asignación
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                      <FormDescription>Marcar como ruta especial</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Preview de paradas (solo en edición) */}
            {isEdit && ruta.paradas && ruta.paradas.length > 0 && (
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm font-medium mb-2">
                  Paradas actuales: {ruta.paradas.length}
                </p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {ruta.paradas.slice(0, 3).map((parada) => (
                    <div key={parada.id} className="flex items-center gap-2">
                      <span className="font-medium">{parada.orden}.</span>
                      {parada.nombre}
                    </div>
                  ))}
                  {ruta.paradas.length > 3 && (
                    <p className="text-xs">... y {ruta.paradas.length - 3} más</p>
                  )}
                </div>
              </div>
            )}

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

### Test 1: Listar Rutas

1. Navegar a `/dashboard/rutas`
2. Verificar columna de color con círculo
3. Verificar contador de paradas
4. Verificar badges de Activa/Inactiva
5. Verificar badge de Especial con estrella

**Resultado esperado:**
- Círculo de color en primera columna
- Paradas con ícono MapPin
- Toggle filters funcionando

### Test 2: Color Picker

1. Click en "Nueva Ruta"
2. Click en botón de color
3. Seleccionar color predefinido
4. Probar color personalizado con input type="color"

**Resultado esperado:**
- Popover con 10 colores predefinidos
- Input de color personalizado
- Preview del color seleccionado

### Test 3: Crear Ruta

1. Nombre: "Ruta Norte"
2. Descripción: "Ruta que cubre la zona norte"
3. Color: Seleccionar verde (#10b981)
4. Activa: ON
5. Especial: ON

**Resultado esperado:**
- Ruta creada con color correcto
- Badge "Especial" con estrella
- Badge "Activa" con check

---

## Criterios de Aceptación

- [x] Página `/dashboard/rutas` operativa
- [x] Color picker con colores predefinidos
- [x] Input de color personalizado
- [x] Preview de color en tabla (círculo)
- [x] Contador de paradas
- [x] Toggle Activa/Inactiva
- [x] Toggle Ruta Especial con ícono estrella
- [x] Filtros de activa y especial
- [x] Preview de paradas en edición

---

## Archivos Creados

```
src/app/dashboard/rutas/
└── page.tsx

src/components/rutas/
└── ruta-dialog.tsx
```

---

## Link a API Route

**[Historia 08: API Routes - Rutas](./HISTORIA-08-api-rutas.md)**

---

## Siguiente Historia

**[Historia 16: Frontend CRUD - Usuarios](./HISTORIA-16-crud-usuarios.md)**

---

**Fecha de creación:** 2025-02-10
**Última actualización:** 2025-02-10
