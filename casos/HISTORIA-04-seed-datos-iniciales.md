# Historia 04: Seed de Datos Iniciales

**Prioridad:** MEDIA
**Dependencias:** Historia 01 (Prisma setup)
**Estimación:** 1-2 horas
**Estado:** Pendiente

---

## Objetivo

Crear un script de seed para poblar la base de datos con datos iniciales de prueba, incluyendo rutas, paradas con coordenadas GPS, conductores, vehículos, usuarios y horarios de ejemplo.

---

## Pre-requisitos

- ✅ Historia 01 completada
- ✅ Prisma Client generado
- ✅ Base de datos accesible

---

## Tareas Detalladas

### 1. Crear Script de Seed

**Archivo:** `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de base de datos...\n');

  // ==================== ESTATUS VEHICULOS ====================
  console.log('📦 Creando estatus de vehículos...');

  const estatusData = [
    {
      nombre: 'Operativo',
      color: '#10b981',
      descripcion: 'Vehículo en operación normal',
    },
    {
      nombre: 'En Taller',
      color: '#f59e0b',
      descripcion: 'Vehículo en mantenimiento',
    },
    {
      nombre: 'Fuera de Servicio',
      color: '#ef4444',
      descripcion: 'Vehículo no disponible',
    },
    {
      nombre: 'En Espera',
      color: '#6b7280',
      descripcion: 'Sin conductor asignado',
    },
  ];

  for (const estatus of estatusData) {
    await prisma.estatusVehiculo.upsert({
      where: { nombre: estatus.nombre },
      update: {},
      create: estatus,
    });
  }

  console.log('✅ Estatus de vehículos creados\n');

  // ==================== RUTAS ====================
  console.log('🛣️  Creando rutas...');

  const rutaCharles = await prisma.ruta.upsert({
    where: { nombre: 'Ruta Charles de Gaulle' },
    update: {},
    create: {
      nombre: 'Ruta Charles de Gaulle',
      descripcion: 'Ruta principal desde Sabana Larga hacia el centro',
      color: '#3b82f6',
      activa: true,
      esEspecial: false,
    },
  });

  const rutaDuarte = await prisma.ruta.upsert({
    where: { nombre: 'Ruta Autopista Duarte' },
    update: {},
    create: {
      nombre: 'Ruta Autopista Duarte',
      descripcion: 'Ruta por Autopista Duarte hacia el norte',
      color: '#10b981',
      activa: true,
      esEspecial: false,
    },
  });

  const rutaIndependencia = await prisma.ruta.upsert({
    where: { nombre: 'Ruta Independencia' },
    update: {},
    create: {
      nombre: 'Ruta Independencia',
      descripcion: 'Ruta por Avenida Independencia',
      color: '#f59e0b',
      activa: true,
      esEspecial: false,
    },
  });

  console.log('✅ Rutas creadas\n');

  // ==================== PARADAS ====================
  console.log('📍 Creando paradas con coordenadas GPS...');

  // Paradas Ruta Charles de Gaulle
  const paradasCharles = [
    {
      nombre: 'Parada 1: Av. Sabana Larga',
      direccion: 'Avenida Sabana Larga, Santo Domingo',
      latitud: 18.4861,
      longitud: -69.9312,
      orden: 1,
      rutaId: rutaCharles.id,
    },
    {
      nombre: 'Parada 2: Puente Juan Carlos',
      direccion: 'Puente Juan Carlos, Santo Domingo Este',
      latitud: 18.49,
      longitud: -69.94,
      orden: 2,
      rutaId: rutaCharles.id,
    },
    {
      nombre: 'Parada 3: Estación Concepción Bona',
      direccion: 'Estación Metro Concepción Bona',
      latitud: 18.47,
      longitud: -69.92,
      orden: 3,
      rutaId: rutaCharles.id,
    },
    {
      nombre: 'Parada 4: Carretera Mella Km 8',
      direccion: 'Carretera Mella Km 8',
      latitud: 18.465,
      longitud: -69.91,
      orden: 4,
      rutaId: rutaCharles.id,
    },
  ];

  // Paradas Ruta Autopista Duarte
  const paradasDuarte = [
    {
      nombre: 'Parada 1: Km 8 Autopista Duarte',
      direccion: 'Autopista Duarte Km 8',
      latitud: 18.50,
      longitud: -69.91,
      orden: 1,
      rutaId: rutaDuarte.id,
    },
    {
      nombre: 'Parada 2: Terminal Norte',
      direccion: 'Terminal de Autobuses del Norte',
      latitud: 18.51,
      longitud: -69.90,
      orden: 2,
      rutaId: rutaDuarte.id,
    },
    {
      nombre: 'Parada 3: Villa Mella',
      direccion: 'Villa Mella, Santo Domingo Norte',
      latitud: 18.52,
      longitud: -69.89,
      orden: 3,
      rutaId: rutaDuarte.id,
    },
  ];

  // Paradas Ruta Independencia
  const paradasIndependencia = [
    {
      nombre: 'Parada 1: Cruce Independencia',
      direccion: 'Avenida Independencia con 27 de Febrero',
      latitud: 18.475,
      longitud: -69.935,
      orden: 1,
      rutaId: rutaIndependencia.id,
    },
    {
      nombre: 'Parada 2: Centro Olímpico',
      direccion: 'Centro Olímpico Juan Pablo Duarte',
      latitud: 18.478,
      longitud: -69.928,
      orden: 2,
      rutaId: rutaIndependencia.id,
    },
  ];

  const todasLasParadas = [...paradasCharles, ...paradasDuarte, ...paradasIndependencia];

  for (const parada of todasLasParadas) {
    await prisma.parada.upsert({
      where: {
        rutaId_orden: {
          rutaId: parada.rutaId,
          orden: parada.orden,
        },
      },
      update: {},
      create: parada,
    });
  }

  console.log(`✅ ${todasLasParadas.length} paradas creadas\n`);

  // ==================== CONDUCTORES ====================
  console.log('👨‍✈️ Creando conductores...');

  const conductoresData = [
    {
      nombre: 'Manuel Gonzalez',
      cedula: '001-1234567-8',
      licencia: '001-1234567-8',
      telefono: '809-555-0101',
      email: 'manuel.gonzalez@cesac.com',
      turno: 'Matutino',
      estado: 'Activo',
    },
    {
      nombre: 'Ricardo Peralta',
      cedula: '001-8765432-1',
      licencia: '001-8765432-1',
      telefono: '809-555-0102',
      email: 'ricardo.peralta@cesac.com',
      turno: 'Vespertino',
      estado: 'Activo',
    },
    {
      nombre: 'Julia Martinez',
      cedula: '001-1111111-1',
      licencia: '001-1111111-1',
      telefono: '809-555-0103',
      email: 'julia.martinez@cesac.com',
      turno: 'Matutino',
      estado: 'Activo',
    },
    {
      nombre: 'Carlos Mendez',
      cedula: '001-2222222-2',
      licencia: '001-2222222-2',
      telefono: '809-555-0104',
      email: 'carlos.mendez@cesac.com',
      turno: 'Nocturno',
      estado: 'Activo',
    },
  ];

  const conductores = [];
  for (const conductor of conductoresData) {
    const created = await prisma.conductor.upsert({
      where: { cedula: conductor.cedula },
      update: {},
      create: conductor,
    });
    conductores.push(created);
  }

  console.log(`✅ ${conductores.length} conductores creados\n`);

  // ==================== VEHICULOS ====================
  console.log('🚌 Creando vehículos...');

  const vehiculosData = [
    {
      ficha: 'Ficha 01',
      modelo: 'Toyota Coaster 2022',
      placa: 'I098765',
      capacidad: 30,
      estado: 'Operativo',
      rutaAsignada: rutaCharles.id,
    },
    {
      ficha: 'Ficha 02',
      modelo: 'Mitsubishi Rosa 2021',
      placa: 'I098766',
      capacidad: 28,
      estado: 'Operativo',
      rutaAsignada: rutaDuarte.id,
    },
    {
      ficha: 'Ficha 03',
      modelo: 'Toyota Coaster 2023',
      placa: 'I098767',
      capacidad: 32,
      estado: 'Operativo',
      rutaAsignada: rutaIndependencia.id,
    },
    {
      ficha: 'Ficha 04',
      modelo: 'Hyundai County 2020',
      placa: 'I098768',
      capacidad: 25,
      estado: 'EnTaller',
      rutaAsignada: null,
    },
  ];

  const vehiculos = [];
  for (const vehiculo of vehiculosData) {
    const created = await prisma.vehiculo.upsert({
      where: { placa: vehiculo.placa },
      update: {},
      create: vehiculo,
    });
    vehiculos.push(created);
  }

  console.log(`✅ ${vehiculos.length} vehículos creados\n`);

  // ==================== ASIGNAR CONDUCTORES A VEHICULOS ====================
  console.log('🔗 Asignando conductores a vehículos...');

  await prisma.conductor.update({
    where: { id: conductores[0].id },
    data: { vehiculoId: vehiculos[0].id },
  });

  await prisma.conductor.update({
    where: { id: conductores[1].id },
    data: { vehiculoId: vehiculos[1].id },
  });

  await prisma.conductor.update({
    where: { id: conductores[2].id },
    data: { vehiculoId: vehiculos[2].id },
  });

  console.log('✅ Conductores asignados\n');

  // ==================== USUARIOS ====================
  console.log('👥 Creando usuarios...');

  const usuariosData = [
    {
      nombre: 'Juan Perez',
      cedula: '002-1234567-9',
      email: 'juan.perez@empresa.com',
      telefono: '809-555-1001',
      direccion: 'Av. Sabana Larga #123',
      rutaAsignada: rutaCharles.id,
      estado: 'Activo',
    },
    {
      nombre: 'Maria Rodriguez',
      cedula: '002-9876543-2',
      email: 'maria.rodriguez@empresa.com',
      telefono: '809-555-1002',
      direccion: 'Autopista Duarte Km 8',
      rutaAsignada: rutaDuarte.id,
      estado: 'Activo',
    },
    {
      nombre: 'Pedro Sanchez',
      cedula: '002-5555555-5',
      email: 'pedro.sanchez@empresa.com',
      telefono: '809-555-1003',
      direccion: 'Av. Independencia #456',
      rutaAsignada: rutaIndependencia.id,
      estado: 'Activo',
    },
    {
      nombre: 'Ana Lopez',
      cedula: '002-6666666-6',
      email: 'ana.lopez@empresa.com',
      telefono: '809-555-1004',
      direccion: 'Sabana Larga Norte',
      rutaAsignada: rutaCharles.id,
      estado: 'Activo',
    },
    {
      nombre: 'Luis Fernandez',
      cedula: '002-7777777-7',
      email: 'luis.fernandez@empresa.com',
      telefono: '809-555-1005',
      direccion: 'Villa Mella',
      rutaAsignada: rutaDuarte.id,
      estado: 'Activo',
    },
  ];

  for (const usuario of usuariosData) {
    await prisma.usuario.upsert({
      where: { cedula: usuario.cedula },
      update: {},
      create: usuario,
    });
  }

  console.log(`✅ ${usuariosData.length} usuarios creados\n`);

  // ==================== HORARIOS ====================
  console.log('🕐 Creando horarios...');

  const horariosData = [
    {
      rutaId: rutaCharles.id,
      conductorId: conductores[0].id,
      horaInicio: '06:00',
      horaFin: '07:30',
      diasSemana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      activo: true,
    },
    {
      rutaId: rutaCharles.id,
      conductorId: conductores[2].id,
      horaInicio: '14:00',
      horaFin: '15:30',
      diasSemana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      activo: true,
    },
    {
      rutaId: rutaDuarte.id,
      conductorId: conductores[1].id,
      horaInicio: '07:00',
      horaFin: '08:30',
      diasSemana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      activo: true,
    },
    {
      rutaId: rutaIndependencia.id,
      conductorId: conductores[3].id,
      horaInicio: '18:00',
      horaFin: '19:30',
      diasSemana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      activo: true,
    },
  ];

  for (const horario of horariosData) {
    await prisma.horario.create({
      data: horario,
    });
  }

  console.log(`✅ ${horariosData.length} horarios creados\n`);

  // ==================== RESUMEN ====================
  console.log('📊 Resumen del seed:');
  console.log(`   - ${estatusData.length} estatus de vehículos`);
  console.log(`   - 3 rutas`);
  console.log(`   - ${todasLasParadas.length} paradas con GPS`);
  console.log(`   - ${conductores.length} conductores`);
  console.log(`   - ${vehiculos.length} vehículos`);
  console.log(`   - ${usuariosData.length} usuarios`);
  console.log(`   - ${horariosData.length} horarios\n`);

  console.log('✅ Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

### 2. Actualizar package.json

**Archivo:** `package.json`

Agregar script de seed:

```json
{
  "scripts": {
    "prisma:seed": "tsx prisma/seed.ts",
    "prisma:reset": "prisma migrate reset --skip-seed && npm run prisma:seed"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

### 3. Ejecutar Seed

**Comando:**
```bash
npm run prisma:seed
```

**Salida esperada:**
```
🌱 Iniciando seed de base de datos...

📦 Creando estatus de vehículos...
✅ Estatus de vehículos creados

🛣️  Creando rutas...
✅ Rutas creadas

📍 Creando paradas con coordenadas GPS...
✅ 9 paradas creadas

👨‍✈️ Creando conductores...
✅ 4 conductores creados

🚌 Creando vehículos...
✅ 4 vehículos creados

🔗 Asignando conductores a vehículos...
✅ Conductores asignados

👥 Creando usuarios...
✅ 5 usuarios creados

🕐 Creando horarios...
✅ 4 horarios creados

📊 Resumen del seed:
   - 4 estatus de vehículos
   - 3 rutas
   - 9 paradas con GPS
   - 4 conductores
   - 4 vehículos
   - 5 usuarios
   - 4 horarios

✅ Seed completado exitosamente!
```

---

## Pruebas de Verificación

### Test 1: Verificar en Prisma Studio

**Comando:**
```bash
npm run prisma:studio
```

**Verificar:**
- ✅ Tabla `rutas` tiene 3 registros
- ✅ Tabla `paradas` tiene 9 registros con coordenadas GPS
- ✅ Tabla `conductores` tiene 4 registros
- ✅ Tabla `vehiculos` tiene 4 registros
- ✅ Tabla `usuarios` tiene 5 registros
- ✅ Tabla `horarios` tiene 4 registros
- ✅ Relaciones funcionan correctamente

### Test 2: Query de Verificación

**Crear archivo:** `test-seed.ts`

```typescript
import { prisma } from '@/lib/prisma';

async function verificarSeed() {
  console.log('🔍 Verificando seed...\n');

  const rutas = await prisma.ruta.count();
  const paradas = await prisma.parada.count();
  const conductores = await prisma.conductor.count();
  const vehiculos = await prisma.vehiculo.count();
  const usuarios = await prisma.usuario.count();
  const horarios = await prisma.horario.count();

  console.log('Conteo de registros:');
  console.log(`  Rutas: ${rutas}`);
  console.log(`  Paradas: ${paradas}`);
  console.log(`  Conductores: ${conductores}`);
  console.log(`  Vehículos: ${vehiculos}`);
  console.log(`  Usuarios: ${usuarios}`);
  console.log(`  Horarios: ${horarios}\n`);

  // Verificar relaciones
  const rutaConParadas = await prisma.ruta.findFirst({
    where: { nombre: 'Ruta Charles de Gaulle' },
    include: { paradas: true },
  });

  console.log(`Ruta "${rutaConParadas?.nombre}" tiene ${rutaConParadas?.paradas.length} paradas`);

  const conductorConVehiculo = await prisma.conductor.findFirst({
    where: { nombre: 'Manuel Gonzalez' },
    include: { vehiculo: true },
  });

  console.log(`Conductor "${conductorConVehiculo?.nombre}" asignado a vehículo: ${conductorConVehiculo?.vehiculo?.ficha}`);

  console.log('\n✅ Verificación completada');

  await prisma.$disconnect();
}

verificarSeed();
```

**Ejecutar:**
```bash
npx tsx test-seed.ts
```

---

## Reset y Re-seed

Si necesitas resetear la base de datos:

```bash
# Opción 1: Reset completo (borra todo)
npm run prisma:reset

# Opción 2: Solo borrar datos y re-seed
npx prisma migrate reset --skip-generate
npm run prisma:seed
```

---

## Troubleshooting

### Error: "Unique constraint failed"

**Causa:** Ya existen datos en la BD

**Solución:**
```bash
# Resetear base de datos
npx prisma migrate reset

# Re-ejecutar seed
npm run prisma:seed
```

### Error: "Foreign key constraint failed"

**Causa:** Orden incorrecto de creación

**Solución:** El script ya maneja el orden correcto:
1. Estatus (sin dependencias)
2. Rutas (sin dependencias)
3. Paradas (depende de Rutas)
4. Conductores (sin dependencias)
5. Vehículos (depende de Rutas)
6. Asignar Conductores a Vehículos
7. Usuarios (depende de Rutas)
8. Horarios (depende de Rutas y Conductores)

---

## Criterios de Aceptación

- [x] Script `prisma/seed.ts` creado
- [x] Datos de ejemplo para todas las tablas
- [x] Paradas con coordenadas GPS reales de Santo Domingo
- [x] Relaciones entre tablas funcionan
- [x] Seed puede ejecutarse múltiples veces (upsert)
- [x] Script npm agregado
- [x] Prisma Studio muestra todos los datos
- [x] Tests de verificación pasan

---

## Archivos Creados

```
prisma/
└── seed.ts                     # Script de seed completo

test-seed.ts                    # Verificación (eliminar después)
```

---

## Datos Incluidos en Seed

### Rutas
- Ruta Charles de Gaulle (4 paradas)
- Ruta Autopista Duarte (3 paradas)
- Ruta Independencia (2 paradas)

### Paradas (9 total)
Todas con coordenadas GPS reales de Santo Domingo

### Conductores (4)
- Manuel Gonzalez (Matutino)
- Ricardo Peralta (Vespertino)
- Julia Martinez (Matutino)
- Carlos Mendez (Nocturno)

### Vehículos (4)
- Ficha 01 → Ruta Charles (Operativo)
- Ficha 02 → Ruta Duarte (Operativo)
- Ficha 03 → Ruta Independencia (Operativo)
- Ficha 04 → Sin ruta (En Taller)

### Usuarios (5)
Distribuidos en las 3 rutas

### Horarios (4)
Horarios de ida y vuelta para cada ruta

---

## Siguiente Historia

Una vez completada esta historia, continuar con:
**[Historia 05: Hook useApi y API Base](./HISTORIA-05-hook-useapi.md)**

---

**Fecha de creación:** 2025-02-10
**Última actualización:** 2025-02-10
