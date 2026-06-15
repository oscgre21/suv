import { defineConfig, devices } from '@playwright/test';

/**
 * Config E2E. Asume:
 *  - PostgreSQL accesible vía DATABASE_URL (mismo que dev).
 *  - Seed ejecutado (`npm run prisma:seed`) para tener admin/pasajero/conductor.
 *
 * El servidor se levanta automáticamente con `npm run dev` (puerto 9002).
 * Para reutilizar un servidor ya iniciado, exporta PW_REUSE_SERVER=1.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:9002',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:9002',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
