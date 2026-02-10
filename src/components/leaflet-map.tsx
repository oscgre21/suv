
"use client";

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bus, MapPin } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';

// Mock data for bus locations
const buses = [
  { id: 'B-01', position: [18.4861, -69.9312] as L.LatLngExpression, popup: 'Bus 01 - En Ruta' },
  { id: 'B-02', position: [18.49, -69.94] as L.LatLngExpression, popup: 'Bus 02 - Detenido' },
  { id: 'B-03', position: [18.47, -69.92] as L.LatLngExpression, popup: 'Bus 03 - En Ruta' },
  { id: 'B-04', position: [18.50, -69.91] as L.LatLngExpression, popup: 'Bus 04 - Retrasado' },
];

// Mock data for user locations
const users = [
    { id: 'U-01', position: [18.483, -69.935] as L.LatLngExpression, popup: 'Juan Perez' },
    { id: 'U-02', position: [18.475, -69.915] as L.LatLngExpression, popup: 'Maria Rodriguez' },
    { id: 'U-03', position: [18.495, -69.925] as L.LatLngExpression, popup: 'Carlos Gomez' },
];


const busIcon = new L.DivIcon({
  html: ReactDOMServer.renderToString(
    <div className="relative flex items-center justify-center w-8 h-8">
      <div className="absolute w-full h-full rounded-full bg-primary/50 animate-ping"></div>
      <div className="relative flex items-center justify-center w-6 h-6 bg-primary rounded-full text-primary-foreground shadow-md">
        <Bus className="w-4 h-4" />
      </div>
    </div>
  ),
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const userIcon = new L.DivIcon({
  html: ReactDOMServer.renderToString(
    <MapPin className="w-8 h-8 text-red-500 fill-red-500/30" />
  ),
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32], // Point of the pin
  popupAnchor: [0, -32],
});

export function LeafletMap() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        // Initialize map only if the container exists and the map isn't already initialized.
        if (mapContainerRef.current && !mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: [18.4861, -69.9312], // Santo Domingo
                zoom: 13,
                scrollWheelZoom: false,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            buses.forEach(bus => {
                L.marker(bus.position, { icon: busIcon })
                    .addTo(map)
                    .bindPopup(bus.popup);
            });

            users.forEach(user => {
                L.marker(user.position, { icon: userIcon })
                    .addTo(map)
                    .bindPopup(`Usuario: ${user.popup}`);
            });
            
            mapInstanceRef.current = map;
        }

        // Cleanup function to run when component is unmounted
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []); // Empty dependency array ensures this effect runs only once on mount

    return <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />;
}
