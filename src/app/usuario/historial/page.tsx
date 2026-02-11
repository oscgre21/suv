"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useApiList } from "@/hooks/use-api-list";
import type { HistorialViajeWithRelations } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Filter = 'Todos' | 'Completado' | 'Cancelado';

export default function HistorialPage() {
    const [activeFilter, setActiveFilter] = useState<Filter>('Todos');

    // TODO: Obtener el usuarioId del usuario autenticado
    // Por ahora usaremos todos los viajes
    const {
        items: viajes,
        isLoading,
    } = useApiList<HistorialViajeWithRelations>({
        endpoint: '/api/historial-viajes',
    });

    const filteredHistory = viajes.filter(item => {
        if (activeFilter === 'Todos') return true;
        return item.estado === activeFilter;
    });

    // Group by date
    const groupedHistory = filteredHistory.reduce((acc, item) => {
        const dateKey = format(new Date(item.fechaInicio), 'dd MMM, yyyy', { locale: es });
        (acc[dateKey] = acc[dateKey] || []).push(item);
        return acc;
    }, {} as Record<string, HistorialViajeWithRelations[]>);

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
                {isCanceled && <X className="mr-1 h-3 w-3" />}
                {isCompleted ? 'Recogido' : isInProgress ? 'En Curso' : status}
            </Badge>
        );
    }

    return (
        <div className="p-4 bg-background h-full space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Historial de Viajes</h1>
                <p className="text-muted-foreground">Registro de tus viajes en transporte CESAC</p>
            </div>

            <div className="flex gap-2">
                {(['Todos', 'Completado', 'Cancelado'] as Filter[]).map(filter => (
                    <Button
                        key={filter}
                        variant={activeFilter === filter ? 'default' : 'outline'}
                        onClick={() => setActiveFilter(filter)}
                        className="rounded-full"
                    >
                        {filter}
                    </Button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-6 pb-4">
                    {Object.keys(groupedHistory).length === 0 ? (
                        <p className="text-center text-muted-foreground pt-8">No hay viajes para este filtro.</p>
                    ) : Object.entries(groupedHistory).map(([date, items]) => (
                        <div key={date}>
                            <h2 className="text-lg font-semibold mb-2">{date}</h2>
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <Card key={item.id} className="shadow-sm">
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-2">
                                                    <div className="flex gap-2 items-center text-sm">
                                                        <span className="text-muted-foreground w-16">Ruta:</span>
                                                        <span className="font-medium">{item.ruta.nombre}</span>
                                                    </div>
                                                    <div className="flex gap-2 items-center text-sm">
                                                        <span className="text-muted-foreground w-16">Hora:</span>
                                                        <span className="font-medium">
                                                            {format(new Date(item.fechaInicio), 'h:mm a', { locale: es })}
                                                        </span>
                                                    </div>
                                                    {item.fechaFin && (
                                                        <div className="flex gap-2 items-center text-sm">
                                                            <span className="text-muted-foreground w-16">Llegada:</span>
                                                            <span className="font-medium">
                                                                {format(new Date(item.fechaFin), 'h:mm a', { locale: es })}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {item.duracionMinutos && (
                                                        <div className="flex gap-2 items-center text-sm">
                                                            <span className="text-muted-foreground w-16">Duración:</span>
                                                            <span className="font-medium">{item.duracionMinutos} min</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {getStatusBadge(item.estado)}
                                            </div>
                                            {item.estado === 'Completado' && (
                                                <>
                                                    <hr className="border-t border-border" />
                                                    <Link href={`/usuario/historial/${item.id}`} className="flex items-center justify-end text-sm font-medium text-primary hover:underline">
                                                        Ver detalles
                                                        <ChevronRight className="h-4 w-4 ml-1" />
                                                    </Link>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
