
"use client";

import { AnimatedMap } from "@/components/animated-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft, Bus, Calendar, Check, Clock, Route, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Mock data, in a real app this would come from an API
const travelHistory = [
  {
    id: 1,
    date: '17 Jul, 2025',
    route: 'Charles de Gaulle',
    time: '7:30 AM',
    arrival: '8:15 AM',
    status: 'Recogido',
    driver: 'Manuel Gonzalez',
    bus: { name: 'Ficha 01', model: 'Toyota Coaster' },
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
    bus: { name: 'Ficha 01', model: 'Toyota Coaster' },
    duration: '50 min'
  },
  {
    id: 4,
    date: '14 Jul, 2025',
    route: 'Autopista Duarte',
    time: '6:45 AM',
    arrival: '7:50 AM',
    status: 'Recogido',
    driver: 'Ricardo Peralta',
    bus: { name: 'Ficha 02', model: 'Mitsubishi Rosa' },
    duration: '1h 5min'
  },
];


export default function HistorialDetallePage() {
    const params = useParams();
    const tripId = params.id;

    // Find the trip data. In a real app, you'd fetch this.
    const trip = travelHistory.find(t => t.id.toString() === tripId);

    if (!trip) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <h2 className="text-xl font-bold">Viaje no encontrado</h2>
                <p className="text-muted-foreground">No se pudieron encontrar los detalles para este viaje.</p>
                <Button asChild className="mt-4">
                    <Link href="/usuario/historial">Volver al Historial</Link>
                </Button>
            </div>
        )
    }

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
                            <Badge variant="secondary" className="text-sm">{trip.date}</Badge>
                            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:border-green-700/30 dark:text-green-400">
                                <Check className="mr-1 h-3 w-3" />
                                {trip.status}
                            </Badge>
                        </div>
                        <CardTitle className="text-2xl pt-2">{trip.route}</CardTitle>
                    </CardHeader>
                </Card>

                <div className="grid grid-cols-1 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> Conductor</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold">{trip.driver}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2"><Bus className="h-4 w-4 text-muted-foreground" /> Vehículo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold">{trip.bus.name} - {trip.bus.model}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2"><Route className="h-4 w-4 text-muted-foreground" /> Recorrido</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Recogida:</span>
                                <span className="font-medium">{trip.time}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Llegada:</span>
                                <span className="font-medium">{trip.arrival}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Duración:</span>
                                <span className="font-medium">{trip.duration}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
