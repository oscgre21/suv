import { NextResponse } from 'next/server';
import { getSession, type SessionData } from '@/lib/session';

/**
 * Helpers de autorización para route handlers.
 *
 * Cada guard devuelve `{ session }` cuando el acceso es válido, o
 * `{ response }` con un NextResponse de error (401/403) cuando no lo es.
 * Uso típico al inicio de un handler:
 *
 *   const guard = await requireAdmin();
 *   if (guard.response) return guard.response;
 *   const { session } = guard;
 */
export type GuardResult =
  | { session: SessionData; response?: undefined }
  | { session?: undefined; response: NextResponse };

const noAutenticado = () =>
  NextResponse.json({ error: 'No autenticado' }, { status: 401 });

const sinPermiso = () =>
  NextResponse.json({ error: 'No autorizado' }, { status: 403 });

/** Requiere un usuario con rol de administrador. */
export async function requireAdmin(): Promise<GuardResult> {
  const session = await getSession();
  if (!session) return { response: noAutenticado() };
  if (session.tipo !== 'usuario' || session.rol !== 'admin') {
    return { response: sinPermiso() };
  }
  return { session };
}

/** Requiere un conductor autenticado. */
export async function requireConductor(): Promise<GuardResult> {
  const session = await getSession();
  if (!session) return { response: noAutenticado() };
  if (session.tipo !== 'conductor' || !session.conductorId) {
    return { response: sinPermiso() };
  }
  return { session };
}

/** Requiere un usuario (pasajero o admin) autenticado. */
export async function requireUsuario(): Promise<GuardResult> {
  const session = await getSession();
  if (!session) return { response: noAutenticado() };
  if (session.tipo !== 'usuario' || !session.userId) {
    return { response: sinPermiso() };
  }
  return { session };
}
