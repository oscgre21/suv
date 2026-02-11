"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

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

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  gpsData: VehiculoGPS[];
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  gpsData: []
});

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gpsData, setGpsData] = useState<VehiculoGPS[]>([]);

  useEffect(() => {
    const socketInstance = io('http://localhost:9002', {
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('Socket.IO connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setIsConnected(false);
    });

    socketInstance.on('gps-update', (data: VehiculoGPS[]) => {
      console.log('GPS update received:', data.length, 'vehicles');
      setGpsData(data);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, gpsData }}>
      {children}
    </SocketContext.Provider>
  );
}
