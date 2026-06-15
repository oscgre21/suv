import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'cesac-gps-secret-key-2025'
);

export interface SessionData {
  userId?: string;           // Para usuarios
  conductorId?: string;      // Para conductores
  tipo: 'usuario' | 'conductor';
  rol?: 'admin' | 'pasajero'; // Solo para tipo === 'usuario'
  nombre: string;
  email: string;
  rutaAsignada?: string | null;
  vehiculoId?: string | null;
}

export async function createSession(data: SessionData): Promise<string> {
  const token = await new SignJWT(data as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);

  return token;
}

/**
 * Verifica un token JWT y devuelve su SessionData. Es "edge-safe": opera
 * directamente sobre el string del token (sin `next/headers`), por lo que
 * puede usarse desde el middleware (edge runtime) además del servidor.
 */
export async function verifyToken(token: string | undefined): Promise<SessionData | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionData;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  return verifyToken(token);
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
