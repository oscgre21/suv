import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePrismaError } from '@/lib/api-utils';
import { estatusVehiculoSchema } from '@/lib/validations';

// GET /api/estatus-vehiculo/[id] - Obtener estatus de vehículo por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const estatusVehiculo = await prisma.estatusVehiculo.findUnique({
      where: { id: params.id },
    });

    if (!estatusVehiculo) {
      return NextResponse.json(
        { error: 'Estatus de vehículo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(estatusVehiculo);
  } catch (error) {
    console.error('Error fetching estatus vehiculo:', error);
    return handlePrismaError(error);
  }
}

// PATCH /api/estatus-vehiculo/[id] - Actualizar estatus de vehículo
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validación parcial con Zod
    const validatedData = estatusVehiculoSchema.partial().parse(body);

    const estatusVehiculo = await prisma.estatusVehiculo.update({
      where: { id: params.id },
      data: {
        ...(validatedData.nombre && { nombre: validatedData.nombre }),
        ...(validatedData.color && { color: validatedData.color }),
        ...(validatedData.descripcion !== undefined && {
          descripcion: validatedData.descripcion || null,
        }),
        ...(validatedData.activo !== undefined && { activo: validatedData.activo }),
      },
    });

    return NextResponse.json(estatusVehiculo);
  } catch (error: any) {
    console.error('Error updating estatus vehiculo:', error);

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

// DELETE /api/estatus-vehiculo/[id] - Eliminar estatus de vehículo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const estatusVehiculo = await prisma.estatusVehiculo.findUnique({
      where: { id: params.id },
    });

    if (!estatusVehiculo) {
      return NextResponse.json(
        { error: 'Estatus de vehículo no encontrado' },
        { status: 404 }
      );
    }

    await prisma.estatusVehiculo.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting estatus vehiculo:', error);
    return handlePrismaError(error);
  }
}
