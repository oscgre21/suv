"use client";

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Loader2 } from 'lucide-react';

interface MapPickerLeafletProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  height?: string;
}

export function MapPickerLeaflet({
  initialLat = 18.4861,
  initialLng = -69.9312,
  onLocationSelect,
  height = '400px',
}: MapPickerLeafletProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState({ lat: initialLat, lng: initialLng });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Crear marcador draggable
      const customIcon = L.divIcon({
        html: `<div style="color: #ef4444; font-size: 32px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 32px; height: 32px;"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" /></svg></div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([initialLat, initialLng], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      marker.bindPopup('Arrastra para seleccionar ubicación').openPopup();

      // Listener para cuando se arrastra el marcador
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        const lat = position.lat;
        const lng = position.lng;
        setSelectedLocation({ lat, lng });
        reverseGeocode(lat, lng);
        map.panTo([lat, lng]);
      });

      // Listener para click en el mapa
      map.on('click', (e: L.LeafletMouseEvent) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        marker.setLatLng([lat, lng]);
        setSelectedLocation({ lat, lng });
        reverseGeocode(lat, lng);
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;

      // Reverse geocode inicial
      reverseGeocode(initialLat, initialLng);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initialLat, initialLng]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      onLocationSelect(lat, lng, address);
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery || !mapInstanceRef.current) return;

    try {
      setIsSearching(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();

      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        mapInstanceRef.current.setView([lat, lng], 16);

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }

        setSelectedLocation({ lat, lng });

        const address = data[0].display_name;
        onLocationSelect(lat, lng, address);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Buscar dirección..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            disabled={isSearching}
          />
          <Button
            onClick={handleSearch}
            size="icon"
            disabled={isSearching || !searchQuery}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div
          ref={mapContainerRef}
          className="w-full rounded-lg"
          style={{ height }}
        />

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
