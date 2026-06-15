# Historia 22: Roles y Control de Acceso (Admin / Conductor / Pasajero)

**Prioridad:** CRÍTICA
**Dependencias:** Historia 01, Historia 10 (API Usuarios), Historia 06 (API Conductores)
**Estimación:** 4-6 horas
**Estado:** ✅ Completada

---

## Objetivo

Hacer cumplir la arquitectura de **tres accesos** que define el sistema, que estaba implementada solo a nivel de datos pero sin barreras reales de seguridad:

- **Administrador** → gestiona toda la flota desde `/dashboard`.
- **Conductor** → opera *su* vehículo y activa *su* ruta desde `/vista-bus`.
- **Usuario final (pasajero)** → solicita paradas de su ruta desde `/usuario`.

Antes de esta historia: no existía rol de admin (todo usuario logueado era admin de facto), el conductor entraba sin contraseña, el middleware solo comprobaba la existencia de la cookie, y los endpoints de gestión (`/api/dashboard/*` y los CRUD) eran públicos.

---

## Pre-requisitos

- ✅ Prisma configurado (Historia 01)
- ✅ Login con JWT en cookie httpOnly (`src/lib/session.ts`, `src/app/api/auth/login/route.ts`)
- ✅ API de Usuarios y Conductores (Historias 06 y 10)

---

## Tareas Detalladas

### 1. Modelo de datos

**Archivo:** `prisma/schema.prisma`

- `Usuario`: nuevo campo `rol String @default("pasajero")` (valores `admin` | `pasajero`).
- `Conductor`: nuevo campo `password String?` (hash bcrypt; clave inicial = cédula).

Migración: `npx prisma migrate dev --name roles-y-password-conductor`.

**Seed** (`prisma/seed.ts`):
- 1 usuario administrador: `admin@cesac.com` / `admin123` (`rol: 'admin'`).
- Los 4 usuarios pasajero marcados con `rol: 'pasajero'`.
- Cada conductor con `password = bcrypt.hash(cedula, 10)` → inician sesión con su cédula.

### 2. Sesión y JWT

**Archivo:** `src/lib/session.ts`

- `SessionData` extendido con `rol?: 'admin' | 'pasajero'` (solo para `tipo === 'usuario'`).
- Nuevo `verifyToken(token)` **edge-safe** (verifica el JWT sobre el string de la cookie con `jose`, sin `next/headers`), reutilizado por el middleware. `getSession()` delega en él.

### 3. Login

**Archivo:** `src/app/api/auth/login/route.ts`

- El identificador acepta **correo o cédula** (`OR: [{ email }, { cedula }]`).
- Usuario: se incluye `rol` en el JWT.
- Conductor: **se valida la contraseña con `bcrypt.compare`** (se eliminó el bypass "acepta cualquier password"); si no tiene contraseña configurada se rechaza con mensaje claro.

### 4. Middleware por rol

**Archivo:** `src/middleware.ts`

- Decodifica el JWT con `verifyToken` y aplica reglas por prefijo:
  - `/dashboard/*` → `tipo === 'usuario' && rol === 'admin'`.
  - `/vista-bus/*` → `tipo === 'conductor'`.
  - `/usuario/*` → `tipo === 'usuario'` (antes no estaba protegido).
- Sin sesión → `/`; con sesión de otro rol → su home correspondiente (`homeFor`).
- `matcher` ampliado a `/usuario/:path*`.

### 5. Guard de API reutilizable

**Archivo:** `src/lib/auth-guard.ts` (nuevo)

- `requireAdmin()`, `requireConductor()`, `requireUsuario()` → devuelven `{ session }` o `{ response }` (401/403).

**Endpoints protegidos con `requireAdmin()`:**
- `src/app/api/dashboard/*` (stats, buses, gps, route-usage).
- CRUD de gestión (GET/POST/PATCH/DELETE) de: `usuarios`, `conductores`, `vehiculos`, `rutas`, `paradas`, `horarios`, `estatus-vehiculo`, `solicitudes`.

**Excepción:** `DELETE /api/solicitudes/[id]` usa autorización mixta — **admin o el pasajero dueño** de la solicitud (para permitir que el pasajero cancele la suya).

Los endpoints `/me/*` siguen validando su propio tipo y no se tocan.

### 6. Frontend

**Archivo:** `src/contexts/auth-context.tsx`
- El contexto expone `tipo`, `rol` y los derivados `isAdmin`, `isConductor`, `isPasajero`.

**Archivo:** `src/app/dashboard/layout.tsx`
- Defensa en profundidad: si `!isAdmin`, redirige a `/` (además del middleware).

---

## Criterios de Aceptación

- [x] El modelo `Usuario` tiene `rol` y `Conductor` tiene `password`.
- [x] El seed crea un admin y asigna contraseña (cédula) a cada conductor.
- [x] Un **pasajero** NO puede entrar a `/dashboard` ni a `/vista-bus` (redirige).
- [x] Un **conductor** entra con su cédula como contraseña; con cédula errónea, falla.
- [x] `/api/dashboard/*` y los CRUD de gestión responden 401/403 sin sesión de admin.
- [x] El pasajero sigue pudiendo cancelar su propia solicitud (`DELETE /api/solicitudes/[id]`).
- [x] El frontend conoce el rol (`isAdmin`/`isConductor`/`isPasajero`).

---

## Pruebas de Verificación

```bash
# Sin sesión → 401/403
curl -i http://localhost:9002/api/dashboard/stats
curl -i -X POST http://localhost:9002/api/usuarios -d '{}'

# Login admin
curl -i -X POST http://localhost:9002/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@cesac.com","password":"admin123"}'

# Login conductor con su cédula
curl -i -X POST http://localhost:9002/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"001-1234567-8","password":"001-1234567-8"}'
```

Tests automatizados: ver Historia 21 (suite Vitest + Playwright).

---

## Archivos Creados / Modificados

**Creados:**
- `src/lib/auth-guard.ts`
- `casos/HISTORIA-22-roles-y-control-de-acceso.md`

**Modificados:**
- `prisma/schema.prisma`, `prisma/seed.ts` (+ migración)
- `src/lib/session.ts`
- `src/middleware.ts`
- `src/app/api/auth/login/route.ts`, `src/app/api/auth/session/route.ts`
- `src/app/api/dashboard/*/route.ts`
- CRUD: `src/app/api/{usuarios,conductores,vehiculos,rutas,paradas,horarios,estatus-vehiculo,solicitudes}/route.ts` y `[id]/route.ts`
- `src/contexts/auth-context.tsx`, `src/app/dashboard/layout.tsx`

---

## Notas / Riesgos

- **Edge runtime:** el middleware no puede usar `getSession()` (depende de `next/headers`); por eso existe `verifyToken`.
- **Compatibilidad:** los conductores creados antes de la migración quedan sin contraseña hasta re-ejecutar el seed; el login los rechaza. Re-seed asigna la cédula como clave inicial.
- **Cambio de comportamiento:** tras esta historia, los pasajeros pierden el acceso a `/dashboard` (intencional). Asegurar que exista al menos un usuario admin antes de desplegar.
