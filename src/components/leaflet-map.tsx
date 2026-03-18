
"use client";

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bus, MapPin } from 'lucide-react';
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

interface ParadaMap {
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
  orden: number;
}

interface LeafletMapProps {
  vehiculos?: VehiculoGPS[];
  paradas?: ParadaMap[];
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

const createParadaIcon = (orden: number) => new L.DivIcon({
  html: ReactDOMServer.renderToString(
    <div className="relative flex items-center justify-center w-7 h-7">
      <div className="relative flex items-center justify-center w-6 h-6 bg-white border-2 border-blue-600 rounded-full shadow-md">
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#2563eb' }}>{orden}</span>
      </div>
    </div>
  ),
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

const getEstadoTexto = (estado: string, velocidad: number) => {
  if (velocidad > 0) return 'En Ruta';
  if (estado === 'Operativo') return 'Detenido';
  return estado;
};

export function LeafletMap({ vehiculos = [], paradas = [] }: LeafletMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<Map<string, L.Marker>>(new Map());
    const paradaMarkersRef = useRef<L.Marker[]>([]);
    const polylineRef = useRef<L.Polyline | null>(null);
    const hasFittedBoundsRef = useRef(false);

    // Inicializar mapa
    useEffect(() => {
        if (mapContainerRef.current && !mapInstanceRef.current) {
            const map = L.map(mapContainerRef.current, {
                center: [18.4861, -69.9312],
                zoom: 13,
                scrollWheelZoom: false,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            mapInstanceRef.current = map;
        }

        return () => {
            if (mapInstanceRef.current) {
                markersRef.current.forEach(marker => {
                    mapInstanceRef.current?.removeLayer(marker);
                });
                markersRef.current.clear();
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                hasFittedBoundsRef.current = false;
            }
        };
    }, []);

    // Dibujar paradas y polyline
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || paradas.length === 0) return;

        // Limpiar paradas anteriores
        paradaMarkersRef.current.forEach(m => map.removeLayer(m));
        paradaMarkersRef.current = [];
        if (polylineRef.current) {
            map.removeLayer(polylineRef.current);
            polylineRef.current = null;
        }

        // Ordenar paradas por orden
        const paradasOrdenadas = [...paradas].sort((a, b) => a.orden - b.orden);

        // Dibujar polyline conectando las paradas
        const latlngs: L.LatLngExpression[] = paradasOrdenadas.map(p => [p.latitud, p.longitud]);
        polylineRef.current = L.polyline(latlngs, {
            color: '#2563eb',
            weight: 3,
            opacity: 0.6,
            dashArray: '8, 8',
        }).addTo(map);

        // Dibujar marcadores de paradas
        paradasOrdenadas.forEach(parada => {
            const marker = L.marker([parada.latitud, parada.longitud], {
                icon: createParadaIcon(parada.orden),
                zIndexOffset: -100,
            }).addTo(map);

            marker.bindPopup(`
                <div style="text-align:center;">
                    <strong>${parada.nombre}</strong><br/>
                    <span style="color:#666;font-size:12px;">Parada #${parada.orden}</span>
                </div>
            `);

            paradaMarkersRef.current.push(marker);
        });

        // Ajustar zoom para mostrar todas las paradas (solo la primera vez)
        if (!hasFittedBoundsRef.current && latlngs.length > 0) {
            const bounds = L.latLngBounds(latlngs);
            map.fitBounds(bounds, { padding: [30, 30] });
            hasFittedBoundsRef.current = true;
        }
    }, [paradas]);

    // Actualizar marcadores de vehículos
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        if (vehiculos.length > 0) {
            const currentMarkers = markersRef.current;
            const updatedVehicleIds = new Set<string>();

            vehiculos.forEach(vehiculo => {
                if (vehiculo.latitud && vehiculo.longitud) {
                    updatedVehicleIds.add(vehiculo.id);
                    const newLatLng: L.LatLngExpression = [vehiculo.latitud, vehiculo.longitud];

                    if (currentMarkers.has(vehiculo.id)) {
                        const existingMarker = currentMarkers.get(vehiculo.id)!;
                        const currentLatLng = existingMarker.getLatLng();

                        const latDiff = Math.abs(currentLatLng.lat - vehiculo.latitud);
                        const lngDiff = Math.abs(currentLatLng.lng - vehiculo.longitud);

                        if (latDiff > 0.0001 || lngDiff > 0.0001) {
                            animateMarker(existingMarker, currentLatLng, newLatLng);
                        }

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
                        const marker = L.marker(newLatLng, { icon: busIcon })
                            .addTo(map);

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

            // Remover marcadores de vehículos que ya no existen
            currentMarkers.forEach((marker, id) => {
                if (!updatedVehicleIds.has(id)) {
                    map.removeLayer(marker);
                    currentMarkers.delete(id);
                }
            });
        }
    }, [vehiculos]);

    const animateMarker = (marker: L.Marker, startLatLng: L.LatLng, endLatLng: L.LatLngExpression) => {
        const duration = 1000;
        const frameRate = 60;
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
