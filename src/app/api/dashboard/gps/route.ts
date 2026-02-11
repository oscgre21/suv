import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const vehiculos = await prisma.vehiculo.findMany({
      where: {
        estado: 'Operativo',
        latitud: { not: null },
        longitud: { not: null },
      },
      select: {
        id: true,
        ficha: true,
        latitud: true,
        longitud: true,
        velocidad: true,
        estado: true,
        ultimaActualizacion: true,
        ruta: {
          select: { nombre: true, color: true },
        },
      },
    });

    const resultado = vehiculos.map((v) => ({
      ...v,
      velocidad: v.velocidad ?? 0,
    }));

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error fetching GPS positions:', error);
    return NextResponse.json(
      { error: 'Error al obtener posiciones GPS' },
      { status: 500 }
    );
  }
}
