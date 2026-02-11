
"use client";

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bus } from 'lucide-react';
import ReactDOMServer from 'react-dom/server';

interface VehiculoGPS {
  id: string;
  ficha: string;
  latitud: number;
  longitud: number;
  velocidad: number;
  estado: string;
  ruta: { nombre: string; color: string } | null;
  ultimaActualizacion: string | null;
}

interface LeafletMapProps {
  vehiculos?: VehiculoGPS[];
  isNotified?: boolean;
  countdownSeconds?: number;
  initialSeconds?: number;
}

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

const getEstadoTexto = (estado: string, velocidad: number) => {
  if (velocidad > 0) return 'En Ruta';
  if (estado === 'Operativo') return 'Detenido';
  return estado;
};

export function LeafletMap({ vehiculos = [] }: LeafletMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<Map<string, L.Marker>>(new Map());

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

            mapInstanceRef.current = map;
        }

        // Update markers with animation
        if (mapInstanceRef.current && vehiculos && vehiculos.length > 0) {
            const currentMarkers = markersRef.current;
            const updatedVehicleIds = new Set<string>();

            vehiculos.forEach(vehiculo => {
                if (vehiculo.latitud && vehiculo.longitud) {
                    updatedVehicleIds.add(vehiculo.id);
                    const newLatLng: L.LatLngExpression = [vehiculo.latitud, vehiculo.longitud];

                    if (currentMarkers.has(vehiculo.id)) {
                        // Update existing marker with smooth animation
                        const existingMarker = currentMarkers.get(vehiculo.id)!;
                        const currentLatLng = existingMarker.getLatLng();

                        // Only animate if position changed significantly (> 0.0001 degrees ~11 meters)
                        const latDiff = Math.abs(currentLatLng.lat - vehiculo.latitud);
                        const lngDiff = Math.abs(currentLatLng.lng - vehiculo.longitud);

                        if (latDiff > 0.0001 || lngDiff > 0.0001) {
                            // Animate marker movement
                            animateMarker(existingMarker, currentLatLng, newLatLng);
                        }

                        // Update popup content
                        const velocidad = vehiculo.velocidad ?? 0;
                        const estado = getEstadoTexto(vehiculo.estado, velocidad);

                        existingMarker.setPopupContent(`
                            <div>
                                <strong>${vehiculo.ficha}</strong><br/>
                                Ruta: ${vehiculo.ruta?.nombre || 'Sin asignar'}<br/>
                                Estado: ${estado}<br/>
                                Velocidad: ${velocidad} km/h
                            </div>
                        `);
                    } else {
                        // Create new marker
                        const marker = L.marker(newLatLng, { icon: busIcon })
                            .addTo(mapInstanceRef.current!);

                        const velocidad = vehiculo.velocidad ?? 0;
                        const estado = getEstadoTexto(vehiculo.estado, velocidad);

                        marker.bindPopup(`
                            <div>
                                <strong>${vehiculo.ficha}</strong><br/>
                                Ruta: ${vehiculo.ruta?.nombre || 'Sin asignar'}<br/>
                                Estado: ${estado}<br/>
                                Velocidad: ${velocidad} km/h
                            </div>
                        `);

                        currentMarkers.set(vehiculo.id, marker);
                    }
                }
            });

            // Remove markers for vehicles that no longer exist
            currentMarkers.forEach((marker, id) => {
                if (!updatedVehicleIds.has(id)) {
                    mapInstanceRef.current?.removeLayer(marker);
                    currentMarkers.delete(id);
                }
            });
        }

        // Cleanup function to run when component is unmounted
        return () => {
            if (mapInstanceRef.current) {
                markersRef.current.forEach(marker => {
                    mapInstanceRef.current?.removeLayer(marker);
                });
                markersRef.current.clear();
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [vehiculos]); // Update when vehiculos change

    // Smooth marker animation helper
    const animateMarker = (marker: L.Marker, startLatLng: L.LatLng, endLatLng: L.LatLngExpression) => {
        const duration = 1000; // 1 second animation
        const frameRate = 60; // 60 FPS
        const frames = duration / (1000 / frameRate);
        let frame = 0;

        const endLatLngObj = L.latLng(endLatLng);
        const latStep = (endLatLngObj.lat - startLatLng.lat) / frames;
        const lngStep = (endLatLngObj.lng - startLatLng.lng) / frames;

        const animate = () => {
            frame++;
            if (frame <= frames) {
                const newLat = startLatLng.lat + (latStep * frame);
                const newLng = startLatLng.lng + (lngStep * frame);
                marker.setLatLng([newLat, newLng]);
                requestAnimationFrame(animate);
            } else {
                marker.setLatLng(endLatLng);
            }
        };

        requestAnimationFrame(animate);
    };

    return <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />;
}
