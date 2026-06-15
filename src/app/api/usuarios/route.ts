import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePrismaError, sanitizeSearchInput } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth-guard';
import { usuarioSchema } from '@/lib/validations';

// GET /api/usuarios - Listar todos los usuarios
export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.response) return guard.response;
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const rutaId = searchParams.get('rutaId');
    const search = searchParams.get('search');

    const where: any = {};

    if (estado) {
      where.estado = estado;
    }

    if (rutaId) {
      where.rutaAsignada = rutaId;
    }

    if (search) {
      const sanitizedSearch = sanitizeSearchInput(search);
      where.OR = [
        { nombre: { contains: sanitizedSearch, mode: 'insensitive' } },
        { cedula: { contains: sanitizedSearch, mode: 'insensitive' } },
        { email: { contains: sanitizedSearch, mode: 'insensitive' } },
        { telefono: { contains: sanitizedSearch, mode: 'insensitive' } },
      ];
    }

    const usuarios = await prisma.usuario.findMany({
      where,
      include: {
        ruta: true,
        solicitudes: {
          include: {
            parada: true,
          },
          orderBy: { horaSolicitud: 'desc' },
          take: 5,
        },
        historialViajes: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            solicitudes: true,
            historialViajes: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Error fetching usuarios:', error);
    return handlePrismaError(error);
  }
}

// POST /api/usuarios - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (guard.response) return guard.response;
    const body = await request.json();

    // Validar con Zod
    const validatedData = usuarioSchema.parse(body);

    const usuario = await prisma.usuario.create({
      data: {
        nombre: validatedData.nombre,
        cedula: validatedData.cedula,
        email: validatedData.email,
        telefono: validatedData.telefono || null,
        direccion: validatedData.direccion || null,
        rutaAsignada: validatedData.rutaAsignada || null,
        estado: validatedData.estado,
      },
      include: {
        ruta: true,
      },
    });

    return NextResponse.json(usuario, { status: 201 });
  } catch (error: any) {
    console.error('Error creating usuario:', error);

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
