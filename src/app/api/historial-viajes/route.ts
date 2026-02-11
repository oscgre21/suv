import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePrismaError } from '@/lib/api-utils';

// GET /api/historial-viajes - Listar historial de viajes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get('usuarioId');
    const conductorId = searchParams.get('conductorId');
    const vehiculoId = searchParams.get('vehiculoId');
    const rutaId = searchParams.get('rutaId');
    const estado = searchParams.get('estado');

    const where: any = {};

    if (usuarioId) {
      where.usuarioId = usuarioId;
    }

    if (conductorId) {
      where.conductorId = conductorId;
    }

    if (vehiculoId) {
      where.vehiculoId = vehiculoId;
    }

    if (rutaId) {
      where.rutaId = rutaId;
    }

    if (estado) {
      where.estado = estado;
    }

    const viajes = await prisma.historialViaje.findMany({
      where,
      include: {
        ruta: true,
        vehiculo: true,
        conductor: true,
        usuario: true,
      },
      orderBy: {
        fechaInicio: 'desc',
      },
    });

    return NextResponse.json(viajes);
  } catch (error) {
    console.error('Error fetching historial viajes:', error);
    return handlePrismaError(error);
  }
}
