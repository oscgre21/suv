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
  height?: string;
}

export function MapPicker({
  initialLat = 18.4861,
  initialLng = -69.9312,
  onLocationSelect,
  height = '400px',
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState({ lat: initialLat, lng: initialLng });
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initMap() {
      if (!mapRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        const loader = getGoogleMapsLoader();
        const { Map } = await loader.importLibrary('maps') as google.maps.MapsLibrary;
        const { AdvancedMarkerElement } = await loader.importLibrary('marker') as google.maps.MarkerLibrary;

        const mapInstance = new Map(mapRef.current, {
          center: { lat: initialLat, lng: initialLng },
          zoom: 15,
          mapId: 'cesac-map-picker',
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });

        // Crear marcador draggable
        const marker = new AdvancedMarkerElement({
          map: mapInstance,
          position: { lat: initialLat, lng: initialLng },
          gmpDraggable: true,
          title: 'Arrastra para seleccionar ubicación',
        });

        // Listener para cuando se arrastra el marcador
        marker.addListener('dragend', () => {
          const position = marker.position as google.maps.LatLngLiteral;
          if (position) {
            const lat = position.lat;
            const lng = position.lng;
            setSelectedLocation({ lat, lng });
            reverseGeocode(lat, lng);
          }
        });

        // Listener para click en el mapa
        mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            marker.position = { lat, lng };
            setSelectedLocation({ lat, lng });
            reverseGeocode(lat, lng);
          }
        });

        markerRef.current = marker;
        setMap(mapInstance);
        setIsLoading(false);

        // Reverse geocode inicial
        reverseGeocode(initialLat, initialLng);
      } catch (err: any) {
        console.error('Error initializing map:', err);
        setError(err.message || 'Error al cargar el mapa');
        setIsLoading(false);
      }
    }

    initMap();
  }, [initialLat, initialLng]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const loader = getGoogleMapsLoader();
      const { Geocoder } = await loader.importLibrary('geocoding') as google.maps.GeocodingLibrary;
      const geocoder = new Geocoder();

      const result = await geocoder.geocode({ location: { lat, lng } });
      if (result.results.length > 0) {
        const address = result.results[0].formatted_address;
        onLocationSelect(lat, lng, address);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery || !map) return;

    try {
      setIsSearching(true);
      const loader = getGoogleMapsLoader();
      const { Geocoder } = await loader.importLibrary('geocoding') as google.maps.GeocodingLibrary;
      const geocoder = new Geocoder();

      const result = await geocoder.geocode({ address: searchQuery });

      if (result.results.length > 0) {
        const location = result.results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();

        map.setCenter(location);
        map.setZoom(16);

        if (markerRef.current) {
          markerRef.current.position = { lat, lng };
        }

        setSelectedLocation({ lat, lng });

        const address = result.results[0].formatted_address;
        onLocationSelect(lat, lng, address);
      }
    } catch (error) {
      console.error('Error searching:', error);
      setError('No se pudo encontrar la dirección');
    } finally {
      setIsSearching(false);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <p className="font-semibold">Error al cargar el mapa</p>
            <p className="text-sm mt-2">{error}</p>
            <p className="text-xs mt-4 text-muted-foreground">
              Asegúrate de que NEXT_PUBLIC_GOOGLE_MAPS_API_KEY está configurada en .env
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Buscar dirección..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            disabled={isLoading || isSearching}
          />
          <Button
            onClick={handleSearch}
            size="icon"
            disabled={isLoading || isSearching || !searchQuery}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Cargando mapa...</p>
              </div>
            </div>
          )}
          <div
            ref={mapRef}
            className="w-full rounded-lg"
            style={{ height }}
          />
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>
              Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
            </span>
          </div>
          <span className="text-xs">Click o arrastra el marcador para seleccionar</span>
        </div>
      </CardContent>
    </Card>
  );
}
