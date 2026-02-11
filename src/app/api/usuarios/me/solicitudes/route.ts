import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

const PENALTY_DURATION_MINUTES = 10;

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    if (!session.rutaAsignada) {
      return NextResponse.json(
        { error: 'Usuario no tiene ruta asignada' },
        { status: 400 }
      );
    }

    const { paradaId, vehiculoId } = await request.json();

    if (!paradaId) {
      return NextResponse.json(
        { error: 'paradaId es requerido' },
        { status: 400 }
      );
    }

    // Verificar que la parada pertenece a la ruta del usuario
    const parada = await prisma.parada.findUnique({
      where: { id: paradaId },
      select: { rutaId: true, nombre: true },
    });

    if (!parada || parada.rutaId !== session.rutaAsignada) {
      return NextResponse.json(
        { error: 'Parada no pertenece a tu ruta' },
        { status: 400 }
      );
    }

    // Verificar si hay solicitud reciente (últimas 2 horas)
    const hace2Horas = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const solicitudReciente = await prisma.solicitudParada.findFirst({
      where: {
        usuarioId: session.userId,
        paradaId,
        horaSolicitud: { gte: hace2Horas },
        estado: 'Pendiente',
      },
    });

    if (solicitudReciente) {
      return NextResponse.json(
        { error: 'Ya tienes una solicitud pendiente para esta parada' },
        { status: 409 }
      );
    }

    // Crear solicitud
    const solicitud = await prisma.solicitudParada.create({
      data: {
        usuarioId: session.userId,
        paradaId,
        rutaId: session.rutaAsignada,
        estado: 'Pendiente',
        notificado: false,
      },
    });

    return NextResponse.json({
      success: true,
      solicitud: {
        id: solicitud.id,
        parada: parada.nombre,
        horaSolicitud: solicitud.horaSolicitud,
        penalizacionMinutos: PENALTY_DURATION_MINUTES,
      },
    });
  } catch (error) {
    console.error('Error creando solicitud:', error);
    return NextResponse.json(
      { error: 'Error al crear solicitud de parada' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const solicitudes = await prisma.solicitudParada.findMany({
      where: {
        usuarioId: session.userId,
      },
      include: {
        parada: {
          select: { nombre: true },
        },
        ruta: {
          select: { nombre: true },
        },
      },
      orderBy: { horaSolicitud: 'desc' },
      take: 10,
    });

    return NextResponse.json(solicitudes);
  } catch (error) {
    console.error('Error obteniendo solicitudes:', error);
    return NextResponse.json(
      { error: 'Error al obtener solicitudes' },
      { status: 500 }
    );
  }
}
