# Historia 02: Setup de Google Maps API con Selector de Coordenadas

**Prioridad:** ALTA
**Dependencias:** Historia 01 (Prisma setup)
**Estimación:** 3-4 horas
**Estado:** Pendiente

---

## Objetivo

Configurar Google Maps API para permitir la selección visual de coordenadas GPS en el mapa, implementar geocoding (dirección → coordenadas) y reverse geocoding (coordenadas → dirección), y crear el componente MapPicker reutilizable.

---

## Pre-requisitos

- ✅ Historia 01 completada
- ✅ Google Cloud Project creado
- ✅ Billing habilitado en Google Cloud
- ⚠️ API Key de Google Maps disponible

---

## Paso 0: Obtener Google Maps API Key

### Crear Proyecto en Google Cloud

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear nuevo proyecto: "CESAC Maps"
3. Habilitar billing (requerido para uso de Maps)

### Habilitar APIs Necesarias

4. Ir a **APIs & Services > Library**
5. Buscar y habilitar:
   - ✅ **Maps JavaScript API**
   - ✅ **Geocoding API**
   - ✅ **Places API**

### Crear API Key

6. Ir a **APIs & Services > Credentials**
7. Click **Create Credentials > API Key**
8. Copiar la API key generada

### Restringir API Key (Seguridad)

9. Click en la API key creada
10. En **Application restrictions**:
    - Seleccionar "HTTP referrers"
    - Agregar: `http://localhost:9002/*`
    - Agregar: `https://tu-dominio-produccion.com/*`

11. En **API restrictions**:
    - Seleccionar "Restrict key"
    - Elegir:
      - Maps JavaScript API
      - Geocoding API
      - Places API

12. Guardar cambios

---

## Tareas Detalladas

### 1. Instalar Dependencias

**Comando:**
```bash
npm install @googlemaps/js-api-loader
```

**Verificar instalación:**
```bash
npm list @googlemaps/js-api-loader
```

---

### 2. Actualizar Variables de Entorno

**Archivo:** `.env`

Agregar la API key:

```bash
# Google AI (ya existe)
GEMINI_API_KEY=AIzaSyAgblHISwV43r9BgLf1BzsjtWTCClVrAlI

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=TU_API_KEY_AQUI

# PostgreSQL (ya existe)
DATABASE_URL=postgresql://dgii_oscgre:dgii_oscgre@manager.oscgre.com:5432/suv_db?schema=public
```

**IMPORTANTE:**
- Usar prefijo `NEXT_PUBLIC_` para exponer al cliente
- NO commitear `.env` al repositorio
- Usar `.env.example` para documentar variables

**Crear:** `.env.example`

```bash
# Google AI API
GEMINI_API_KEY=tu_gemini_api_key_aqui

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key_aqui

# PostgreSQL
DATABASE_URL=postgresql://usuario:password@host:5432/database?schema=public
```

---

### 3. Crear Helper de Google Maps

**Archivo:** `src/lib/google-maps.ts`

```typescript
import { Loader } from '@googlemaps/js-api-loader';

let loader: Loader | null = null;

/**
 * Obtiene la instancia del loader de Google Maps (singleton)
 */
export function getGoogleMapsLoader(): Loader {
  if (!loader) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      throw new Error(
        'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY no está configurada en .env'
      );
    }

    loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry', 'geocoding'],
    });
  }

  return loader;
}

/**
 * Convierte una dirección en coordenadas GPS (Geocoding)
 * @param address - Dirección a geocodificar
 * @returns Coordenadas { lat, lng } o null si no se encuentra
 */
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const loader = getGoogleMapsLoader();
    const { Geocoder } = await loader.importLibrary('geocoding') as google.maps.GeocodingLibrary;
    const geocoder = new Geocoder();

    const result = await geocoder.geocode({ address });

    if (result.results.length > 0) {
      const location = result.results[0].geometry.location;
      return {
        lat: location.lat(),
        lng: location.lng(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error en geocoding:', error);
    return null;
  }
}

/**
 * Convierte coordenadas GPS en dirección (Reverse Geocoding)
 * @param lat - Latitud
 * @param lng - Longitud
 * @returns Dirección formateada o null si falla
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    const loader = getGoogleMapsLoader();
    const { Geocoder } = await loader.importLibrary('geocoding') as google.maps.GeocodingLibrary;
    const geocoder = new Geocoder();

    const result = await geocoder.geocode({
      location: { lat, lng },
    });

    if (result.results.length > 0) {
      return result.results[0].formatted_address;
    }

    return null;
  } catch (error) {
    console.error('Error en reverse geocoding:', error);
    return null;
  }
}

/**
 * Calcula la distancia entre dos puntos en metros
 * @param point1 - Primer punto { lat, lng }
 * @param point2 - Segundo punto { lat, lng }
 * @returns Distancia en metros
 */
export async function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): Promise<number> {
  try {
    const loader = getGoogleMapsLoader();
    const { geometry } = await loader.importLibrary('geometry') as google.maps.GeometryLibrary & { geometry: any };

    const p1 = new google.maps.LatLng(point1.lat, point1.lng);
    const p2 = new google.maps.LatLng(point2.lat, point2.lng);

    return google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
  } catch (error) {
    console.error('Error calculando distancia:', error);
    return 0;
  }
}
```

