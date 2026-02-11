import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePrismaError } from '@/lib/api-utils';
import { horarioSchema } from '@/lib/validations';

// GET /api/horarios/[id] - Obtener horario por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const horario = await prisma.horario.findUnique({
      where: { id: params.id },
      include: {
        ruta: {
          include: {
            paradas: {
              orderBy: { orden: 'asc' },
            },
          },
        },
        conductor: {
          include: {
            vehiculo: true,
          },
        },
      },
    });

    if (!horario) {
      return NextResponse.json(
        { error: 'Horario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(horario);
  } catch (error) {
    console.error('Error fetching horario:', error);
    return handlePrismaError(error);
  }
}

// PATCH /api/horarios/[id] - Actualizar horario
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validación parcial con Zod
    const validatedData = horarioSchema.partial().parse(body);

    // Si se está cambiando el conductor, horaInicio, horaFin o diasSemana, verificar conflictos
    if (
      validatedData.conductorId ||
      validatedData.horaInicio ||
      validatedData.horaFin ||
      validatedData.diasSemana
    ) {
      const horarioActual = await prisma.horario.findUnique({
        where: { id: params.id },
      });

      if (!horarioActual) {
        return NextResponse.json(
          { error: 'Horario no encontrado' },
          { status: 404 }
        );
      }

      const conductorId = validatedData.conductorId || horarioActual.conductorId;
      const horaInicio = validatedData.horaInicio || horarioActual.horaInicio;
      const horaFin = validatedData.horaFin || horarioActual.horaFin;
      const diasSemana = validatedData.diasSemana || horarioActual.diasSemana;

      // Verificar conflictos
      const horariosConflicto = await prisma.horario.findMany({
        where: {
          conductorId,
          activo: true,
          id: { not: params.id },
          diasSemana: {
            hasSome: diasSemana,
          },
        },
      });

      const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number);
      const [horaFinH, horaFinM] = horaFin.split(':').map(Number);
      const nuevoInicio = horaInicioH * 60 + horaInicioM;
      const nuevoFin = horaFinH * 60 + horaFinM;

      for (const horario of horariosConflicto) {
        const [hInicioH, hInicioM] = horario.horaInicio.split(':').map(Number);
        const [hFinH, hFinM] = horario.horaFin.split(':').map(Number);
        const inicioExistente = hInicioH * 60 + hInicioM;
        const finExistente = hFinH * 60 + hFinM;

        if (
          (nuevoInicio >= inicioExistente && nuevoInicio < finExistente) ||
          (nuevoFin > inicioExistente && nuevoFin <= finExistente) ||
          (nuevoInicio <= inicioExistente && nuevoFin >= finExistente)
        ) {
          return NextResponse.json(
            {
              error: 'El conductor ya tiene un horario asignado en ese rango de horas',
              details: `Conflicto con horario: ${horario.horaInicio} - ${horario.horaFin}`,
            },
            { status: 400 }
          );
        }
      }
    }

    const horario = await prisma.horario.update({
      where: { id: params.id },
      data: {
        ...(validatedData.rutaId && { rutaId: validatedData.rutaId }),
        ...(validatedData.conductorId && { conductorId: validatedData.conductorId }),
        ...(validatedData.horaInicio && { horaInicio: validatedData.horaInicio }),
        ...(validatedData.horaFin && { horaFin: validatedData.horaFin }),
        ...(validatedData.diasSemana && { diasSemana: validatedData.diasSemana }),
        ...(validatedData.activo !== undefined && { activo: validatedData.activo }),
      },
      include: {
        ruta: true,
        conductor: true,
      },
    });

    return NextResponse.json(horario);
  } catch (error: any) {
    console.error('Error updating horario:', error);

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

// DELETE /api/horarios/[id] - Eliminar horario
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const horario = await prisma.horario.findUnique({
      where: { id: params.id },
    });

    if (!horario) {
      return NextResponse.json(
        { error: 'Horario no encontrado' },
        { status: 404 }
      );
    }

    await prisma.horario.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting horario:', error);
    return handlePrismaError(error);
  }
}
