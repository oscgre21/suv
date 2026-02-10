
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileDown, Users, Route, Clock } from "lucide-react";

type RouteHistory = {
  date: string;
  route: string;
  bus: string;
  schedule: string;
};

export type Driver = {
  id: number;
  name: string;
  employeeId: string;
  shift: string;
  bus: string;
  status: string;
  avatarUrl: string;
  currentRoute: string;
  recentTrips: number;
  passengersTransported: number;
  routeHistory: RouteHistory[];
};

interface DriverProfileCardProps {
  driver: Driver;
}

export function DriverProfileCard({ driver }: DriverProfileCardProps) {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-none">
        <CardHeader className="flex flex-row items-center gap-4 p-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={driver.avatarUrl} data-ai-hint="person portrait" />
            <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{driver.name}</CardTitle>
            <CardDescription>{driver.employeeId} - {driver.status}</CardDescription>
            <div className="flex gap-2 mt-2">
                <Badge variant="outline">{driver.currentRoute}</Badge>
                <Badge variant="secondary">{driver.shift}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col space-y-1.5 rounded-lg border p-3">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Route className="h-4 w-4" /> Viajes Recientes (30d)</h3>
                <p className="text-xl font-bold">{driver.recentTrips}</p>
            </div>
            <div className="flex flex-col space-y-1.5 rounded-lg border p-3">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" /> Pasajeros Transportados</h3>
                <p className="text-xl font-bold">{driver.passengersTransported.toLocaleString()}</p>
            </div>
          </div>
          
           <div>
                <h3 className="text-lg font-semibold mb-2">Últimas 3 Rutas Trabajadas</h3>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Ruta</TableHead>
                            <TableHead>Bus</TableHead>
                            <TableHead>Horario</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {driver.routeHistory.map((item) => (
                            <TableRow key={item.date}>
                                <TableCell>{item.date}</TableCell>
                                <TableCell className="font-medium">{item.route}</TableCell>
                                <TableCell>{item.bus}</TableCell>
                                <TableCell>{item.schedule}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
           </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>
          <FileDown className="mr-2 h-4 w-4" />
          Generar Reporte
        </Button>
      </div>
    </div>
  );
}
