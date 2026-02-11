"use client";

import React, { createContext, useCallback, useContext, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { playErrorSound, playSuccessSound, playLoopingAlertSound } from '@/lib/audio';
import { useApi } from '@/hooks/use-api';
import { useAuth } from '@/contexts/auth-context';

const PENALTY_DURATION_MINUTES = 10;

// --- TYPES ---
export interface Bus {
    id: string;
    ficha: string;
    estado: string;
    velocidad: number;
    latitud: number | null;
    longitud: number | null;
    proximaParada: string | null;
    tiempoEstimado: number | null;
}

export interface Parada {
    id: string;
    nombre: string;
    latitud: number;
    longitud: number;
    orden: number;
}

interface UsuarioContextType {
  buses: Bus[];
  paradas: Parada[];
  updateBusStatus: (busId: string, status: string) => void;
  selectedBusId: string | null;
  setSelectedBusId: (id: string | null) => void;
  selectedBus: Bus | null;
  notified: boolean;
  isPenaltyActive: boolean;
  penaltyEndTime: number | null;
  countdownSeconds: number;
  showArrivalAlert: boolean;
  setShowArrivalAlert: (show: boolean) => void;
  showSurvey: boolean;
  setShowSurvey: (show: boolean) => void;
  handleNotify: () => void;
  handleCancellation: () => void;
  handlePenaltyEnd: () => void;
  getRemainingPenaltyTime: () => number;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

// --- CONTEXT DEFINITION ---
const UsuarioContext = createContext<UsuarioContextType | null>(null);

export const useUsuario = () => {
    const context = useContext(UsuarioContext);
    if (!context) {
        throw new Error('useUsuario must be used within a UsuarioProvider');
    }
    return context;
};

function UsuarioProviderContent({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { execute } = useApi();
    const { usuario } = useAuth();

    const [buses, setBuses] = useState<Bus[]>([]);
    const [paradas, setParadas] = useState<Parada[]>([]);
    const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
    const [notified, setNotified] = useState(false);
    const [countdownSeconds, setCountdownSeconds] = useState(0);
    const [isPenaltyActive, setIsPenaltyActive] = useState(false);
    const [penaltyEndTime, setPenaltyEndTime] = useState<number | null>(null);
    const [showArrivalAlert, setShowArrivalAlert] = useState(false);
    const [showSurvey, setShowSurvey] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { toast } = useToast();
    const selectedBus = buses.find(bus => bus.id === selectedBusId) || null;

    const fetchData = useCallback(async () => {
        if (!usuario) return;

        try {
            setIsLoading(true);
            const [busesData, paradasData] = await Promise.all([
                execute('/api/usuarios/me/vehiculos', 'GET'),
                execute('/api/usuarios/me/paradas', 'GET'),
            ]);

            setBuses(busesData);
            setParadas(paradasData);

            // Seleccionar primer bus si no hay ninguno seleccionado
            if (!selectedBusId && busesData.length > 0) {
                setSelectedBusId(busesData[0].id);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            toast({
                title: 'Error',
                description: 'No se pudieron cargar los datos',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [usuario, execute, toast, selectedBusId]);

    // Conectar a SSE para actualizaciones en tiempo real
    useEffect(() => {
        if (!usuario) return;

        let eventSource: EventSource | null = null;

        try {
            eventSource = new EventSource('/api/usuarios/me/vehiculos/stream');

            eventSource.onmessage = (event) => {
                try {
                    const updatedVehiculo = JSON.parse(event.data);

                    console.log('[SSE] Recibida actualización:', updatedVehiculo);

                    // Actualizar el vehículo en el estado local
                    setBuses(prevBuses => {
                        const index = prevBuses.findIndex(b => b.id === updatedVehiculo.id);
                        if (index !== -1) {
                            const newBuses = [...prevBuses];
                            newBuses[index] = {
                                ...newBuses[index],
                                ...updatedVehiculo,
                            };
                            return newBuses;
                        }
                        // Si es un vehículo nuevo que cumple con los filtros, agregarlo
                        return [...prevBuses, updatedVehiculo];
                    });

                    // Mostrar notificación solo si es el bus seleccionado
                    if (selectedBusId === updatedVehiculo.id) {
                        const estadoMessages: Record<string, string> = {
                            'En Ruta': '🚌 El bus está en ruta',
                            'Operativo': '✅ El bus está operativo',
                            'Retrasado': '⏰ El bus está retrasado',
                            'Dañado': '⚠️ El bus está dañado',
                            '911': '🚨 Emergencia en el bus',
                        };

                        toast({
                            title: 'Actualización del bus',
                            description: estadoMessages[updatedVehiculo.estado] || `Estado: ${updatedVehiculo.estado}`,
                        });
                    }
                } catch (error) {
                    console.error('[SSE] Error parseando evento:', error);
                }
            };

            eventSource.onerror = (error) => {
                console.error('[SSE] Error en conexión:', error);
                eventSource?.close();

                // Reintentar conexión después de 5 segundos
                setTimeout(() => {
                    console.log('[SSE] Reintentando conexión...');
                    fetchData(); // Refetch completo como fallback
                }, 5000);
            };

            eventSource.onopen = () => {
                console.log('[SSE] Conexión establecida');
            };

        } catch (error) {
            console.error('[SSE] Error creando EventSource:', error);
        }

        // Cleanup al desmontar
        return () => {
            if (eventSource) {
                console.log('[SSE] Cerrando conexión');
                eventSource.close();
            }
        };
    }, [usuario, selectedBusId, toast, fetchData]);

    useEffect(() => {
        if (usuario) {
            fetchData();

            // Polling cada 60 segundos como fallback
            const interval = setInterval(fetchData, 60000);
            return () => clearInterval(interval);
        }
    }, [usuario, fetchData]);

    const updateBusStatus = (busId: string, status: string) => {
        setBuses(currentBuses =>
            currentBuses.map(bus =>
                bus.id === busId ? { ...bus, estado: status } : bus
            )
        );
    };

    const handleNotify = useCallback(async () => {
        if (notified || !selectedBus || !usuario) return;

        // Usar primera parada como parada actual (simplificado)
        const paradaId = paradas[0]?.id;

        if (!paradaId) {
            toast({
                title: 'Error',
                description: 'No se pudo determinar la parada',
                variant: 'destructive',
            });
            return;
        }

        try {
            const response = await execute('/api/usuarios/me/solicitudes', 'POST', {
                paradaId,
                vehiculoId: selectedBus.id,
            });

            if (response.success) {
                playSuccessSound();
                setNotified(true);
                localStorage.setItem('isStopNotified', 'true');
                setCountdownSeconds(response.solicitud.penalizacionMinutos * 60);

                toast({
                    title: '✅ Parada notificada con éxito',
                    description: `El bus ${selectedBus.ficha} ha sido notificado. Llegará en aproximadamente ${selectedBus.tiempoEstimado || 5} minutos.`,
                    variant: 'default',
                });

                router.replace('/usuario', undefined);
            }
        } catch (error: any) {
            playErrorSound();
            toast({
                title: 'Error',
                description: error.message || 'No se pudo crear la solicitud',
                variant: 'destructive',
            });
        }
    }, [selectedBus, notified, usuario, paradas, execute, toast, router]);

    useEffect(() => {
        const startTracking = searchParams.get('startTracking');
        const busIdParam = searchParams.get('busId');
        if (startTracking === 'true' && busIdParam) {
            const busExists = buses.some(bus => bus.id === busIdParam);
            if (busExists) {
                setSelectedBusId(busIdParam);
                setTimeout(() => handleNotify(), 0);
            }
        }
    }, [searchParams, handleNotify, buses]);

    const handleCancellation = () => {
        setNotified(false);
        localStorage.removeItem('isStopNotified');
        const endTime = Date.now() + PENALTY_DURATION_MINUTES * 60 * 1000;
        setPenaltyEndTime(endTime);
        setIsPenaltyActive(true);
        toast({
            title: "⚠️ Parada Cancelada",
            description: `Podrás notificar una parada nuevamente en ${PENALTY_DURATION_MINUTES} minutos.`,
            variant: "destructive"
        });
    };

    const handleCountdownEnd = useCallback(() => {
        setNotified(false);
        localStorage.removeItem('isStopNotified');
        setShowSurvey(true);
    }, []);

    const handlePenaltyEnd = useCallback(() => {
        setIsPenaltyActive(false);
        setPenaltyEndTime(null);
    }, []);

    const getRemainingPenaltyTime = useCallback(() => {
        if (!penaltyEndTime) return 0;
        return Math.max(0, Math.ceil((penaltyEndTime - Date.now()) / (1000 * 60)));
    }, [penaltyEndTime]);

    useEffect(() => {
        if (!notified) return;

        if (countdownSeconds <= 0) {
            handleCountdownEnd();
            return;
        }

        if (countdownSeconds === 20) {
            setShowArrivalAlert(true);
            playLoopingAlertSound();
        }

        const timer = setInterval(() => {
            setCountdownSeconds(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [notified, countdownSeconds, handleCountdownEnd]);

    const contextValue = {
        buses,
        paradas,
        updateBusStatus,
        selectedBusId,
        setSelectedBusId,
        selectedBus,
        notified,
        isPenaltyActive,
        penaltyEndTime,
        countdownSeconds,
        showArrivalAlert,
        setShowArrivalAlert,
        showSurvey,
        setShowSurvey,
        handleNotify,
        handleCancellation,
        handlePenaltyEnd,
        getRemainingPenaltyTime,
        isLoading,
        refresh: fetchData,
    };

    return (
        <UsuarioContext.Provider value={contextValue}>
            {children}
        </UsuarioContext.Provider>
    );
}

// --- PROVIDER COMPONENT ---
export function UsuarioProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
        <UsuarioProviderContent>{children}</UsuarioProviderContent>
    </Suspense>
  )
}
