# Historia 09: API Routes - Paradas

**Prioridad:** ALTA
**Dependencias:** Historia 01, Historia 02, Historia 03, Historia 05, Historia 08
**Estimación:** 3-4 horas
**Estado:** Pendiente

---

## Objetivo

Implementar todas las API Routes para el módulo de Paradas, incluyendo integración con Google Maps geocoding, gestión de orden dentro de rutas, validación de coordenadas GPS, y manejo de paradas activas/inactivas.

---

## Pre-requisitos

- ✅ Prisma configurado (Historia 01)
- ✅ Google Maps API configurada (Historia 02)
- ✅ Schema Parada en base de datos
- ✅ Zod schemas creados (Historia 03)
- ✅ Hook useApi implementado (Historia 05)
- ✅ API de Rutas implementada (Historia 08)

---

## Tareas Detalladas

### 1. Crear API Route Principal - Paradas

**Archivo:** `src/app/api/paradas/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paradaSchema } from '@/lib/validations';
import { handlePrismaError } from '@/lib/api-utils';
import { geocodeAddress, reverseGeocode } from '@/lib/google-maps';
import { z } from 'zod';

// GET /api/paradas - Listar todas las paradas con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const rutaId = searchParams.get('rutaId');
    const activa = searchParams.get('activa');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const where: any = {};

    if (rutaId) {
      where.rutaId = rutaId;
    }

    if (activa !== null) {
      where.activa = activa === 'true';
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { direccion: { contains: search, mode: 'insensitive' } },
      ];
    }

    const paradas = await prisma.parada.findMany({
      where,
      include: {
        ruta: {
          select: {
            id: true,
            nombre: true,
            color: true,
            activa: true,
          },
        },
        solicitudes: {
          where: {
            estado: 'Pendiente',
          },
          select: {
            id: true,
            estado: true,
            usuario: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: [
        { rutaId: 'asc' },
        { orden: 'asc' },
      ],
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) }),
    });

    return NextResponse.json(paradas);
  } catch (error) {
    console.error('Error fetching paradas:', error);
    return NextResponse.json(
      { error: 'Error al obtener paradas' },
      { status: 500 }
    );
  }
}

// POST /api/paradas - Crear nueva parada
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar con Zod
    const validatedData = paradaSchema.parse(body);

    // Verificar que la ruta existe
    const ruta = await prisma.ruta.findUnique({
      where: { id: validatedData.rutaId },
    });

    if (!ruta) {
      return NextResponse.json(
        { error: 'Ruta no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que no exista parada con mismo orden en la misma ruta
    const existingParada = await prisma.parada.findFirst({
      where: {
        rutaId: validatedData.rutaId,
        orden: validatedData.orden,
      },
    });

    if (existingParada) {
      return NextResponse.json(
        { error: `Ya existe una parada con orden ${validatedData.orden} en esta ruta` },
        { status: 400 }
      );
    }

    // Si no se proporcionaron coordenadas, intentar geocodificar la dirección
    let latitud = validatedData.latitud;
    let longitud = validatedData.longitud;
    let direccionFinal = validatedData.direccion;

    if (!latitud || !longitud || latitud === 0 || longitud === 0) {
      const coords = await geocodeAddress(validatedData.direccion);
      if (coords) {
        latitud = coords.lat;
        longitud = coords.lng;
      } else {
        return NextResponse.json(
          { error: 'No se pudieron obtener las coordenadas. Proporciona coordenadas manualmente.' },
          { status: 400 }
        );
      }
    }

    // Si se proporcionaron coordenadas pero no dirección completa, hacer reverse geocoding
    if (!direccionFinal || direccionFinal.length < 10) {
      const address = await reverseGeocode(latitud, longitud);
      if (address) {
        direccionFinal = address;
      }
    }

    // Crear parada
    const parada = await prisma.parada.create({
      data: {
        nombre: validatedData.nombre,
        direccion: direccionFinal,
        latitud,
        longitud,
        orden: validatedData.orden,
        activa: validatedData.activa,
        ruta: {
          connect: { id: validatedData.rutaId },
        },
      },
      include: {
        ruta: {
          select: {
            id: true,
            nombre: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json(parada, { status: 201 });
  } catch (error: any) {
    console.error('Error creating parada:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de validación inválidos', details: error.errors },
        { status: 400 }
      );
    }

    if (error.code?.startsWith('P')) {
      return NextResponse.json(
        { error: handlePrismaError(error) },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear parada' },
      { status: 500 }
    );
  }
}
```

---

### 2. Crear API Route por ID - Paradas

