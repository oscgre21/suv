import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';

export async function GET() {
  try {
    const guard = await requireAdmin();
    if (guard.response) return guard.response;

    const buses = await prisma.vehiculo.findMany({
      where: { estado: 'Operativo' },
      select: {
        id: true,
        ficha: true,
        estado: true,
        capacidad: true,
        velocidad: true,
        latitud: true,
        longitud: true,
        ultimaActualizacion: true,
        ruta: {
          select: { id: true, nombre: true, color: true },
        },
        conductor: {
          select: { id: true, nombre: true },
        },
      },
      orderBy: { ficha: 'asc' },
    });

    // Mapear respuesta para asegurar que velocidad tenga valor por defecto
    const busesConVelocidad = buses.map((bus) => ({
      ...bus,
      velocidad: bus.velocidad ?? 0,
    }));

    return NextResponse.json(busesConVelocidad);
  } catch (error) {
    console.error('Error fetching buses:', error);
    return NextResponse.json(
      { error: 'Error al obtener estado de buses' },
      { status: 500 }
    );
  }
}
