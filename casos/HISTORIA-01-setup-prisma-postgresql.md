# Historia 01: Setup de Prisma con PostgreSQL

**Prioridad:** CRÍTICA
**Dependencias:** Ninguna
**Estimación:** 2-3 horas
**Estado:** Pendiente

---

## Objetivo

Instalar y configurar Prisma ORM para conectar con la base de datos PostgreSQL existente, crear el esquema completo de todas las entidades del sistema y ejecutar la migración inicial.

---

## Pre-requisitos

- ✅ PostgreSQL configurado en `manager.oscgre.com:5432`
- ✅ Base de datos `suv_db` creada
- ✅ Variable `DATABASE_URL` en `.env`
- ✅ Next.js 15 + TypeScript funcionando

---

## Tareas Detalladas

### 1. Instalar Dependencias de Prisma

**Comando:**
```bash
npm install @prisma/client
npm install -D prisma tsx
```

**Verificación:**
```bash
npx prisma --version
```

**Resultado esperado:**
```
prisma                  : 5.x.x
@prisma/client          : 5.x.x
```

---

### 2. Inicializar Prisma

**Comando:**
```bash
npx prisma init
```

**Archivos creados:**
- `prisma/schema.prisma` (base)
- `.env` (ya existe, no sobrescribir)

**Verificar `.env`:**
```bash
DATABASE_URL=postgresql://dgii_oscgre:dgii_oscgre@manager.oscgre.com:5432/suv_db?schema=public
```

---

### 3. Crear Schema Completo

**Archivo:** `prisma/schema.prisma`

**Contenido completo:**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== USUARIOS ====================
model Usuario {
  id              String   @id @default(cuid())
  nombre          String
  cedula          String   @unique
  email           String   @unique
  telefono        String?
  direccion       String?
  rutaAsignada    String?
  ruta            Ruta?    @relation(fields: [rutaAsignada], references: [id])
  estado          String   @default("Activo") // Activo | Inactivo
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  solicitudes     SolicitudParada[]
  historialViajes HistorialViaje[]

  @@map("usuarios")
}

// ==================== CONDUCTORES ====================
model Conductor {
  id              String   @id @default(cuid())
  nombre          String
  cedula          String   @unique
  licencia        String   @unique
  telefono        String
  email           String?
  turno           String   // Matutino | Vespertino | Nocturno
  estado          String   @default("Activo") // Activo | Vacaciones | Inactivo
  fechaIngreso    DateTime @default(now())
  vehiculoId      String?  @unique
  vehiculo        Vehiculo? @relation(fields: [vehiculoId], references: [id])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  horarios        Horario[]
  historialViajes HistorialViaje[]

  @@map("conductores")
}

// ==================== VEHICULOS ====================
model Vehiculo {
  id              String   @id @default(cuid())
  ficha           String   @unique
  modelo          String
  placa           String   @unique
  capacidad       Int
  estado          String   @default("Operativo") // Operativo | EnTaller | FueraDeServicio
  rutaAsignada    String?
  ruta            Ruta?    @relation(fields: [rutaAsignada], references: [id])
  conductor       Conductor?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  historialViajes HistorialViaje[]

  @@map("vehiculos")
}

// ==================== RUTAS ====================
model Ruta {
  id                String   @id @default(cuid())
  nombre            String   @unique
  descripcion       String?
  color             String   @default("#3b82f6") // Para visualización en mapa
  activa            Boolean  @default(true)
  esEspecial        Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  paradas           Parada[]
  horarios          Horario[]
  vehiculos         Vehiculo[]
  usuarios          Usuario[]
  solicitudes       SolicitudParada[]
  historialViajes   HistorialViaje[]

  @@map("rutas")
}

// ==================== PARADAS ====================
model Parada {
  id              String   @id @default(cuid())
  nombre          String
  direccion       String
  latitud         Float
  longitud        Float
  orden           Int      // Orden en la ruta (1, 2, 3...)
  rutaId          String
  ruta            Ruta     @relation(fields: [rutaId], references: [id], onDelete: Cascade)
  activa          Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  solicitudes     SolicitudParada[]

  @@unique([rutaId, orden])
  @@index([rutaId])
  @@map("paradas")
}

