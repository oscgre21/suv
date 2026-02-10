
"use client";

import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { playErrorSound, playSuccessSound, playLoopingAlertSound } from '@/lib/audio';
import { initialBusesData, PENALTY_DURATION_MINUTES } from '@/lib/data';

// --- TYPES ---
export interface Bus {
    id: string;
    status: string;
    estimatedTime: number;
    nextStop: string;
}

interface UsuarioContextType {
  buses: Bus[];
  updateBusStatus: (busId: string, status: string) => void;
  selectedBusId: string;
  setSelectedBusId: (id: string) => void;
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

    const [buses, setBuses] = useState<Bus[]>(initialBusesData);
    const [selectedBusId, setSelectedBusId] = useState(initialBusesData[0].id);
    const [notified, setNotified] = useState(false);
    const [countdownSeconds, setCountdownSeconds] = useState(0);
    const [isPenaltyActive, setIsPenaltyActive] = useState(false);
    const [penaltyEndTime, setPenaltyEndTime] = useState<number | null>(null);
    const [showArrivalAlert, setShowArrivalAlert] = useState(false);
    const [showSurvey, setShowSurvey] = useState(false);
    
    const { toast } = useToast();
    const selectedBus = buses.find(bus => bus.id === selectedBusId) || buses[0];
    
    const updateBusStatus = (busId: string, status: string) => {
        setBuses(currentBuses =>
            currentBuses.map(bus =>
                bus.id === busId ? { ...bus, status } : bus
            )
        );
    };

    const handleNotify = useCallback(() => {
        if (notified) return;
        playSuccessSound();
        setNotified(true);
        localStorage.setItem('isStopNotified', 'true');
        setCountdownSeconds(selectedBus.estimatedTime * 60);
        toast({
            title: "✅ Parada notificada con éxito",
            description: `El bus ${selectedBus.id} llegará en aproximadamente ${selectedBus.estimatedTime} minutos.`,
            variant: "default",
        });
        router.replace('/usuario', undefined);
    }, [selectedBus, toast, router, notified]);

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
        updateBusStatus,
        selectedBusId,
        setSelectedBusId,
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
