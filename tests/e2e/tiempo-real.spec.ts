import { test, expect } from '@playwright/test';
import { CREDS, loginApi } from './helpers';

/**
 * Valida el flujo de tiempo real chofer → usuario:
 *  - El chofer (Ricardo, vehículo en ruta Autopista Duarte) transmite GPS.
 *  - El pasajero de la MISMA ruta (Carmen) ve la nueva posición del bus.
 *  - Al "confirmar parada" (paradaActualId), el pasajero ve la parada actual.
 *
 * Usamos dos contextos de navegador independientes para no mezclar cookies.
 */
const PASAJERO_RUTA_DUARTE = {
  email: 'carmen.fernandez@empresa.com',
  password: 'password123',
};

test('el GPS del chofer se propaga al pasajero de su ruta', async ({ browser }) => {
  const choferCtx = await browser.newContext();
  const pasajeroCtx = await browser.newContext();

  try {
    // 1) Login de ambos
    await loginApi(choferCtx.request, CREDS.conductor); // Ricardo (vehículo en ruta Duarte)
    await loginApi(pasajeroCtx.request, PASAJERO_RUTA_DUARTE);

    // 2) El chofer obtiene su vehículo
    const meRes = await choferCtx.request.get('/api/conductores/me');
    expect(meRes.ok()).toBeTruthy();
    const me = await meRes.json();
    const vehiculoId = me.vehiculo?.id;
    expect(vehiculoId, 'el chofer debe tener vehículo asignado').toBeTruthy();

    // 3) El pasajero ve el bus de su ruta (estado inicial)
    const antesRes = await pasajeroCtx.request.get('/api/usuarios/me/vehiculos');
    expect(antesRes.ok()).toBeTruthy();
    const antes = await antesRes.json();
    const busAntes = antes.find((b: any) => b.id === vehiculoId);
    expect(busAntes, 'el pasajero debe ver el bus de su ruta').toBeTruthy();

    // 4) El chofer transmite una posición NUEVA y distinta
    const nuevaLat = 18.51234;
    const nuevaLng = -69.85678;
    const gpsRes = await choferCtx.request.patch(`/api/vehiculos/${vehiculoId}/gps`, {
      data: { latitud: nuevaLat, longitud: nuevaLng, velocidad: 40 },
    });
    expect(gpsRes.ok()).toBeTruthy();

    // 5) El pasajero consulta de nuevo y ve la posición actualizada
    const despuesRes = await pasajeroCtx.request.get('/api/usuarios/me/vehiculos');
    const despues = await despuesRes.json();
    const busDespues = despues.find((b: any) => b.id === vehiculoId);
    expect(busDespues.latitud).toBeCloseTo(nuevaLat, 4);
    expect(busDespues.longitud).toBeCloseTo(nuevaLng, 4);
  } finally {
    await choferCtx.close();
    await pasajeroCtx.close();
  }
});

test('al confirmar una parada, el pasajero ve la parada actual del bus', async ({ browser }) => {
  const choferCtx = await browser.newContext();
  const pasajeroCtx = await browser.newContext();

  try {
    await loginApi(choferCtx.request, CREDS.conductor);
    await loginApi(pasajeroCtx.request, PASAJERO_RUTA_DUARTE);

    const me = await (await choferCtx.request.get('/api/conductores/me')).json();
    const vehiculoId = me.vehiculo.id;

    // Tomar una parada real de la ruta del chofer
    const paradas = await (await choferCtx.request.get('/api/conductores/me/paradas')).json();
    expect(paradas.length).toBeGreaterThan(0);
    const parada = paradas[0];

    // El chofer "llega" a esa parada: envía GPS con paradaActualId
    const gpsRes = await choferCtx.request.patch(`/api/vehiculos/${vehiculoId}/gps`, {
      data: {
        latitud: parada.latitud,
        longitud: parada.longitud,
        paradaActualId: parada.id,
      },
    });
    expect(gpsRes.ok()).toBeTruthy();

    // El pasajero ve la parada actual reflejada
    const vehiculos = await (await pasajeroCtx.request.get('/api/usuarios/me/vehiculos')).json();
    const bus = vehiculos.find((b: any) => b.id === vehiculoId);
    expect(bus.paradaActual).toBe(parada.nombre);
  } finally {
    await choferCtx.close();
    await pasajeroCtx.close();
  }
});

