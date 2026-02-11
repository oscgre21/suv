# Historia 17: Frontend CRUD - Paradas con MapPicker (Google Maps)

**Prioridad:** ALTA
**Dependencias:** Historia 02 (Google Maps), Historia 05 (useApi), Historia 10 (API Paradas)
**Estimación:** 6-8 horas
**Estado:** Pendiente

---

## Objetivo

Implementar una página especial para gestión de Paradas con integración completa de Google Maps usando el componente MapPicker de Historia 02. Incluye drag & drop de marcadores, geocoding automático, reverse geocoding, gestión de orden de paradas, y visualización de múltiples paradas en el mapa.

---

## Pre-requisitos

- ✅ Google Maps API configurada (Historia 02)
- ✅ Componente MapPicker creado (Historia 02)
- ✅ Hook useApi implementado (Historia 05)
- ✅ API Routes de Paradas (Historia 10)
- ✅ Schemas Zod de Parada (Historia 03)

---

## Tareas Detalladas

### 1. Crear Página Principal de Paradas con Mapa

**Archivo:** `src/app/dashboard/paradas/page.tsx`

```typescript
"use client";

import { useState, useEffect } from 'react';
import { useApiList } from '@/hooks/use-api-list';
import { ParadaWithRelations, RutaWithRelations } from '@/types';
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
  Search,
  X,
  MapPin,
  MoreVertical,
  Navigation,
  ArrowUp,
  ArrowDown,
  Map,
} from 'lucide-react';
import { ParadaDialog } from '@/components/paradas/parada-dialog';
import { ParadaMapView } from '@/components/paradas/parada-map-view';
import { useDebounce } from '@/hooks/use-debounce';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ParadasPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingParada, setEditingParada] = useState<ParadaWithRelations | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; nombre: string } | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [rutaFilter, setRutaFilter] = useState<string>('');
  const [rutas, setRutas] = useState<RutaWithRelations[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Hook principal de lista
  const {
    items: paradas,
    isLoading,
    error,
    setFilters,
    refresh,
    remove,
  } = useApiList<ParadaWithRelations>({
    url: '/api/paradas',
    autoFetch: true,
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
      rutaId: rutaFilter || undefined,
    });
  }, [debouncedSearch, rutaFilter, setFilters]);

  const handleEdit = (parada: ParadaWithRelations) => {
    setEditingParada(parada);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingParada(null);
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
    setEditingParada(null);
  };

  const handleSuccess = () => {
    refresh();
    handleDialogClose();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRutaFilter('');
  };

  const hasFilters = searchTerm || rutaFilter;

  // Ordenar paradas por orden
  const paradasOrdenadas = [...paradas].sort((a, b) => a.orden - b.orden);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="h-8 w-8" />
            Paradas
          </h1>
          <p className="text-muted-foreground">
            Gestión de paradas con ubicación GPS
          </p>
        </div>
        <Button onClick={handleCreate} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Parada
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Visualización</CardTitle>
          <CardDescription>Filtra paradas y cambia entre vista tabla/mapa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

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

          {/* Toggle Vista */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              onClick={() => setViewMode('table')}
              size="sm"
            >
              Vista Tabla
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              onClick={() => setViewMode('map')}
              size="sm"
            >
              <Map className="mr-2 h-4 w-4" />
              Vista Mapa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contenido según vista */}
      {viewMode === 'map' ? (
        <ParadaMapView
          paradas={paradasOrdenadas}
          rutaFilter={rutaFilter}
          onEditParada={handleEdit}
          onDeleteParada={(parada) =>
            setDeleteConfirm({ id: parada.id, nombre: parada.nombre })
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Orden</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Coordenadas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-red-500 py-8">
                      Error al cargar paradas: {error}
                    </TableCell>
                  </TableRow>
                ) : paradasOrdenadas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      {hasFilters
                        ? 'No se encontraron paradas con los filtros aplicados'
                        : 'No hay paradas registradas'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paradasOrdenadas.map((parada) => (
                    <TableRow key={parada.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          #{parada.orden}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{parada.nombre}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {parada.direccion}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: parada.ruta.color }}
                          />
                          <span className="text-sm">{parada.ruta.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs font-mono">
                          <Navigation className="h-3 w-3 text-muted-foreground" />
                          {parada.latitud.toFixed(6)}, {parada.longitud.toFixed(6)}
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
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(parada)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setDeleteConfirm({ id: parada.id, nombre: parada.nombre })
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
      )}

      {/* Diálogo Crear/Editar con MapPicker */}
      <ParadaDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        parada={editingParada}
        onSuccess={handleSuccess}
      />

      {/* Diálogo Eliminar */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar la parada <strong>{deleteConfirm?.nombre}</strong>?
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

### 2. Crear Componente de Diálogo con MapPicker (Historia 02)

**Archivo:** `src/components/paradas/parada-dialog.tsx`

```typescript
"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paradaSchema, ParadaFormData } from '@/lib/validations';
import { useApi } from '@/hooks/use-api';
import { ParadaWithRelations, RutaWithRelations } from '@/types';
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
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { MapPicker } from '@/components/map-picker'; // ✅ Componente de Historia 02
import { Badge } from '@/components/ui/badge';

