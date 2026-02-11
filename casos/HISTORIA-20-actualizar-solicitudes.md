# Historia 20: Actualizar Página Solicitudes (Database Integration)

**Prioridad:** ALTA
**Dependencias:** Historia 05 (useApi), Historia 13 (API Solicitudes)
**Estimación:** 5-6 horas
**Estado:** Pendiente

---

## Objetivo

Actualizar la página existente de Solicitudes para usar la base de datos en lugar de datos hardcodeados. Agregar filtros avanzados, transiciones de estado (Pendiente → Confirmado → NoRecogido/Cancelado), vista detallada, y notificaciones en tiempo real.

---

## Pre-requisitos

- ✅ Hook useApi implementado (Historia 05)
- ✅ Hook useApiList implementado (Historia 05)
- ✅ API Routes de Solicitudes (Historia 13)
- ✅ Schemas Zod de SolicitudParada (Historia 03)
- ⚠️ Página solicitudes existente con datos hardcodeados

---

## Tareas Detalladas

### 1. Actualizar Página Solicitudes

**Archivo:** `src/app/dashboard/solicitudes/page.tsx`

```typescript
"use client";

import { useState, useEffect } from 'react';
import { useApiList } from '@/hooks/use-api-list';
import { useApi } from '@/hooks/use-api';
import { SolicitudParadaWithRelations, RutaWithRelations } from '@/types';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MoreVertical,
  Search,
  X,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function SolicitudesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('');
  const [rutaFilter, setRutaFilter] = useState<string>('');
  const [rutas, setRutas] = useState<RutaWithRelations[]>([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudParadaWithRelations | null>(
    null
  );

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Hook principal de lista
  const {
    items: solicitudes,
    isLoading,
    error,
    setFilters,
    refresh,
  } = useApiList<SolicitudParadaWithRelations>({
    url: '/api/solicitudes',
    autoFetch: true,
  });

  const { execute: updateEstado, isLoading: isUpdating } = useApi({
    successMessage: 'Estado actualizado',
    onSuccess: () => {
      refresh();
    },
  });

  // Cargar rutas
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
      rutaId: rutaFilter || undefined,
    });
  }, [debouncedSearch, estadoFilter, rutaFilter, setFilters]);

  const handleEstadoChange = async (solicitudId: string, nuevoEstado: string) => {
    try {
      await updateEstado(`/api/solicitudes/${solicitudId}`, 'PATCH', {
        estado: nuevoEstado,
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setEstadoFilter('');
    setRutaFilter('');
  };

  const hasFilters = searchTerm || estadoFilter || rutaFilter;

  const getEstadoBadge = (estado: string) => {
    const config: Record<
      string,
      { variant: any; icon: React.ReactNode; label: string }
    > = {
      Pendiente: {
        variant: 'secondary',
        icon: <Clock className="h-3 w-3" />,
        label: 'Pendiente',
      },
      Confirmado: {
        variant: 'default',
        icon: <CheckCircle className="h-3 w-3" />,
        label: 'Confirmado',
      },
      NoRecogido: {
        variant: 'destructive',
        icon: <AlertCircle className="h-3 w-3" />,
        label: 'No Recogido',
      },
      Cancelado: {
        variant: 'outline',
        icon: <XCircle className="h-3 w-3" />,
        label: 'Cancelado',
      },
    };

    const item = config[estado] || config.Pendiente;

    return (
      <Badge variant={item.variant} className="gap-1">
        {item.icon}
        {item.label}
      </Badge>
    );
  };

  // Estadísticas
  const stats = {
    total: solicitudes.length,
    pendientes: solicitudes.filter((s) => s.estado === 'Pendiente').length,
    confirmadas: solicitudes.filter((s) => s.estado === 'Confirmado').length,
    noRecogidos: solicitudes.filter((s) => s.estado === 'NoRecogido').length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Solicitudes de Parada
          </h1>
          <p className="text-muted-foreground">
            Gestión de solicitudes de usuarios para paradas
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Solicitudes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.pendientes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmadas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">No Recogidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.noRecogidos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtra solicitudes por usuario, estado o ruta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuario, parada..."
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
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Confirmado">Confirmado</SelectItem>
                <SelectItem value="NoRecogido">No Recogido</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
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
                <TableHead>Usuario</TableHead>
                <TableHead>Parada</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Notificado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-red-500 py-8">
                    Error al cargar solicitudes: {error}
                  </TableCell>
                </TableRow>
              ) : solicitudes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {hasFilters
                      ? 'No se encontraron solicitudes con los filtros aplicados'
                      : 'No hay solicitudes registradas'}
                  </TableCell>
                </TableRow>
              ) : (
                solicitudes.map((solicitud) => (
                  <TableRow key={solicitud.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{solicitud.usuario.nombre}</div>
                          <div className="text-xs text-muted-foreground">
                            {solicitud.usuario.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{solicitud.parada.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: solicitud.ruta.color }}
                        />
                        <span className="text-sm">{solicitud.ruta.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(solicitud.createdAt), 'dd/MM/yyyy HH:mm', {
                          locale: es,
                        })}
                      </div>
                    </TableCell>
                    <TableCell>{getEstadoBadge(solicitud.estado)}</TableCell>
                    <TableCell>
                      {solicitud.notificado ? (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Sí
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={isUpdating}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Cambiar Estado</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleEstadoChange(solicitud.id, 'Pendiente')}
                            disabled={solicitud.estado === 'Pendiente'}
                          >
                            Pendiente
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEstadoChange(solicitud.id, 'Confirmado')}
                            disabled={solicitud.estado === 'Confirmado'}
                          >
                            Confirmar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEstadoChange(solicitud.id, 'NoRecogido')}
                            disabled={solicitud.estado === 'NoRecogido'}
                          >
                            No Recogido
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEstadoChange(solicitud.id, 'Cancelado')}
                            disabled={solicitud.estado === 'Cancelado'}
                          >
                            Cancelar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setSelectedSolicitud(solicitud)}>
                            Ver Detalles
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

      {/* Diálogo Detalles */}
      <Dialog open={!!selectedSolicitud} onOpenChange={() => setSelectedSolicitud(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles de Solicitud</DialogTitle>
            <DialogDescription>Información completa de la solicitud</DialogDescription>
          </DialogHeader>

          {selectedSolicitud && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Usuario</h4>
                <div className="text-sm">
                  <p className="font-medium">{selectedSolicitud.usuario.nombre}</p>
                  <p className="text-muted-foreground">{selectedSolicitud.usuario.email}</p>
                  {selectedSolicitud.usuario.telefono && (
                    <p className="text-muted-foreground">{selectedSolicitud.usuario.telefono}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Parada</h4>
                <div className="text-sm">
                  <p className="font-medium">{selectedSolicitud.parada.nombre}</p>
                  <p className="text-muted-foreground">{selectedSolicitud.parada.direccion}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Ruta</h4>
                <div className="flex items-center gap-2 text-sm">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: selectedSolicitud.ruta.color }}
                  />
                  <span className="font-medium">{selectedSolicitud.ruta.nombre}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Estado Actual</h4>
                {getEstadoBadge(selectedSolicitud.estado)}
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Fecha de Solicitud</h4>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedSolicitud.createdAt), "dd 'de' MMMM 'de' yyyy, HH:mm", {
                    locale: es,
                  })}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Notificado</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedSolicitud.notificado ? 'Sí' : 'No'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

## Pruebas Manuales

### Test 1: Reemplazar Datos Hardcodeados

1. Abrir `/dashboard/solicitudes`
2. Verificar que datos vienen de la API
3. No debe haber datos hardcodeados

**Resultado esperado:**
- Datos de base de datos PostgreSQL
- Hook useApiList funcionando

### Test 2: Transiciones de Estado

1. Seleccionar solicitud "Pendiente"
2. Cambiar a "Confirmado"
3. Verificar toast de éxito
4. Ver badge actualizado
5. Probar: Confirmado → NoRecogido

**Resultado esperado:**
- Dropdown con opciones de estado
- Estado actual deshabilitado
- API actualiza correctamente

### Test 3: Filtros Avanzados

1. Filtrar por estado "Pendiente"
2. Ver solo pendientes
3. Filtrar por ruta específica
4. Combinar filtros

**Resultado esperado:**
- Estadísticas actualizadas
- Tabla filtrada
- Búsqueda con debounce

### Test 4: Vista Detalles

1. Click en "Ver Detalles"
2. Verificar información completa

**Resultado esperado:**
- Diálogo con todos los datos
- Fecha formateada en español
- Información de usuario, parada y ruta

---

## Diferencias con Página Anterior

### Antes (Hardcoded)
```typescript
const solicitudes = [
  {
    id: '1',
    usuario: { nombre: 'Usuario Hardcoded', email: 'test@test.com' },
    // ... más datos hardcoded
  }
];
```

### Después (Database)
```typescript
const {
  items: solicitudes,
  isLoading,
  refresh,
} = useApiList<SolicitudParadaWithRelations>({
  url: '/api/solicitudes',
  autoFetch: true,
});
```

---

## Criterios de Aceptación

- [x] Eliminar todos los datos hardcodeados
- [x] Integrar con API de solicitudes
- [x] Agregar filtros de búsqueda, estado y ruta
- [x] Implementar transiciones de estado
- [x] Agregar cards de estadísticas
- [x] Vista detallada en diálogo
- [x] Badges con iconos por estado
- [x] Formato de fechas en español
- [x] Indicador de notificación
- [x] Loading states y error handling

---

## Archivos Modificados

```
src/app/dashboard/solicitudes/
└── page.tsx                    # Actualizar completamente
```

---

## Link a API Route

**[Historia 13: API Routes - Solicitudes](./HISTORIA-13-api-solicitudes.md)**

---

## Siguiente Historia

Esta es la última historia de Frontend CRUD. Una vez completada, el sistema tiene todos los módulos CRUD operativos con integración completa a base de datos.

---

**Fecha de creación:** 2025-02-10
**Última actualización:** 2025-02-10
