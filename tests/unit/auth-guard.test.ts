import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SessionData } from '@/lib/session';

const getSessionMock = vi.fn<[], Promise<SessionData | null>>();

vi.mock('@/lib/session', () => ({
  getSession: () => getSessionMock(),
}));

import { requireAdmin, requireConductor, requireUsuario } from '@/lib/auth-guard';

const admin: SessionData = { userId: 'u1', tipo: 'usuario', rol: 'admin', nombre: 'A', email: 'a@x.com' };
const pasajero: SessionData = { userId: 'u2', tipo: 'usuario', rol: 'pasajero', nombre: 'P', email: 'p@x.com' };
const conductor: SessionData = { conductorId: 'c1', tipo: 'conductor', nombre: 'C', email: 'c@x.com' };

beforeEach(() => getSessionMock.mockReset());

describe('requireAdmin', () => {
  it('acepta a un admin', async () => {
    getSessionMock.mockResolvedValue(admin);
    const r = await requireAdmin();
    expect(r.session).toEqual(admin);
    expect(r.response).toBeUndefined();
  });

  it('rechaza a un pasajero con 403', async () => {
    getSessionMock.mockResolvedValue(pasajero);
    const r = await requireAdmin();
    expect(r.session).toBeUndefined();
    expect(r.response?.status).toBe(403);
  });

  it('rechaza a un conductor con 403', async () => {
    getSessionMock.mockResolvedValue(conductor);
    expect((await requireAdmin()).response?.status).toBe(403);
  });

  it('rechaza sin sesión con 401', async () => {
    getSessionMock.mockResolvedValue(null);
    expect((await requireAdmin()).response?.status).toBe(401);
  });
});

describe('requireConductor', () => {
  it('acepta a un conductor', async () => {
    getSessionMock.mockResolvedValue(conductor);
    expect((await requireConductor()).session).toEqual(conductor);
  });
  it('rechaza a un usuario con 403', async () => {
    getSessionMock.mockResolvedValue(admin);
    expect((await requireConductor()).response?.status).toBe(403);
  });
  it('rechaza sin sesión con 401', async () => {
    getSessionMock.mockResolvedValue(null);
    expect((await requireConductor()).response?.status).toBe(401);
  });
});

describe('requireUsuario', () => {
  it('acepta a un pasajero', async () => {
    getSessionMock.mockResolvedValue(pasajero);
    expect((await requireUsuario()).session).toEqual(pasajero);
  });
  it('acepta a un admin (también es usuario)', async () => {
    getSessionMock.mockResolvedValue(admin);
    expect((await requireUsuario()).session).toEqual(admin);
  });
  it('rechaza a un conductor con 403', async () => {
    getSessionMock.mockResolvedValue(conductor);
    expect((await requireUsuario()).response?.status).toBe(403);
  });
});
