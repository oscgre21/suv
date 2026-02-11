
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Siren, Wifi, WifiOff, Play, Square, Timer, Mic, LayoutDashboard, Loader2 } from 'lucide-react';
import { playSuccessSound } from '@/lib/audio';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { WeatherWidget } from '@/components/weather-widget';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const DigitalClock = () => {
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        if(!time) {
            setTime(new Date());
        }
        return () => clearInterval(timerId);
    }, [time]);

    const hours = time ? String(time.getHours()).padStart(2, '0') : '--';
    const minutes = time ? String(time.getMinutes()).padStart(2, '0') : '--';

    return (
        <div className="font-mono text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-widest bg-gray-900/80 border-4 border-gray-700/60 rounded-2xl shadow-inner-strong text-cyan-300 p-2 sm:p-4 px-3 sm:px-6 relative">
            <div className="absolute inset-0 bg-grid-cyan opacity-20"></div>
            {time ? (
                <>
                    <span className="text-shadow-cyan">{hours}</span>
                    <span className="animate-pulse">:</span>
                    <span className="text-shadow-cyan">{minutes}</span>
                </>
            ) : (
                <span className="text-shadow-cyan">--:--</span>
            )}
        </div>
    );
};

const MotionCard = motion.div;

const InfoCard = ({ title, value, className, titleClassName, valueClassName, icon: Icon }: { title: string, value: string | number, className?: string, titleClassName?: string, valueClassName?: string, icon?: React.ElementType }) => (
    <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={cn("bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6 text-center shadow-lg", className)}
    >
        <h3 className={cn("text-base md:text-lg font-semibold text-gray-300 uppercase tracking-wider flex items-center justify-center gap-2", titleClassName)}>
            {Icon && <Icon className="h-5 w-5 opacity-70"/>}
            {title}
        </h3>
        <p className={cn("text-4xl md:text-5xl font-bold text-white mt-2", valueClassName)}>{value}</p>
    </MotionCard>
);

const StatusButton = ({ children, status, currentStatus, setStatus, className, Icon, disabled }: { children: React.ReactNode, status: string, currentStatus: string, setStatus: (status: string) => void, className?: string, Icon?: React.ElementType, disabled?: boolean }) => {
    const isActive = status === currentStatus;
    return (
        <motion.button
            onClick={() => setStatus(status)}
            disabled={disabled}
            className={cn(
                "w-full rounded-xl border-2 text-lg md:text-xl font-bold uppercase tracking-wider transition-all duration-300 ease-in-out shadow-md text-white/90 py-3 md:py-4 disabled:opacity-50 disabled:cursor-not-allowed",
                className,
                isActive ? 'shadow-inner-strong' : 'hover:scale-105 active:scale-95'
            )}
            whileHover={{ scale: isActive || disabled ? 1 : 1.05 }}
            whileTap={{ scale: isActive || disabled ? 1 : 0.95 }}
        >
            <div className="flex items-center justify-center gap-2 md:gap-3">
                {Icon && <Icon className="h-5 w-5 md:h-6 md:w-6"/>}
                {children}
            </div>
        </motion.button>
    );
};

interface ConductorInfo {
    id: string;
    nombre: string;
    cedula: string;
    turno: string;
    vehiculo: {
        id: string;
        ficha: string;
        capacidad: number;
        ruta: {
            nombre: string;
        } | null;
    } | null;
}

interface Parada {
    id: string;
    nombre: string;
    direccion: string;
    orden: number;
}

