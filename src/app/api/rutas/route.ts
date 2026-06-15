import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePrismaError, sanitizeSearchInput } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth-guard';
import { rutaSchema } from '@/lib/validations';

// GET /api/rutas - Listar todas las rutas
export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.response) return guard.response;
    const { searchParams } = new URL(request.url);
    const activa = searchParams.get('activa');
    const esEspecial = searchParams.get('esEspecial');
    const search = searchParams.get('search');

    const where: any = {};

    if (activa !== null) {
      where.activa = activa === 'true';
    }

    if (esEspecial !== null) {
      where.esEspecial = esEspecial === 'true';
    }

    if (search) {
      const sanitizedSearch = sanitizeSearchInput(search);
      where.OR = [
        { nombre: { contains: sanitizedSearch, mode: 'insensitive' } },
        { descripcion: { contains: sanitizedSearch, mode: 'insensitive' } },
      ];
    }

    const rutas = await prisma.ruta.findMany({
      where,
      include: {
        paradas: {
          orderBy: { orden: 'asc' },
        },
        horarios: {
          include: {
            conductor: true,
          },
        },
        vehiculos: true,
        usuarios: true,
        _count: {
          select: {
            paradas: true,
            vehiculos: true,
            usuarios: true,
            horarios: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    return NextResponse.json(rutas);
  } catch (error) {
    console.error('Error fetching rutas:', error);
    return handlePrismaError(error);
  }
}

// POST /api/rutas - Crear nueva ruta
export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.response) return guard.response;
    const body = await request.json();

    // Validar con Zod
    const validatedData = rutaSchema.parse(body);

    const ruta = await prisma.ruta.create({
      data: {
        nombre: validatedData.nombre,
        descripcion: validatedData.descripcion || null,
        color: validatedData.color,
        activa: validatedData.activa,
        esEspecial: validatedData.esEspecial,
      },
      include: {
        paradas: true,
        vehiculos: true,
        _count: {
          select: {
            paradas: true,
            vehiculos: true,
            usuarios: true,
          },
        },
      },
    });

    return NextResponse.json(ruta, { status: 201 });
  } catch (error: any) {
    console.error('Error creating ruta:', error);

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
