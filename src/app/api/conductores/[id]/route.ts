import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePrismaError } from '@/lib/api-utils';
import { conductorSchema } from '@/lib/validations';

// GET /api/conductores/[id] - Obtener conductor por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conductor = await prisma.conductor.findUnique({
      where: { id: params.id },
      include: {
        vehiculo: true,
        horarios: {
          include: {
            ruta: true,
          },
        },
        historialViajes: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            ruta: true,
            vehiculo: true,
          },
        },
      },
    });

    if (!conductor) {
      return NextResponse.json(
        { error: 'Conductor no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(conductor);
  } catch (error) {
    console.error('Error fetching conductor:', error);
    return handlePrismaError(error);
  }
}

// PATCH /api/conductores/[id] - Actualizar conductor
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validación parcial con Zod
    const validatedData = conductorSchema.partial().parse(body);

    // Si se está asignando un vehículo, verificar que no tenga conductor
    if (validatedData.vehiculoId) {
      const vehiculo = await prisma.vehiculo.findUnique({
        where: { id: validatedData.vehiculoId },
        include: { conductor: true },
      });

      if (vehiculo?.conductor && vehiculo.conductor.id !== params.id) {
        return NextResponse.json(
          { error: 'El vehículo ya tiene un conductor asignado' },
          { status: 400 }
        );
      }
    }

    // Si se está desasignando un vehículo (vehiculoId = null), primero desconectar
    const currentConductor = await prisma.conductor.findUnique({
      where: { id: params.id },
      select: { vehiculoId: true },
    });

    const conductor = await prisma.conductor.update({
      where: { id: params.id },
      data: {
        ...(validatedData.nombre && { nombre: validatedData.nombre }),
        ...(validatedData.cedula && { cedula: validatedData.cedula }),
        ...(validatedData.licencia && { licencia: validatedData.licencia }),
        ...(validatedData.telefono && { telefono: validatedData.telefono }),
        ...(validatedData.email !== undefined && { email: validatedData.email || null }),
        ...(validatedData.turno && { turno: validatedData.turno }),
        ...(validatedData.estado && { estado: validatedData.estado }),
        ...(validatedData.vehiculoId !== undefined && {
          vehiculoId: validatedData.vehiculoId,
        }),
      },
      include: {
        vehiculo: true,
      },
    });

    return NextResponse.json(conductor);
  } catch (error: any) {
    console.error('Error updating conductor:', error);

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

// DELETE /api/conductores/[id] - Eliminar conductor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si el conductor tiene relaciones activas
    const conductor = await prisma.conductor.findUnique({
      where: { id: params.id },
      include: {
        horarios: true,
        historialViajes: true,
      },
    });

    if (!conductor) {
      return NextResponse.json(
        { error: 'Conductor no encontrado' },
        { status: 404 }
      );
    }

    // Si tiene horarios activos, no permitir eliminación
    const horariosActivos = conductor.horarios.filter((h) => h.activo);
    if (horariosActivos.length > 0) {
      return NextResponse.json(
        {
          error: 'No se puede eliminar el conductor porque tiene horarios activos',
          details: `El conductor tiene ${horariosActivos.length} horario(s) activo(s)`,
        },
        { status: 400 }
      );
    }

    // Eliminar conductor (el historial de viajes se mantendrá por integridad)
    await prisma.conductor.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting conductor:', error);
    return handlePrismaError(error);
  }
}
