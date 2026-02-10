
"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bus, Clock, AlertCircle, MapPin, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedMap } from '@/components/animated-map';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { WeatherWidget } from '@/components/weather-widget';
import { playErrorSound, stopLoopingAlertSound } from '@/lib/audio';
import { useUsuario } from '@/app/usuario/usuario-provider';
import { SurveyDialog } from '@/components/survey-dialog';
import { Countdown } from '@/components/countdown';


function UsuarioPageContent() {
    const {
        buses,
        selectedBusId,
        setSelectedBusId,
        notified,
        isPenaltyActive,
        countdownSeconds,
        showArrivalAlert,
        setShowArrivalAlert,
        showSurvey,
        setShowSurvey,
        handleNotify,
        handleCancellation,
        handlePenaltyEnd,
        getRemainingPenaltyTime,
    } = useUsuario();

    const [greeting, setGreeting] = useState("Hola");
    
    const selectedBus = buses.find(bus => bus.id === selectedBusId) || buses[0];

    useEffect(() => {
        const getGreeting = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) return "Buenos días";
            if (hour >= 12 && hour < 19) return "Buenas tardes";
            return "Buenas noches";
        };
        setGreeting(getGreeting());
    }, []);

    const onCancelClick = () => {
        playErrorSound();
    };

    const handleAcceptArrivalAlert = () => {
        stopLoopingAlertSound();
        setShowArrivalAlert(false);
    }

    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'en ruta':
                return 'outline';
            case 'retrasado':
            case 'dañado':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const getStatusColor = (status: string) => {
         switch (status.toLowerCase()) {
            case 'en ruta':
                return 'text-green-600';
            case 'retrasado':
            case 'dañado':
            case '911':
                return 'text-red-600';
            default:
                return 'text-yellow-600';
        }
    }
     const getStatusPingColor = (status: string) => {
         switch (status.toLowerCase()) {
            case 'en ruta':
                return 'bg-green-400';
            case 'retrasado':
            case 'dañado':
            case '911':
                return 'bg-red-400';
            default:
                return 'bg-yellow-400';
        }
    }
    const getStatusDotColor = (status: string) => {
         switch (status.toLowerCase()) {
            case 'en ruta':
                return 'bg-green-500';
            case 'retrasado':
                return 'bg-red-500';
            case 'dañado':
            case '911':
                return 'bg-red-500';
            default:
                return 'bg-yellow-500';
        }
    }

    return (
        <div className="h-full w-full flex flex-col">
            <SurveyDialog open={showSurvey} onOpenChange={setShowSurvey} />

            <AlertDialog open={showArrivalAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¡Atención!</AlertDialogTitle>
                        <AlertDialogDescription>
                           Tu bus está a punto de llegar. Pendiente a tu parada.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleAcceptArrivalAlert}>Aceptar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="p-4 bg-background flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold">{greeting}, Kendy Qualey</h2>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <MapPin className="h-4 w-4" />
                        <span>Charles de Gaulle</span>
                    </div>
                </div>
                <WeatherWidget />
            </div>
            <div className="flex-grow relative">
                 <AnimatedMap 
                    isNotified={notified}
                    countdownSeconds={countdownSeconds}
                    initialSeconds={selectedBus.estimatedTime * 60}
                 />
            </div>
            
            <div className="bg-background/80 backdrop-blur-sm p-2">
                <Card className="w-full max-w-lg mx-auto shadow-lg border-t">
                    <CardContent className="p-4 grid gap-4">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", getStatusPingColor(selectedBus.status))}></span>
                                <span className={cn("relative inline-flex rounded-full h-3 w-3", getStatusDotColor(selectedBus.status))}></span>
                            </span>
                            <span className={cn("font-semibold", getStatusColor(selectedBus.status))}>{selectedBus.status}</span>
                        </div>
                        
                        <div>
                            <h3 className="text-sm font-medium mb-2 text-muted-foreground">Buses disponibles</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {buses.map(bus => (
                                    <Button
                                        key={bus.id}
                                        variant={selectedBusId === bus.id ? "default" : "outline"}
                                        className="w-full h-auto p-2 flex flex-col items-center gap-2"
                                        onClick={() => {
                                            if (notified || isPenaltyActive) return;
                                            setSelectedBusId(bus.id);
                                        }}
                                        disabled={notified || isPenaltyActive}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Bus className="h-5 w-5"/>
                                            <span className="font-bold">{bus.id}</span>
                                        </div>
                                        <Badge variant={getStatusVariant(bus.status)} className={cn(
                                            selectedBusId === bus.id && bus.status === 'En ruta' ? "bg-primary-foreground/20 text-primary-foreground" : ""
                                        )}>{bus.status}</Badge>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-primary"/>
                                <div className='text-sm'>
                                    <span className="text-muted-foreground">Tiempo estimado: </span>
                                    <span className="font-bold">{selectedBus.estimatedTime} min</span>
                                </div>
                            </div>
                             <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-primary"/>
                                 <div className='text-sm'>
                                    <span className="text-muted-foreground">Próxima parada: </span>
                                    <span className="font-bold">{selectedBus.nextStop}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {selectedBus.status === 'En ruta' ? (
                                <Button 
                                    size="lg" 
                                    className="w-full h-12 text-base font-bold shadow-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                                    onClick={handleNotify}
                                    disabled={notified || isPenaltyActive}
                                >
                                    {isPenaltyActive ? (
                                        <div className='flex items-center gap-2'>
                                            <Ban className="h-5 w-5" />
                                            <span>Penalizado: <Countdown initialSeconds={getRemainingPenaltyTime() * 60} onEnd={handlePenaltyEnd} showIcon={false} /></span>
                                        </div>
                                    ) : notified ? (
                                        <Countdown initialSeconds={countdownSeconds} />
                                    ) : (
                                        "Estoy en la parada"
                                    )}
                                </Button>
                            ) : (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            size="lg" 
                                            className="w-full h-12 text-base font-bold shadow-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                                            disabled={notified || isPenaltyActive}
                                        >
                                            {isPenaltyActive ? (
                                                <div className='flex items-center gap-2'>
                                                    <Ban className="h-5 w-5" />
                                                    <span>Penalizado: <Countdown initialSeconds={getRemainingPenaltyTime() * 60} onEnd={handlePenaltyEnd} showIcon={false} /></span>
                                                </div>
                                            ) : (
                                                "Estoy en la parada"
                                            )}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>⚠️ Advertencia de Ruta</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                El bus seleccionado tiene un estado de "{selectedBus.status}". La espera estimada podría extenderse más de lo normal.
                                                ¿Desea notificar su parada de todos modos?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Volver</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleNotify}>Confirmar Notificación</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}

                            {notified && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="lg" className="h-12 text-base font-bold shadow-lg" onClick={onCancelClick}>
                                            Cancelar
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Confirmar Cancelación?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Si cancelas tu parada, recibirás una penalidad de 10 minutos durante la cual no podrás notificar una nueva parada. ¿Estás seguro?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>No, mantener parada</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleCancellation} className="bg-destructive hover:bg-destructive/90">Sí, cancelar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


export default function UsuarioPage() {
  return (
    <Suspense fallback={<div className="flex h-full w-full items-center justify-center">Cargando...</div>}>
      <UsuarioPageContent />
    </Suspense>
  )
}
