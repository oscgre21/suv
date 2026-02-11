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

    // Buscar usuario por email
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

    if (!usuario || !usuario.password) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, usuario.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Crear sesión
    const sessionData = {
      userId: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rutaAsignada: usuario.rutaAsignada,
    };

    const token = await createSession(sessionData);
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rutaAsignada: usuario.rutaAsignada,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
