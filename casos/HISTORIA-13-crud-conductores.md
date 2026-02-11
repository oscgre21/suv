# Historia 13: Frontend CRUD - Conductores

**Prioridad:** ALTA
**Dependencias:** Historia 05 (useApi), Historia 06 (API Conductores)
**Estimación:** 4-5 horas
**Estado:** Pendiente

---

## Objetivo

Implementar el frontend completo de CRUD para el módulo de Conductores con React Hook Form + Zod validation, tabla con filtros, diálogo de creación/edición, confirmación de eliminación, y badges de estado. Utilizar el hook `useApiList` para gestión de datos.

---

## Pre-requisitos

- ✅ Hook useApi implementado (Historia 05)
- ✅ Hook useApiList implementado (Historia 05)
- ✅ API Routes de Conductores (Historia 06)
- ✅ Schemas Zod de Conductor (Historia 03)
- ✅ shadcn/ui componentes instalados

---

## Tareas Detalladas

### 1. Crear Página Principal de Conductores

**Archivo:** `src/app/dashboard/conductores/page.tsx`

```typescript
"use client";

import { useState } from 'react';
import { useApiList } from '@/hooks/use-api-list';
import { useApi } from '@/hooks/use-api';
import { ConductorWithRelations } from '@/types';
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
import { MoreVertical, Plus, Search, X, Eye } from 'lucide-react';
import { ConductorDialog } from '@/components/conductores/conductor-dialog';
import { useDebounce } from '@/hooks/use-debounce';

export default function ConductoresPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConductor, setEditingConductor] = useState<ConductorWithRelations | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; nombre: string } | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('');
  const [turnoFilter, setTurnoFilter] = useState<string>('');

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Hook principal de lista
  const {
    items: conductores,
    isLoading,
    error,
    filters,
    setFilters,
    refresh,
    remove,
  } = useApiList<ConductorWithRelations>({
    url: '/api/conductores',
    autoFetch: true,
  });

  // Actualizar filtros cuando cambian los valores
  React.useEffect(() => {
    setFilters({
      search: debouncedSearch || undefined,
      estado: estadoFilter || undefined,
      turno: turnoFilter || undefined,
    });
  }, [debouncedSearch, estadoFilter, turnoFilter, setFilters]);

  const handleEdit = (conductor: ConductorWithRelations) => {
    setEditingConductor(conductor);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingConductor(null);
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
    setEditingConductor(null);
  };

  const handleSuccess = () => {
    refresh();
    handleDialogClose();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setEstadoFilter('');
    setTurnoFilter('');
  };

  const hasFilters = searchTerm || estadoFilter || turnoFilter;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Conductores</h1>
          <p className="text-muted-foreground">
            Gestión de conductores del sistema de transporte
          </p>
        </div>
        <Button onClick={handleCreate} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Conductor
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra conductores por búsqueda, estado o turno</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, cédula..."
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
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Vacaciones">Vacaciones</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro Turno */}
            <Select value={turnoFilter} onValueChange={setTurnoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por turno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Matutino">Matutino</SelectItem>
                <SelectItem value="Vespertino">Vespertino</SelectItem>
                <SelectItem value="Nocturno">Nocturno</SelectItem>
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
                <TableHead>Nombre</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Vehículo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton loading
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-red-500 py-8">
                    Error al cargar conductores: {error}
                  </TableCell>
                </TableRow>
              ) : conductores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {hasFilters
                      ? 'No se encontraron conductores con los filtros aplicados'
                      : 'No hay conductores registrados'}
                  </TableCell>
                </TableRow>
              ) : (
                conductores.map((conductor) => (
                  <TableRow key={conductor.id}>
                    <TableCell className="font-medium">{conductor.nombre}</TableCell>
                    <TableCell>{conductor.cedula}</TableCell>
                    <TableCell>{conductor.telefono}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{conductor.turno}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          conductor.estado === 'Activo'
                            ? 'default'
                            : conductor.estado === 'Vacaciones'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {conductor.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {conductor.vehiculo ? (
                        <span className="text-sm">
                          {conductor.vehiculo.ficha} - {conductor.vehiculo.placa}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin asignar</span>
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
                          <DropdownMenuItem onClick={() => handleEdit(conductor)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setDeleteConfirm({ id: conductor.id, nombre: conductor.nombre })
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
      <ConductorDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        conductor={editingConductor}
        onSuccess={handleSuccess}
      />

      {/* Diálogo Eliminar */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar al conductor <strong>{deleteConfirm?.nombre}</strong>?
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

### 2. Crear Componente de Diálogo Conductor

**Archivo:** `src/components/conductores/conductor-dialog.tsx`

```typescript
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { conductorSchema, ConductorFormData } from '@/lib/validations';
import { useApi } from '@/hooks/use-api';
import { ConductorWithRelations } from '@/types';
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

interface ConductorDialogProps {
  open: boolean;
  onClose: () => void;
  conductor: ConductorWithRelations | null;
  onSuccess: () => void;
}

