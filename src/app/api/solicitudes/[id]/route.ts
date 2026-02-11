import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePrismaError } from '@/lib/api-utils';
import { solicitudParadaSchema } from '@/lib/validations';

// GET /api/solicitudes/[id] - Obtener solicitud por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const solicitud = await prisma.solicitudParada.findUnique({
      where: { id: params.id },
      include: {
        usuario: {
          include: {
            ruta: true,
          },
        },
        parada: true,
        ruta: {
          include: {
            paradas: {
              orderBy: { orden: 'asc' },
            },
          },
        },
      },
    });

    if (!solicitud) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(solicitud);
  } catch (error) {
    console.error('Error fetching solicitud:', error);
    return handlePrismaError(error);
  }
}

// PATCH /api/solicitudes/[id] - Actualizar solicitud (cambiar estado principalmente)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validación parcial con Zod
    const validatedData = solicitudParadaSchema.partial().parse(body);

    const solicitud = await prisma.solicitudParada.update({
      where: { id: params.id },
      data: {
        ...(validatedData.estado && { estado: validatedData.estado }),
        ...(validatedData.notificado !== undefined && { notificado: validatedData.notificado }),
      },
      include: {
        usuario: true,
        parada: true,
        ruta: true,
      },
    });

    return NextResponse.json(solicitud);
  } catch (error: any) {
    console.error('Error updating solicitud:', error);

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

// DELETE /api/solicitudes/[id] - Eliminar solicitud (cancelar)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const solicitud = await prisma.solicitudParada.findUnique({
      where: { id: params.id },
    });

    if (!solicitud) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    // En lugar de eliminar, cambiar estado a Cancelado si está pendiente
    if (solicitud.estado === 'Pendiente') {
      await prisma.solicitudParada.update({
        where: { id: params.id },
        data: {
          estado: 'Cancelado',
        },
      });
    } else {
      // Si ya está confirmada o en otro estado, eliminar
      await prisma.solicitudParada.delete({
        where: { id: params.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting solicitud:', error);
    return handlePrismaError(error);
  }
}
