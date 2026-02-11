# Historia 07: API Routes - Vehículos

**Prioridad:** ALTA
**Dependencias:** Historia 01, Historia 03, Historia 05
**Estimación:** 2-3 horas
**Estado:** Pendiente

---

## Objetivo

Implementar todas las API Routes para el módulo de Vehículos, incluyendo listado con filtros, asignación de conductores, gestión de rutas, y control de estados operativos.

---

## Pre-requisitos

- ✅ Prisma configurado (Historia 01)
- ✅ Schema Vehiculo en base de datos
- ✅ Zod schemas creados (Historia 03)
- ✅ Hook useApi implementado (Historia 05)

---

## Tareas Detalladas

### 1. Crear API Route Principal - Vehículos

**Archivo:** `src/app/api/vehiculos/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { vehiculoSchema } from '@/lib/validations';
import { handlePrismaError } from '@/lib/api-utils';
import { z } from 'zod';

// GET /api/vehiculos - Listar todos los vehículos con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const estado = searchParams.get('estado');
    const rutaId = searchParams.get('rutaId');
    const conConductor = searchParams.get('conConductor');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const where: any = {};

    if (estado) {
      where.estado = estado;
    }

    if (rutaId) {
      where.rutaAsignada = rutaId;
    }

    if (conConductor === 'true') {
      where.conductor = { isNot: null };
    } else if (conConductor === 'false') {
      where.conductor = { is: null };
    }

    if (search) {
      where.OR = [
        { ficha: { contains: search, mode: 'insensitive' } },
        { modelo: { contains: search, mode: 'insensitive' } },
        { placa: { contains: search, mode: 'insensitive' } },
      ];
    }

    const vehiculos = await prisma.vehiculo.findMany({
      where,
      include: {
        ruta: {
          select: {
            id: true,
            nombre: true,
            color: true,
            descripcion: true,
          },
        },
        conductor: {
          select: {
            id: true,
            nombre: true,
            cedula: true,
            telefono: true,
            turno: true,
            estado: true,
          },
        },
      },
      orderBy: {
        ficha: 'asc',
      },
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) }),
    });

    return NextResponse.json(vehiculos);
  } catch (error) {
    console.error('Error fetching vehiculos:', error);
    return NextResponse.json(
      { error: 'Error al obtener vehículos' },
      { status: 500 }
    );
  }
}

// POST /api/vehiculos - Crear nuevo vehículo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = vehiculoSchema.parse(body);

    // Verificar que no exista vehículo con misma ficha o placa
    const existing = await prisma.vehiculo.findFirst({
      where: {
        OR: [
          { ficha: validatedData.ficha },
          { placa: validatedData.placa },
        ],
      },
    });

    if (existing) {
      if (existing.ficha === validatedData.ficha) {
        return NextResponse.json(
          { error: 'Ya existe un vehículo con esta ficha' },
          { status: 400 }
        );
      }
      if (existing.placa === validatedData.placa) {
        return NextResponse.json(
          { error: 'Ya existe un vehículo con esta placa' },
          { status: 400 }
        );
      }
    }

    // Si se asigna ruta, verificar que existe
    if (validatedData.rutaAsignada) {
      const rutaExists = await prisma.ruta.findUnique({
        where: { id: validatedData.rutaAsignada },
      });

      if (!rutaExists) {
        return NextResponse.json(
          { error: 'Ruta no encontrada' },
          { status: 400 }
        );
      }
    }

    const vehiculo = await prisma.vehiculo.create({
      data: {
        ficha: validatedData.ficha,
        modelo: validatedData.modelo,
        placa: validatedData.placa,
        capacidad: validatedData.capacidad,
        estado: validatedData.estado,
        ...(validatedData.rutaAsignada && {
          ruta: {
            connect: { id: validatedData.rutaAsignada },
          },
        }),
      },
      include: {
        ruta: true,
        conductor: true,
      },
    });

    return NextResponse.json(vehiculo, { status: 201 });
  } catch (error: any) {
    console.error('Error creating vehiculo:', error);

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
      { error: 'Error al crear vehículo' },
      { status: 500 }
    );
  }
}
```

---

### 2. Crear API Route por ID - Vehículos