export function ConductorDialog({
  open,
  onClose,
  conductor,
  onSuccess,
}: ConductorDialogProps) {
  const isEdit = !!conductor;

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

  const { execute, isLoading } = useApi<ConductorWithRelations>({
    successMessage: isEdit ? 'Conductor actualizado' : 'Conductor creado',
    onSuccess: () => {
      onSuccess();
      form.reset();
    },
  });

  // Cargar datos si es edición
  useEffect(() => {
    if (conductor) {
      form.reset({
        nombre: conductor.nombre,
        cedula: conductor.cedula,
        licencia: conductor.licencia,
        telefono: conductor.telefono,
        email: conductor.email || '',
        turno: conductor.turno,
        estado: conductor.estado,
        vehiculoId: conductor.vehiculoId,
      });
    } else {
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
  }, [conductor, form]);

  const onSubmit = async (data: ConductorFormData) => {
    try {
      if (isEdit) {
        await execute(`/api/conductores/${conductor.id}`, 'PATCH', data);
      } else {
        await execute('/api/conductores', 'POST', data);
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Conductor' : 'Nuevo Conductor'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los datos del conductor'
              : 'Completa el formulario para crear un nuevo conductor'}
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
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cédula y Licencia */}
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
                      <Input placeholder="Número de licencia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Teléfono y Email */}
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
                      <Input type="email" placeholder="conductor@correo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Turno y Estado */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="turno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turno</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

### Test 1: Listar Conductores

1. Navegar a `/dashboard/conductores`
2. Verificar que la tabla muestra conductores
3. Verificar badges de estado y turno
4. Verificar columna de vehículo asignado

**Resultado esperado:**
- Tabla muestra todos los conductores
- Loading skeleton mientras carga
- Estados con colores correctos (Activo=verde, Vacaciones=gris, Inactivo=rojo)

### Test 2: Filtros

1. Escribir en búsqueda: "Manuel"
2. Seleccionar estado: "Activo"
3. Seleccionar turno: "Matutino"
4. Click en "Limpiar"

**Resultado esperado:**
- Búsqueda con debounce (500ms)
- Filtros se aplican correctamente
- Botón limpiar restaura vista completa

### Test 3: Crear Conductor

1. Click en "Nuevo Conductor"
2. Llenar formulario:
   - Nombre: "Test Conductor"
   - Cédula: "001-9999999-9"
   - Licencia: "LIC-TEST"
   - Teléfono: "809-999-9999"
   - Turno: "Matutino"
   - Estado: "Activo"
3. Click en "Crear"

**Resultado esperado:**
- Validación en tiempo real
- Toast de éxito
- Tabla se actualiza automáticamente
- Diálogo se cierra

### Test 4: Editar Conductor

1. Click en menú de acciones (3 puntos)
2. Click en "Editar"
3. Cambiar estado a "Vacaciones"
4. Click en "Actualizar"

**Resultado esperado:**
- Diálogo precargado con datos
- Toast de actualización exitosa
- Badge de estado cambia en tabla

### Test 5: Eliminar Conductor

1. Click en menú de acciones
2. Click en "Eliminar"
3. Confirmar en diálogo

**Resultado esperado:**
- AlertDialog de confirmación
- Nombre del conductor mostrado
- Toast de eliminación exitosa
- Conductor desaparece de tabla

### Test 6: Validaciones

Intentar crear conductor con:
- Cédula sin formato: "12345678"
- Teléfono sin formato: "8095550101"
- Email inválido: "test@"

**Resultado esperado:**
- Mensajes de error bajo cada campo
- Botón submit deshabilitado
- Formato correcto: 001-1234567-8, 809-555-0101

---

## Screenshots Esperados

### Vista Principal
```
+----------------------------------------------------------+
|  Conductores                           [+ Nuevo Conductor]|
|  Gestión de conductores del sistema                       |
+----------------------------------------------------------+
|  Filtros                                                  |
|  [Buscar...] [Estado▼] [Turno▼] [X Limpiar]             |
+----------------------------------------------------------+
|  Nombre    | Cédula    | Teléfono   | Turno | Estado    |
|  Manuel P. | 001-xxx-x | 809-xxx-xx | [Mat] | [Activo]  |
|  Carlos G. | 002-xxx-x | 809-xxx-xx | [Vesp]| [Vacacio] |
|  ...                                                      |
+----------------------------------------------------------+
```

### Diálogo Crear/Editar
```
+------------------------------------------+
|  Nuevo Conductor                    [X]  |
|  Completa el formulario para crear...    |
+------------------------------------------+
|  Nombre Completo                         |
|  [Juan Pérez                  ]          |
|                                          |
|  Cédula              Licencia            |
|  [001-1234567-8]     [LIC-001      ]     |
|                                          |
|  Teléfono            Email               |
|  [809-555-0101]      [conductor@...]     |
|                                          |
|  Turno               Estado              |
|  [Matutino ▼]        [Activo ▼]          |
|                                          |
|             [Cancelar]  [Crear]          |
+------------------------------------------+
```

---

## Criterios de Aceptación

- [x] Página `/dashboard/conductores` muestra tabla
- [x] useApiList integrado correctamente
- [x] Filtros de búsqueda, estado y turno funcionan
- [x] Debounce en búsqueda implementado
- [x] Diálogo crear/editar con React Hook Form
- [x] Validación Zod en formulario
- [x] AlertDialog de confirmación para eliminar
- [x] Loading states con Skeleton
- [x] Error handling implementado
- [x] Badges con colores por estado
- [x] DropdownMenu de acciones funcional
- [x] Toast notifications operativas
- [x] Responsive design

---

## Archivos Creados

```
src/app/dashboard/conductores/
└── page.tsx                    # Página principal

src/components/conductores/
└── conductor-dialog.tsx        # Diálogo crear/editar
```

---

## Link a API Route

Esta historia consume:
**[Historia 06: API Routes - Conductores](./HISTORIA-06-api-conductores.md)**

---

## Siguiente Historia

Una vez completada esta historia, continuar con:
**[Historia 14: Frontend CRUD - Vehículos](./HISTORIA-14-crud-vehiculos.md)**

---

**Fecha de creación:** 2025-02-10
**Última actualización:** 2025-02-10
