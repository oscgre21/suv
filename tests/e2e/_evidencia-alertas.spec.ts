import { test } from '@playwright/test';
import { CREDS, loginApi } from './helpers';
import path from 'path';

// Captura de evidencia: el dashboard admin con una alerta 911 activa.
test('evidencia: dashboard admin con alerta 911', async ({ browser }) => {
  const chofer = await browser.newContext();
  const admin = await browser.newContext();
  const adminPage = await admin.newPage();

  try {
    await loginApi(chofer.request, CREDS.conductor);
    await loginApi(admin.request, CREDS.admin);

    const me = await (await chofer.request.get('/api/conductores/me')).json();
    const vehiculoId = me.vehiculo.id;

    // Provocar una emergencia
    await chofer.request.patch(`/api/vehiculos/${vehiculoId}/estado`, { data: { estado: '911' } });

    await adminPage.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await adminPage.waitForTimeout(3000);
    await adminPage.screenshot({
      path: path.join(process.cwd(), 'docs', 'e2e-evidencia', 'admin', 'screenshots', '16-alerta-911.png'),
      fullPage: true,
    });
  } finally {
    const me = await (await chofer.request.get('/api/conductores/me')).json();
    await chofer.request.patch(`/api/vehiculos/${me.vehiculo.id}/estado`, { data: { estado: 'Operativo' } }).catch(() => {});
    await adminPage.close();
    await chofer.close();
    await admin.close();
  }
});
