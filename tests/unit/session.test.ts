import { describe, it, expect, vi } from 'vitest';

// session.ts importa `cookies` de next/headers (solo usado por getSession/setSessionCookie).
// Lo mockeamos para poder importar el módulo en entorno node sin Next.
vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: () => undefined,
    set: () => {},
    delete: () => {},
  })),
}));

import { createSession, verifyToken, type SessionData } from '@/lib/session';

const adminData: SessionData = {
  userId: 'u1',
  tipo: 'usuario',
  rol: 'admin',
  nombre: 'Admin',
  email: 'admin@cesac.com',
};

describe('session: createSession / verifyToken', () => {
  it('firma y verifica un token preservando tipo y rol', async () => {
    const token = await createSession(adminData);
    const session = await verifyToken(token);
    expect(session).not.toBeNull();
    expect(session?.tipo).toBe('usuario');
    expect(session?.rol).toBe('admin');
    expect(session?.userId).toBe('u1');
  });

  it('verifyToken devuelve null con token indefinido', async () => {
    expect(await verifyToken(undefined)).toBeNull();
  });

  it('verifyToken devuelve null con token inválido/manipulado', async () => {
    const token = await createSession(adminData);
    const tampered = token.slice(0, -3) + 'abc';
    expect(await verifyToken(tampered)).toBeNull();
    expect(await verifyToken('no-es-un-jwt')).toBeNull();
  });

  it('conserva rol pasajero', async () => {
    const token = await createSession({ ...adminData, rol: 'pasajero' });
    const session = await verifyToken(token);
    expect(session?.rol).toBe('pasajero');
  });
});
