import { test, expect } from '@playwright/test';
import { CREDS, loginApi, loginUi, capturaPantalla } from './helpers';

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

  // Recorrido visual de TODAS las pantallas del administrador.
  test('recorrido de pantallas del administrador', async ({ page }) => {
    test.setTimeout(180_000);
    // Login por UI para capturar también la pantalla de acceso.
    await page.goto('/');
    await capturaPantalla(page, 'admin', 0, 'login', '/');
    await loginApi(page.request, CREDS.admin);

    const pantallas: Array<[string, string]> = [
      ['panel-control-gps', '/dashboard'],
      ['solicitudes-y-paradas', '/dashboard/solicitudes'],
      ['gestion-rutas', '/dashboard/rutas'],
      ['gestion-usuarios', '/dashboard/usuarios'],
      ['choferes-y-vehiculos', '/dashboard/choferes-y-vehiculos'],
      ['horarios', '/dashboard/horarios'],
      ['reportes', '/dashboard/reportes'],
      ['configuracion', '/dashboard/configuracion'],
      ['data-master', '/dashboard/data-master'],
      ['data-master-conductores', '/dashboard/data-master/conductores'],
      ['data-master-vehiculos', '/dashboard/data-master/vehiculos'],
      ['data-master-rutas', '/dashboard/data-master/rutas'],
      ['data-master-rutas-especiales', '/dashboard/data-master/rutas-especiales'],
      ['data-master-estatus-vehiculo', '/dashboard/data-master/estatus-vehiculo'],
      ['perfil', '/dashboard/perfil'],
    ];

    for (let i = 0; i < pantallas.length; i++) {
      const [slug, ruta] = pantallas[i];
      await capturaPantalla(page, 'admin', i + 1, slug, ruta);
      // En cada pantalla del dashboard seguimos autenticados como admin.
      expect(page.url()).toContain('/dashboard');
    }
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
