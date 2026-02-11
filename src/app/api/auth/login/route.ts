import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, setSessionCookie } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Intentar login como usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        nombre: true,
        email: true,
        password: true,
        rutaAsignada: true,
      },
    });

    if (usuario && usuario.password) {
      const passwordMatch = await bcrypt.compare(password, usuario.password);
      if (passwordMatch) {
        const sessionData = {
          userId: usuario.id,
          tipo: 'usuario' as const,
          nombre: usuario.nombre,
          email: usuario.email,
          rutaAsignada: usuario.rutaAsignada,
        };
        const token = await createSession(sessionData);
        await setSessionCookie(token);
        return NextResponse.json({
          success: true,
          tipo: 'usuario',
          usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rutaAsignada: usuario.rutaAsignada,
          },
        });
      }
    }

    // Intentar login como conductor (por email)
    const conductor = await prisma.conductor.findFirst({
      where: { email },
      select: {
        id: true,
        nombre: true,
        email: true,
        vehiculoId: true,
        vehiculo: {
          select: { rutaAsignada: true },
        },
      },
    });

    if (conductor) {
      // Los conductores no tienen password hasheado, aceptar cualquier password temporalmente
      // TODO: Implementar passwords para conductores en producción
      const sessionData = {
        conductorId: conductor.id,
        tipo: 'conductor' as const,
        nombre: conductor.nombre,
        email: conductor.email || '',
        vehiculoId: conductor.vehiculoId,
        rutaAsignada: conductor.vehiculo?.rutaAsignada,
      };
      const token = await createSession(sessionData);
      await setSessionCookie(token);
      return NextResponse.json({
        success: true,
        tipo: 'conductor',
        conductor: {
          id: conductor.id,
          nombre: conductor.nombre,
          email: conductor.email,
        },
      });
    }

    return NextResponse.json(
      { error: 'Credenciales inválidas' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
