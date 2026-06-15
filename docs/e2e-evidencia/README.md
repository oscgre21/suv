# Evidencia de Pruebas E2E — Sistema CESAC

Documentación visual de las pruebas end-to-end (Playwright) de los **tres accesos** del sistema. Cada categoría incluye un **video del recorrido** y **capturas de todas las pantallas**.

> Generado automáticamente al ejecutar `npm run test:e2e`.
> Credenciales sembradas por `prisma/seed.ts` (ver `casos/HISTORIA-22`).

---

## Resultado de la corrida

**14 pruebas E2E — ✅ 14 pasaron** (3 proyectos: `admin`, `choferes`, `usuarios`).

Cada proyecto valida tanto el **control de acceso** (quién puede entrar a qué) como un **recorrido visual** de las pantallas de ese rol.

---

## Categorías

| Categoría | Rol | Documento | Video | Pantallas |
|-----------|-----|-----------|-------|-----------|
| 🛡️ Administrador | Gestiona la flota (`/dashboard`) | [pruebas-administrador.md](./admin/pruebas-administrador.md) | [recorrido-admin.webm](./admin/recorrido-admin.webm) | 16 |
| 🚍 Choferes | Operan su vehículo (`/vista-bus`) | [pruebas-choferes.md](./choferes/pruebas-choferes.md) | [recorrido-chofer.webm](./choferes/recorrido-chofer.webm) | 2 |
| 👤 Usuarios | Consultan su ruta y solicitan paradas (`/usuario`) | [pruebas-usuarios.md](./usuarios/pruebas-usuarios.md) | [recorrido-usuario.webm](./usuarios/recorrido-usuario.webm) | 5 |

---

## Cómo reproducir

```bash
# 1. Base de datos sembrada (admin, choferes con vehículo, pasajeros)
npm run prisma:seed

# 2. Ejecutar la suite E2E (levanta el dev server, graba video y capturas)
npm run test:e2e

# 3. Ver el reporte interactivo de Playwright
npx playwright show-report docs/e2e-evidencia/_report
```

Los videos se graban en `test-results/<categoria>/` y se copian a cada carpeta de evidencia; las capturas se guardan en `docs/e2e-evidencia/<categoria>/screenshots/`.
