import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePrismaError } from '@/lib/api-utils';

// GET /api/historial-viajes/[id] - Obtener un viaje específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const viaje = await prisma.historialViaje.findUnique({
      where: { id: params.id },
      include: {
        ruta: true,
        vehiculo: true,
        conductor: true,
        usuario: true,
      },
    });

    if (!viaje) {
      return NextResponse.json(
        { error: 'Viaje no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(viaje);
  } catch (error) {
    console.error('Error fetching viaje:', error);
    return handlePrismaError(error);
  }
}
