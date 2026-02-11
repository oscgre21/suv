# Historia 08: API Routes - Rutas

**Prioridad:** ALTA
**Dependencias:** Historia 01, Historia 03, Historia 05
**Estimación:** 2-3 horas
**Estado:** Pendiente

---

## Objetivo

Implementar todas las API Routes necesarias para el módulo de Rutas, incluyendo listado con filtros, gestión de paradas asociadas, manejo de colores, rutas especiales, y relaciones con vehículos y horarios.

---

## Pre-requisitos

- ✅ Prisma configurado (Historia 01)
- ✅ Schema Ruta en base de datos
- ✅ Zod schemas creados (Historia 03)
- ✅ Hook useApi implementado (Historia 05)

---

## Tareas Detalladas

### 1. Crear API Route Principal - Rutas

**Archivo:** `src/app/api/rutas/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rutaSchema } from '@/lib/validations';
import { handlePrismaError } from '@/lib/api-utils';
import { z } from 'zod';

// GET /api/rutas - Listar todas las rutas con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filtros opcionales
    const activa = searchParams.get('activa');
    const esEspecial = searchParams.get('esEspecial');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Construir query donde con filtros
    const where: any = {};

    if (activa !== null) {
      where.activa = activa === 'true';
    }

    if (esEspecial !== null) {
      where.esEspecial = esEspecial === 'true';
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
      ];
    }

    const rutas = await prisma.ruta.findMany({
      where,
      include: {
        paradas: {
          orderBy: {
            orden: 'asc',
          },
          select: {
            id: true,
            nombre: true,
            direccion: true,
            latitud: true,
            longitud: true,
            orden: true,
            activa: true,
          },
        },
        vehiculos: {
          select: {
            id: true,
            ficha: true,
            modelo: true,
            placa: true,
            estado: true,
          },
        },
        horarios: {
          include: {
            conductor: {
              select: {
                id: true,
                nombre: true,
                cedula: true,
                turno: true,
              },
            },
          },
          orderBy: {
            horaInicio: 'asc',
          },
        },
        usuarios: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) }),
    });

    return NextResponse.json(rutas);
  } catch (error) {
    console.error('Error fetching rutas:', error);
    return NextResponse.json(
      { error: 'Error al obtener rutas' },
      { status: 500 }
    );
  }
}

// POST /api/rutas - Crear nueva ruta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar con Zod
    const validatedData = rutaSchema.parse(body);

    // Verificar que no exista ruta con mismo nombre
    const existingRuta = await prisma.ruta.findFirst({
      where: {
        nombre: {
          equals: validatedData.nombre,
          mode: 'insensitive',
        },
      },
    });

    if (existingRuta) {
      return NextResponse.json(
        { error: 'Ya existe una ruta con este nombre' },
        { status: 400 }
      );
    }

    // Crear ruta
    const ruta = await prisma.ruta.create({
      data: {
        nombre: validatedData.nombre,
        descripcion: validatedData.descripcion || null,
        color: validatedData.color,
        activa: validatedData.activa,
        esEspecial: validatedData.esEspecial,
      },
      include: {
        paradas: true,
      },
    });

    return NextResponse.json(ruta, { status: 201 });
  } catch (error: any) {
    console.error('Error creating ruta:', error);

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
      { error: 'Error al crear ruta' },
      { status: 500 }
    );
  }
}
```

---

### 2. Crear API Route por ID - Rutas