**Archivo:** `src/app/api/paradas/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paradaSchema } from '@/lib/validations';
import { handlePrismaError } from '@/lib/api-utils';
import { geocodeAddress, reverseGeocode } from '@/lib/google-maps';
import { z } from 'zod';

// GET /api/paradas/[id] - Obtener parada por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const parada = await prisma.parada.findUnique({
      where: { id: params.id },
      include: {
        ruta: {
          include: {
            paradas: {
              where: { activa: true },
              orderBy: { orden: 'asc' },
              select: {
                id: true,
                nombre: true,
                orden: true,
                latitud: true,
                longitud: true,
              },
            },
          },
        },
        solicitudes: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true,
                telefono: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!parada) {
      return NextResponse.json(
        { error: 'Parada no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(parada);
  } catch (error) {
    console.error('Error fetching parada:', error);
    return NextResponse.json(
      { error: 'Error al obtener parada' },
      { status: 500 }
    );
  }
}

// PATCH /api/paradas/[id] - Actualizar parada
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validación parcial
    const partialSchema = paradaSchema.partial();
    const validatedData = partialSchema.parse(body);

    // Verificar que la parada existe
    const existingParada = await prisma.parada.findUnique({
      where: { id: params.id },
    });

    if (!existingParada) {
      return NextResponse.json(
        { error: 'Parada no encontrada' },
        { status: 404 }
      );
    }

    // Si se está cambiando el orden, verificar que no exista conflicto
    if (validatedData.orden && validatedData.orden !== existingParada.orden) {
      const duplicate = await prisma.parada.findFirst({
        where: {
          rutaId: validatedData.rutaId || existingParada.rutaId,
          orden: validatedData.orden,
          id: { not: params.id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: `Ya existe una parada con orden ${validatedData.orden} en esta ruta` },
          { status: 400 }
        );
      }
    }

    // Si se está actualizando la dirección, geocodificarla
    let updateData: any = {};

    if (validatedData.nombre) {
      updateData.nombre = validatedData.nombre;
    }

    if (validatedData.direccion) {
      updateData.direccion = validatedData.direccion;

      // Intentar geocodificar la nueva dirección
      const coords = await geocodeAddress(validatedData.direccion);
      if (coords) {
        updateData.latitud = coords.lat;
        updateData.longitud = coords.lng;
      }
    }

    // Si se proporcionaron coordenadas manualmente, usarlas
    if (validatedData.latitud !== undefined) {
      updateData.latitud = validatedData.latitud;
    }

    if (validatedData.longitud !== undefined) {
      updateData.longitud = validatedData.longitud;
    }

    // Si se cambiaron las coordenadas, hacer reverse geocoding
    if ((updateData.latitud || updateData.longitud) && !validatedData.direccion) {
      const lat = updateData.latitud || existingParada.latitud;
      const lng = updateData.longitud || existingParada.longitud;
      const address = await reverseGeocode(lat, lng);
      if (address) {
        updateData.direccion = address;
      }
    }

    if (validatedData.orden !== undefined) {
      updateData.orden = validatedData.orden;
    }

    if (validatedData.activa !== undefined) {
      updateData.activa = validatedData.activa;
    }

    if (validatedData.rutaId) {
      updateData.rutaId = validatedData.rutaId;
    }

    // Actualizar parada
    const parada = await prisma.parada.update({
      where: { id: params.id },
      data: updateData,
      include: {
        ruta: {
          select: {
            id: true,
            nombre: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json(parada);
  } catch (error: any) {
    console.error('Error updating parada:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de validación inválidos', details: error.errors },
        { status: 400 }
      );
    }

    if (error.code?.startsWith('P')) {
      return NextResponse.json(
        { error: handlePrismaError(error) },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al actualizar parada' },
      { status: 500 }
    );
  }
}

// DELETE /api/paradas/[id] - Eliminar parada
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar que la parada existe
    const existingParada = await prisma.parada.findUnique({
      where: { id: params.id },
      include: {
        solicitudes: true,
      },
    });

    if (!existingParada) {
      return NextResponse.json(
        { error: 'Parada no encontrada' },
        { status: 404 }
      );
    }

    // Si tiene solicitudes, marcar como inactiva en lugar de eliminar
    if (existingParada.solicitudes.length > 0) {
      const updated = await prisma.parada.update({
        where: { id: params.id },
        data: { activa: false },
      });

      return NextResponse.json({
        success: true,
        message: 'Parada marcada como inactiva (tiene solicitudes asociadas)',
        parada: updated,
      });
    }

    // Eliminar parada
    await prisma.parada.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Parada eliminada exitosamente',
    });
  } catch (error: any) {
    console.error('Error deleting parada:', error);

    if (error.code?.startsWith('P')) {
      return NextResponse.json(
        { error: handlePrismaError(error) },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al eliminar parada' },
      { status: 500 }
    );
  }
}
```

