import { defineConfig, devices } from '@playwright/test';

/**
 * Config E2E con grabación de VIDEO y screenshots por pantalla.
 *
 * La salida se separa por categoría/rol en carpetas:
 *   - test-results/admin
 *   - test-results/choferes
 *   - test-results/usuarios
 *
 * Las capturas de cada pantalla se guardan en:
 *   - docs/e2e-evidencia/<categoria>/screenshots
 *
 * Requisitos:
 *   - PostgreSQL accesible vía DATABASE_URL (mismo que dev).
 *   - Seed ejecutado (`npm run prisma:seed`) para tener admin/pasajero/conductor.
 */

const viewport = { width: 1440, height: 900 };

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'docs/e2e-evidencia/_report' }]],
  use: {
    baseURL: 'http://localhost:9002',
    viewport,
    video: 'on',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'admin',
      testMatch: /acceso-admin\.spec\.ts/,
      outputDir: 'test-results/admin',
      use: { ...devices['Desktop Chrome'], viewport },
    },
    {
      name: 'choferes',
      testMatch: /acceso-conductor\.spec\.ts/,
      outputDir: 'test-results/choferes',
      use: { ...devices['Desktop Chrome'], viewport },
    },
    {
      name: 'usuarios',
      testMatch: /acceso-pasajero\.spec\.ts/,
      outputDir: 'test-results/usuarios',
      use: { ...devices['Desktop Chrome'], viewport },
    },
    {
      name: 'tiempo-real',
      testMatch: /tiempo-real\.spec\.ts/,
      outputDir: 'test-results/tiempo-real',
      use: { ...devices['Desktop Chrome'], viewport },
    },
    {
      name: 'evidencia',
      testMatch: /_evidencia-.*\.spec\.ts/,
      outputDir: 'test-results/evidencia',
      use: { ...devices['Desktop Chrome'], viewport },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:9002',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