// ==================== HORARIOS ====================
model Horario {
  id              String   @id @default(cuid())
  rutaId          String
  ruta            Ruta     @relation(fields: [rutaId], references: [id], onDelete: Cascade)
  conductorId     String
  conductor       Conductor @relation(fields: [conductorId], references: [id])
  horaInicio      String   // "06:00"
  horaFin         String   // "07:30"
  diasSemana      String[] // ["Lunes", "Martes", ...]
  activo          Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([rutaId])
  @@index([conductorId])
  @@map("horarios")
}

// ==================== SOLICITUDES DE PARADAS ====================
model SolicitudParada {
  id              String   @id @default(cuid())
  usuarioId       String
  usuario         Usuario  @relation(fields: [usuarioId], references: [id])
  paradaId        String
  parada          Parada   @relation(fields: [paradaId], references: [id])
  rutaId          String
  ruta            Ruta     @relation(fields: [rutaId], references: [id])
  horaSolicitud   DateTime @default(now())
  estado          String   @default("Pendiente") // Pendiente | Confirmado | NoRecogido | Cancelado
  notificado      Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([usuarioId])
  @@index([paradaId])
  @@index([rutaId])
  @@map("solicitudes_paradas")
}

// ==================== HISTORIAL DE VIAJES ====================
model HistorialViaje {
  id              String   @id @default(cuid())
  rutaId          String
  ruta            Ruta     @relation(fields: [rutaId], references: [id])
  vehiculoId      String
  vehiculo        Vehiculo @relation(fields: [vehiculoId], references: [id])
  conductorId     String
  conductor       Conductor @relation(fields: [conductorId], references: [id])
  usuarioId       String?
  usuario         Usuario? @relation(fields: [usuarioId], references: [id])
  fechaInicio     DateTime
  fechaFin        DateTime?
  duracionMinutos Int?
  pasajeros       Int      @default(0)
  paradasConfirmadas Int   @default(0)
  estado          String   // Completado | EnCurso | Cancelado
  calificacion    Int?     // 1-5 estrellas
  comentarios     String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([rutaId])
  @@index([vehiculoId])
  @@index([conductorId])
  @@index([usuarioId])
  @@map("historial_viajes")
}

// ==================== ESTATUS VEHICULO (Catalogo) ====================
model EstatusVehiculo {
  id              String   @id @default(cuid())
  nombre          String   @unique
  color           String   // Color para UI
  descripcion     String?
  activo          Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("estatus_vehiculos")
}
```

**Explicación del Schema:**

1. **@map("tabla")**: Define el nombre de la tabla en PostgreSQL
2. **@unique**: Garantiza valores únicos (cédula, email, placa)
3. **@index**: Mejora performance en búsquedas frecuentes
4. **onDelete: Cascade**: Elimina registros relacionados automáticamente
5. **relaciones**: Usa foreign keys para mantener integridad referencial

---

### 4. Crear Helper de Prisma

**Archivo:** `src/lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Por qué este patrón:**
- Evita múltiples instancias de PrismaClient en desarrollo
- Logs solo en development para debugging
- Singleton pattern para producción

---

### 5. Ejecutar Migración Inicial

**Comando:**
```bash
npx prisma migrate dev --name init
```

**Proceso:**
1. Prisma lee el schema
2. Genera SQL para crear tablas
3. Ejecuta SQL en PostgreSQL
4. Crea archivo de migración en `prisma/migrations/`
5. Genera Prisma Client

**Salida esperada:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "suv_db", schema "public"

Applying migration `20250210_init`

The following migration(s) have been created and applied:

migrations/
  └─ 20250210_init/
    └─ migration.sql

✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client
```

---

### 6. Generar Prisma Client

**Comando:**
```bash
npx prisma generate
```

**Resultado:**
- Genera tipos TypeScript en `node_modules/@prisma/client`
- Permite importar tipos: `import { Usuario, Conductor } from '@prisma/client'`

---

### 7. Verificar Conexión con Prisma Studio

**Comando:**
```bash
npx prisma studio
```

**Resultado esperado:**
- Abre navegador en `http://localhost:5555`
- Muestra todas las tablas creadas
- Permite ver/editar datos visualmente

**Verificar:**
- ✅ Tabla `usuarios` existe
- ✅ Tabla `conductores` existe
- ✅ Tabla `vehiculos` existe
- ✅ Tabla `rutas` existe
- ✅ Tabla `paradas` existe
- ✅ Tabla `horarios` existe
- ✅ Tabla `solicitudes_paradas` existe
- ✅ Tabla `historial_viajes` existe
- ✅ Tabla `estatus_vehiculos` existe

