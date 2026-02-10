
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const travelHistory = [
  {
    id: 1,
    date: '17 Jul, 2025',
    route: 'Charles de Gaulle',
    time: '7:30 AM',
    arrival: '8:15 AM',
    status: 'Recogido',
    driver: 'Manuel Gonzalez',
    bus: 'Ficha 01',
    duration: '45 min'
  },
  {
    id: 2,
    date: '16 Jul, 2025',
    route: 'Charles de Gaulle',
    time: '7:30 AM',
    arrival: '8:20 AM',
    status: 'Recogido',
    driver: 'Manuel Gonzalez',
    bus: 'Ficha 01',
    duration: '50 min'
  },
  {
    id: 3,
    date: '15 Jul, 2025',
    route: 'Charles de Gaulle',
    time: '7:30 AM',
    arrival: null,
    status: 'No pasó',
    driver: 'Manuel Gonzalez',
    bus: 'Ficha 01',
    duration: null
  },
   {
    id: 4,
    date: '14 Jul, 2025',
    route: 'Autopista Duarte',
    time: '6:45 AM',
    arrival: '7:50 AM',
    status: 'Recogido',
    driver: 'Ricardo Peralta',
    bus: 'Ficha 02',
    duration: '1h 5min'
  },
];

type Filter = 'Todos' | 'Recogidos' | 'No pasó';

export default function HistorialPage() {
    const [activeFilter, setActiveFilter] = useState<Filter>('Todos');

    const filteredHistory = travelHistory.filter(item => {
        if (activeFilter === 'Todos') return true;
        if (activeFilter === 'Recogidos') return item.status === 'Recogido';
        if (activeFilter === 'No pasó') return item.status === 'No pasó';
        return false;
    });
    
    // Group by date
    const groupedHistory = filteredHistory.reduce((acc, item) => {
        (acc[item.date] = acc[item.date] || []).push(item);
        return acc;
    }, {} as Record<string, typeof travelHistory>);

    const getStatusBadge = (status: string) => {
        const isPickedUp = status === 'Recogido';
        return (
            <Badge variant="outline" className={cn(
                "font-medium",
                isPickedUp ? "border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:border-green-700/30 dark:text-green-400" 
                           : "border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:border-red-700/30 dark:text-red-400"
            )}>
                {isPickedUp ? <Check className="mr-1 h-3 w-3" /> : <X className="mr-1 h-3 w-3" />}
                {status}
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
                {(['Todos', 'Recogidos', 'No pasó'] as Filter[]).map(filter => (
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
                                                    <span className="font-medium">{item.route}</span>
                                                </div>
                                                <div className="flex gap-2 items-center text-sm">
                                                    <span className="text-muted-foreground w-16">Hora:</span>
                                                    <span className="font-medium">{item.time}</span>
                                                </div>
                                                {item.arrival && (
                                                    <div className="flex gap-2 items-center text-sm">
                                                        <span className="text-muted-foreground w-16">Llegada:</span>
                                                        <span className="font-medium">{item.arrival}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {getStatusBadge(item.status)}
                                        </div>
                                        {item.status === 'Recogido' && (
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
        </div>
    );
}
