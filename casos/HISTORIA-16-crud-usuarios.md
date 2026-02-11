# Historia 16: Frontend CRUD - Usuarios

**Prioridad:** ALTA
**Dependencias:** Historia 05 (useApi), Historia 09 (API Usuarios)
**Estimación:** 4-5 horas
**Estado:** Pendiente

---

## Objetivo

Implementar el frontend completo de CRUD para el módulo de Usuarios con selector de ruta asignada, visualización de historial de solicitudes, estado activo/inactivo, y validación de cédula y email.

---

## Pre-requisitos

- ✅ Hook useApi implementado (Historia 05)
- ✅ Hook useApiList implementado (Historia 05)
- ✅ API Routes de Usuarios (Historia 09)
- ✅ Schemas Zod de Usuario (Historia 03)
- ✅ shadcn/ui componentes instalados

---

## Tareas Detalladas

### 1. Crear Página Principal de Usuarios

**Archivo:** `src/app/dashboard/usuarios/page.tsx`

```typescript
"use client";

import { useState, useEffect } from 'react';
import { useApiList } from '@/hooks/use-api-list';
import { UsuarioWithRelations, RutaWithRelations } from '@/types';
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
import { MoreVertical, Plus, Search, X, User, Mail, Phone } from 'lucide-react';
import { UsuarioDialog } from '@/components/usuarios/usuario-dialog';
import { useDebounce } from '@/hooks/use-debounce';

export default function UsuariosPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<UsuarioWithRelations | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; nombre: string } | null>(
    null
  );

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('');
  const [rutaFilter, setRutaFilter] = useState<string>('');
  const [rutas, setRutas] = useState<RutaWithRelations[]>([]);

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Hook principal de lista
  const {
    items: usuarios,
    isLoading,
    error,
    setFilters,
    refresh,
    remove,
  } = useApiList<UsuarioWithRelations>({
    url: '/api/usuarios',
    autoFetch: true,
  });

  // Cargar rutas para filtro
  useEffect(() => {
    async function loadRutas() {
      try {
        const response = await fetch('/api/rutas');
        const data = await response.json();
        setRutas(data);
      } catch (error) {
        console.error('Error loading rutas:', error);
      }
    }
    loadRutas();
  }, []);

  // Actualizar filtros
  useEffect(() => {
    setFilters({
      search: debouncedSearch || undefined,
      estado: estadoFilter || undefined,
      rutaAsignada: rutaFilter || undefined,
    });
  }, [debouncedSearch, estadoFilter, rutaFilter, setFilters]);

  const handleEdit = (usuario: UsuarioWithRelations) => {
    setEditingUsuario(usuario);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingUsuario(null);
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
    setEditingUsuario(null);
  };

  const handleSuccess = () => {
    refresh();
    handleDialogClose();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setEstadoFilter('');
    setRutaFilter('');
  };

  const hasFilters = searchTerm || estadoFilter || rutaFilter;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="h-8 w-8" />
            Usuarios
          </h1>
          <p className="text-muted-foreground">
            Gestión de usuarios del sistema de transporte
          </p>
        </div>
        <Button onClick={handleCreate} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra usuarios por búsqueda, estado o ruta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, cédula, email..."
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
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro Ruta */}
            <Select value={rutaFilter} onValueChange={setRutaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por ruta" />
              </SelectTrigger>
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
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Ruta Asignada</TableHead>
                <TableHead>Solicitudes</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-red-500 py-8">
                    Error al cargar usuarios: {error}
                  </TableCell>
                </TableRow>
              ) : usuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    {hasFilters
                      ? 'No se encontraron usuarios con los filtros aplicados'
                      : 'No hay usuarios registrados'}
                  </TableCell>
                </TableRow>
              ) : (
                usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.nombre}</TableCell>
                    <TableCell className="font-mono text-sm">{usuario.cedula}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{usuario.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {usuario.telefono ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{usuario.telefono}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {usuario.ruta ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: usuario.ruta.color }}
                          />
                          <span className="text-sm">{usuario.ruta.nombre}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin ruta</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {usuario.solicitudes?.length || 0} solicitudes
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={usuario.estado === 'Activo' ? 'default' : 'secondary'}>
                        {usuario.estado}
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
                          <DropdownMenuItem onClick={() => handleEdit(usuario)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setDeleteConfirm({ id: usuario.id, nombre: usuario.nombre })
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
      <UsuarioDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        usuario={editingUsuario}
        onSuccess={handleSuccess}
      />

      {/* Diálogo Eliminar */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar al usuario <strong>{deleteConfirm?.nombre}</strong>?
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

### 2. Crear Componente de Diálogo Usuario

**Archivo:** `src/components/usuarios/usuario-dialog.tsx`

```typescript
"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usuarioSchema, UsuarioFormData } from '@/lib/validations';
import { useApi } from '@/hooks/use-api';
import { UsuarioWithRelations, RutaWithRelations } from '@/types';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface UsuarioDialogProps {
  open: boolean;
  onClose: () => void;
  usuario: UsuarioWithRelations | null;
  onSuccess: () => void;
}

