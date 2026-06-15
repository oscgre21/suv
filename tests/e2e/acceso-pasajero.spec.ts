import { test, expect } from '@playwright/test';
import { CREDS, loginApi } from './helpers';

test.describe('Acceso de pasajero', () => {
  test('el pasajero NO puede entrar a /dashboard (lo redirige)', async ({ page }) => {
    await loginApi(page.request, CREDS.pasajero);

    await page.goto('/dashboard');
    // El middleware lo manda a su home; nunca permanece en /dashboard
    await expect(page).not.toHaveURL(/\/dashboard/);
  });

  test('el pasajero NO puede entrar a /vista-bus', async ({ page }) => {
    await loginApi(page.request, CREDS.pasajero);
    await page.goto('/vista-bus');
    await expect(page).not.toHaveURL(/\/vista-bus/);
  });

  test('el pasajero NO puede usar endpoints de admin', async ({ page }) => {
    await loginApi(page.request, CREDS.pasajero);
    const stats = await page.request.get('/api/dashboard/stats');
    expect(stats.status()).toBe(403);
    const crear = await page.request.post('/api/usuarios', { data: {} });
    expect(crear.status()).toBe(403);
  });

  test('el pasajero solo ve paradas de su ruta', async ({ page }) => {
    await loginApi(page.request, CREDS.pasajero);
    const res = await page.request.get('/api/usuarios/me/paradas');
    expect(res.ok()).toBeTruthy();
    const paradas = await res.json();
    expect(Array.isArray(paradas)).toBeTruthy();
  });
});
