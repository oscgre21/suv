import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { calcularProximaParada } from '@/lib/distancia';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    if (!session.rutaAsignada) {
      return NextResponse.json([]);
    }

    // Obtener vehículos y paradas de la ruta en paralelo
    const [vehiculos, paradas] = await Promise.all([
      prisma.vehiculo.findMany({
        where: {
          rutaAsignada: session.rutaAsignada,
          estado: {
            in: ['Operativo', 'En Ruta', 'Retrasado', 'Dañado', '911'],
          },
        },
        select: {
          id: true,
          ficha: true,
          estado: true,
          velocidad: true,
          latitud: true,
          longitud: true,
          pasajerosABordo: true,
          ultimaActualizacion: true,
          ruta: {
            select: {
              nombre: true,
              color: true,
            },
          },
          paradaActual: {
            select: { nombre: true, orden: true },
          },
        },
        orderBy: { ficha: 'asc' },
      }),
      prisma.parada.findMany({
        where: {
          rutaId: session.rutaAsignada,
          activa: true,
        },
        select: {
          nombre: true,
          latitud: true,
          longitud: true,
          orden: true,
        },
        orderBy: { orden: 'asc' },
      }),
    ]);

    const vehiculosConEstimacion = vehiculos.map(v => {
      const { proximaParada, tiempoEstimado } = calcularProximaParada(v, paradas);
      return {
        ...v,
        velocidad: v.velocidad ?? 0,
        // Parada en la que el chofer confirmó por última vez (persistida)
        paradaActual: v.paradaActual?.nombre ?? null,
        proximaParada,
        tiempoEstimado,
      };
    });

    return NextResponse.json(vehiculosConEstimacion);
  } catch (error) {
    console.error('Error obteniendo vehículos:', error);
    return NextResponse.json(
      { error: 'Error al obtener vehículos' },
      { status: 500 }
    );
  }
}