---

### 3. Crear API Route para Reordenar Paradas

**Archivo:** `src/app/api/paradas/reordenar/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const reordenarSchema = z.object({
  rutaId: z.string().min(1, 'La ruta es requerida'),
  paradas: z.array(
    z.object({
      id: z.string(),
      orden: z.number().int().min(1),
    })
  ).min(1, 'Debe proporcionar al menos una parada'),
});

// POST /api/paradas/reordenar - Reordenar paradas en una ruta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = reordenarSchema.parse(body);

    // Verificar que la ruta existe
    const ruta = await prisma.ruta.findUnique({
      where: { id: validatedData.rutaId },
      include: {
        paradas: true,
      },
    });

    if (!ruta) {
      return NextResponse.json(
        { error: 'Ruta no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que todas las paradas pertenecen a la ruta
    const paradaIds = validatedData.paradas.map(p => p.id);
    const rutaParadaIds = ruta.paradas.map(p => p.id);
    const invalidParadas = paradaIds.filter(id => !rutaParadaIds.includes(id));

    if (invalidParadas.length > 0) {
      return NextResponse.json(
        { error: 'Algunas paradas no pertenecen a esta ruta' },
        { status: 400 }
      );
    }

    // Actualizar orden de cada parada
    const updatePromises = validatedData.paradas.map(({ id, orden }) =>
      prisma.parada.update({
        where: { id },
        data: { orden },
      })
    );

    await Promise.all(updatePromises);

    // Obtener paradas actualizadas
    const paradasActualizadas = await prisma.parada.findMany({
      where: { rutaId: validatedData.rutaId },
      orderBy: { orden: 'asc' },
      include: {
        ruta: {
          select: {
            id: true,
            nombre: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Paradas reordenadas exitosamente',
      paradas: paradasActualizadas,
    });
  } catch (error: any) {
    console.error('Error reordenando paradas:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de validación inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al reordenar paradas' },
      { status: 500 }
    );
  }
}
```

---

### 4. Crear API Route para Estadísticas

**Archivo:** `src/app/api/paradas/stats/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/paradas/stats - Estadísticas de paradas
export async function GET(request: NextRequest) {
  try {
    const [
      total,
      activas,
      inactivas,
      porRuta,
      conSolicitudes,
      sinSolicitudes,
    ] = await Promise.all([
      // Total de paradas
      prisma.parada.count(),

      // Por estado
      prisma.parada.count({ where: { activa: true } }),
      prisma.parada.count({ where: { activa: false } }),

      // Por ruta
      prisma.parada.groupBy({
        by: ['rutaId'],
        _count: true,
      }),

      // Con/sin solicitudes
      prisma.parada.count({
        where: {
          solicitudes: {
            some: {},
          },
        },
      }),
      prisma.parada.count({
        where: {
          solicitudes: {
            none: {},
          },
        },
      }),
    ]);

    // Obtener nombres de rutas
    const rutasIds = porRuta.map(r => r.rutaId);
    const rutas = await prisma.ruta.findMany({
      where: { id: { in: rutasIds } },
      select: { id: true, nombre: true },
    });

    const rutasMap = rutas.reduce((acc, r) => {
      acc[r.id] = r.nombre;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      total,
      porEstado: {
        activas,
        inactivas,
        porcentajeActivas: total > 0 ? ((activas / total) * 100).toFixed(1) : '0',
      },
      porRuta: porRuta.map(r => ({
        rutaId: r.rutaId,
        rutaNombre: rutasMap[r.rutaId] || 'Desconocida',
        cantidad: r._count,
      })),
      solicitudes: {
        conSolicitudes,
        sinSolicitudes,
        porcentajeConSolicitudes: total > 0 ? ((conSolicitudes / total) * 100).toFixed(1) : '0',
      },
    });
  } catch (error) {
    console.error('Error fetching parada stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
```

---

## Pruebas de Verificación

### Test 1: Crear Parada con Dirección (Geocoding Automático)

```bash
curl -X POST http://localhost:9002/api/paradas \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Parada Plaza Central",
    "direccion": "Av. Winston Churchill, Santo Domingo",
    "latitud": 0,
    "longitud": 0,
    "orden": 1,
    "rutaId": "clx...",
    "activa": true
  }'
```

### Test 2: Crear Parada con Coordenadas Manuales

```bash
curl -X POST http://localhost:9002/api/paradas \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Parada Malecón",
    "direccion": "Malecón de Santo Domingo",
    "latitud": 18.4662,
    "longitud": -69.8946,
    "orden": 2,
    "rutaId": "clx...",
    "activa": true
  }'
```

