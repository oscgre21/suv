import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { eventBus } from '@/lib/event-bus';
import { calcularProximaParada } from '@/lib/distancia';

/**
 * PATCH /api/vehiculos/[id]/gps
 * El chofer transmite su posición (y opcionalmente la parada actual).
 * Persiste lat/lng, calcula la próxima parada y emite `vehiculo-update`
 * para que los usuarios de esa ruta vean el bus moverse en tiempo real.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id } = await params;

    if (!session || session.tipo !== 'conductor' || !session.conductorId) {
      return NextResponse.json(
        { error: 'No autenticado como conductor' },
        { status: 401 }
      );
    }

    // Validar que el conductor sea el asignado al vehículo
    const conductor = await prisma.conductor.findUnique({
      where: { id: session.conductorId },
      select: { vehiculoId: true },
    });

    if (!conductor || conductor.vehiculoId !== id) {
      return NextResponse.json(
        { error: 'No autorizado para actualizar este vehículo' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { latitud, longitud, velocidad, paradaActualId } = body;

    if (typeof latitud !== 'number' || typeof longitud !== 'number') {
      return NextResponse.json(
        { error: 'latitud y longitud (numéricos) son requeridos' },
        { status: 400 }
      );
    }

    const vehiculo = await prisma.vehiculo.update({
      where: { id },
      data: {
        latitud,
        longitud,
        ...(typeof velocidad === 'number' ? { velocidad } : {}),
        ...(paradaActualId !== undefined ? { paradaActualId } : {}),
        ultimaActualizacion: new Date(),
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
        rutaAsignada: true,
        paradaActual: { select: { nombre: true, orden: true } },
        ruta: { select: { nombre: true, color: true } },
      },
    });

    // Calcular la próxima parada a partir de la posición recién recibida
    const paradas = vehiculo.rutaAsignada
      ? await prisma.parada.findMany({
          where: { rutaId: vehiculo.rutaAsignada, activa: true },
          select: { nombre: true, latitud: true, longitud: true, orden: true },
          orderBy: { orden: 'asc' },
        })
      : [];

    const { proximaParada, tiempoEstimado } = calcularProximaParada(vehiculo, paradas);

    const payload = {
      ...vehiculo,
      paradaActual: vehiculo.paradaActual?.nombre ?? null,
      proximaParada,
      tiempoEstimado,
    };

    // Notificar a los usuarios conectados de esta ruta (el stream filtra por ruta)
    eventBus.emit('vehiculo-update', payload);

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error actualizando GPS del vehículo:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la posición del vehículo' },
      { status: 500 }
    );
  }
}
