import { ReportCharts } from "@/components/report-charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

export default function ReportesPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-headline">Reportes y Estadísticas</h1>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Todo (PDF)
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Reporte Diario de Movilidad</CardTitle>
                    <CardDescription>Resumen de la operación del día de hoy.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                    <div className="flex flex-col space-y-1.5 rounded-lg border p-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Viajes Completados</h3>
                        <p className="text-2xl font-bold">128</p>
                    </div>
                     <div className="flex flex-col space-y-1.5 rounded-lg border p-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Pasajeros Transportados</h3>
                        <p className="text-2xl font-bold">1,450</p>
                    </div>
                     <div className="flex flex-col space-y-1.5 rounded-lg border p-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Kilómetros Recorridos</h3>
                        <p className="text-2xl font-bold">2,340 km</p>
                    </div>
                </CardContent>
            </Card>

            <ReportCharts />

        </div>
    );
}
