import { test, expect } from '@playwright/test';
import { CREDS, loginApi } from './helpers';

test.describe('Acceso de administrador', () => {
  test('el admin entra a /dashboard y los endpoints de gestión responden', async ({ page }) => {
    // page.request comparte el cookie jar del navegador
    await loginApi(page.request, CREDS.admin);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    // Endpoints admin-only accesibles con su sesión
    const stats = await page.request.get('/api/dashboard/stats');
    expect(stats.ok()).toBeTruthy();

    const usuarios = await page.request.get('/api/usuarios');
    expect(usuarios.ok()).toBeTruthy();
  });
});

test.describe('Endpoints protegidos sin sesión', () => {
  test('responden 401/403 sin autenticación', async ({ request }) => {
    const stats = await request.get('/api/dashboard/stats');
    expect([401, 403]).toContain(stats.status());

    const crear = await request.post('/api/usuarios', { data: {} });
    expect([401, 403]).toContain(crear.status());
  });
});
