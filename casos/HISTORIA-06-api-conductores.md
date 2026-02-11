# Historia 06: API Routes - Conductores

**Prioridad:** ALTA
**Dependencias:** Historia 01, Historia 03, Historia 05
**Estimación:** 2-3 horas
**Estado:** Pendiente

---

## Objetivo

Implementar todas las API Routes necesarias para el módulo de Conductores, incluyendo listado, creación, actualización, eliminación y búsqueda con filtros. Estas rutas se conectarán a Prisma y usarán validación Zod.

---

## Pre-requisitos

- ✅ Prisma configurado (Historia 01)
- ✅ Schema Conductor en base de datos
- ✅ Zod schemas creados (Historia 03)
- ✅ Hook useApi implementado (Historia 05)

---

## Tareas Detalladas

### 1. Crear API Route Principal - Conductores

**Archivo:** `src/app/api/conductores/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { conductorSchema } from '@/lib/validations';
import { handlePrismaError } from '@/lib/api-utils';
import { z } from 'zod';

// GET /api/conductores - Listar todos los conductores con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filtros opcionales
    const estado = searchParams.get('estado');
    const turno = searchParams.get('turno');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Construir query donde con filtros
    const where: any = {};

    if (estado) {
      where.estado = estado;
    }

    if (turno) {
      where.turno = turno;
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { cedula: { contains: search, mode: 'insensitive' } },
        { licencia: { contains: search, mode: 'insensitive' } },
        { telefono: { contains: search, mode: 'insensitive' } },
      ];
    }

    const conductores = await prisma.conductor.findMany({
      where,
      include: {
        vehiculo: {
          select: {
            id: true,
            ficha: true,
            modelo: true,
            placa: true,
          },
        },
        horarios: {
          include: {
            ruta: {
              select: {
                id: true,
                nombre: true,
                color: true,
              },
            },
          },
          orderBy: {
            horaInicio: 'asc',
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) }),
    });

    return NextResponse.json(conductores);
  } catch (error) {
    console.error('Error fetching conductores:', error);
    return NextResponse.json(
      { error: 'Error al obtener conductores' },
      { status: 500 }
    );
  }
}

// POST /api/conductores - Crear nuevo conductor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar con Zod
    const validatedData = conductorSchema.parse(body);

    // Verificar que no exista conductor con misma cédula o licencia
    const existingConductor = await prisma.conductor.findFirst({
      where: {
        OR: [
          { cedula: validatedData.cedula },
          { licencia: validatedData.licencia },
        ],
      },
    });

    if (existingConductor) {
      if (existingConductor.cedula === validatedData.cedula) {
        return NextResponse.json(
          { error: 'Ya existe un conductor con esta cédula' },
          { status: 400 }
        );
      }
      if (existingConductor.licencia === validatedData.licencia) {
        return NextResponse.json(
          { error: 'Ya existe un conductor con esta licencia' },
          { status: 400 }
        );
      }
    }

    // Crear conductor
    const conductor = await prisma.conductor.create({
      data: {
        nombre: validatedData.nombre,
        cedula: validatedData.cedula,
        licencia: validatedData.licencia,
        telefono: validatedData.telefono,
        email: validatedData.email || null,
        turno: validatedData.turno,
        estado: validatedData.estado,
        ...(validatedData.vehiculoId && {
          vehiculo: {
            connect: { id: validatedData.vehiculoId },
          },
        }),
      },
      include: {
        vehiculo: true,
      },
    });

    return NextResponse.json(conductor, { status: 201 });
  } catch (error: any) {
    console.error('Error creating conductor:', error);

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
      { error: 'Error al crear conductor' },
      { status: 500 }
    );
  }
}
```

---

### 2. Crear API Route por ID - Conductores

