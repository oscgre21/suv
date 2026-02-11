import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePrismaError, sanitizeSearchInput } from '@/lib/api-utils';
import { vehiculoSchema } from '@/lib/validations';

// GET /api/vehiculos - Listar todos los vehículos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const rutaId = searchParams.get('rutaId');
    const conConductor = searchParams.get('conConductor');
    const search = searchParams.get('search');

    const where: any = {};

    if (estado) {
      where.estado = estado;
    }

    if (rutaId) {
      where.rutaAsignada = rutaId;
    }

    if (conConductor === 'true') {
      where.conductor = { isNot: null };
    } else if (conConductor === 'false') {
      where.conductor = { is: null };
    }

    if (search) {
      const sanitizedSearch = sanitizeSearchInput(search);
      where.OR = [
        { ficha: { contains: sanitizedSearch, mode: 'insensitive' } },
        { modelo: { contains: sanitizedSearch, mode: 'insensitive' } },
        { placa: { contains: sanitizedSearch, mode: 'insensitive' } },
      ];
    }

    const vehiculos = await prisma.vehiculo.findMany({
      where,
      include: {
        ruta: true,
        conductor: true,
        historialViajes: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: {
        ficha: 'asc',
      },
    });

    return NextResponse.json(vehiculos);
  } catch (error) {
    console.error('Error fetching vehiculos:', error);
    return handlePrismaError(error);
  }
}

// POST /api/vehiculos - Crear nuevo vehículo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar con Zod
    const validatedData = vehiculoSchema.parse(body);

    const vehiculo = await prisma.vehiculo.create({
      data: {
        ficha: validatedData.ficha,
        modelo: validatedData.modelo,
        placa: validatedData.placa,
        capacidad: validatedData.capacidad,
        estado: validatedData.estado,
        ...(validatedData.rutaAsignada && {
          ruta: {
            connect: { id: validatedData.rutaAsignada },
          },
        }),
      },
      include: {
        ruta: true,
        conductor: true,
      },
    });

    return NextResponse.json(vehiculo, { status: 201 });
  } catch (error: any) {
    console.error('Error creating vehiculo:', error);

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
