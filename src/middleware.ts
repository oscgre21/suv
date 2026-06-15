import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, type SessionData } from '@/lib/session';

/**
 * Devuelve la ruta "home" correcta según el tipo/rol de la sesión.
 * Se usa para redirigir cuando alguien intenta entrar a una sección que
 * no le corresponde pero sí tiene una sesión válida de otro rol.
 */
function homeFor(session: SessionData): string {
  if (session.tipo === 'conductor') return '/vista-bus';
  if (session.tipo === 'usuario' && session.rol === 'admin') return '/dashboard';
  if (session.tipo === 'usuario') return '/usuario';
  return '/';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('session')?.value;
  const session = await verifyToken(token);

  // Determinar el rol requerido por la sección solicitada.
  let allowed: boolean;
  if (pathname.startsWith('/dashboard')) {
    allowed = !!session && session.tipo === 'usuario' && session.rol === 'admin';
  } else if (pathname.startsWith('/vista-bus')) {
    allowed = !!session && session.tipo === 'conductor';
  } else if (pathname.startsWith('/usuario')) {
    allowed = !!session && session.tipo === 'usuario';
  } else {
    allowed = true;
  }

  if (allowed) {
    return NextResponse.next();
  }

  // Sin sesión válida → al login. Con sesión de otro rol → a su home.
  const destino = session ? homeFor(session) : '/';
  return NextResponse.redirect(new URL(destino, request.url));
}

export const config = {
  matcher: ['/dashboard/:path*', '/vista-bus/:path*', '/usuario/:path*'],
};
