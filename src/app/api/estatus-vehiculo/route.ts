import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePrismaError, sanitizeSearchInput } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth-guard';
import { estatusVehiculoSchema } from '@/lib/validations';

// GET /api/estatus-vehiculo - Listar todos los estatus de vehículos
export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.response) return guard.response;
    const { searchParams } = new URL(request.url);
    const activo = searchParams.get('activo');
    const search = searchParams.get('search');

    const where: any = {};

    if (activo !== null) {
      where.activo = activo === 'true';
    }

    if (search) {
      const sanitizedSearch = sanitizeSearchInput(search);
      where.OR = [
        { nombre: { contains: sanitizedSearch, mode: 'insensitive' } },
        { descripcion: { contains: sanitizedSearch, mode: 'insensitive' } },
      ];
    }

    const estatusVehiculos = await prisma.estatusVehiculo.findMany({
      where,
      orderBy: {
        nombre: 'asc',
      },
    });

    return NextResponse.json(estatusVehiculos);
  } catch (error) {
    console.error('Error fetching estatus vehiculos:', error);
    return handlePrismaError(error);
  }
}

// POST /api/estatus-vehiculo - Crear nuevo estatus de vehículo
export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.response) return guard.response;
    const body = await request.json();

    // Validar con Zod
    const validatedData = estatusVehiculoSchema.parse(body);

    const estatusVehiculo = await prisma.estatusVehiculo.create({
      data: {
        nombre: validatedData.nombre,
        color: validatedData.color,
        descripcion: validatedData.descripcion || null,
        activo: validatedData.activo,
      },
    });

    return NextResponse.json(estatusVehiculo, { status: 201 });
  } catch (error: any) {
    console.error('Error creating estatus vehiculo:', error);

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