**Archivo:** `src/app/api/vehiculos/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { vehiculoSchema } from '@/lib/validations';
import { handlePrismaError } from '@/lib/api-utils';
import { z } from 'zod';

// GET /api/vehiculos/[id] - Obtener vehículo por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id: params.id },
      include: {
        ruta: {
          include: {
            paradas: {
              orderBy: { orden: 'asc' },
            },
          },
        },
        conductor: {
          include: {
            horarios: {
              include: {
                ruta: true,
              },
            },
          },
        },
        historialViajes: {
          take: 30,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            ruta: true,
            conductor: true,
          },
        },
      },
    });

    if (!vehiculo) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(vehiculo);
  } catch (error) {
    console.error('Error fetching vehiculo:', error);
    return NextResponse.json(
      { error: 'Error al obtener vehículo' },
      { status: 500 }
    );
  }
}

// PATCH /api/vehiculos/[id] - Actualizar vehículo
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const partialSchema = vehiculoSchema.partial();
    const validatedData = partialSchema.parse(body);

    const existing = await prisma.vehiculo.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar duplicados de ficha o placa
    if (validatedData.ficha || validatedData.placa) {
      const duplicate = await prisma.vehiculo.findFirst({
        where: {
          AND: [
            { id: { not: params.id } },
            {
              OR: [
                ...(validatedData.ficha ? [{ ficha: validatedData.ficha }] : []),
                ...(validatedData.placa ? [{ placa: validatedData.placa }] : []),
              ],
            },
          ],
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'Ficha o placa ya registrada en otro vehículo' },
          { status: 400 }
        );
      }
    }

    const vehiculo = await prisma.vehiculo.update({
      where: { id: params.id },
      data: {
        ...(validatedData.ficha && { ficha: validatedData.ficha }),
        ...(validatedData.modelo && { modelo: validatedData.modelo }),
        ...(validatedData.placa && { placa: validatedData.placa }),
        ...(validatedData.capacidad !== undefined && { capacidad: validatedData.capacidad }),
        ...(validatedData.estado && { estado: validatedData.estado }),
        ...(validatedData.rutaAsignada !== undefined && {
          rutaAsignada: validatedData.rutaAsignada,
        }),
      },
      include: {
        ruta: true,
        conductor: true,
      },
    });

    return NextResponse.json(vehiculo);
  } catch (error: any) {
    console.error('Error updating vehiculo:', error);

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
      { error: 'Error al actualizar vehículo' },
      { status: 500 }
    );
  }
}

// DELETE /api/vehiculos/[id] - Eliminar vehículo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.vehiculo.findUnique({
      where: { id: params.id },
      include: {
        conductor: true,
        historialViajes: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 }
      );
    }

    // Si tiene conductor asignado, no permitir eliminación
    if (existing.conductor) {
      return NextResponse.json(
        {
          error: 'No se puede eliminar: vehículo tiene conductor asignado',
          details: {
            conductor: existing.conductor.nombre,
          },
        },
        { status: 400 }
      );
    }

    // Si tiene historial, marcar como fuera de servicio
    if (existing.historialViajes.length > 0) {
      const updated = await prisma.vehiculo.update({
        where: { id: params.id },
        data: { estado: 'FueraDeServicio' },
      });

      return NextResponse.json({
        success: true,
        message: 'Vehículo marcado como fuera de servicio',
        vehiculo: updated,
      });
    }

    await prisma.vehiculo.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Vehículo eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Error deleting vehiculo:', error);

    if (error.code?.startsWith('P')) {
      return NextResponse.json(
        { error: handlePrismaError(error) },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al eliminar vehículo' },
      { status: 500 }
    );
  }
}
```

---

### 3. Crear API Route para Asignar Conductor

**Archivo:** `src/app/api/vehiculos/[id]/asignar-conductor/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/vehiculos/[id]/asignar-conductor - Asignar conductor a vehículo
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { conductorId } = body;

    if (!conductorId) {
      return NextResponse.json(
        { error: 'conductorId es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el vehículo existe
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id: params.id },
      include: { conductor: true },
    });

    if (!vehiculo) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el conductor existe y está activo
    const conductor = await prisma.conductor.findUnique({
      where: { id: conductorId },
      include: { vehiculo: true },
    });

    if (!conductor) {
      return NextResponse.json(
        { error: 'Conductor no encontrado' },
        { status: 404 }
      );
    }

    if (conductor.estado !== 'Activo') {
      return NextResponse.json(
        { error: `Conductor está en estado: ${conductor.estado}` },
        { status: 400 }
      );
    }

    // Si el conductor ya tiene un vehículo, desasignarlo primero
    if (conductor.vehiculo) {
      await prisma.conductor.update({
        where: { id: conductorId },
        data: { vehiculoId: null },
      });
    }

    // Asignar conductor al vehículo
    const updated = await prisma.conductor.update({
      where: { id: conductorId },
      data: { vehiculoId: params.id },
      include: {
        vehiculo: {
          include: {
            ruta: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Conductor asignado exitosamente',
      conductor: updated,
    });
  } catch (error) {
    console.error('Error asignando conductor:', error);
    return NextResponse.json(
      { error: 'Error al asignar conductor' },
      { status: 500 }
    );
  }
}

// DELETE /api/vehiculos/[id]/asignar-conductor - Desasignar conductor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id: params.id },
      include: { conductor: true },
    });

    if (!vehiculo) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 }
      );
    }

    if (!vehiculo.conductor) {
      return NextResponse.json(
        { error: 'El vehículo no tiene conductor asignado' },
        { status: 400 }
      );
    }

    await prisma.conductor.update({
      where: { id: vehiculo.conductor.id },
      data: { vehiculoId: null },
    });

    return NextResponse.json({
      success: true,
      message: 'Conductor desasignado exitosamente',
    });
  } catch (error) {
    console.error('Error desasignando conductor:', error);
    return NextResponse.json(
      { error: 'Error al desasignar conductor' },
      { status: 500 }
    );
  }
}
```

