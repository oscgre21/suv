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

    const conductor = await prisma.conductor.findUnique({
      where: { id: session.conductorId },
      select: {
        id: true,
        nombre: true,
        cedula: true,
        licencia: true,
        turno: true,
        estado: true,
        vehiculo: {
          select: {
            id: true,
            ficha: true,
            modelo: true,
            placa: true,
            capacidad: true,
            estado: true,
            velocidad: true,
            pasajerosABordo: true,
            ruta: {
              select: {
                id: true,
                nombre: true,
                color: true,
                descripcion: true,
              },
            },
          },
        },
      },
    });

    if (!conductor) {
      return NextResponse.json(
        { error: 'Conductor no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(conductor);
  } catch (error) {
    console.error('Error obteniendo conductor:', error);
    return NextResponse.json(
      { error: 'Error al obtener información del conductor' },
      { status: 500 }
    );
  }
}