**Archivo:** `src/app/api/rutas/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rutaSchema } from '@/lib/validations';
import { handlePrismaError } from '@/lib/api-utils';
import { z } from 'zod';

// GET /api/rutas/[id] - Obtener ruta por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ruta = await prisma.ruta.findUnique({
      where: { id: params.id },
      include: {
        paradas: {
          orderBy: { orden: 'asc' },
        },
        vehiculos: {
          include: {
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
        },
        horarios: {
          include: {
            conductor: {
              select: {
                id: true,
                nombre: true,
                cedula: true,
                turno: true,
                estado: true,
              },
            },
          },
          orderBy: {
            horaInicio: 'asc',
          },
        },
        usuarios: {
          select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true,
            estado: true,
          },
        },
      },
    });

    if (!ruta) {
      return NextResponse.json(
        { error: 'Ruta no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(ruta);
  } catch (error) {
    console.error('Error fetching ruta:', error);
    return NextResponse.json(
      { error: 'Error al obtener ruta' },
      { status: 500 }
    );
  }
}

// PATCH /api/rutas/[id] - Actualizar ruta
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validación parcial (solo campos que vienen)
    const partialSchema = rutaSchema.partial();
    const validatedData = partialSchema.parse(body);

    // Verificar que la ruta existe
    const existingRuta = await prisma.ruta.findUnique({
      where: { id: params.id },
    });

    if (!existingRuta) {
      return NextResponse.json(
        { error: 'Ruta no encontrada' },
        { status: 404 }
      );
    }

    // Si se está actualizando nombre, verificar que no exista
    if (validatedData.nombre) {
      const duplicate = await prisma.ruta.findFirst({
        where: {
          AND: [
            { id: { not: params.id } },
            {
              nombre: {
                equals: validatedData.nombre,
                mode: 'insensitive',
              },
            },
          ],
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'Ya existe otra ruta con este nombre' },
          { status: 400 }
        );
      }
    }

    // Actualizar ruta
    const ruta = await prisma.ruta.update({
      where: { id: params.id },
      data: {
        ...(validatedData.nombre && { nombre: validatedData.nombre }),
        ...(validatedData.descripcion !== undefined && {
          descripcion: validatedData.descripcion || null,
        }),
        ...(validatedData.color && { color: validatedData.color }),
        ...(validatedData.activa !== undefined && { activa: validatedData.activa }),
        ...(validatedData.esEspecial !== undefined && { esEspecial: validatedData.esEspecial }),
      },
      include: {
        paradas: {
          orderBy: { orden: 'asc' },
        },
        vehiculos: true,
        horarios: {
          include: {
            conductor: true,
          },
        },
      },
    });

    return NextResponse.json(ruta);
  } catch (error: any) {
    console.error('Error updating ruta:', error);

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
      { error: 'Error al actualizar ruta' },
      { status: 500 }
    );
  }
}

// DELETE /api/rutas/[id] - Eliminar ruta
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar que la ruta existe
    const existingRuta = await prisma.ruta.findUnique({
      where: { id: params.id },
      include: {
        paradas: true,
        vehiculos: true,
        horarios: true,
        usuarios: true,
      },
    });

    if (!existingRuta) {
      return NextResponse.json(
        { error: 'Ruta no encontrada' },
        { status: 404 }
      );
    }

    // Verificar si tiene relaciones activas
    const hasActiveRelations =
      existingRuta.vehiculos.length > 0 ||
      existingRuta.horarios.length > 0 ||
      existingRuta.usuarios.length > 0;

    if (hasActiveRelations) {
      return NextResponse.json(
        {
          error: 'No se puede eliminar: ruta tiene relaciones activas',
          details: {
            vehiculos: existingRuta.vehiculos.length,
            horarios: existingRuta.horarios.length,
            usuarios: existingRuta.usuarios.length,
          },
        },
        { status: 400 }
      );
    }

    // Si tiene paradas, eliminarlas primero
    if (existingRuta.paradas.length > 0) {
      await prisma.parada.deleteMany({
        where: { rutaId: params.id },
      });
    }

    // Eliminar ruta
    await prisma.ruta.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Ruta eliminada exitosamente',
    });
  } catch (error: any) {
    console.error('Error deleting ruta:', error);

    if (error.code?.startsWith('P')) {
      return NextResponse.json(
        { error: handlePrismaError(error) },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al eliminar ruta' },
      { status: 500 }
    );
  }
}
```

---

### 3. Crear API Route para Estadísticas

