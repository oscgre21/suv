import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePrismaError } from '@/lib/api-utils';
import { usuarioSchema } from '@/lib/validations';

// GET /api/usuarios/[id] - Obtener usuario por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: params.id },
      include: {
        ruta: {
          include: {
            paradas: {
              orderBy: { orden: 'asc' },
            },
          },
        },
        solicitudes: {
          include: {
            parada: true,
            ruta: true,
          },
          orderBy: { horaSolicitud: 'desc' },
        },
        historialViajes: {
          include: {
            ruta: true,
            vehiculo: true,
            conductor: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            solicitudes: true,
            historialViajes: true,
          },
        },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Error fetching usuario:', error);
    return handlePrismaError(error);
  }
}

// PATCH /api/usuarios/[id] - Actualizar usuario
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validación parcial con Zod
    const validatedData = usuarioSchema.partial().parse(body);

    const usuario = await prisma.usuario.update({
      where: { id: params.id },
      data: {
        ...(validatedData.nombre && { nombre: validatedData.nombre }),
        ...(validatedData.cedula && { cedula: validatedData.cedula }),
        ...(validatedData.email && { email: validatedData.email }),
        ...(validatedData.telefono !== undefined && {
          telefono: validatedData.telefono || null,
        }),
        ...(validatedData.direccion !== undefined && {
          direccion: validatedData.direccion || null,
        }),
        ...(validatedData.rutaAsignada !== undefined && {
          rutaAsignada: validatedData.rutaAsignada,
        }),
        ...(validatedData.estado && { estado: validatedData.estado }),
      },
      include: {
        ruta: true,
      },
    });

    return NextResponse.json(usuario);
  } catch (error: any) {
    console.error('Error updating usuario:', error);

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

// DELETE /api/usuarios/[id] - Eliminar usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: params.id },
      include: {
        solicitudes: {
          where: {
            estado: 'Pendiente',
          },
        },
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Si tiene solicitudes pendientes, no permitir eliminación
    if (usuario.solicitudes.length > 0) {
      return NextResponse.json(
        {
          error: 'No se puede eliminar el usuario porque tiene solicitudes pendientes',
          details: `El usuario tiene ${usuario.solicitudes.length} solicitud(es) pendiente(s)`,
        },
        { status: 400 }
      );
    }

    await prisma.usuario.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting usuario:', error);
    return handlePrismaError(error);
  }
}
