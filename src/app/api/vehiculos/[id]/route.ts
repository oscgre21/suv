import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePrismaError } from '@/lib/api-utils';
import { vehiculoSchema } from '@/lib/validations';

// GET /api/vehiculos/[id] - Obtener vehículo por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id: params.id },
      include: {
        ruta: {
          include: {
            paradas: {
              orderBy: { orden: 'asc' },
            },
          },
        },
        conductor: true,
        historialViajes: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            ruta: true,
            conductor: true,
          },
        },
      },
    });

    if (!vehiculo) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(vehiculo);
  } catch (error) {
    console.error('Error fetching vehiculo:', error);
    return handlePrismaError(error);
  }
}

// PATCH /api/vehiculos/[id] - Actualizar vehículo
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validación parcial con Zod
    const validatedData = vehiculoSchema.partial().parse(body);

    const vehiculo = await prisma.vehiculo.update({
      where: { id: params.id },
      data: {
        ...(validatedData.ficha && { ficha: validatedData.ficha }),
        ...(validatedData.modelo && { modelo: validatedData.modelo }),
        ...(validatedData.placa && { placa: validatedData.placa }),
        ...(validatedData.capacidad !== undefined && { capacidad: validatedData.capacidad }),
        ...(validatedData.estado && { estado: validatedData.estado }),
        ...(validatedData.rutaAsignada !== undefined && {
          rutaAsignada: validatedData.rutaAsignada,
        }),
      },
      include: {
        ruta: true,
        conductor: true,
      },
    });

    return NextResponse.json(vehiculo);
  } catch (error: any) {
    console.error('Error updating vehiculo:', error);

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

// DELETE /api/vehiculos/[id] - Eliminar vehículo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id: params.id },
      include: {
        conductor: true,
      },
    });

    if (!vehiculo) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 }
      );
    }

    // Si tiene conductor asignado, no permitir eliminación
    if (vehiculo.conductor) {
      return NextResponse.json(
        {
          error: 'No se puede eliminar el vehículo porque tiene un conductor asignado',
          details: `Desasigna primero al conductor ${vehiculo.conductor.nombre}`,
        },
        { status: 400 }
      );
    }

    await prisma.vehiculo.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting vehiculo:', error);
    return handlePrismaError(error);
  }
}
