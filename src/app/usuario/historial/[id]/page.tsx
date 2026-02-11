"use client";

import { useState, useEffect } from "react";
import { AnimatedMap } from "@/components/animated-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft, Bus, Calendar, Check, Clock, Loader2, Route, User, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import type { HistorialViajeWithRelations } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function HistorialDetallePage() {
    const params = useParams();
    const tripId = params.id as string;
    const [trip, setTrip] = useState<HistorialViajeWithRelations | null>(null);
    const { execute: fetchTrip, isLoading } = useApi();

    useEffect(() => {
        const loadTrip = async () => {
            try {
                const data = await fetchTrip(`/api/historial-viajes/${tripId}`, 'GET');
                setTrip(data);
            } catch (error) {
                console.error('Error loading trip:', error);
            }
        };
        loadTrip();
    }, [tripId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <h2 className="text-xl font-bold">Viaje no encontrado</h2>
                <p className="text-muted-foreground">No se pudieron encontrar los detalles para este viaje.</p>
                <Button asChild className="mt-4">
                    <Link href="/usuario/historial">Volver al Historial</Link>
                </Button>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        const isCompleted = status === 'Completado';
        const isCanceled = status === 'Cancelado';
        const isInProgress = status === 'EnCurso';

        return (
            <Badge variant="outline" className={cn(
                "font-medium",
                isCompleted && "border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:border-green-700/30 dark:text-green-400",
                isCanceled && "border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:border-red-700/30 dark:text-red-400",
                isInProgress && "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700/30 dark:text-blue-400"
            )}>
                {isCompleted && <Check className="mr-1 h-3 w-3" />}
                {isCompleted ? 'Recogido' : isInProgress ? 'En Curso' : status}
            </Badge>
        );
    };

    return (
        <div className="flex flex-col h-full">
            <div className="relative h-48 bg-muted">
                <AnimatedMap />
                <div className="absolute top-4 left-4">
                    <Button asChild size="icon" className="rounded-full">
                        <Link href="/usuario/historial">
                            <ArrowLeft />
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex-1 p-4 space-y-4 bg-background overflow-y-auto">
                <Card className="shadow-none border-none">
                    <CardHeader className="p-0 pb-2">
                        <div className="flex justify-between items-center">
                            <Badge variant="secondary" className="text-sm">
                                {format(new Date(trip.fechaInicio), 'dd MMM, yyyy', { locale: es })}
                            </Badge>
                            {getStatusBadge(trip.estado)}
                        </div>
                        <CardTitle className="text-2xl pt-2">{trip.ruta.nombre}</CardTitle>
                    </CardHeader>
                </Card>

                <div className="grid grid-cols-1 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" /> Conductor
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold">{trip.conductor.nombre}</p>
                            <p className="text-sm text-muted-foreground">{trip.conductor.telefono}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Bus className="h-4 w-4 text-muted-foreground" /> Vehículo
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold">{trip.vehiculo.ficha} - {trip.vehiculo.modelo}</p>
                            <p className="text-sm text-muted-foreground">Placa: {trip.vehiculo.placa}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Route className="h-4 w-4 text-muted-foreground" /> Recorrido
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Recogida:</span>
                                <span className="font-medium">
                                    {format(new Date(trip.fechaInicio), 'h:mm a', { locale: es })}
                                </span>
                            </div>
                            {trip.fechaFin && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Llegada:</span>
                                    <span className="font-medium">
                                        {format(new Date(trip.fechaFin), 'h:mm a', { locale: es })}
                                    </span>
                                </div>
                            )}
                            {trip.duracionMinutos && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Duración:</span>
                                    <span className="font-medium">{trip.duracionMinutos} min</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {trip.estado === 'Completado' && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" /> Información Adicional
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Pasajeros:</span>
                                    <span className="font-medium">{trip.pasajeros}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Paradas confirmadas:</span>
                                    <span className="font-medium">{trip.paradasConfirmadas}</span>
                                </div>
                                {trip.calificacion && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Calificación:</span>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn(
                                                        "h-4 w-4",
                                                        i < trip.calificacion! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {trip.comentarios && (
                                    <div className="pt-2">
                                        <p className="text-muted-foreground mb-1">Comentarios:</p>
                                        <p className="text-sm">{trip.comentarios}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
