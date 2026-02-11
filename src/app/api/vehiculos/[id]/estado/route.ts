import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { eventBus } from '@/lib/event-bus';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id } = await params;

    if (!session || session.tipo !== 'conductor') {
      return NextResponse.json(
        { error: 'No autenticado como conductor' },
        { status: 401 }
      );
    }

    const { estado } = await request.json();

    if (!estado) {
      return NextResponse.json(
        { error: 'Estado es requerido' },
        { status: 400 }
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

    // Actualizar estado del vehículo
    const vehiculo = await prisma.vehiculo.update({
      where: { id },
      data: {
        estado,
        ultimaActualizacion: new Date(),
      },
      select: {
        id: true,
        ficha: true,
        estado: true,
        velocidad: true,
        latitud: true,
        longitud: true,
        ultimaActualizacion: true,
        rutaAsignada: true,
        ruta: {
          select: {
            nombre: true,
            color: true,
          },
        },
      },
    });

    // Emitir evento para notificar a usuarios conectados
    eventBus.emit('vehiculo-update', {
      ...vehiculo,
      proximaParada: null,
      tiempoEstimado: null,
    });

    console.log(`[SSE] Emitido evento vehiculo-update para ${vehiculo.ficha} - Estado: ${vehiculo.estado}`);

    return NextResponse.json(vehiculo);
  } catch (error) {
    console.error('Error actualizando estado del vehículo:', error);
    return NextResponse.json(
      { error: 'Error al actualizar estado del vehículo' },
      { status: 500 }
    );
  }
}
