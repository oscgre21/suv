import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePrismaError } from '@/lib/api-utils';
import { horarioSchema } from '@/lib/validations';

// GET /api/horarios - Listar todos los horarios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rutaId = searchParams.get('rutaId');
    const conductorId = searchParams.get('conductorId');
    const diaSemana = searchParams.get('diaSemana');
    const activo = searchParams.get('activo');

    const where: any = {};

    if (rutaId) {
      where.rutaId = rutaId;
    }

    if (conductorId) {
      where.conductorId = conductorId;
    }

    if (diaSemana) {
      where.diasSemana = {
        has: diaSemana,
      };
    }

    if (activo !== null) {
      where.activo = activo === 'true';
    }

    const horarios = await prisma.horario.findMany({
      where,
      include: {
        ruta: true,
        conductor: true,
      },
      orderBy: [
        { rutaId: 'asc' },
        { horaInicio: 'asc' },
      ],
    });

    return NextResponse.json(horarios);
  } catch (error) {
    console.error('Error fetching horarios:', error);
    return handlePrismaError(error);
  }
}

// POST /api/horarios - Crear nuevo horario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar con Zod
    const validatedData = horarioSchema.parse(body);

    // Verificar que la ruta y el conductor existen
    const [ruta, conductor] = await Promise.all([
      prisma.ruta.findUnique({ where: { id: validatedData.rutaId } }),
      prisma.conductor.findUnique({ where: { id: validatedData.conductorId } }),
    ]);

    if (!ruta) {
      return NextResponse.json(
        { error: 'La ruta especificada no existe' },
        { status: 400 }
      );
    }

    if (!conductor) {
      return NextResponse.json(
        { error: 'El conductor especificado no existe' },
        { status: 400 }
      );
    }

    // Verificar si el conductor ya tiene un horario en el mismo día y rango de horas
    const horariosConflicto = await prisma.horario.findMany({
      where: {
        conductorId: validatedData.conductorId,
        activo: true,
        diasSemana: {
          hasSome: validatedData.diasSemana,
        },
      },
    });

    // Convertir horas a minutos para comparar
    const [horaInicioH, horaInicioM] = validatedData.horaInicio.split(':').map(Number);
    const [horaFinH, horaFinM] = validatedData.horaFin.split(':').map(Number);
    const nuevoInicio = horaInicioH * 60 + horaInicioM;
    const nuevoFin = horaFinH * 60 + horaFinM;

    for (const horario of horariosConflicto) {
      const [hInicioH, hInicioM] = horario.horaInicio.split(':').map(Number);
      const [hFinH, hFinM] = horario.horaFin.split(':').map(Number);
      const inicioExistente = hInicioH * 60 + hInicioM;
      const finExistente = hFinH * 60 + hFinM;

      // Verificar si hay solapamiento
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

    const horario = await prisma.horario.create({
      data: {
        rutaId: validatedData.rutaId,
        conductorId: validatedData.conductorId,
        horaInicio: validatedData.horaInicio,
        horaFin: validatedData.horaFin,
        diasSemana: validatedData.diasSemana,
        activo: validatedData.activo,
      },
      include: {
        ruta: true,
        conductor: true,
      },
    });

    return NextResponse.json(horario, { status: 201 });
  } catch (error: any) {
    console.error('Error creating horario:', error);

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