const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function VistaBusPage() {
    const { execute } = useApi();
    const { toast } = useToast();

    const [conductor, setConductor] = useState<ConductorInfo | null>(null);
    const [paradas, setParadas] = useState<Parada[]>([]);
    const [solicitudesPorParada, setSolicitudesPorParada] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState('En Ruta');

    const [isOnline, setIsOnline] = useState(true);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const [passengersOnBoard, setPassengersOnBoard] = useState(0);
    
    const [isRouteActive, setIsRouteActive] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [tripDuration, setTripDuration] = useState<string | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioCache, setAudioCache] = useState<Record<string, string>>({});
    const audioRef = useRef<HTMLAudioElement>(null);

    // Cargar datos del conductor
    const loadConductorData = useCallback(async () => {
        try {
            setIsLoading(true);

            const [conductorData, paradasData, solicitudesData] = await Promise.all([
                execute('/api/conductores/me', 'GET'),
                execute('/api/conductores/me/paradas', 'GET'),
                execute('/api/conductores/me/solicitudes', 'GET'),
            ]);

            setConductor(conductorData);
            setParadas(paradasData);
            setSolicitudesPorParada(solicitudesData);

            // Inicializar pasajeros a bordo con la capacidad del vehículo
            if (conductorData.vehiculo?.capacidad) {
                setPassengersOnBoard(Math.floor(conductorData.vehiculo.capacidad * 0.4)); // 40% inicial
            }
        } catch (error) {
            console.error('Error cargando datos del conductor:', error);
            toast({
                title: 'Error',
                description: 'No se pudieron cargar los datos del conductor',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [execute, toast]);

    useEffect(() => {
        loadConductorData();

        // Auto-refresh de solicitudes cada 30 segundos
        const interval = setInterval(() => {
            execute('/api/conductores/me/solicitudes', 'GET')
                .then(data => setSolicitudesPorParada(data))
                .catch(err => console.error('Error refreshing solicitudes:', err));
        }, 30000);

        return () => clearInterval(interval);
    }, [loadConductorData, execute]);

    useEffect(() => {
        if (isRouteActive) {
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRouteActive]);

    const handleStartRoute = () => {
        setIsRouteActive(true);
        setElapsedTime(0);
        setTripDuration(null);
    };

    const handleFinishRoute = () => {
        setIsRouteActive(false);
        setTripDuration(formatTime(elapsedTime));

        // Resetear a estado inicial
        const initialPassengers = conductor?.vehiculo?.capacidad
            ? Math.floor(conductor.vehiculo.capacidad * 0.4)
            : 15;

        setPassengersOnBoard(initialPassengers);
        setCurrentStopIndex(0);
    };
    
    const handleTTS = async (text: string) => {
        if (audioCache[text]) {
            setAudioUrl(audioCache[text]);
            return;
        }

        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                body: JSON.stringify({ text }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('TTS API request failed');
            }
            
            const audio = await response.json();

            if (audio.media) {
              setAudioCache(prev => ({...prev, [text]: audio.media}));
              setAudioUrl(audio.media);
            }
        } catch (error) {
            console.error("Error generating speech:", error);
        }
    };

    const handleConfirmStop = () => {
        if (!paradas[currentStopIndex]) return;

        playSuccessSound();

        // Agregar pasajeros esperando en la parada actual
        const currentStopRequests = solicitudesPorParada[paradas[currentStopIndex].id] || 0;
        setPassengersOnBoard(prevOnBoard => prevOnBoard + currentStopRequests);

        // Avanzar a siguiente parada
        const nextStopIndex = (currentStopIndex + 1) % paradas.length;
        setCurrentStopIndex(nextStopIndex);

        // Anunciar siguiente parada
        setTimeout(() => {
            if (paradas[nextStopIndex]) {
                const nextStopText = `Siguiente parada: ${paradas[nextStopIndex].nombre}`;
                handleTTS(nextStopText);
            }
        }, 3000);

        // Actualizar solicitudes
        execute('/api/conductores/me/solicitudes', 'GET')
            .then(data => setSolicitudesPorParada(data))
            .catch(err => console.error('Error refreshing solicitudes:', err));
    };

    const handleSetStatus = (newStatus: string) => {
        setStatus(newStatus);
        // TODO: Actualizar estado del vehículo en la base de datos
    };

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        
        if (typeof navigator !== 'undefined') {
            setIsOnline(navigator.onLine);
        }

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-800">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }

    if (!conductor || !conductor.vehiculo) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-800">
                <div className="text-center text-white">
                    <p className="text-xl">No hay vehículo asignado</p>
                    <p className="text-sm text-gray-400 mt-2">
                        Contacta al administrador para asignar un vehículo
                    </p>
                </div>
            </div>
        );
    }

    const currentStopRequests = paradas[currentStopIndex]
        ? solicitudesPorParada[paradas[currentStopIndex].id] || 0
        : 0;

    return (
        <>
        <div className="flex justify-center items-center min-h-screen bg-gray-800">
            <div
                className="font-body text-white w-full h-full"
            >
                <div className="flex flex-col min-h-screen p-4 sm:p-6 md:p-8">
                    <style jsx global>{`
                        .bg-grid-cyan {
                            background-image: linear-gradient(to right, hsl(195, 100%, 50%, 0.1) 1px, transparent 1px), linear-gradient(to bottom, hsl(195, 100%, 50%, 0.1) 1px, transparent 1px);
                            background-size: 20px 20px;
                        }
                        .text-shadow-cyan {
                            text-shadow: 0 0 5px hsl(195, 100%, 80%), 0 0 10px hsl(195, 100%, 80%), 0 0 15px hsl(195, 100%, 50%), 0 0 20px hsl(195, 100%, 50%);
                        }
                         .text-shadow-green {
                            text-shadow: 0 0 2px hsl(120, 100%, 80%, 0.7), 0 0 5px hsl(120, 100%, 60%, 0.7);
                        }
                        .shadow-inner-strong {
                            box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.3), inset 0 -2px 4px 0 rgba(255, 255, 255, 0.1);
                        }
                    `}</style>
                    
                    {audioUrl && <audio ref={audioRef} src={audioUrl} autoPlay />}

                    <motion.header 
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 md:mb-8 bg-gradient-to-b from-gray-900 to-gray-800 p-4 md:p-6 rounded-b-2xl shadow-lg"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center h-14 w-14 md:h-20 md:w-20 rounded-lg bg-gray-900/50 p-2">
                                <Image src="https://i.postimg.cc/SNWKyqdx/LOG_APP_VEHICULOS.png" alt="Logo S.U.V." width={80} height={80} className="rounded-md"/>
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-4xl font-black tracking-wider">Sistema de Ubicación Vehicular</h1>
                                <p className="text-sm md:text-base text-gray-400">Cuerpo Especializado en Seguridad Aeroportuaria y de la Aviación Civil - CESAC</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4">
                            <Button asChild variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
                                <Link href="/dashboard" title="Ir al Dashboard">
                                    <LayoutDashboard className="h-7 w-7" />
                                </Link>
                            </Button>
                            <div className={cn("flex items-center gap-2 text-sm px-3 py-1 rounded-full", isOnline ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300")}>
                                {isOnline ? <Wifi className="h-4 w-4"/> : <WifiOff className="h-4 w-4"/>}
                                <span>{isOnline ? 'Online' : 'Offline'}</span>
                            </div>
                            <WeatherWidget />
                            <DigitalClock />
                        </div>
                    </motion.header>

                    <main className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className={cn("md:col-span-2 lg:col-span-2 space-y-6 transition-opacity", !isRouteActive && "opacity-50 pointer-events-none")}
                        >
                             <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6 shadow-lg">
                                <h2 className="text-base md:text-lg font-semibold text-gray-300 uppercase tracking-wider">Chofer en turno</h2>
                                <p className="text-2xl md:text-3xl font-bold text-white mt-1">{conductor.nombre}</p>
                                <p className="text-sm text-gray-400">{conductor.cedula} - Activo</p>
                                <p className="text-sm text-gray-400 mt-1">Ruta {conductor.vehiculo?.ruta?.nombre || 'Sin ruta'} | {conductor.turno}</p>
                            </div>

                            <motion.button 
                                onClick={handleConfirmStop}
                                disabled={!isRouteActive}
                                className="w-full text-center py-6 md:py-8 rounded-2xl bg-gradient-to-br from-green-400 to-cyan-500 text-gray-900 font-black text-3xl md:text-4xl tracking-wider shadow-lg transform transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: isRouteActive ? 1.05 : 1, boxShadow: isRouteActive ? "0 10px 20px rgba(57, 255, 20, 0.3)" : "none" }}
                                whileTap={{ scale: isRouteActive ? 0.95 : 1 }}
                            >
                                CONFIRMAR PARADA
                            </motion.button>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="md:col-span-2 lg:col-span-3 space-y-6"
                        >
                            <MotionCard
                                className={cn("bg-gray-900/10 backdrop-blur-md border-white/20 p-6 md:p-8 transition-opacity", !isRouteActive && "opacity-50")}
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            >
                                <h2 className="text-xl md:text-2xl font-bold text-gray-300 uppercase tracking-wider">Siguiente parada</h2>
                                <p className="text-3xl md:text-4xl font-semibold text-white mt-2 md:mt-4">
                                    {isRouteActive && paradas[currentStopIndex]
                                        ? paradas[currentStopIndex].nombre
                                        : "---"
                                    }
                                </p>
                            </MotionCard>
                            <div className={cn("grid grid-cols-2 gap-4 md:gap-6 transition-opacity", !isRouteActive && "opacity-50")}>
                                <InfoCard title="A Bordo" value={isRouteActive ? passengersOnBoard : "--"} valueClassName="text-cyan-300" />
                                <InfoCard title="Paradas Solicitadas" value={isRouteActive ? currentStopRequests.toString().padStart(2, '0') : "--"} valueClassName="text-yellow-300" />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <motion.button 
                                     onClick={handleStartRoute}
                                     disabled={isRouteActive}
                                     className="w-full flex items-center justify-center gap-2 text-center py-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold text-lg tracking-wider shadow-lg transform transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                     whileHover={{ scale: !isRouteActive ? 1.05 : 1 }}
                                     whileTap={{ scale: !isRouteActive ? 0.95 : 1 }}
                                >
                                    {isRouteActive ? (
                                        <>
                                            <Timer className="h-5 w-5"/>
                                            <span className="font-mono">{formatTime(elapsedTime)}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-5 w-5"/>
                                            <span>Iniciar RUTA</span>
                                        </>
                                    )}
                                </motion.button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <motion.button
                                            disabled={!isRouteActive}
                                            className="w-full flex items-center justify-center gap-2 text-center py-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 text-white font-bold text-lg tracking-wider shadow-lg transform transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            whileHover={{ scale: isRouteActive ? 1.05 : 1 }}
                                            whileTap={{ scale: isRouteActive ? 0.95 : 1 }}
                                        >
                                             {tripDuration && !isRouteActive ? (
                                                <>
                                                    <Timer className="h-5 w-5"/>
                                                    <span className="font-mono">{tripDuration}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Square className="h-5 w-5"/>
                                                    <span>Finalizar RUTA</span>
                                                </>
                                            )}
                                        </motion.button>
                                    </AlertDialogTrigger>
                                     <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Confirmar acción?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                ¿Estás seguro de que deseas finalizar la ruta? Esta acción no se puede deshacer.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleFinishRoute}>Confirmar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </motion.div>
                    </main>

                    <motion.footer 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mt-6 md:mt-8"
                    >
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 shadow-lg">
                            <h3 className="text-base md:text-lg font-semibold text-gray-300 uppercase tracking-wider mb-4 text-center">Estado del Bus</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatusButton status="En Ruta" currentStatus={status} setStatus={handleSetStatus} disabled={!isRouteActive} className={cn(status === 'En Ruta' ? "bg-green-500 border-green-300" : "bg-green-500/30 border-green-500/50 hover:bg-green-500/50")}>En Ruta</StatusButton>
                                <StatusButton status="Retrasado" currentStatus={status} setStatus={handleSetStatus} disabled={!isRouteActive} className={cn(status === 'Retrasado' ? "bg-yellow-500 border-yellow-300" : "bg-yellow-500/30 border-yellow-500/50 hover:bg-yellow-500/50")}>Retrasado</StatusButton>
                                <StatusButton status="Dañado" currentStatus={status} setStatus={handleSetStatus} disabled={!isRouteActive} className={cn(status === 'Dañado' ? "bg-orange-500 border-orange-300" : "bg-orange-500/30 border-orange-500/50 hover:bg-orange-500/50")}>Dañado</StatusButton>
                                <StatusButton status="911" currentStatus={status} setStatus={handleSetStatus} disabled={!isRouteActive} className={cn(status === '911' ? "bg-red-600 border-red-400" : "bg-red-600/30 border-red-600/50 hover:bg-red-700/50")} Icon={Siren} />
                            </div>
                        </div>
                         <div className="text-center text-xs text-white/50 pt-4">
                            Dirección de Tecnología y Comunicaciones del CESAC - Versión 1.0 - @ 2025
                        </div>
                    </motion.footer>
                </div>
            </div>
        </div>
        </>
    )
}
    

    

    



    

    