---

### 4. Crear Componente MapPicker

**Archivo:** `src/components/map-picker.tsx`

```typescript
"use client";

import { useEffect, useRef, useState } from 'react';
import { getGoogleMapsLoader } from '@/lib/google-maps';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Loader2 } from 'lucide-react';

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  className?: string;
}

export function MapPicker({
  initialLat = 18.4861, // Santo Domingo por defecto
  initialLng = -69.9312,
  onLocationSelect,
  className = '',
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState({
    lat: initialLat,
    lng: initialLng,
  });

  // Inicializar mapa
  useEffect(() => {
    async function initMap() {
      if (!mapRef.current) return;

      try {
        setIsLoading(true);
        const loader = getGoogleMapsLoader();
        const { Map } = await loader.importLibrary('maps') as google.maps.MapsLibrary;
        const { Marker } = await loader.importLibrary('marker') as google.maps.MarkerLibrary;

        const mapInstance = new Map(mapRef.current, {
          center: { lat: initialLat, lng: initialLng },
          zoom: 15,
          mapId: 'cesac-map-picker', // Necesario para Advanced Markers
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: false,
        });

        // Crear marcador arrastrable
        const marker = new Marker({
          position: { lat: initialLat, lng: initialLng },
          map: mapInstance,
          draggable: true,
          title: 'Arrastrar para cambiar ubicación',
        });

        // Evento: Arrastrar marcador
        marker.addListener('dragend', () => {
          const position = marker.getPosition();
          if (position) {
            const lat = position.lat();
            const lng = position.lng();
            setSelectedLocation({ lat, lng });
            reverseGeocodeAndNotify(lat, lng);
          }
        });

        // Evento: Click en mapa
        mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            marker.setPosition(e.latLng);
            setSelectedLocation({ lat, lng });
            reverseGeocodeAndNotify(lat, lng);
          }
        });

        markerRef.current = marker;
        setMap(mapInstance);
        setIsLoading(false);

        // Reverse geocode inicial
        reverseGeocodeAndNotify(initialLat, initialLng);
      } catch (error) {
        console.error('Error inicializando mapa:', error);
        setIsLoading(false);
      }
    }

    initMap();
  }, [initialLat, initialLng]);

  // Reverse geocode y notificar al padre
  const reverseGeocodeAndNotify = async (lat: number, lng: number) => {
    try {
      const loader = getGoogleMapsLoader();
      const { Geocoder } = await loader.importLibrary('geocoding') as google.maps.GeocodingLibrary;
      const geocoder = new Geocoder();

      const result = await geocoder.geocode({ location: { lat, lng } });
      if (result.results.length > 0) {
        const address = result.results[0].formatted_address;
        onLocationSelect(lat, lng, address);
      } else {
        onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Error en reverse geocoding:', error);
      onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  // Buscar dirección y centrar mapa
  const handleSearch = async () => {
    if (!searchQuery || !map) return;

    try {
      const loader = getGoogleMapsLoader();
      const { Geocoder } = await loader.importLibrary('geocoding') as google.maps.GeocodingLibrary;
      const geocoder = new Geocoder();

      const result = await geocoder.geocode({ address: searchQuery });

      if (result.results.length > 0) {
        const location = result.results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();

        map.setCenter(location);
        map.setZoom(17);
        markerRef.current?.setPosition(location);
        setSelectedLocation({ lat, lng });

        const address = result.results[0].formatted_address;
        onLocationSelect(lat, lng, address);
      } else {
        alert('No se encontró la dirección. Intenta con otra búsqueda.');
      }
    } catch (error) {
      console.error('Error buscando dirección:', error);
      alert('Error al buscar dirección. Intenta de nuevo.');
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        {/* Buscador de direcciones */}
        <div className="flex gap-2">
          <Input
            placeholder="Buscar dirección en Santo Domingo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Mapa */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          <div ref={mapRef} className="h-[400px] w-full rounded-lg border" />
        </div>

        {/* Coordenadas seleccionadas */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              Lat: <strong>{selectedLocation.lat.toFixed(6)}</strong>, Lng:{' '}
              <strong>{selectedLocation.lng.toFixed(6)}</strong>
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Click o arrastra el marcador 📍
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 5. Crear Página de Prueba

**Archivo:** `src/app/test-maps/page.tsx`

```typescript
"use client";