### Test 3: Listar Paradas por Ruta

```bash
curl "http://localhost:9002/api/paradas?rutaId=clx..."
```

### Test 4: Filtrar Paradas Activas

```bash
curl "http://localhost:9002/api/paradas?activa=true"
```

### Test 5: Buscar Paradas

```bash
curl "http://localhost:9002/api/paradas?search=Plaza"
```

### Test 6: Obtener Parada por ID

```bash
curl http://localhost:9002/api/paradas/clx...
```

### Test 7: Actualizar Parada

```bash
curl -X PATCH http://localhost:9002/api/paradas/clx... \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Parada Plaza Central (Actualizada)",
    "orden": 3
  }'
```

### Test 8: Reordenar Paradas

```bash
curl -X POST http://localhost:9002/api/paradas/reordenar \
  -H "Content-Type: application/json" \
  -d '{
    "rutaId": "clx...",
    "paradas": [
      { "id": "clx1...", "orden": 1 },
      { "id": "clx2...", "orden": 2 },
      { "id": "clx3...", "orden": 3 }
    ]
  }'
```

### Test 9: Eliminar Parada

```bash
curl -X DELETE http://localhost:9002/api/paradas/clx...
```

### Test 10: Estadísticas

```bash
curl http://localhost:9002/api/paradas/stats
```

---

## Troubleshooting

### Error: "No se pudieron obtener las coordenadas"

**Solución:**
```typescript
// Verificar que Google Maps API está configurada
console.log(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

// Proporcionar coordenadas manualmente
const paradaData = {
  nombre: "Parada Test",
  direccion: "Dirección Test",
  latitud: 18.4861,
  longitud: -69.9312,
  orden: 1,
  rutaId: "clx...",
};
```

### Error: "Ya existe una parada con orden X en esta ruta"

**Solución:**
```typescript
// Verificar órdenes disponibles
const paradas = await prisma.parada.findMany({
  where: { rutaId: 'clx...' },
  select: { orden: true },
  orderBy: { orden: 'asc' },
});

// Usar siguiente orden disponible
const maxOrden = Math.max(...paradas.map(p => p.orden), 0);
const nuevoOrden = maxOrden + 1;
```

### Error: "Latitud debe estar entre -90 y 90"

**Solución:**
```typescript
// Verificar formato de coordenadas
const coordenadasValidas = {
  latitud: 18.4861,   // ✅ válido para República Dominicana
  longitud: -69.9312, // ✅ válido (negativo para oeste)
};

const coordenadasInvalidas = {
  latitud: 118.4861,  // ❌ inválido (excede 90)
  longitud: 269.9312, // ❌ inválido (excede 180)
};
```

### Error: "Datos de validación inválidos"

**Solución:**
```typescript
// Verificar formato según schema Zod
const testData = {
  nombre: "Parada Válida",                    // ✅ min 2 caracteres
  direccion: "Calle Principal #123",          // ✅ min 5 caracteres
  latitud: 18.4861,                           // ✅ entre -90 y 90
  longitud: -69.9312,                         // ✅ entre -180 y 180
  orden: 1,                                   // ✅ entero >= 1
  rutaId: "clx...",                          // ✅ string válido
  activa: true,                               // ✅ boolean
};
```

---

## Criterios de Aceptación

- [x] GET /api/paradas retorna lista con filtros
- [x] POST /api/paradas crea parada con validación
- [x] Integración con geocoding funciona correctamente
- [x] Reverse geocoding automático implementado
- [x] GET /api/paradas/[id] retorna parada con relaciones
- [x] PATCH /api/paradas/[id] actualiza parada
- [x] DELETE /api/paradas/[id] elimina o inactiva
- [x] POST /api/paradas/reordenar funciona correctamente
- [x] GET /api/paradas/stats retorna estadísticas
- [x] Validación de orden único por ruta
- [x] Coordenadas GPS validadas correctamente
- [x] Filtros por ruta y estado operativos

---

## Archivos Creados

```
src/app/api/paradas/
├── route.ts                # GET, POST
├── [id]/
│   └── route.ts            # GET, PATCH, DELETE
├── reordenar/
│   └── route.ts            # POST reordenar paradas
└── stats/
    └── route.ts            # GET estadísticas
```

---

## Siguiente Historia

Una vez completada esta historia, continuar con:
**[Historia 10: API Routes - Usuarios](./HISTORIA-10-api-usuarios.md)**

---

**Fecha de creación:** 2025-02-10
**Última actualización:** 2025-02-10
