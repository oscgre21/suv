import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePrismaError } from '@/lib/api-utils';
import { solicitudParadaSchema } from '@/lib/validations';

// GET /api/solicitudes - Listar todas las solicitudes de parada
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get('usuarioId');
    const paradaId = searchParams.get('paradaId');
    const rutaId = searchParams.get('rutaId');
    const estado = searchParams.get('estado');
    const notificado = searchParams.get('notificado');
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');

    const where: any = {};

    if (usuarioId) {
      where.usuarioId = usuarioId;
    }

    if (paradaId) {
      where.paradaId = paradaId;
    }

    if (rutaId) {
      where.rutaId = rutaId;
    }

    if (estado) {
      where.estado = estado;
    }

    if (notificado !== null) {
      where.notificado = notificado === 'true';
    }

    if (fechaDesde || fechaHasta) {
      where.horaSolicitud = {};
      if (fechaDesde) {
        where.horaSolicitud.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        where.horaSolicitud.lte = new Date(fechaHasta);
      }
    }

    const solicitudes = await prisma.solicitudParada.findMany({
      where,
      include: {
        usuario: true,
        parada: true,
        ruta: true,
      },
      orderBy: {
        horaSolicitud: 'desc',
      },
    });

    return NextResponse.json(solicitudes);
  } catch (error) {
    console.error('Error fetching solicitudes:', error);
    return handlePrismaError(error);
  }
}

// POST /api/solicitudes - Crear nueva solicitud de parada
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar con Zod
    const validatedData = solicitudParadaSchema.parse(body);

    // Verificar que el usuario, parada y ruta existen
    const [usuario, parada, ruta] = await Promise.all([
      prisma.usuario.findUnique({ where: { id: validatedData.usuarioId } }),
      prisma.parada.findUnique({ where: { id: validatedData.paradaId } }),
      prisma.ruta.findUnique({ where: { id: validatedData.rutaId } }),
    ]);

    if (!usuario) {
      return NextResponse.json(
        { error: 'El usuario especificado no existe' },
        { status: 400 }
      );
    }

    if (!parada) {
      return NextResponse.json(
        { error: 'La parada especificada no existe' },
        { status: 400 }
      );
    }

    if (!ruta) {
      return NextResponse.json(
        { error: 'La ruta especificada no existe' },
        { status: 400 }
      );
    }

    // Verificar que la parada pertenece a la ruta
    if (parada.rutaId !== validatedData.rutaId) {
      return NextResponse.json(
        { error: 'La parada no pertenece a la ruta especificada' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya tiene una solicitud pendiente para la misma parada hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const solicitudExistente = await prisma.solicitudParada.findFirst({
      where: {
        usuarioId: validatedData.usuarioId,
        paradaId: validatedData.paradaId,
        estado: 'Pendiente',
        horaSolicitud: {
          gte: hoy,
          lt: manana,
        },
      },
    });

    if (solicitudExistente) {
      return NextResponse.json(
        { error: 'Ya tienes una solicitud pendiente para esta parada hoy' },
        { status: 400 }
      );
    }

    const solicitud = await prisma.solicitudParada.create({
      data: {
        usuarioId: validatedData.usuarioId,
        paradaId: validatedData.paradaId,
        rutaId: validatedData.rutaId,
        estado: validatedData.estado,
        notificado: validatedData.notificado,
      },
      include: {
        usuario: true,
        parada: true,
        ruta: true,
      },
    });

    return NextResponse.json(solicitud, { status: 201 });
  } catch (error: any) {
    console.error('Error creating solicitud:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: error.errors.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    return handlePrismaError(error);
  }
}
