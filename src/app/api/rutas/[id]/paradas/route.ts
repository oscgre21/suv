import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePrismaError } from '@/lib/api-utils';

// GET /api/rutas/[id]/paradas - Obtener paradas de una ruta específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar que la ruta existe
    const ruta = await prisma.ruta.findUnique({
      where: { id: params.id },
    });

    if (!ruta) {
      return NextResponse.json(
        { error: 'Ruta no encontrada' },
        { status: 404 }
      );
    }

    const paradas = await prisma.parada.findMany({
      where: {
        rutaId: params.id,
      },
      include: {
        solicitudes: {
          where: {
            estado: 'Pendiente',
          },
        },
        _count: {
          select: {
            solicitudes: true,
          },
        },
      },
      orderBy: {
        orden: 'asc',
      },
    });

    return NextResponse.json(paradas);
  } catch (error) {
    console.error('Error fetching paradas for ruta:', error);
    return handlePrismaError(error);
  }
}