**Archivo:** `src/app/api/rutas/stats/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/rutas/stats - Estadísticas de rutas
export async function GET(request: NextRequest) {
  try {
    const [
      total,
      activas,
      inactivas,
      especiales,
      normales,
      conParadas,
      sinParadas,
      conVehiculos,
      sinVehiculos,
      totalParadas,
      promedioParadasPorRuta,
    ] = await Promise.all([
      // Total de rutas
      prisma.ruta.count(),

      // Por estado activo
      prisma.ruta.count({ where: { activa: true } }),
      prisma.ruta.count({ where: { activa: false } }),

      // Por tipo
      prisma.ruta.count({ where: { esEspecial: true } }),
      prisma.ruta.count({ where: { esEspecial: false } }),

      // Con/sin paradas
      prisma.ruta.count({
        where: {
          paradas: {
            some: {},
          },
        },
      }),
      prisma.ruta.count({
        where: {
          paradas: {
            none: {},
          },
        },
      }),

      // Con/sin vehículos
      prisma.ruta.count({
        where: {
          vehiculos: {
            some: {},
          },
        },
      }),
      prisma.ruta.count({
        where: {
          vehiculos: {
            none: {},
          },
        },
      }),

      // Total de paradas
      prisma.parada.count(),

      // Promedio de paradas por ruta
      prisma.parada.groupBy({
        by: ['rutaId'],
        _count: true,
      }),
    ]);

    const promedioParadas =
      promedioParadasPorRuta.length > 0
        ? (
            promedioParadasPorRuta.reduce((acc, item) => acc + item._count, 0) /
            promedioParadasPorRuta.length
          ).toFixed(1)
        : '0';

    return NextResponse.json({
      total,
      porEstado: {
        activas,
        inactivas,
        porcentajeActivas: total > 0 ? ((activas / total) * 100).toFixed(1) : '0',
      },
      porTipo: {
        especiales,
        normales,
        porcentajeEspeciales: total > 0 ? ((especiales / total) * 100).toFixed(1) : '0',
      },
      paradas: {
        total: totalParadas,
        rutasConParadas: conParadas,
        rutasSinParadas: sinParadas,
        promedioParadasPorRuta: promedioParadas,
      },
      vehiculos: {
        conVehiculos,
        sinVehiculos,
        porcentajeConVehiculos: total > 0 ? ((conVehiculos / total) * 100).toFixed(1) : '0',
      },
    });
  } catch (error) {
    console.error('Error fetching ruta stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
```

---

## Pruebas de Verificación

### Test 1: Crear Ruta

```bash
curl -X POST http://localhost:9002/api/rutas \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ruta Norte",
    "descripcion": "Recorrido por la zona norte de la ciudad",
    "color": "#3b82f6",
    "activa": true,
    "esEspecial": false
  }'
```

**Respuesta esperada:**
```json
{
  "id": "clx...",
  "nombre": "Ruta Norte",
  "descripcion": "Recorrido por la zona norte de la ciudad",
  "color": "#3b82f6",
  "activa": true,
  "esEspecial": false,
  "paradas": [],
  "createdAt": "2025-02-10T...",
  "updatedAt": "2025-02-10T..."
}
```

### Test 2: Crear Ruta Especial

```bash
curl -X POST http://localhost:9002/api/rutas \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ruta Expresa Centro",
    "descripcion": "Ruta directa al centro con paradas limitadas",
    "color": "#ef4444",
    "activa": true,
    "esEspecial": true
  }'
```

### Test 3: Listar Rutas

```bash
curl http://localhost:9002/api/rutas
```

### Test 4: Filtrar Rutas Activas

```bash
curl "http://localhost:9002/api/rutas?activa=true"
```

### Test 5: Filtrar Rutas Especiales

```bash
curl "http://localhost:9002/api/rutas?esEspecial=true"
```

### Test 6: Buscar por Texto

```bash
curl "http://localhost:9002/api/rutas?search=Norte"
```

### Test 7: Obtener por ID

```bash
curl http://localhost:9002/api/rutas/clx...
```

### Test 8: Actualizar Ruta

