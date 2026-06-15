import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePrismaError, sanitizeSearchInput } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth-guard';
import { paradaSchema } from '@/lib/validations';

// GET /api/paradas - Listar todas las paradas
export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.response) return guard.response;
    const { searchParams } = new URL(request.url);
    const rutaId = searchParams.get('rutaId');
    const activa = searchParams.get('activa');
    const search = searchParams.get('search');

    const where: any = {};

    if (rutaId) {
      where.rutaId = rutaId;
    }

    if (activa !== null) {
      where.activa = activa === 'true';
    }

    if (search) {
      const sanitizedSearch = sanitizeSearchInput(search);
      where.OR = [
        { nombre: { contains: sanitizedSearch, mode: 'insensitive' } },
        { direccion: { contains: sanitizedSearch, mode: 'insensitive' } },
      ];
    }

    const paradas = await prisma.parada.findMany({
      where,
      include: {
        ruta: true,
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
      orderBy: [
        { rutaId: 'asc' },
        { orden: 'asc' },
      ],
    });

    return NextResponse.json(paradas);
  } catch (error) {
    console.error('Error fetching paradas:', error);
    return handlePrismaError(error);
  }
}

// POST /api/paradas - Crear nueva parada
export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.response) return guard.response;
    const body = await request.json();

    // Validar con Zod
    const validatedData = paradaSchema.parse(body);

    // Verificar que la ruta existe
    const ruta = await prisma.ruta.findUnique({
      where: { id: validatedData.rutaId },
    });

    if (!ruta) {
      return NextResponse.json(
        { error: 'La ruta especificada no existe' },
        { status: 400 }
      );
    }

    // Verificar que el orden no esté duplicado en la misma ruta
    const paradaExistente = await prisma.parada.findFirst({
      where: {
        rutaId: validatedData.rutaId,
        orden: validatedData.orden,
      },
    });

    if (paradaExistente) {
      return NextResponse.json(
        { error: `Ya existe una parada con orden ${validatedData.orden} en esta ruta` },
        { status: 400 }
      );
    }

    const parada = await prisma.parada.create({
      data: {
        nombre: validatedData.nombre,
        direccion: validatedData.direccion,
        latitud: validatedData.latitud,
        longitud: validatedData.longitud,
        orden: validatedData.orden,
        rutaId: validatedData.rutaId,
        activa: validatedData.activa,
      },
      include: {
        ruta: true,
      },
    });

    return NextResponse.json(parada, { status: 201 });
  } catch (error: any) {
    console.error('Error creating parada:', error);

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
