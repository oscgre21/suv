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

    // El identificador puede ser correo o cédula
    const identificador = String(email).trim();

    // Intentar login como usuario (por email o cédula)
    const usuario = await prisma.usuario.findFirst({
      where: { OR: [{ email: identificador }, { cedula: identificador }] },
      select: {
        id: true,
        nombre: true,
        email: true,
        password: true,
        rol: true,
        rutaAsignada: true,
      },
    });

    if (usuario && usuario.password) {
      const passwordMatch = await bcrypt.compare(password, usuario.password);
      if (passwordMatch) {
        const rol = usuario.rol === 'admin' ? 'admin' : 'pasajero';
        const sessionData = {
          userId: usuario.id,
          tipo: 'usuario' as const,
          rol: rol as 'admin' | 'pasajero',
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
            rol,
            rutaAsignada: usuario.rutaAsignada,
          },
        });
      }
    }

    // Intentar login como conductor (por email o cédula)
    const conductor = await prisma.conductor.findFirst({
      where: { OR: [{ email: identificador }, { cedula: identificador }] },
      select: {
        id: true,
        nombre: true,
        email: true,
        password: true,
        vehiculoId: true,
        vehiculo: {
          select: { rutaAsignada: true },
        },
      },
    });

    if (conductor) {
      if (!conductor.password) {
        return NextResponse.json(
          { error: 'Este conductor no tiene contraseña configurada. Contacte al administrador.' },
          { status: 401 }
        );
      }

      const passwordMatch = await bcrypt.compare(password, conductor.password);
      if (passwordMatch) {
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