---

### 8. Agregar Scripts a package.json

**Archivo:** `package.json`

Agregar en la sección `"scripts"`:

```json
{
  "scripts": {
    "dev": "next dev --port 9002",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "tsx prisma/seed.ts",
    "prisma:reset": "prisma migrate reset",
    "genkit:dev": "genkit start -- tsx --watch ai/genkit.ts",
    "genkit:watch": "genkit start -- tsx --watch ai/genkit.ts"
  }
}
```

---

## Pruebas de Verificación

### Test 1: Verificar Tipos Generados

**Crear archivo de prueba:** `test-prisma.ts`

```typescript
import { prisma } from '@/lib/prisma';

async function testConnection() {
  try {
    // Test: Contar usuarios
    const userCount = await prisma.usuario.count();
    console.log('✅ Conexión exitosa. Usuarios:', userCount);

    // Test: Verificar todas las tablas
    const tables = [
      prisma.usuario.count(),
      prisma.conductor.count(),
      prisma.vehiculo.count(),
      prisma.ruta.count(),
      prisma.parada.count(),
      prisma.horario.count(),
      prisma.solicitudParada.count(),
      prisma.historialViaje.count(),
      prisma.estatusVehiculo.count(),
    ];

    const results = await Promise.all(tables);
    console.log('✅ Todas las tablas accesibles:', results);

  } catch (error) {
    console.error('❌ Error de conexión:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

**Ejecutar:**
```bash
npx tsx test-prisma.ts
```

**Resultado esperado:**
```
✅ Conexión exitosa. Usuarios: 0
✅ Todas las tablas accesibles: [0, 0, 0, 0, 0, 0, 0, 0, 0]
```

### Test 2: Crear y Leer Registro

```typescript
import { prisma } from '@/lib/prisma';

async function testCRUD() {
  try {
    // Crear estatus de vehículo
    const estatus = await prisma.estatusVehiculo.create({
      data: {
        nombre: 'Test Operativo',
        color: '#10b981',
        descripcion: 'Estado de prueba'
      }
    });

    console.log('✅ Registro creado:', estatus);

    // Leer
    const encontrado = await prisma.estatusVehiculo.findUnique({
      where: { id: estatus.id }
    });

    console.log('✅ Registro leído:', encontrado);

    // Eliminar
    await prisma.estatusVehiculo.delete({
      where: { id: estatus.id }
    });

    console.log('✅ Registro eliminado');

  } catch (error) {
    console.error('❌ Error en CRUD:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCRUD();
```

---

## Troubleshooting

### Error: "Can't reach database server"

**Solución:**
```bash
# Verificar que la IP es accesible
ping manager.oscgre.com

# Verificar puerto PostgreSQL
nc -zv manager.oscgre.com 5432

# Verificar credenciales
psql "postgresql://dgii_oscgre:dgii_oscgre@manager.oscgre.com:5432/suv_db"
```

### Error: "Schema.prisma validation error"

**Solución:**
```bash
# Verificar sintaxis
npx prisma validate

# Formatear schema
npx prisma format
```

### Error: "Module not found: @prisma/client"

**Solución:**
```bash
# Reinstalar
npm install @prisma/client
npx prisma generate
```

---

## Criterios de Aceptación

- [x] Prisma instalado correctamente
- [x] Schema completo con 9 modelos creados
- [x] Migración ejecutada sin errores
- [x] Prisma Client generado
- [x] Helper `prisma.ts` funcional
- [x] Prisma Studio muestra todas las tablas
- [x] Tests de conexión pasan exitosamente
- [x] Scripts npm agregados

---

## Archivos Creados

```
prisma/
├── schema.prisma         # Schema completo de BD
└── migrations/
    └── 20250210_init/
        └── migration.sql # SQL generado

src/lib/
└── prisma.ts            # Helper de conexión

test-prisma.ts           # Tests de verificación (opcional, eliminar después)
```

---

## Siguiente Historia

Una vez completada esta historia, continuar con:
**[Historia 02: Setup Google Maps API](./HISTORIA-02-setup-google-maps.md)**

---

**Fecha de creación:** 2025-02-10
**Última actualización:** 2025-02-10
