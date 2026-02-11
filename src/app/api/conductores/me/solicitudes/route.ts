import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.tipo !== 'conductor' || !session.conductorId) {
      return NextResponse.json(
        { error: 'No autenticado como conductor' },
        { status: 401 }
      );
    }

    // Obtener conductor y ruta
    const conductor = await prisma.conductor.findUnique({
      where: { id: session.conductorId },
      select: {
        vehiculo: {
          select: { rutaAsignada: true },
        },
      },
    });

    if (!conductor?.vehiculo?.rutaAsignada) {
      return NextResponse.json({});
    }

    // Contar solicitudes pendientes por parada (últimas 2 horas)
    const solicitudes = await prisma.solicitudParada.groupBy({
      by: ['paradaId'],
      where: {
        rutaId: conductor.vehiculo.rutaAsignada,
        estado: 'Pendiente',
        horaSolicitud: {
          gte: new Date(Date.now() - 2 * 60 * 60 * 1000), // Últimas 2 horas
        },
      },
      _count: { id: true },
    });

    // Mapear a objeto { paradaId: count }
    const resultado = solicitudes.reduce((acc, s) => {
      acc[s.paradaId] = s._count.id;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error obteniendo solicitudes:', error);
    return NextResponse.json(
      { error: 'Error al obtener solicitudes' },
      { status: 500 }
    );
  }
}
