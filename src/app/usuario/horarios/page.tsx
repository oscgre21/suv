
"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bus, MapPin, Route, User, Radar, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useUsuario } from "../usuario-provider";

const schedules = [
    {
        route: "Ruta Charles de Gaulle",
        schedules: [
            { time: "06:00 - 07:30", driver: "Manuel Gonzalez", bus: "Ficha 01" },
            { time: "14:00 - 15:30", driver: "Julia Martinez", bus: "Ficha 04" },
        ]
    },
    {
        route: "Ruta Autopista Duarte",
        schedules: [
            { time: "06:15 - 07:45", driver: "Ricardo Peralta", bus: "Ficha 02" },
            { time: "14:15 - 15:45", driver: "Carlos Santana", bus: "Ficha 05" },
        ]
    },
    {
        route: "Ruta Independencia",
        schedules: [
            { time: "06:30 - 08:00", driver: "Ana Fuentes", bus: "Ficha 03" },
            { time: "14:30 - 16:00", driver: "Pedro Gomez", bus: "Ficha 06" },
        ]
    }
];

type AnalysisResult = {
    closestStop: string;
    isDifferent: boolean;
};

export default function HorariosPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [showWarning, setShowWarning] = useState(false);
    const router = useRouter();
    const { notified, handleNotify } = useUsuario();

    const handleTracking = () => {
        setIsLoading(true);
        setAnalysisResult(null);

        setTimeout(() => {
            // Simulación: La parada encontrada es diferente a la del perfil
            setAnalysisResult({
                closestStop: "Puente Juan Carlos (Ruta Charles)",
                isDifferent: true, 
            });
            setIsLoading(false);
        }, 4000);
    };

    const handleConfirmChange = () => {
        if (notified) {
            setShowWarning(true);
        } else {
            router.push('/usuario?startTracking=true&busId=BUSCESAC-1');
        }
    };
    
    const closeWarning = () => {
        setShowWarning(false);
        router.push('/usuario');
    }

    return (
        <div className="p-4 bg-background h-full space-y-6 relative">
            {isLoading && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-32 h-32 bg-green-500/20 rounded-full animate-ping"></div>
                        <div className="relative w-24 h-24 rounded-full bg-card border flex items-center justify-center">
                            <span className="text-2xl font-bold text-green-600">P.G.A.</span>
                        </div>
                    </div>
                    <p className="mt-4 text-lg font-semibold text-muted-foreground animate-pulse">Analizando...</p>
                </div>
            )}
            
            <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>⚠️ Acción no permitida</AlertDialogTitle>
                        <AlertDialogDescription>
                            Lo siento, no puedo ejecutar esta orden pues ya pediste una parada previo a este análisis de ruta.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={closeWarning}>Aceptar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


            <div>
                 <h1 className="text-2xl font-bold">Horarios de Rutas</h1>
                <p className="text-muted-foreground">Consulta los horarios y encuentra tu parada más cercana.</p>
            </div>

            <Card>
                <CardContent className="p-4">
                     <Button className="w-full" variant="outline" onClick={handleTracking} disabled={isLoading || notified}>
                        <Radar className="mr-2 h-4 w-4" />
                        Tracking: Encontrar parada más cercana
                    </Button>
                </CardContent>
            </Card>

            {analysisResult && (
                <Card className="bg-primary/5 border-primary/20 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <Sparkles className="h-5 w-5" />
                            Análisis de Proximidad Completo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg bg-background/80 border">
                             <p className="text-sm text-muted-foreground">Tu parada actual es: <span className="font-semibold text-foreground">Av. Sabana Larga</span></p>
                             <p className="text-sm text-muted-foreground">Parada más cercana encontrada: <span className="font-semibold text-foreground">{analysisResult.closestStop}</span></p>
                        </div>
                       
                        {analysisResult.isDifferent && (
                             <div>
                                <p className="text-sm text-center mb-3 text-muted-foreground">
                                    Te puedo asistir si te gustaría cambiar de parada. <br/>¿Te ayudo con el cambio?
                                </p>
                                <div className="flex gap-2 justify-center">
                                    <Button onClick={handleConfirmChange}>Sí, cambiar</Button>
                                    <Button variant="ghost" onClick={() => setAnalysisResult(null)}>No, gracias</Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Accordion type="single" collapsible className={cn("w-full space-y-4", analysisResult || isLoading || notified ? "opacity-30 pointer-events-none" : "")}>
                {schedules.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index} className="bg-card border rounded-lg shadow-sm">
                        <AccordionTrigger className="p-4 hover:no-underline">
                           <div className="flex items-center gap-3">
                               <Route className="h-5 w-5 text-primary" />
                               <span className="font-semibold text-base">{item.route}</span>
                           </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-0">
                            <div className="border-t">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Horario</TableHead>
                                            <TableHead>Conductor</TableHead>
                                            <TableHead>Bus</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {item.schedules.map((schedule, sIndex) => (
                                            <TableRow key={sIndex}>
                                                <TableCell className="font-medium">{schedule.time}</TableCell>
                                                <TableCell>{schedule.driver}</TableCell>
                                                <TableCell>{schedule.bus}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
