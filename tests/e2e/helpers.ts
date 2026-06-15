import { Page, APIRequestContext, expect } from '@playwright/test';

/** Credenciales sembradas por prisma/seed.ts */
export const CREDS = {
  admin: { email: 'admin@cesac.com', password: 'admin123' },
  // password del pasajero = 'password123'
  pasajero: { email: 'maria.rodriguez@empresa.com', password: 'password123' },
  // password del conductor = su cédula
  conductor: { email: '001-1234567-8', password: '001-1234567-8' },
};

/**
 * Login por API. Para que la cookie quede disponible tanto en peticiones API
 * como en la navegación del navegador, pasa `page.request` (comparte el cookie
 * jar del contexto de la página).
 */
export async function loginApi(
  request: APIRequestContext,
  creds: { email: string; password: string }
) {
  const res = await request.post('/api/auth/login', { data: creds });
  expect(res.ok(), `login debería responder OK para ${creds.email}`).toBeTruthy();
  return res.json();
}

/** Login por la UI rellenando el formulario. */
export async function loginUi(page: Page, creds: { email: string; password: string }) {
  await page.goto('/');
  await page.locator('#email').fill(creds.email);
  await page.locator('#password').fill(creds.password);
  await page.getByRole('button', { name: /acceder/i }).first().click();
}