**Archivo:** `src/app/api/conductores/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { conductorSchema } from '@/lib/validations';
import { handlePrismaError } from '@/lib/api-utils';
import { z } from 'zod';

// GET /api/conductores/[id] - Obtener conductor por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conductor = await prisma.conductor.findUnique({
      where: { id: params.id },
      include: {
        vehiculo: true,
        horarios: {
          include: {
            ruta: {
              select: {
                id: true,
                nombre: true,
                color: true,
                descripcion: true,
              },
            },
          },
          orderBy: {
            horaInicio: 'asc',
          },
        },
        historialViajes: {
          take: 20,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            ruta: {
              select: {
                id: true,
                nombre: true,
              },
            },
            vehiculo: {
              select: {
                id: true,
                ficha: true,
                placa: true,
              },
            },
          },
        },
      },
    });

    if (!conductor) {
      return NextResponse.json(
        { error: 'Conductor no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(conductor);
  } catch (error) {
    console.error('Error fetching conductor:', error);
    return NextResponse.json(
      { error: 'Error al obtener conductor' },
      { status: 500 }
    );
  }
}

// PATCH /api/conductores/[id] - Actualizar conductor
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validación parcial (solo campos que vienen)
    const partialSchema = conductorSchema.partial();
    const validatedData = partialSchema.parse(body);

    // Verificar que el conductor existe
    const existingConductor = await prisma.conductor.findUnique({
      where: { id: params.id },
    });

    if (!existingConductor) {
      return NextResponse.json(
        { error: 'Conductor no encontrado' },
        { status: 404 }
      );
    }

    // Si se está actualizando cédula o licencia, verificar que no exista
    if (validatedData.cedula || validatedData.licencia) {
      const duplicate = await prisma.conductor.findFirst({
        where: {
          AND: [
            { id: { not: params.id } },
            {
              OR: [
                ...(validatedData.cedula ? [{ cedula: validatedData.cedula }] : []),
                ...(validatedData.licencia ? [{ licencia: validatedData.licencia }] : []),
              ],
            },
          ],
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'Cédula o licencia ya registrada en otro conductor' },
          { status: 400 }
        );
      }
    }

    // Actualizar conductor
    const conductor = await prisma.conductor.update({
      where: { id: params.id },
      data: {
        ...(validatedData.nombre && { nombre: validatedData.nombre }),
        ...(validatedData.cedula && { cedula: validatedData.cedula }),
        ...(validatedData.licencia && { licencia: validatedData.licencia }),
        ...(validatedData.telefono && { telefono: validatedData.telefono }),
        ...(validatedData.email !== undefined && { email: validatedData.email || null }),
        ...(validatedData.turno && { turno: validatedData.turno }),
        ...(validatedData.estado && { estado: validatedData.estado }),
        ...(validatedData.vehiculoId !== undefined && {
          vehiculoId: validatedData.vehiculoId,
        }),
      },
      include: {
        vehiculo: true,
        horarios: {
          include: {
            ruta: true,
          },
        },
      },
    });

    return NextResponse.json(conductor);
  } catch (error: any) {
    console.error('Error updating conductor:', error);

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
      { error: 'Error al actualizar conductor' },
      { status: 500 }
    );
  }
}

// DELETE /api/conductores/[id] - Eliminar conductor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar que el conductor existe
    const existingConductor = await prisma.conductor.findUnique({
      where: { id: params.id },
      include: {
        horarios: true,
        historialViajes: true,
      },
    });

    if (!existingConductor) {
      return NextResponse.json(
        { error: 'Conductor no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si tiene relaciones activas
    if (existingConductor.horarios.length > 0) {
      return NextResponse.json(
        {
          error: 'No se puede eliminar: conductor tiene horarios asignados',
          details: {
            horarios: existingConductor.horarios.length,
          },
        },
        { status: 400 }
      );
    }

    // Si tiene historial de viajes, solo marcar como inactivo
    if (existingConductor.historialViajes.length > 0) {
      const updated = await prisma.conductor.update({
        where: { id: params.id },
        data: { estado: 'Inactivo' },
      });

      return NextResponse.json({
        success: true,
        message: 'Conductor marcado como inactivo (tiene historial de viajes)',
        conductor: updated,
      });
    }

    // Si no tiene relaciones, eliminar
    await prisma.conductor.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Conductor eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Error deleting conductor:', error);

    if (error.code?.startsWith('P')) {
      return NextResponse.json(
        { error: handlePrismaError(error) },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al eliminar conductor' },
      { status: 500 }
    );
  }
}
```

---

### 3. Crear API Route para Estadísticas

**Archivo:** `src/app/api/conductores/stats/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/conductores/stats - Estadísticas de conductores
export async function GET(request: NextRequest) {
  try {
    const [
      total,
      activos,
      vacaciones,
      inactivos,
      porTurno,
      conVehiculo,
      sinVehiculo,
    ] = await Promise.all([
      // Total de conductores
      prisma.conductor.count(),

      // Por estado
      prisma.conductor.count({ where: { estado: 'Activo' } }),
      prisma.conductor.count({ where: { estado: 'Vacaciones' } }),
      prisma.conductor.count({ where: { estado: 'Inactivo' } }),

      // Por turno
      prisma.conductor.groupBy({
        by: ['turno'],
        _count: true,
      }),

      // Con vehículo asignado
      prisma.conductor.count({
        where: { vehiculoId: { not: null } },
      }),

      // Sin vehículo asignado
      prisma.conductor.count({
        where: { vehiculoId: null },
      }),
    ]);

    return NextResponse.json({
      total,
      porEstado: {
        activos,
        vacaciones,
        inactivos,
      },
      porTurno: porTurno.reduce((acc, item) => {
        acc[item.turno] = item._count;
        return acc;
      }, {} as Record<string, number>),
      asignacion: {
        conVehiculo,
        sinVehiculo,
        porcentajeAsignado: total > 0 ? ((conVehiculo / total) * 100).toFixed(1) : '0',
      },
    });
  } catch (error) {
    console.error('Error fetching conductor stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
```