```bash
curl -X PATCH http://localhost:9002/api/rutas/clx... \
  -H "Content-Type: application/json" \
  -d '{
    "color": "#10b981",
    "activa": false
  }'
```

### Test 9: Eliminar Ruta

```bash
curl -X DELETE http://localhost:9002/api/rutas/clx...
```

### Test 10: Estadísticas

```bash
curl http://localhost:9002/api/rutas/stats
```

**Respuesta esperada:**
```json
{
  "total": 5,
  "porEstado": {
    "activas": 4,
    "inactivas": 1,
    "porcentajeActivas": "80.0"
  },
  "porTipo": {
    "especiales": 1,
    "normales": 4,
    "porcentajeEspeciales": "20.0"
  },
  "paradas": {
    "total": 25,
    "rutasConParadas": 5,
    "rutasSinParadas": 0,
    "promedioParadasPorRuta": "5.0"
  },
  "vehiculos": {
    "conVehiculos": 3,
    "sinVehiculos": 2,
    "porcentajeConVehiculos": "60.0"
  }
}
```

---

## Troubleshooting

### Error: "Ya existe una ruta con este nombre"

**Solución:**
```sql
-- Verificar rutas duplicadas en base de datos
SELECT nombre, COUNT(*)
FROM rutas
GROUP BY nombre
HAVING COUNT(*) > 1;
```

### Error: "No se puede eliminar: ruta tiene relaciones activas"

**Solución:**
```typescript
// Primero desasignar vehículos
await prisma.vehiculo.updateMany({
  where: { rutaAsignada: 'clx...' },
  data: { rutaAsignada: null },
});

// Eliminar horarios
await prisma.horario.deleteMany({
  where: { rutaId: 'clx...' },
});

// Desasignar usuarios
await prisma.usuario.updateMany({
  where: { rutaAsignada: 'clx...' },
  data: { rutaAsignada: null },
});

// Eliminar paradas
await prisma.parada.deleteMany({
  where: { rutaId: 'clx...' },
});

// Luego eliminar ruta
await prisma.ruta.delete({
  where: { id: 'clx...' },
});
```

### Error: "Formato de color inválido"

**Solución:**
```typescript
// Verificar formato de color según schema Zod
const testData = {
  nombre: "Ruta Test",
  color: "#3b82f6",  // ✅ formato hexadecimal válido
  // color: "blue",  // ❌ inválido
  // color: "rgb(59, 130, 246)",  // ❌ inválido
};
```

### Error: "Datos de validación inválidos"

**Solución:**
```typescript
// Verificar formato de datos según schema Zod
const testData = {
  nombre: "Ruta Válida",              // ✅ min 2 caracteres
  descripcion: "Descripción corta",   // ✅ opcional, max 500
  color: "#3b82f6",                   // ✅ formato hexadecimal
  activa: true,                       // ✅ boolean
  esEspecial: false,                  // ✅ boolean
};
```

---

## Criterios de Aceptación

- [x] GET /api/rutas retorna lista con filtros
- [x] POST /api/rutas crea ruta con validación
- [x] GET /api/rutas/[id] retorna ruta con relaciones
- [x] PATCH /api/rutas/[id] actualiza ruta
- [x] DELETE /api/rutas/[id] elimina ruta
- [x] GET /api/rutas/stats retorna estadísticas
- [x] Validación Zod funciona correctamente
- [x] Manejo de errores de Prisma implementado
- [x] Filtros por activa y esEspecial operativos
- [x] Búsqueda case-insensitive funciona
- [x] Gestión de color hexadecimal funcional
- [x] Relaciones con paradas incluidas

---

## Archivos Creados

```
src/app/api/rutas/
├── route.ts                # GET, POST
├── [id]/
│   └── route.ts            # GET, PATCH, DELETE
└── stats/
    └── route.ts            # GET estadísticas
```

---

## Siguiente Historia

Una vez completada esta historia, continuar con:
**[Historia 09: API Routes - Paradas](./HISTORIA-09-api-paradas.md)**

---

**Fecha de creación:** 2025-02-10
**Última actualización:** 2025-02-10
