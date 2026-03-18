import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { eventBus } from '@/lib/event-bus';

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || session.tipo !== 'conductor' || !session.conductorId) {
      return NextResponse.json(
        { error: 'No autenticado como conductor' },
        { status: 401 }
      );
    }

    const { paradaId } = await request.json();

    if (!paradaId) {
      return NextResponse.json(
        { error: 'paradaId es requerido' },
        { status: 400 }
      );
    }

    // Obtener la ruta asignada del conductor
    const conductor = await prisma.conductor.findUnique({
      where: { id: session.conductorId },
      select: {
        vehiculo: {
          select: { rutaAsignada: true },
        },
      },
    });

    if (!conductor?.vehiculo?.rutaAsignada) {
      return NextResponse.json(
        { error: 'No se encontró ruta asignada' },
        { status: 400 }
      );
    }

    const rutaId = conductor.vehiculo.rutaAsignada;
    const hace2Horas = new Date(Date.now() - 2 * 60 * 60 * 1000);

    // Buscar solicitudes pendientes para esta parada (necesitamos los IDs y usuarioIds)
    const solicitudesPendientes = await prisma.solicitudParada.findMany({
      where: {
        paradaId,
        rutaId,
        estado: 'Pendiente',
        horaSolicitud: { gte: hace2Horas },
      },
      select: { id: true, usuarioId: true },
    });

    if (solicitudesPendientes.length === 0) {
      return NextResponse.json({ confirmadas: 0 });
    }

    // Actualizar todas a "Confirmado"
    await prisma.solicitudParada.updateMany({
      where: {
        id: { in: solicitudesPendientes.map(s => s.id) },
      },
      data: { estado: 'Confirmado' },
    });

    // Emitir evento por cada solicitud confirmada
    for (const solicitud of solicitudesPendientes) {
      eventBus.emit('solicitud-confirmada', {
        solicitudId: solicitud.id,
        usuarioId: solicitud.usuarioId,
        paradaId,
        rutaId,
      });
    }

    console.log(`[Confirmar] ${solicitudesPendientes.length} solicitudes confirmadas para parada ${paradaId}`);

    return NextResponse.json({ confirmadas: solicitudesPendientes.length });
  } catch (error) {
    console.error('Error confirmando solicitudes:', error);
    return NextResponse.json(
      { error: 'Error al confirmar solicitudes' },
      { status: 500 }
    );
  }
}
