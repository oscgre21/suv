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

    // Obtener conductor y su vehículo
    const conductor = await prisma.conductor.findUnique({
      where: { id: session.conductorId },
      select: {
        vehiculo: {
          select: {
            rutaAsignada: true,
          },
        },
      },
    });

    if (!conductor?.vehiculo?.rutaAsignada) {
      return NextResponse.json([]);
    }

    // Obtener paradas de la ruta
    const paradas = await prisma.parada.findMany({
      where: {
        rutaId: conductor.vehiculo.rutaAsignada,
        activa: true,
      },
      select: {
        id: true,
        nombre: true,
        direccion: true,
        latitud: true,
        longitud: true,
        orden: true,
        activa: true,
      },
      orderBy: { orden: 'asc' },
    });

    return NextResponse.json(paradas);
  } catch (error) {
    console.error('Error obteniendo paradas:', error);
    return NextResponse.json(
      { error: 'Error al obtener paradas' },
      { status: 500 }
    );
  }
}
