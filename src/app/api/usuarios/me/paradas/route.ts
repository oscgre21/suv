import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

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

    const paradas = await prisma.parada.findMany({
      where: {
        rutaId: session.rutaAsignada,
      },
      select: {
        id: true,
        nombre: true,
        latitud: true,
        longitud: true,
        orden: true,
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
