import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePrismaError, buildPrismaWhere, sanitizeSearchInput } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth-guard';
import { conductorSchema } from '@/lib/validations';

// GET /api/conductores - Listar todos los conductores
export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.response) return guard.response;
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const turno = searchParams.get('turno');
    const search = searchParams.get('search');
    const conVehiculo = searchParams.get('conVehiculo');

    const where: any = {};

    if (estado) {
      where.estado = estado;
    }

    if (turno) {
      where.turno = turno;
    }

    if (conVehiculo === 'true') {
      where.vehiculoId = { not: null };
    } else if (conVehiculo === 'false') {
      where.vehiculoId = null;
    }

    if (search) {
      const sanitizedSearch = sanitizeSearchInput(search);
      where.OR = [
        { nombre: { contains: sanitizedSearch, mode: 'insensitive' } },
        { cedula: { contains: sanitizedSearch, mode: 'insensitive' } },
        { licencia: { contains: sanitizedSearch, mode: 'insensitive' } },
        { telefono: { contains: sanitizedSearch, mode: 'insensitive' } },
      ];
    }

    const conductores = await prisma.conductor.findMany({
      where,
      include: {
        vehiculo: true,
        horarios: {
          include: {
            ruta: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    return NextResponse.json(conductores);
  } catch (error) {
    console.error('Error fetching conductores:', error);
    return handlePrismaError(error);
  }
}

// POST /api/conductores - Crear nuevo conductor
export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.response) return guard.response;
    const body = await request.json();

    // Validar con Zod
    const validatedData = conductorSchema.parse(body);

    // Verificar si el vehículo ya tiene conductor asignado
    if (validatedData.vehiculoId) {
      const vehiculo = await prisma.vehiculo.findUnique({
        where: { id: validatedData.vehiculoId },
        include: { conductor: true },
      });

      if (vehiculo?.conductor) {
        return NextResponse.json(
          { error: 'El vehículo ya tiene un conductor asignado' },
          { status: 400 }
        );
      }
    }

    const conductor = await prisma.conductor.create({
      data: {
        nombre: validatedData.nombre,
        cedula: validatedData.cedula,
        licencia: validatedData.licencia,
        telefono: validatedData.telefono,
        email: validatedData.email || null,
        turno: validatedData.turno,
        estado: validatedData.estado,
        ...(validatedData.vehiculoId && {
          vehiculo: {
            connect: { id: validatedData.vehiculoId },
          },
        }),
      },
      include: {
        vehiculo: true,
      },
    });

    return NextResponse.json(conductor, { status: 201 });
  } catch (error: any) {
    console.error('Error creating conductor:', error);

    // Errores de validación Zod
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
