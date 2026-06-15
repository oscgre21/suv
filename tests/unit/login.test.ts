import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';

// --- Mocks de infraestructura ---
const usuarioFindFirst = vi.fn();
const conductorFindFirst = vi.fn();
const createSession = vi.fn(async () => 'fake-token');
const setSessionCookie = vi.fn(async () => {});

vi.mock('@/lib/prisma', () => ({
  prisma: {
    usuario: { findFirst: (...a: any[]) => usuarioFindFirst(...a) },
    conductor: { findFirst: (...a: any[]) => conductorFindFirst(...a) },
  },
}));

vi.mock('@/lib/session', () => ({
  createSession: (...a: any[]) => createSession(...a),
  setSessionCookie: (...a: any[]) => setSessionCookie(...a),
}));

import { POST } from '@/app/api/auth/login/route';

function req(body: any) {
  return new Request('http://localhost/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  usuarioFindFirst.mockReset();
  conductorFindFirst.mockReset();
  createSession.mockClear();
  setSessionCookie.mockClear();
});

describe('login de usuario', () => {
  it('inicia sesión de admin con contraseña correcta e incluye rol', async () => {
    const hash = await bcrypt.hash('admin123', 10);
    usuarioFindFirst.mockResolvedValue({
      id: 'u1', nombre: 'Admin', email: 'admin@cesac.com',
      password: hash, rol: 'admin', rutaAsignada: null,
    });
    const res = await POST(req({ email: 'admin@cesac.com', password: 'admin123' }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.tipo).toBe('usuario');
    expect(json.usuario.rol).toBe('admin');
    // el rol llega al token
    expect(createSession).toHaveBeenCalledWith(expect.objectContaining({ rol: 'admin' }));
  });

  it('rechaza contraseña incorrecta', async () => {
    const hash = await bcrypt.hash('correcta', 10);
    usuarioFindFirst.mockResolvedValue({
      id: 'u1', nombre: 'P', email: 'p@x.com', password: hash, rol: 'pasajero', rutaAsignada: null,
    });
    conductorFindFirst.mockResolvedValue(null);
    const res = await POST(req({ email: 'p@x.com', password: 'mala' }));
    expect(res.status).toBe(401);
  });
});

describe('login de conductor (password = cédula)', () => {
  it('inicia sesión con la cédula como contraseña', async () => {
    const cedula = '001-1234567-8';
    const hash = await bcrypt.hash(cedula, 10);
    usuarioFindFirst.mockResolvedValue(null);
    conductorFindFirst.mockResolvedValue({
      id: 'c1', nombre: 'Conductor', email: 'c@cesac.com',
      password: hash, vehiculoId: 'v1', vehiculo: { rutaAsignada: 'r1' },
    });
    const res = await POST(req({ email: cedula, password: cedula }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.tipo).toBe('conductor');
    expect(createSession).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'conductor' }));
  });

  it('rechaza cédula/contraseña incorrecta', async () => {
    const hash = await bcrypt.hash('001-1234567-8', 10);
    usuarioFindFirst.mockResolvedValue(null);
    conductorFindFirst.mockResolvedValue({
      id: 'c1', nombre: 'C', email: 'c@x.com', password: hash, vehiculoId: null, vehiculo: null,
    });
    const res = await POST(req({ email: '001-1234567-8', password: 'otra' }));
    expect(res.status).toBe(401);
  });

  it('rechaza conductor sin contraseña configurada', async () => {
    usuarioFindFirst.mockResolvedValue(null);
    conductorFindFirst.mockResolvedValue({
      id: 'c1', nombre: 'C', email: 'c@x.com', password: null, vehiculoId: null, vehiculo: null,
    });
    const res = await POST(req({ email: 'c@x.com', password: 'loquesea' }));
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error).toMatch(/contraseña/i);
    // ya NO acepta cualquier contraseña
    expect(createSession).not.toHaveBeenCalled();
  });
});

describe('validación de entrada', () => {
  it('exige email y password', async () => {
    const res = await POST(req({ email: '', password: '' }));
    expect(res.status).toBe(400);
  });
});