---

### 4. Crear API Route para Estadísticas

**Archivo:** `src/app/api/vehiculos/stats/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/vehiculos/stats - Estadísticas de vehículos
export async function GET(request: NextRequest) {
  try {
    const [
      total,
      operativos,
      enTaller,
      fueraDeServicio,
      conConductor,
      sinConductor,
      porRuta,
      capacidadPromedio,
    ] = await Promise.all([
      prisma.vehiculo.count(),
      prisma.vehiculo.count({ where: { estado: 'Operativo' } }),
      prisma.vehiculo.count({ where: { estado: 'EnTaller' } }),
      prisma.vehiculo.count({ where: { estado: 'FueraDeServicio' } }),
      prisma.vehiculo.count({ where: { conductor: { isNot: null } } }),
      prisma.vehiculo.count({ where: { conductor: { is: null } } }),
      prisma.vehiculo.groupBy({
        by: ['rutaAsignada'],
        _count: true,
        where: { rutaAsignada: { not: null } },
      }),
      prisma.vehiculo.aggregate({
        _avg: { capacidad: true },
        _sum: { capacidad: true },
      }),
    ]);

    // Obtener nombres de rutas
    const rutasIds = porRuta.map((r) => r.rutaAsignada!);
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
        operativos,
        enTaller,
        fueraDeServicio,
      },
      asignacion: {
        conConductor,
        sinConductor,
        porcentajeAsignado: total > 0 ? ((conConductor / total) * 100).toFixed(1) : '0',
      },
      porRuta: porRuta.map((r) => ({
        rutaId: r.rutaAsignada,
        rutaNombre: rutasMap[r.rutaAsignada!] || 'Desconocida',
        cantidad: r._count,
      })),
      capacidad: {
        promedio: capacidadPromedio._avg.capacidad
          ? Math.round(capacidadPromedio._avg.capacidad)
          : 0,
        total: capacidadPromedio._sum.capacidad || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching vehiculo stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
```

---

## Pruebas de Verificación

### Test 1: Crear Vehículo

```bash
curl -X POST http://localhost:9002/api/vehiculos \
  -H "Content-Type: application/json" \
  -d '{
    "ficha": "Test-01",
    "modelo": "Toyota Test 2025",
    "placa": "I999999",
    "capacidad": 30,
    "estado": "Operativo"
  }'
```

### Test 2: Asignar Conductor

```bash
curl -X POST http://localhost:9002/api/vehiculos/clx.../asignar-conductor \
  -H "Content-Type: application/json" \
  -d '{"conductorId": "clx..."}'
```

### Test 3: Desasignar Conductor

```bash
curl -X DELETE http://localhost:9002/api/vehiculos/clx.../asignar-conductor
```

### Test 4: Filtrar por Ruta

```bash
curl "http://localhost:9002/api/vehiculos?rutaId=clx..."
```

### Test 5: Estadísticas

```bash
curl http://localhost:9002/api/vehiculos/stats
```

---

## Criterios de Aceptación

- [x] GET /api/vehiculos retorna lista con filtros
- [x] POST /api/vehiculos crea vehículo
- [x] PATCH /api/vehiculos/[id] actualiza
- [x] DELETE /api/vehiculos/[id] elimina o desactiva
- [x] POST asignar-conductor funciona
- [x] DELETE desasignar-conductor funciona
- [x] Estadísticas completas

---

## Archivos Creados

```
src/app/api/vehiculos/
├── route.ts
├── [id]/
│   ├── route.ts
│   └── asignar-conductor/
│       └── route.ts
└── stats/
    └── route.ts
```

---

## Siguiente Historia

**[Historia 08: API Routes - Rutas](./HISTORIA-08-api-rutas.md)**

---

**Fecha de creación:** 2025-02-10
