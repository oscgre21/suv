import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Si es conductor, retornar datos de conductor
    if (session.tipo === 'conductor' && session.conductorId) {
      const conductor = await prisma.conductor.findUnique({
        where: { id: session.conductorId },
        select: {
          id: true,
          nombre: true,
          email: true,
          cedula: true,
        },
      });

      if (!conductor) {
        return NextResponse.json(
          { error: 'Conductor no encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        ...conductor,
        tipo: 'conductor',
      });
    }

    // Obtener datos actualizados del usuario
    if (session.userId) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          nombre: true,
          email: true,
          cedula: true,
          rutaAsignada: true,
          ruta: {
            select: {
              id: true,
              nombre: true,
              color: true,
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
    }

    return NextResponse.json(
      { error: 'Sesión inválida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error obteniendo sesión:', error);
    return NextResponse.json(
      { error: 'Error al obtener sesión' },
      { status: 500 }
    );
  }
}
