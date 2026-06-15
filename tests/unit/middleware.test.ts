import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SessionData } from '@/lib/session';

const verifyToken = vi.fn<[string | undefined], Promise<SessionData | null>>();

vi.mock('@/lib/session', () => ({
  verifyToken: (t: string | undefined) => verifyToken(t),
}));

import { middleware } from '@/middleware';

const admin: SessionData = { userId: 'u1', tipo: 'usuario', rol: 'admin', nombre: 'A', email: 'a@x.com' };
const pasajero: SessionData = { userId: 'u2', tipo: 'usuario', rol: 'pasajero', nombre: 'P', email: 'p@x.com' };
const conductor: SessionData = { conductorId: 'c1', tipo: 'conductor', nombre: 'C', email: 'c@x.com' };

// Construye un NextRequest mínimo para el middleware.
function makeReq(pathname: string, hasCookie = true) {
  return {
    nextUrl: { pathname },
    url: `http://localhost:9002${pathname}`,
    cookies: { get: () => (hasCookie ? { value: 'tok' } : undefined) },
  } as any;
}

function redirectTarget(res: any): string | null {
  const loc = res.headers.get('location');
  return loc ? new URL(loc).pathname : null;
}

beforeEach(() => verifyToken.mockReset());

describe('middleware: /dashboard (solo admin)', () => {
  it('deja pasar al admin', async () => {
    verifyToken.mockResolvedValue(admin);
    const res = await middleware(makeReq('/dashboard'));
    expect(redirectTarget(res)).toBeNull(); // NextResponse.next() no redirige
  });

  it('redirige al pasajero a su home /usuario', async () => {
    verifyToken.mockResolvedValue(pasajero);
    const res = await middleware(makeReq('/dashboard'));
    expect(redirectTarget(res)).toBe('/usuario');
  });

  it('redirige al conductor a /vista-bus', async () => {
    verifyToken.mockResolvedValue(conductor);
    const res = await middleware(makeReq('/dashboard/usuarios'));
    expect(redirectTarget(res)).toBe('/vista-bus');
  });

  it('redirige a / sin sesión', async () => {
    verifyToken.mockResolvedValue(null);
    const res = await middleware(makeReq('/dashboard', false));
    expect(redirectTarget(res)).toBe('/');
  });
});

describe('middleware: /vista-bus (solo conductor)', () => {
  it('deja pasar al conductor', async () => {
    verifyToken.mockResolvedValue(conductor);
    expect(redirectTarget(await middleware(makeReq('/vista-bus')))).toBeNull();
  });
  it('redirige al pasajero', async () => {
    verifyToken.mockResolvedValue(pasajero);
    expect(redirectTarget(await middleware(makeReq('/vista-bus')))).toBe('/usuario');
  });
});

describe('middleware: /usuario (solo usuarios)', () => {
  it('deja pasar al pasajero', async () => {
    verifyToken.mockResolvedValue(pasajero);
    expect(redirectTarget(await middleware(makeReq('/usuario')))).toBeNull();
  });
  it('redirige al conductor', async () => {
    verifyToken.mockResolvedValue(conductor);
    expect(redirectTarget(await middleware(makeReq('/usuario')))).toBe('/vista-bus');
  });
});
