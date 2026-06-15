import { test, expect } from '@playwright/test';
import { CREDS, loginApi } from './helpers';

test.describe('Acceso de conductor', () => {
  test('el conductor inicia sesión con su cédula como contraseña', async ({ page }) => {
    const json = await loginApi(page.request, CREDS.conductor);
    expect(json.tipo).toBe('conductor');
  });

  test('cédula correcta pero contraseña errónea es rechazada', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { email: CREDS.conductor.email, password: 'incorrecta' },
    });
    expect(res.status()).toBe(401);
  });

  test('el conductor entra a /vista-bus', async ({ page }) => {
    await loginApi(page.request, CREDS.conductor);
    await page.goto('/vista-bus');
    await expect(page).toHaveURL(/\/vista-bus/);
  });

  test('el conductor NO puede entrar a /dashboard', async ({ page }) => {
    await loginApi(page.request, CREDS.conductor);
    await page.goto('/dashboard');
    await expect(page).not.toHaveURL(/\/dashboard/);
  });

  test('el conductor obtiene sus datos en /api/conductores/me', async ({ page }) => {
    await loginApi(page.request, CREDS.conductor);
    const res = await page.request.get('/api/conductores/me');
    expect(res.ok()).toBeTruthy();
  });
});