export function UsuarioDialog({ open, onClose, usuario, onSuccess }: UsuarioDialogProps) {
  const isEdit = !!usuario;
  const [rutas, setRutas] = useState<RutaWithRelations[]>([]);

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

  const { execute, isLoading } = useApi<UsuarioWithRelations>({
    successMessage: isEdit ? 'Usuario actualizado' : 'Usuario creado',
    onSuccess: () => {
      onSuccess();
      form.reset();
    },
  });

  // Cargar rutas
  useEffect(() => {
    async function loadRutas() {
      try {
        const response = await fetch('/api/rutas?activa=true');
        const data = await response.json();
        setRutas(data);
      } catch (error) {
        console.error('Error loading rutas:', error);
      }
    }

    if (open) {
      loadRutas();
    }
  }, [open]);

  // Cargar datos si es edición
  useEffect(() => {
    if (usuario) {
      form.reset({
        nombre: usuario.nombre,
        cedula: usuario.cedula,
        email: usuario.email,
        telefono: usuario.telefono || '',
        direccion: usuario.direccion || '',
        rutaAsignada: usuario.rutaAsignada,
        estado: usuario.estado,
      });
    } else {
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
  }, [usuario, form]);

  const onSubmit = async (data: UsuarioFormData) => {
    try {
      if (isEdit) {
        await execute(`/api/usuarios/${usuario.id}`, 'PATCH', data);
      } else {
        await execute('/api/usuarios', 'POST', data);
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los datos del usuario'
              : 'Completa el formulario para registrar un nuevo usuario'}
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
                    <Input placeholder="Ej: María García" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cédula y Email */}
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
                      <Input type="email" placeholder="usuario@correo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Teléfono */}
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

            {/* Dirección */}
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Dirección completa del usuario"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ruta Asignada y Estado */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rutaAsignada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ruta Asignada</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona ruta" />
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
                    <FormDescription>Ruta principal del usuario</FormDescription>
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
                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Historial de solicitudes (solo en edición) */}
            {isEdit && usuario.solicitudes && usuario.solicitudes.length > 0 && (
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm font-medium mb-2">
                  Historial de solicitudes: {usuario.solicitudes.length}
                </p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {usuario.solicitudes.slice(0, 3).map((solicitud) => (
                    <div key={solicitud.id} className="flex items-center justify-between">
                      <span>{solicitud.parada.nombre}</span>
                      <span className="text-xs">{solicitud.estado}</span>
                    </div>
                  ))}
                  {usuario.solicitudes.length > 3 && (
                    <p className="text-xs">... y {usuario.solicitudes.length - 3} más</p>
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

### Test 1: Crear Usuario

1. Click "Nuevo Usuario"
2. Llenar datos:
   - Nombre: "Test User"
   - Cédula: "002-8888888-8"
   - Email: "test@example.com"
   - Teléfono: "809-888-8888"
   - Ruta: Seleccionar una
3. Click "Crear"

**Resultado esperado:**
- Validación de cédula y email
- Ruta con preview de color

### Test 2: Filtro por Ruta

1. Seleccionar ruta en filtro
2. Ver usuarios de esa ruta

**Resultado esperado:**
- Solo usuarios con esa ruta
- Dot de color en tabla

---

## Criterios de Aceptación

- [x] CRUD completo de usuarios
- [x] Validación cédula formato RD
- [x] Selector de ruta con colores
- [x] Contador de solicitudes
- [x] Historial de solicitudes en edición
- [x] Filtros operativos

---

## Archivos Creados

```
src/app/dashboard/usuarios/
└── page.tsx

src/components/usuarios/
└── usuario-dialog.tsx
```

---

## Link a API Route

**[Historia 09: API Routes - Usuarios](./HISTORIA-09-api-usuarios.md)**

---

## Siguiente Historia

**[Historia 17: Frontend CRUD - Paradas con MapPicker](./HISTORIA-17-paradas-con-maps.md)**

---

**Fecha de creación:** 2025-02-10
**Última actualización:** 2025-02-10