---

## Pruebas de Verificación

### Test 1: Crear Conductor

```bash
curl -X POST http://localhost:9002/api/conductores \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test Conductor",
    "cedula": "001-9999999-9",
    "licencia": "001-9999999-9",
    "telefono": "809-999-9999",
    "email": "test@cesac.com",
    "turno": "Matutino",
    "estado": "Activo"
  }'
```

**Respuesta esperada:**
```json
{
  "id": "clx...",
  "nombre": "Test Conductor",
  "cedula": "001-9999999-9",
  "licencia": "001-9999999-9",
  "telefono": "809-999-9999",
  "email": "test@cesac.com",
  "turno": "Matutino",
  "estado": "Activo",
  "fechaIngreso": "2025-02-10T...",
  "vehiculoId": null,
  "vehiculo": null,
  "createdAt": "2025-02-10T...",
  "updatedAt": "2025-02-10T..."
}
```

### Test 2: Listar Conductores

```bash
curl http://localhost:9002/api/conductores
```

### Test 3: Filtrar por Estado

```bash
curl "http://localhost:9002/api/conductores?estado=Activo&turno=Matutino"
```

### Test 4: Buscar por Texto

```bash
curl "http://localhost:9002/api/conductores?search=Manuel"
```

### Test 5: Obtener por ID

```bash
curl http://localhost:9002/api/conductores/clx...
```

### Test 6: Actualizar Conductor

```bash
curl -X PATCH http://localhost:9002/api/conductores/clx... \
  -H "Content-Type: application/json" \
  -d '{"estado": "Vacaciones"}'
```

### Test 7: Eliminar Conductor

```bash
curl -X DELETE http://localhost:9002/api/conductores/clx...
```

### Test 8: Estadísticas

```bash
curl http://localhost:9002/api/conductores/stats
```

---

## Troubleshooting

### Error: "Ya existe un conductor con esta cédula"

**Solución:**
```sql
-- Verificar conductores duplicados en base de datos
SELECT cedula, COUNT(*)
FROM conductores
GROUP BY cedula
HAVING COUNT(*) > 1;
```

### Error: "No se puede eliminar: conductor tiene horarios asignados"

**Solución:**
```typescript
// Eliminar horarios antes de eliminar conductor
await prisma.horario.deleteMany({
  where: { conductorId: 'clx...' }
});

// Luego eliminar conductor
await prisma.conductor.delete({
  where: { id: 'clx...' }
});
```

### Error: "Datos de validación inválidos"

**Solución:**
```typescript
// Verificar formato de datos según schema Zod
const testData = {
  nombre: "Nombre Válido",           // ✅ min 2 caracteres
  cedula: "001-1234567-8",           // ✅ formato correcto
  telefono: "809-555-0101",          // ✅ formato correcto
  turno: "Matutino",                 // ✅ enum válido
  estado: "Activo",                  // ✅ enum válido
};
```

---

## Criterios de Aceptación

- [x] GET /api/conductores retorna lista con filtros
- [x] POST /api/conductores crea conductor con validación
- [x] GET /api/conductores/[id] retorna conductor con relaciones
- [x] PATCH /api/conductores/[id] actualiza conductor
- [x] DELETE /api/conductores/[id] elimina o inactiva según relaciones
- [x] GET /api/conductores/stats retorna estadísticas
- [x] Validación Zod funciona correctamente
- [x] Manejo de errores de Prisma implementado
- [x] Búsqueda case-insensitive funciona
- [x] Filtros múltiples operativos

---

## Archivos Creados

```
src/app/api/conductores/
├── route.ts                # GET, POST
├── [id]/
│   └── route.ts            # GET, PATCH, DELETE
└── stats/
    └── route.ts            # GET estadísticas
```

---

## Siguiente Historia

Una vez completada esta historia, continuar con:
**[Historia 07: API Routes - Vehículos](./HISTORIA-07-api-vehiculos.md)**

---

**Fecha de creación:** 2025-02-10
**Última actualización:** 2025-02-10
