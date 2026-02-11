
"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Bus, Users, Route, Clock, BarChartHorizontal, Loader2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { AnimatedCard } from '@/components/animated-card';
import { useApi } from '@/hooks/use-api';
import { DateRangeFilter } from '@/components/date-range-filter';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('@/components/leaflet-map').then(m => m.LeafletMap), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted flex items-center justify-center"><p>Cargando mapa...</p></div>
});

interface DashboardStats {
  busesActivos: number;
  busesActivosChange: number;
  rutasOperativas: number;
  solicitudesPendientes: number;
  solicitudesPendientesChange: number;
  puntualidad: number;
  puntualidadChange: number;
}

interface BusStatus {
  id: string;
  ficha: string;
  ruta: { nombre: string; color: string } | null;
  estado: string;
  capacidad: number;
  velocidad: number;
  latitud: number | null;
  longitud: number | null;
  ultimaActualizacion: string | null;
}

interface RouteUsage {
  route: string;
  viajes: number;
  color: string;
}

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

const routeUsageChartConfig = {
  viajes: {
    label: "Viajes",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const getStatusColor = (estado: string) => {
  switch (estado) {
    case 'Operativo':
      return 'bg-green-500';
    case 'EnTaller':
      return 'bg-yellow-500';
    case 'FueraDeServicio':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

export default function MonitoreoPage() {
  const [stats, setStats] = useState<DashboardStats>({
    busesActivos: 0,
    busesActivosChange: 0,
    rutasOperativas: 0,
    solicitudesPendientes: 0,
    solicitudesPendientesChange: 0,
    puntualidad: 0,
    puntualidadChange: 0
  });
  const [buses, setBuses] = useState<BusStatus[]>([]);
  const [routeUsage, setRouteUsage] = useState<RouteUsage[]>([]);
  const [vehiculosGPS, setVehiculosGPS] = useState<VehiculoGPS[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRangeDays, setDateRangeDays] = useState(30);

  const { execute } = useApi();

  useEffect(() => {
    loadDashboardData();

    // Auto-refresh GPS data every 5 seconds
    const gpsInterval = setInterval(() => {
      loadGPSData();
    }, 5000);

    return () => {
      clearInterval(gpsInterval);
    };
  }, []);

  // Reload route usage when date range changes
  useEffect(() => {
    loadRouteUsageData();
  }, [dateRangeDays]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      const [statsData, busesData, routeUsageData, gpsData] = await Promise.all([
        execute('/api/dashboard/stats', 'GET'),
        execute('/api/dashboard/buses', 'GET'),
        execute(`/api/dashboard/route-usage?days=${dateRangeDays}`, 'GET'),
        execute('/api/dashboard/gps', 'GET')
      ]);

      setStats(statsData);
      setBuses(busesData);
      setRouteUsage(routeUsageData);
      setVehiculosGPS(gpsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGPSData = async () => {
    try {
      const gpsData = await execute('/api/dashboard/gps', 'GET');
      setVehiculosGPS(gpsData);
    } catch (error) {
      console.error('Error loading GPS data:', error);
    }
  };

  const loadRouteUsageData = async () => {
    try {
      const routeUsageData = await execute(`/api/dashboard/route-usage?days=${dateRangeDays}`, 'GET');
      setRouteUsage(routeUsageData);
    } catch (error) {
      console.error('Error loading route usage data:', error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Panel de control GPS</h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <AnimatedCard glowClassName="from-blue-500/20 to-blue-500/5" className="bg-gradient-to-br from-blue-500/20 to-blue-500/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Buses Activos</CardTitle>
                    <Bus className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.busesActivos}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.busesActivosChange > 0 ? '+' : ''}{stats.busesActivosChange} que ayer
                    </p>
                </CardContent>
            </AnimatedCard>
            <AnimatedCard glowClassName="from-green-500/20 to-green-500/5" className="bg-gradient-to-br from-green-500/20 to-green-500/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rutas Operativas</CardTitle>
                    <Route className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.rutasOperativas}</div>
                    <p className="text-xs text-muted-foreground">Todas las rutas activas</p>
                </CardContent>
            </AnimatedCard>
            <AnimatedCard glowClassName="from-amber-500/20 to-amber-500/5" className="bg-gradient-to-br from-amber-500/20 to-amber-500/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
                    <Users className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.solicitudesPendientes}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.solicitudesPendientesChange > 0 ? '+' : ''}{stats.solicitudesPendientesChange} en las últimas 24h
                    </p>
                </CardContent>
            </AnimatedCard>
            <AnimatedCard glowClassName="from-rose-500/20 to-rose-500/5" className="bg-gradient-to-br from-rose-500/20 to-rose-500/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Puntualidad General</CardTitle>
                    <Clock className="h-4 w-4 text-rose-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.puntualidad.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.puntualidadChange >= 0 ? 'Mejora' : 'Reducción'} del {Math.abs(stats.puntualidadChange).toFixed(1)}% esta semana
                    </p>
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
                   <LeafletMap vehiculos={vehiculosGPS} />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                              <BarChartHorizontal className="h-5 w-5 text-muted-foreground"/>
                              Frecuencia de Uso por Ruta
                          </CardTitle>
                          <DateRangeFilter value={dateRangeDays} onChange={setDateRangeDays} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {routeUsage.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">
                            No hay datos de viajes disponibles
                          </p>
                        ) : (
                          <ChartContainer config={routeUsageChartConfig} className="h-64 w-full">
                              <BarChart
                                  accessibilityLayer
                                  data={routeUsage}
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
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Estado de Buses</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 max-h-72 overflow-y-auto">
                        {buses.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">
                            No hay buses operativos
                          </p>
                        ) : (
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
                                  <TableCell className="font-medium">{bus.ficha}</TableCell>
                                  <TableCell>{bus.ruta?.nombre || 'Sin ruta'}</TableCell>
                                  <TableCell>
                                  <Badge variant="outline" className="flex items-center gap-2">
                                      <span className={`h-2 w-2 rounded-full ${getStatusColor(bus.estado)}`}></span>
                                      {bus.estado}
                                  </Badge>
                                  </TableCell>
                                  <TableCell>{bus.velocidad} km/h</TableCell>
                              </TableRow>
                              ))}
                          </TableBody>
                          </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
