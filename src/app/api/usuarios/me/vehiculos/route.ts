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

    const vehiculos = await prisma.vehiculo.findMany({
      where: {
        rutaAsignada: session.rutaAsignada,
        estado: {
          in: ['Operativo', 'En Ruta', 'Retrasado', 'Dañado', '911'],
        },
      },
      select: {
        id: true,
        ficha: true,
        estado: true,
        velocidad: true,
        latitud: true,
        longitud: true,
        ultimaActualizacion: true,
        ruta: {
          select: {
            nombre: true,
            color: true,
          },
        },
      },
      orderBy: { ficha: 'asc' },
    });

    // Mapear y agregar datos calculados
    const vehiculosConEstimacion = vehiculos.map(v => ({
      ...v,
      velocidad: v.velocidad ?? 0,
      proximaParada: null, // TODO: Calcular basado en posición GPS
      tiempoEstimado: null, // TODO: Calcular basado en distancia y velocidad
    }));

    return NextResponse.json(vehiculosConEstimacion);
  } catch (error) {
    console.error('Error obteniendo vehículos:', error);
    return NextResponse.json(
      { error: 'Error al obtener vehículos' },
      { status: 500 }
    );
  }
}
