import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handlePrismaError } from '@/lib/api-utils';
import { rutaSchema } from '@/lib/validations';

// GET /api/rutas/[id] - Obtener ruta por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ruta = await prisma.ruta.findUnique({
      where: { id: params.id },
      include: {
        paradas: {
          orderBy: { orden: 'asc' },
        },
        horarios: {
          include: {
            conductor: true,
          },
          orderBy: { horaInicio: 'asc' },
        },
        vehiculos: {
          include: {
            conductor: true,
          },
        },
        usuarios: {
          where: {
            estado: 'Activo',
          },
        },
        solicitudes: {
          include: {
            usuario: true,
            parada: true,
          },
          orderBy: { horaSolicitud: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            paradas: true,
            vehiculos: true,
            usuarios: true,
            horarios: true,
            solicitudes: true,
          },
        },
      },
    });

    if (!ruta) {
      return NextResponse.json(
        { error: 'Ruta no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(ruta);
  } catch (error) {
    console.error('Error fetching ruta:', error);
    return handlePrismaError(error);
  }
}

// PATCH /api/rutas/[id] - Actualizar ruta
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validación parcial con Zod
    const validatedData = rutaSchema.partial().parse(body);

    const ruta = await prisma.ruta.update({
      where: { id: params.id },
      data: {
        ...(validatedData.nombre && { nombre: validatedData.nombre }),
        ...(validatedData.descripcion !== undefined && {
          descripcion: validatedData.descripcion || null,
        }),
        ...(validatedData.color && { color: validatedData.color }),
        ...(validatedData.activa !== undefined && { activa: validatedData.activa }),
        ...(validatedData.esEspecial !== undefined && { esEspecial: validatedData.esEspecial }),
      },
      include: {
        paradas: {
          orderBy: { orden: 'asc' },
        },
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

    return NextResponse.json(ruta);
  } catch (error: any) {
    console.error('Error updating ruta:', error);

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

// DELETE /api/rutas/[id] - Eliminar ruta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ruta = await prisma.ruta.findUnique({
      where: { id: params.id },
      include: {
        vehiculos: true,
        usuarios: true,
        horarios: true,
      },
    });

    if (!ruta) {
      return NextResponse.json(
        { error: 'Ruta no encontrada' },
        { status: 404 }
      );
    }

    // Verificar si tiene vehículos asignados
    if (ruta.vehiculos.length > 0) {
      return NextResponse.json(
        {
          error: 'No se puede eliminar la ruta porque tiene vehículos asignados',
          details: `La ruta tiene ${ruta.vehiculos.length} vehículo(s) asignado(s)`,
        },
        { status: 400 }
      );
    }

    // Verificar si tiene usuarios asignados
    if (ruta.usuarios.length > 0) {
      return NextResponse.json(
        {
          error: 'No se puede eliminar la ruta porque tiene usuarios asignados',
          details: `La ruta tiene ${ruta.usuarios.length} usuario(s) asignado(s)`,
        },
        { status: 400 }
      );
    }

    // Verificar si tiene horarios activos
    const horariosActivos = ruta.horarios.filter((h) => h.activo);
    if (horariosActivos.length > 0) {
      return NextResponse.json(
        {
          error: 'No se puede eliminar la ruta porque tiene horarios activos',
          details: `La ruta tiene ${horariosActivos.length} horario(s) activo(s)`,
        },
        { status: 400 }
      );
    }

    // Eliminar ruta (las paradas se eliminarán en cascada)
    await prisma.ruta.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting ruta:', error);
    return handlePrismaError(error);
  }
}
