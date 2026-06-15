import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePrismaError } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth-guard';
import { paradaSchema } from '@/lib/validations';

// GET /api/paradas/[id] - Obtener parada por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guard = await requireAdmin();
    if (guard.response) return guard.response;
    const parada = await prisma.parada.findUnique({
      where: { id: params.id },
      include: {
        ruta: true,
        solicitudes: {
          include: {
            usuario: true,
          },
          orderBy: { horaSolicitud: 'desc' },
          take: 20,
        },
        _count: {
          select: {
            solicitudes: true,
          },
        },
      },
    });

    if (!parada) {
      return NextResponse.json(
        { error: 'Parada no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(parada);
  } catch (error) {
    console.error('Error fetching parada:', error);
    return handlePrismaError(error);
  }
}

// PATCH /api/paradas/[id] - Actualizar parada
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guard = await requireAdmin();
    if (guard.response) return guard.response;
    const body = await request.json();

    // Validación parcial con Zod
    const validatedData = paradaSchema.partial().parse(body);

    // Si se está cambiando el orden, verificar que no esté duplicado
    if (validatedData.orden !== undefined) {
      const parada = await prisma.parada.findUnique({
        where: { id: params.id },
      });

      if (parada) {
        const paradaConOrden = await prisma.parada.findFirst({
          where: {
            rutaId: parada.rutaId,
            orden: validatedData.orden,
            id: { not: params.id },
          },
        });

        if (paradaConOrden) {
          return NextResponse.json(
            { error: `Ya existe una parada con orden ${validatedData.orden} en esta ruta` },
            { status: 400 }
          );
        }
      }
    }

    const parada = await prisma.parada.update({
      where: { id: params.id },
      data: {
        ...(validatedData.nombre && { nombre: validatedData.nombre }),
        ...(validatedData.direccion && { direccion: validatedData.direccion }),
        ...(validatedData.latitud !== undefined && { latitud: validatedData.latitud }),
        ...(validatedData.longitud !== undefined && { longitud: validatedData.longitud }),
        ...(validatedData.orden !== undefined && { orden: validatedData.orden }),
        ...(validatedData.activa !== undefined && { activa: validatedData.activa }),
      },
      include: {
        ruta: true,
      },
    });

    return NextResponse.json(parada);
  } catch (error: any) {
    console.error('Error updating parada:', error);

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

// DELETE /api/paradas/[id] - Eliminar parada
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guard = await requireAdmin();
    if (guard.response) return guard.response;
    const parada = await prisma.parada.findUnique({
      where: { id: params.id },
      include: {
        solicitudes: {
          where: {
            estado: 'Pendiente',
          },
        },
      },
    });

    if (!parada) {
      return NextResponse.json(
        { error: 'Parada no encontrada' },
        { status: 404 }
      );
    }

    // Si tiene solicitudes pendientes, no permitir eliminación
    if (parada.solicitudes.length > 0) {
      return NextResponse.json(
        {
          error: 'No se puede eliminar la parada porque tiene solicitudes pendientes',
          details: `La parada tiene ${parada.solicitudes.length} solicitud(es) pendiente(s)`,
        },
        { status: 400 }
      );
    }

    await prisma.parada.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting parada:', error);
    return handlePrismaError(error);
  }
}