test.describe('Estados de alerta (Retrasado/Dañado/911)', () => {
  test('una alerta del chofer se ve en el dashboard admin y en el usuario', async ({ browser }) => {
    const choferCtx = await browser.newContext();
    const adminCtx = await browser.newContext();
    const pasajeroCtx = await browser.newContext();

    try {
      await loginApi(choferCtx.request, CREDS.conductor);
      await loginApi(adminCtx.request, CREDS.admin);
      await loginApi(pasajeroCtx.request, PASAJERO_RUTA_DUARTE);

      const me = await (await choferCtx.request.get('/api/conductores/me')).json();
      const vehiculoId = me.vehiculo.id;

      // El chofer marca el bus como "Dañado"
      const patch = await choferCtx.request.patch(`/api/vehiculos/${vehiculoId}/estado`, {
        data: { estado: 'Dañado' },
      });
      expect(patch.ok()).toBeTruthy();

      // 1) El DASHBOARD admin ve el bus en alerta (antes desaparecía)
      const buses = await (await adminCtx.request.get('/api/dashboard/buses')).json();
      const busAdmin = buses.find((b: any) => b.id === vehiculoId);
      expect(busAdmin, 'el bus en alerta debe seguir visible en el dashboard').toBeTruthy();
      expect(busAdmin.estado).toBe('Dañado');

      // 2) Las MÉTRICAS del dashboard cuentan la alerta
      const stats = await (await adminCtx.request.get('/api/dashboard/stats')).json();
      expect(stats.busesEnAlerta).toBeGreaterThanOrEqual(1);
      expect(stats.alertasDesglose.Dañado).toBeGreaterThanOrEqual(1);

      // 3) El USUARIO de la ruta ve el estado de alerta del bus
      const vehiculos = await (await pasajeroCtx.request.get('/api/usuarios/me/vehiculos')).json();
      const busUsuario = vehiculos.find((b: any) => b.id === vehiculoId);
      expect(busUsuario.estado).toBe('Dañado');
    } finally {
      // Restaurar estado para no contaminar otras pruebas
      await choferCtx.request.patch(`/api/vehiculos/${(await (await choferCtx.request.get('/api/conductores/me')).json()).vehiculo.id}/estado`, {
        data: { estado: 'Operativo' },
      }).catch(() => {});
      await choferCtx.close();
      await adminCtx.close();
      await pasajeroCtx.close();
    }
  });

  test('una emergencia 911 marca hayEmergencia en el dashboard', async ({ browser }) => {
    const choferCtx = await browser.newContext();
    const adminCtx = await browser.newContext();

    try {
      await loginApi(choferCtx.request, CREDS.conductor);
      await loginApi(adminCtx.request, CREDS.admin);

      const me = await (await choferCtx.request.get('/api/conductores/me')).json();
      const vehiculoId = me.vehiculo.id;

      await choferCtx.request.patch(`/api/vehiculos/${vehiculoId}/estado`, {
        data: { estado: '911' },
      });

      const stats = await (await adminCtx.request.get('/api/dashboard/stats')).json();
      expect(stats.hayEmergencia).toBe(true);
      expect(stats.alertasDesglose['911']).toBeGreaterThanOrEqual(1);
    } finally {
      const me = await (await choferCtx.request.get('/api/conductores/me')).json();
      await choferCtx.request.patch(`/api/vehiculos/${me.vehiculo.id}/estado`, {
        data: { estado: 'Operativo' },
      }).catch(() => {});
      await choferCtx.close();
      await adminCtx.close();
    }
  });
});