import { useState } from 'react';
import { MapPicker } from '@/components/map-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestMapsPage() {
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 0,
    lng: 0,
    address: '',
  });

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedLocation({ lat, lng, address });
    console.log('Ubicación seleccionada:', { lat, lng, address });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Test: Google Maps Picker</h1>

      <MapPicker
        initialLat={18.4861}
        initialLng={-69.9312}
        onLocationSelect={handleLocationSelect}
      />

      <Card>
        <CardHeader>
          <CardTitle>Ubicación Seleccionada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <strong>Latitud:</strong> {selectedLocation.lat || 'No seleccionada'}
          </div>
          <div>
            <strong>Longitud:</strong> {selectedLocation.lng || 'No seleccionada'}
          </div>
          <div>
            <strong>Dirección:</strong> {selectedLocation.address || 'No disponible'}
          </div>

          <Button
            onClick={() => {
              navigator.clipboard.writeText(
                `${selectedLocation.lat}, ${selectedLocation.lng}`
              );
              alert('Coordenadas copiadas al portapapeles');
            }}
            disabled={!selectedLocation.lat}
          >
            Copiar Coordenadas
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Pruebas de Verificación

### Test 1: Verificar API Key

Navegar a: `http://localhost:9002/test-maps`

**Resultados esperados:**
- ✅ Mapa se carga correctamente
- ✅ Marcador aparece en Santo Domingo
- ✅ Puedes arrastrar el marcador
- ✅ Click en mapa mueve el marcador
- ✅ Búsqueda de direcciones funciona

**Si falla:**
- Verificar que API key está en `.env`
- Verificar que tiene prefijo `NEXT_PUBLIC_`
- Reiniciar servidor: `npm run dev`

### Test 2: Geocoding

En la página de prueba, buscar:
- "Av. Winston Churchill, Santo Domingo"
- "Malecón de Santo Domingo"
- "Parque Colón"

**Resultado esperado:**
- Mapa se centra en la ubicación
- Marcador se mueve a las coordenadas
- Dirección aparece en el panel

### Test 3: Reverse Geocoding

1. Hacer click en diferentes puntos del mapa
2. Verificar que la dirección se actualiza automáticamente
3. Coordenadas deben cambiar en tiempo real

---

## Troubleshooting

### Error: "API key not configured"

**Solución:**
```bash
# Verificar .env
cat .env | grep GOOGLE_MAPS

# Debe mostrar:
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key

# Reiniciar servidor
npm run dev
```

### Error: "This page can't load Google Maps correctly"

**Causa:** API key inválida o restricciones incorrectas

**Solución:**
1. Ir a Google Cloud Console
2. Verificar que APIs están habilitadas
3. Verificar restricciones de HTTP referrer
4. Regenerar API key si es necesario

### Mapa se ve gris

**Causa:** Billing no habilitado en Google Cloud

**Solución:**
1. Ir a [Google Cloud Billing](https://console.cloud.google.com/billing)
2. Vincular tarjeta de crédito
3. Google Maps ofrece $200 USD de crédito gratuito mensual

---

## Criterios de Aceptación

- [x] API Key de Google Maps configurada
- [x] Helper `google-maps.ts` creado
- [x] Función `geocodeAddress()` funcional
- [x] Función `reverseGeocode()` funcional
- [x] Componente `MapPicker` implementado
- [x] Mapa carga correctamente en navegador
- [x] Marcador es arrastrable
- [x] Click en mapa funciona
- [x] Búsqueda de direcciones funciona
- [x] Reverse geocoding automático funciona
- [x] Página de prueba funcional

---

## Archivos Creados

```
src/
├── lib/
│   └── google-maps.ts          # Helper con funciones de Maps
├── components/
│   └── map-picker.tsx           # Componente selector de mapa
└── app/
    └── test-maps/
        └── page.tsx             # Página de prueba (eliminar después)

.env.example                     # Documentación de variables
```

---

## Siguiente Historia

Una vez completada esta historia, continuar con:
**[Historia 03: Schemas Zod y Tipos TypeScript](./HISTORIA-03-schemas-zod-tipos.md)**

---

**Fecha de creación:** 2025-02-10
**Última actualización:** 2025-02-10
