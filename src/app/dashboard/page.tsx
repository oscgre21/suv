
"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bus, Users, Route, Clock, BarChartHorizontal } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { AnimatedCard } from '@/components/animated-card';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('@/components/leaflet-map').then(m => m.LeafletMap), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted flex items-center justify-center"><p>Cargando mapa...</p></div>
});


const buses = [
  { id: 'B-01', route: 'Charles', speed: '45 km/h', status: 'En Ruta', color: 'bg-green-500' },
  { id: 'B-02', route: 'Duarte', speed: '0 km/h', status: 'Detenido', color: 'bg-yellow-500' },
  { id: 'B-03', route: 'Charles', speed: '50 km/h', status: 'En Ruta', color: 'bg-green-500' },
  { id: 'B-04', route: 'Independencia', speed: '30 km/h', status: 'Retrasado', color: 'bg-red-500' },
  { id: 'B-05', route: 'Duarte', speed: '60 km/h', status: 'En Ruta', color: 'bg-green-500' },
];

const routeUsageData = [
  { route: "Charles", viajes: 120 },
  { route: "Duarte", viajes: 98 },
  { route: "Independencia", viajes: 75 },
  { route: "27 Febrero", viajes: 110 },
]

const routeUsageChartConfig = {
  viajes: {
    label: "Viajes",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export default function MonitoreoPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Panel de control GPS</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedCard glowClassName="from-blue-500/20 to-blue-500/5" className="bg-gradient-to-br from-blue-500/20 to-blue-500/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Buses Activos</CardTitle>
                <Bus className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 que ayer</p>
            </CardContent>
        </AnimatedCard>
        <AnimatedCard glowClassName="from-green-500/20 to-green-500/5" className="bg-gradient-to-br from-green-500/20 to-green-500/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rutas Operativas</CardTitle>
                <Route className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">Todas las rutas activas</p>
            </CardContent>
        </AnimatedCard>
        <AnimatedCard glowClassName="from-amber-500/20 to-amber-500/5" className="bg-gradient-to-br from-amber-500/20 to-amber-500/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
                <Users className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">+3 en la última hora</p>
            </CardContent>
        </AnimatedCard>
        <AnimatedCard glowClassName="from-rose-500/20 to-rose-500/5" className="bg-gradient-to-br from-rose-500/20 to-rose-500/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Puntualidad General</CardTitle>
                <Clock className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">96.5%</div>
                <p className="text-xs text-muted-foreground">Mejora del 1.2% esta semana</p>
            </CardContent>
        </AnimatedCard>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mapa de Flota</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full rounded-lg overflow-hidden shadow-inner">
               <LeafletMap />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChartHorizontal className="h-5 w-5 text-muted-foreground"/>
                        Frecuencia de Uso por Ruta
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={routeUsageChartConfig} className="h-64 w-full">
                        <BarChart
                            accessibilityLayer
                            data={routeUsageData}
                            layout="vertical"
                            margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                        >
                            <CartesianGrid horizontal={false} />
                            <YAxis
                                dataKey="route"
                                type="category"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <XAxis dataKey="viajes" type="number" hide />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                            <Bar dataKey="viajes" fill="var(--color-viajes)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Estado de Buses</CardTitle>
                </CardHeader>
                <CardContent className="p-0 max-h-72 overflow-y-auto">
                    <Table>
                    <TableHeader className="sticky top-0 bg-card">
                        <TableRow>
                        <TableHead>Bus</TableHead>
                        <TableHead>Ruta</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Vel.</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {buses.map((bus) => (
                        <TableRow key={bus.id}>
                            <TableCell className="font-medium">{bus.id}</TableCell>
                            <TableCell>{bus.route}</TableCell>
                            <TableCell>
                            <Badge variant="outline" className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${bus.color}`}></span>
                                {bus.status}
                            </Badge>
                            </TableCell>
                            <TableCell>{bus.speed}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
