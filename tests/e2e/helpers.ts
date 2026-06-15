import { Page, APIRequestContext, expect } from '@playwright/test';
import path from 'path';

/** Carpeta base donde se guardan las capturas por categoría. */
const EVIDENCIA_DIR = path.join(process.cwd(), 'docs', 'e2e-evidencia');

/**
 * Navega a una ruta, espera a que cargue y guarda una captura nombrada en
 * docs/e2e-evidencia/<categoria>/screenshots/<orden>-<slug>.png
 */
export async function capturaPantalla(
  page: Page,
  categoria: 'admin' | 'choferes' | 'usuarios',
  orden: number,
  slug: string,
  ruta: string
) {
  // Las pantallas con mapa (Leaflet) y tiempo real (Socket.io/SSE) nunca quedan
  // "networkidle", por eso usamos domcontentloaded + una espera fija de render.
  await page.goto(ruta, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(2500);
  const num = String(orden).padStart(2, '0');
  const file = path.join(EVIDENCIA_DIR, categoria, 'screenshots', `${num}-${slug}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

/** Credenciales sembradas por prisma/seed.ts */
export const CREDS = {
  admin: { email: 'admin@cesac.com', password: 'admin123' },
  // password del pasajero = 'password123'
  pasajero: { email: 'maria.rodriguez@empresa.com', password: 'password123' },
  // password del conductor = su cédula. Usamos a Ricardo Peralta porque
  // TIENE vehículo y ruta asignados, así la vista-bus muestra la pantalla
  // operativa completa (no el estado "sin vehículo").
  conductor: { email: '001-8765432-1', password: '001-8765432-1' },
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