interface ParadaDialogProps {
  open: boolean;
  onClose: () => void;
  parada: ParadaWithRelations | null;
  onSuccess: () => void;
}

export function ParadaDialog({ open, onClose, parada, onSuccess }: ParadaDialogProps) {
  const isEdit = !!parada;
  const [rutas, setRutas] = useState<RutaWithRelations[]>([]);
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 18.4861, // Santo Domingo por defecto
    lng: -69.9312,
    address: '',
  });

  const form = useForm<ParadaFormData>({
    resolver: zodResolver(paradaSchema),
    defaultValues: {
      nombre: '',
      direccion: '',
      latitud: 18.4861,
      longitud: -69.9312,
      orden: 1,
      rutaId: '',
      activa: true,
    },
  });

  const { execute, isLoading } = useApi<ParadaWithRelations>({
    successMessage: isEdit ? 'Parada actualizada' : 'Parada creada',
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
    if (parada) {
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
      form.reset({
        nombre: '',
        direccion: '',
        latitud: 18.4861,
        longitud: -69.9312,
        orden: 1,
        rutaId: '',
        activa: true,
      });
      setSelectedLocation({
        lat: 18.4861,
        lng: -69.9312,
        address: '',
      });
    }
  }, [parada, form]);

  // Manejar selección de ubicación desde MapPicker
  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedLocation({ lat, lng, address });
    form.setValue('latitud', lat);
    form.setValue('longitud', lng);
    form.setValue('direccion', address);
  };

  const onSubmit = async (data: ParadaFormData) => {
    try {
      if (isEdit) {
        await execute(`/api/paradas/${parada.id}`, 'PATCH', data);
      } else {
        await execute('/api/paradas', 'POST', data);
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {isEdit ? 'Editar Parada' : 'Nueva Parada'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los datos de la parada. Arrastra el marcador para cambiar la ubicación.'
              : 'Completa el formulario y selecciona la ubicación en el mapa'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Nombre */}
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Parada</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Parada Universidad Central" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Google Maps Picker - Componente de Historia 02 */}
            <div className="space-y-2">
              <FormLabel>Ubicación GPS</FormLabel>
              <MapPicker
                initialLat={selectedLocation.lat}
                initialLng={selectedLocation.lng}
                onLocationSelect={handleLocationSelect}
                className="border-2"
              />
              <FormDescription className="flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Click en el mapa o arrastra el marcador para seleccionar la ubicación
              </FormDescription>
            </div>

            {/* Dirección (auto-actualizada por MapPicker) */}
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Dirección será obtenida automáticamente del mapa"
                      {...field}
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormDescription>
                    La dirección se actualiza automáticamente al seleccionar en el mapa
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Coordenadas (read-only, actualizadas por MapPicker) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitud"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitud</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-muted font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitud"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitud</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="bg-muted font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Ruta, Orden y Activa */}
            <div className="grid grid-cols-3 gap-4">
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

              <FormField
                control={form.control}
                name="orden"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orden</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="999" {...field} />
                    </FormControl>
                    <FormDescription>Secuencia de la parada</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activa"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-between">
                    <FormLabel>Estado</FormLabel>
                    <div className="flex items-center gap-2">
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                      <span className="text-sm text-muted-foreground">
                        {field.value ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Preview de ubicación */}
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Ubicación Seleccionada
              </p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>
                  <strong>Latitud:</strong> {selectedLocation.lat.toFixed(6)}
                </div>
                <div>
                  <strong>Longitud:</strong> {selectedLocation.lng.toFixed(6)}
                </div>
                <div>
                  <strong>Dirección:</strong> {selectedLocation.address || 'Cargando...'}
                </div>
              </div>
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

### 3. Crear Componente de Vista Mapa

**Archivo:** `src/components/paradas/parada-map-view.tsx`

```typescript
"use client";

import { useEffect, useRef, useState } from 'react';
import { ParadaWithRelations } from '@/types';
import { getGoogleMapsLoader } from '@/lib/google-maps';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Navigation } from 'lucide-react';

interface ParadaMapViewProps {
  paradas: ParadaWithRelations[];
  rutaFilter: string;
  onEditParada: (parada: ParadaWithRelations) => void;
  onDeleteParada: (parada: ParadaWithRelations) => void;
}

export function ParadaMapView({
  paradas,
  rutaFilter,
  onEditParada,
  onDeleteParada,
}: ParadaMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedParada, setSelectedParada] = useState<ParadaWithRelations | null>(null);

  // Inicializar mapa
  useEffect(() => {
    async function initMap() {
      if (!mapRef.current) return;

      try {
        setIsLoading(true);
        const loader = getGoogleMapsLoader();
        const { Map } = (await loader.importLibrary('maps')) as google.maps.MapsLibrary;

        const mapInstance = new Map(mapRef.current, {
          center: { lat: 18.4861, lng: -69.9312 },
          zoom: 12,
          mapId: 'paradas-map-view',
        });

        setMap(mapInstance);
        setIsLoading(false);
      } catch (error) {
        console.error('Error inicializando mapa:', error);
        setIsLoading(false);
      }
    }

    initMap();
  }, []);

  // Actualizar marcadores cuando cambien paradas
  useEffect(() => {
    if (!map) return;

    // Limpiar marcadores anteriores
    markers.forEach((marker) => marker.setMap(null));

    async function addMarkers() {
      if (!map) return;

      const loader = getGoogleMapsLoader();
      const { Marker } = (await loader.importLibrary('marker')) as google.maps.MarkerLibrary;

      const paradasFiltradas = rutaFilter
        ? paradas.filter((p) => p.rutaId === rutaFilter)
        : paradas;

      const newMarkers: google.maps.Marker[] = [];

      paradasFiltradas.forEach((parada) => {
        const marker = new Marker({
          position: { lat: parada.latitud, lng: parada.longitud },
          map,
          title: parada.nombre,
          label: {
            text: `${parada.orden}`,
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
          },
        });

        marker.addListener('click', () => {
          setSelectedParada(parada);
        });

        newMarkers.push(marker);
      });

      setMarkers(newMarkers);

      // Ajustar bounds para ver todas las paradas
      if (paradasFiltradas.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        paradasFiltradas.forEach((parada) => {
          bounds.extend({ lat: parada.latitud, lng: parada.longitud });
        });
        map.fitBounds(bounds);
      }
    }

    addMarkers();
  }, [map, paradas, rutaFilter]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Mapa */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa de Paradas
          </CardTitle>
          <CardDescription>
            Click en un marcador para ver detalles. Los números indican el orden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <div ref={mapRef} className="h-[600px] w-full rounded-lg border" />
          </div>
        </CardContent>
      </Card>

      {/* Panel lateral */}
      <Card>
        <CardHeader>
          <CardTitle>Paradas</CardTitle>
          <CardDescription>
            {paradas.length} parada{paradas.length !== 1 ? 's' : ''} registrada
            {paradas.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
          {paradas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay paradas para mostrar
            </p>
          ) : (
            paradas.map((parada) => (
              <div
                key={parada.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedParada?.id === parada.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedParada(parada)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="font-mono">
                        #{parada.orden}
                      </Badge>
                      <div
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: parada.ruta.color }}
                      />
                    </div>
                    <h4 className="font-medium text-sm truncate">{parada.nombre}</h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {parada.direccion}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Navigation className="h-3 w-3" />
                      {parada.latitud.toFixed(4)}, {parada.longitud.toFixed(4)}
                    </div>
                  </div>
                </div>

                {selectedParada?.id === parada.id && (
                  <div className="mt-3 pt-3 border-t flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEditParada(parada)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDeleteParada(parada)}
                    >
                      Eliminar
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Pruebas Manuales

### Test 1: Crear Parada con MapPicker

1. Click en "Nueva Parada"
2. Buscar dirección en MapPicker: "Universidad APEC"
3. Ajustar marcador arrastrando
4. Verificar que dirección se actualiza automáticamente
5. Llenar nombre: "Parada UNAPEC"
6. Seleccionar ruta y orden
7. Click "Crear"

**Resultado esperado:**
- MapPicker de Historia 02 funciona
- Geocoding automático
- Reverse geocoding al arrastrar
- Coordenadas se actualizan en tiempo real

### Test 2: Vista Mapa

1. Cambiar a "Vista Mapa"
2. Ver todas las paradas en el mapa
3. Click en marcador
4. Ver detalles en panel lateral
5. Click "Editar" desde panel

**Resultado esperado:**
- Marcadores con números de orden
- Bounds ajustados automáticamente
- Panel lateral sincronizado con mapa

### Test 3: Filtro por Ruta en Mapa

1. En Vista Mapa
2. Filtrar por ruta específica
3. Ver solo paradas de esa ruta

**Resultado esperado:**
- Solo marcadores de ruta filtrada
- Zoom ajustado a paradas visibles

---

## Screenshots Esperados

### Vista Tabla
```
+--------------------------------------------------------+
|  Paradas                          [+ Nueva Parada]     |
+--------------------------------------------------------+
|  [Buscar...] [Ruta ▼] [Limpiar]                       |
|  [Vista Tabla] [Vista Mapa]                            |
+--------------------------------------------------------+
| Orden | Nombre    | Dirección | Ruta | GPS | Estado   |
| #1    | UNAPEC    | Av. Max   | [●R1]| 18.4| Activa   |
| #2    | Plaza     | Calle 10  | [●R1]| 18.5| Activa   |
+--------------------------------------------------------+
```

### Diálogo con MapPicker
```
+-------------------------------------------------------+
|  Nueva Parada                                    [X]  |
+-------------------------------------------------------+
|  Nombre de la Parada                                  |
|  [Parada Universidad Central            ]             |
|                                                       |
|  Ubicación GPS                                        |
|  +------------------------------------------+         |
|  | [Buscar dirección...        ] [🔍]      |         |
|  |                                          |         |
|  |          🗺️  GOOGLE MAPS                |         |
|  |             [Marcador 📍]                |         |
|  |                                          |         |
|  |  Lat: 18.486100, Lng: -69.931200        |         |
|  |  Click o arrastra el marcador           |         |
|  +------------------------------------------+         |
|                                                       |
|  Dirección (auto-actualizada)                         |
|  [Av. Máximo Gómez, Santo Domingo...     ]           |
|                                                       |
|  Latitud           Longitud                           |
|  [18.486100]       [-69.931200]                       |
|                                                       |
|  Ruta    Orden    Estado                              |
|  [R1 ▼]  [1   ]   [✓] Activa                          |
|                                                       |
|                    [Cancelar]  [Crear]                |
+-------------------------------------------------------+
```

---

## Criterios de Aceptación

- [x] MapPicker de Historia 02 integrado correctamente
- [x] Drag & drop de marcadores funcional
- [x] Geocoding (dirección → coordenadas) operativo
- [x] Reverse geocoding (coordenadas → dirección) automático
- [x] Vista tabla con ordenamiento por orden
- [x] Vista mapa con múltiples marcadores
- [x] Marcadores numerados por orden
- [x] Panel lateral en vista mapa
- [x] Filtro por ruta en ambas vistas
- [x] Coordenadas en formato legible
- [x] Bounds automáticos en vista mapa

---

## Archivos Creados

```
src/app/dashboard/paradas/
└── page.tsx

src/components/paradas/
├── parada-dialog.tsx        # Diálogo con MapPicker
└── parada-map-view.tsx      # Vista mapa múltiples paradas
```

---

## Integración con Historia 02

Esta historia utiliza directamente:
- `MapPicker` component de Historia 02
- `getGoogleMapsLoader()` función de Historia 02
- Google Maps API Key configurada en Historia 02
- Funciones de geocoding de Historia 02

---

## Link a API Route

**[Historia 10: API Routes - Paradas](./HISTORIA-10-api-paradas.md)**

---

## Siguiente Historia

**[Historia 18: Frontend CRUD - Horarios](./HISTORIA-18-crud-horarios.md)**

---

**Fecha de creación:** 2025-02-10
**Última actualización:** 2025-02-10
