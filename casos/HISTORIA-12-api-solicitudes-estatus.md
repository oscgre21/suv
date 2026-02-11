# Historia 12: API Routes - SolicitudParada y EstatusVehiculo

**Prioridad:** ALTA
**Dependencias:** Historia 01, Historia 03, Historia 05, Historia 08, Historia 09, Historia 10
**Estimación:** 3-4 horas
**Estado:** Pendiente

---

## Objetivo

Implementar todas las API Routes para los módulos de SolicitudParada y EstatusVehiculo, incluyendo gestión de estados de solicitudes (Pendiente, Confirmado, NoRecogido, Cancelado), transiciones de estado con validación, sistema de notificaciones, y gestión de estatus de vehículos con colores personalizados.

---

## Pre-requisitos

- ✅ Prisma configurado (Historia 01)
- ✅ Schemas SolicitudParada y EstatusVehiculo en base de datos
- ✅ Zod schemas creados (Historia 03)
- ✅ Hook useApi implementado (Historia 05)
- ✅ API de Rutas implementada (Historia 08)
- ✅ API de Paradas implementada (Historia 09)
- ✅ API de Usuarios implementada (Historia 10)

---

## Tareas Detalladas

### 1. Crear API Route Principal - Solicitudes de Parada

**Archivo:** `src/app/api/solicitudes-parada/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { solicitudParadaSchema } from '@/lib/validations';
import { handlePrismaError } from '@/lib/api-utils';
import { z } from 'zod';

// GET /api/solicitudes-parada - Listar todas las solicitudes con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const estado = searchParams.get('estado');
    const usuarioId = searchParams.get('usuarioId');
    const rutaId = searchParams.get('rutaId');
    const paradaId = searchParams.get('paradaId');
    const notificado = searchParams.get('notificado');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const where: any = {};

    if (estado) {
      where.estado = estado;
    }

    if (usuarioId) {
      where.usuarioId = usuarioId;
    }

    if (rutaId) {
      where.rutaId = rutaId;
    }

    if (paradaId) {
      where.paradaId = paradaId;
    }

    if (notificado !== null) {
      where.notificado = notificado === 'true';
    }

    const solicitudes = await prisma.solicitudParada.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true,
          },
        },
        parada: {
          select: {
            id: true,
            nombre: true,
            direccion: true,
            latitud: true,
            longitud: true,
            orden: true,
          },
        },
        ruta: {
          select: {
            id: true,
            nombre: true,
            color: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) }),
    });

    return NextResponse.json(solicitudes);
  } catch (error) {
    console.error('Error fetching solicitudes:', error);
    return NextResponse.json(
      { error: 'Error al obtener solicitudes de parada' },
      { status: 500 }
    );
  }
}

// POST /api/solicitudes-parada - Crear nueva solicitud
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar con Zod
    const validatedData = solicitudParadaSchema.parse(body);

    // Verificar que el usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: validatedData.usuarioId },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que la parada existe
    const parada = await prisma.parada.findUnique({
      where: { id: validatedData.paradaId },
    });

    if (!parada) {
      return NextResponse.json(
        { error: 'Parada no encontrada' },
        { status: 404 }
      );
    }

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

    // Verificar que la parada pertenece a la ruta
    if (parada.rutaId !== validatedData.rutaId) {
      return NextResponse.json(
        { error: 'La parada no pertenece a la ruta especificada' },
        { status: 400 }
      );
    }

    // Verificar que no exista solicitud pendiente para mismo usuario, parada y día
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const solicitudExistente = await prisma.solicitudParada.findFirst({
      where: {
        usuarioId: validatedData.usuarioId,
        paradaId: validatedData.paradaId,
        estado: 'Pendiente',
        createdAt: {
          gte: hoy,
          lt: manana,
        },
      },
    });

    if (solicitudExistente) {
      return NextResponse.json(
        { error: 'Ya existe una solicitud pendiente para esta parada hoy' },
        { status: 400 }
      );
    }

    // Crear solicitud
    const solicitud = await prisma.solicitudParada.create({
      data: {
        estado: validatedData.estado,
        notificado: validatedData.notificado,
        usuario: {
          connect: { id: validatedData.usuarioId },
        },
        parada: {
          connect: { id: validatedData.paradaId },
        },
        ruta: {
          connect: { id: validatedData.rutaId },
        },
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true,
          },
        },
        parada: {
          select: {
            id: true,
            nombre: true,
            direccion: true,
            orden: true,
          },
        },
        ruta: {
          select: {
            id: true,
            nombre: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json(solicitud, { status: 201 });
  } catch (error: any) {
    console.error('Error creating solicitud:', error);

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
      { error: 'Error al crear solicitud de parada' },
      { status: 500 }
    );
  }
}
```

---

### 2. Crear API Route por ID - Solicitudes de Parada

**Archivo:** `src/app/api/solicitudes-parada/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { solicitudParadaSchema } from '@/lib/validations';
import { handlePrismaError } from '@/lib/api-utils';
import { z } from 'zod';

// GET /api/solicitudes-parada/[id] - Obtener solicitud por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const solicitud = await prisma.solicitudParada.findUnique({
      where: { id: params.id },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true,
            direccion: true,
          },
        },
        parada: {
          include: {
            ruta: true,
          },
        },
        ruta: true,
      },
    });

    if (!solicitud) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(solicitud);
  } catch (error) {
    console.error('Error fetching solicitud:', error);
    return NextResponse.json(
      { error: 'Error al obtener solicitud' },
      { status: 500 }
    );
  }
}

// PATCH /api/solicitudes-parada/[id] - Actualizar solicitud
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validación parcial
    const partialSchema = solicitudParadaSchema.partial();
    const validatedData = partialSchema.parse(body);

    // Verificar que la solicitud existe
    const existingSolicitud = await prisma.solicitudParada.findUnique({
      where: { id: params.id },
    });

    if (!existingSolicitud) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    // Validar transiciones de estado
    if (validatedData.estado) {
      const estadoActual = existingSolicitud.estado;
      const nuevoEstado = validatedData.estado;

      // Validar transiciones permitidas
      const transicionesValidas: Record<string, string[]> = {
        Pendiente: ['Confirmado', 'Cancelado'],
        Confirmado: ['NoRecogido', 'Cancelado'],
        NoRecogido: ['Pendiente'],
        Cancelado: ['Pendiente'],
      };

      if (!transicionesValidas[estadoActual]?.includes(nuevoEstado)) {
        return NextResponse.json(
          {
            error: `Transición de estado inválida: ${estadoActual} → ${nuevoEstado}`,
            transicionesPermitidas: transicionesValidas[estadoActual],
          },
          { status: 400 }
        );
      }
    }

    // Actualizar solicitud
    const solicitud = await prisma.solicitudParada.update({
      where: { id: params.id },
      data: {
        ...(validatedData.estado && { estado: validatedData.estado }),
        ...(validatedData.notificado !== undefined && { notificado: validatedData.notificado }),
        ...(validatedData.usuarioId && { usuarioId: validatedData.usuarioId }),
        ...(validatedData.paradaId && { paradaId: validatedData.paradaId }),
        ...(validatedData.rutaId && { rutaId: validatedData.rutaId }),
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true,
          },
        },
        parada: {
          select: {
            id: true,
            nombre: true,
            direccion: true,
            orden: true,
          },
        },
        ruta: {
          select: {
            id: true,
            nombre: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json(solicitud);
  } catch (error: any) {
    console.error('Error updating solicitud:', error);

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
      { error: 'Error al actualizar solicitud' },
      { status: 500 }
    );
  }
}

// DELETE /api/solicitudes-parada/[id] - Eliminar solicitud
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingSolicitud = await prisma.solicitudParada.findUnique({
      where: { id: params.id },
    });

    if (!existingSolicitud) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    // Solo permitir eliminar si está en estado Cancelado
    if (existingSolicitud.estado !== 'Cancelado') {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar solicitudes canceladas' },
        { status: 400 }
      );
    }

    await prisma.solicitudParada.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Solicitud eliminada exitosamente',
    });
  } catch (error: any) {
    console.error('Error deleting solicitud:', error);

    if (error.code?.startsWith('P')) {
      return NextResponse.json(
        { error: handlePrismaError(error) },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al eliminar solicitud' },
      { status: 500 }
    );
  }
}
```

---

### 3. Crear API Route para Estadísticas de Solicitudes

**Archivo:** `src/app/api/solicitudes-parada/stats/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/solicitudes-parada/stats - Estadísticas de solicitudes
export async function GET(request: NextRequest) {
  try {
    const [
      total,
      pendientes,
      confirmadas,
      noRecogidas,
      canceladas,
      notificadas,
      noNotificadas,
      porRuta,
      porUsuario,
    ] = await Promise.all([
      // Total
      prisma.solicitudParada.count(),

      // Por estado
      prisma.solicitudParada.count({ where: { estado: 'Pendiente' } }),
      prisma.solicitudParada.count({ where: { estado: 'Confirmado' } }),
      prisma.solicitudParada.count({ where: { estado: 'NoRecogido' } }),
      prisma.solicitudParada.count({ where: { estado: 'Cancelado' } }),

      // Por notificación
      prisma.solicitudParada.count({ where: { notificado: true } }),
      prisma.solicitudParada.count({ where: { notificado: false } }),

      // Por ruta
      prisma.solicitudParada.groupBy({
        by: ['rutaId'],
        _count: true,
      }),

      // Top usuarios con más solicitudes
      prisma.solicitudParada.groupBy({
        by: ['usuarioId'],
        _count: true,
      }),
    ]);

    // Obtener nombres
    const rutasIds = porRuta.map(r => r.rutaId);
    const usuariosIds = porUsuario.map(u => u.usuarioId).slice(0, 10);

    const [rutas, usuarios] = await Promise.all([
      prisma.ruta.findMany({
        where: { id: { in: rutasIds } },
        select: { id: true, nombre: true },
      }),
      prisma.usuario.findMany({
        where: { id: { in: usuariosIds } },
        select: { id: true, nombre: true },
      }),
    ]);

    const rutasMap = rutas.reduce((acc, r) => {
      acc[r.id] = r.nombre;
      return acc;
    }, {} as Record<string, string>);

    const usuariosMap = usuarios.reduce((acc, u) => {
      acc[u.id] = u.nombre;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      total,
      porEstado: {
        pendientes,
        confirmadas,
        noRecogidas,
        canceladas,
      },
      notificaciones: {
        notificadas,
        noNotificadas,
        porcentajeNotificadas: total > 0 ? ((notificadas / total) * 100).toFixed(1) : '0',
      },
      porRuta: porRuta.map(r => ({
        rutaId: r.rutaId,
        rutaNombre: rutasMap[r.rutaId] || 'Desconocida',
        cantidad: r._count,
      })),
      topUsuarios: porUsuario
        .sort((a, b) => b._count - a._count)
        .slice(0, 10)
        .map(u => ({
          usuarioId: u.usuarioId,
          usuarioNombre: usuariosMap[u.usuarioId] || 'Desconocido',
          cantidad: u._count,
        })),
    });
  } catch (error) {
    console.error('Error fetching solicitud stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
```

---

### 4. Crear API Route Principal - Estatus de Vehículos

**Archivo:** `src/app/api/estatus-vehiculos/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { estatusVehiculoSchema } from '@/lib/validations';
import { handlePrismaError } from '@/lib/api-utils';
import { z } from 'zod';

// GET /api/estatus-vehiculos - Listar todos los estatus
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const activo = searchParams.get('activo');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const where: any = {};

    if (activo !== null) {
      where.activo = activo === 'true';
    }

    const estatusVehiculos = await prisma.estatusVehiculo.findMany({
      where,
      orderBy: {
        nombre: 'asc',
      },
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) }),
    });

    return NextResponse.json(estatusVehiculos);
  } catch (error) {
    console.error('Error fetching estatus vehiculos:', error);
    return NextResponse.json(
      { error: 'Error al obtener estatus de vehículos' },
      { status: 500 }
    );
  }
}

// POST /api/estatus-vehiculos - Crear nuevo estatus
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar con Zod
    const validatedData = estatusVehiculoSchema.parse(body);

    // Verificar que no exista estatus con mismo nombre
    const existingEstatus = await prisma.estatusVehiculo.findFirst({
      where: {
        nombre: {
          equals: validatedData.nombre,
          mode: 'insensitive',
        },
      },
    });

    if (existingEstatus) {
      return NextResponse.json(
        { error: 'Ya existe un estatus con este nombre' },
        { status: 400 }
      );
    }

    // Crear estatus
    const estatus = await prisma.estatusVehiculo.create({
      data: {
        nombre: validatedData.nombre,
        color: validatedData.color,
        descripcion: validatedData.descripcion || null,
        activo: validatedData.activo,
      },
    });

    return NextResponse.json(estatus, { status: 201 });
  } catch (error: any) {
    console.error('Error creating estatus vehiculo:', error);

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
      { error: 'Error al crear estatus de vehículo' },
      { status: 500 }
    );
  }
}
```

---

### 5. Crear API Route por ID - Estatus de Vehículos

**Archivo:** `src/app/api/estatus-vehiculos/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { estatusVehiculoSchema } from '@/lib/validations';
import { handlePrismaError } from '@/lib/api-utils';
import { z } from 'zod';

// GET /api/estatus-vehiculos/[id] - Obtener estatus por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const estatus = await prisma.estatusVehiculo.findUnique({
      where: { id: params.id },
    });

    if (!estatus) {
      return NextResponse.json(
        { error: 'Estatus no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(estatus);
  } catch (error) {
    console.error('Error fetching estatus vehiculo:', error);
    return NextResponse.json(
      { error: 'Error al obtener estatus' },
      { status: 500 }
    );
  }
}

// PATCH /api/estatus-vehiculos/[id] - Actualizar estatus
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validación parcial
    const partialSchema = estatusVehiculoSchema.partial();
    const validatedData = partialSchema.parse(body);

    // Verificar que el estatus existe
    const existingEstatus = await prisma.estatusVehiculo.findUnique({
      where: { id: params.id },
    });

    if (!existingEstatus) {
      return NextResponse.json(
        { error: 'Estatus no encontrado' },
        { status: 404 }
      );
    }

    // Si se actualiza nombre, verificar que no exista
    if (validatedData.nombre) {
      const duplicate = await prisma.estatusVehiculo.findFirst({
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
          { error: 'Ya existe otro estatus con este nombre' },
          { status: 400 }
        );
      }
    }

    // Actualizar estatus
    const estatus = await prisma.estatusVehiculo.update({
      where: { id: params.id },
      data: {
        ...(validatedData.nombre && { nombre: validatedData.nombre }),
        ...(validatedData.color && { color: validatedData.color }),
        ...(validatedData.descripcion !== undefined && {
          descripcion: validatedData.descripcion || null,
        }),
        ...(validatedData.activo !== undefined && { activo: validatedData.activo }),
      },
    });

    return NextResponse.json(estatus);
  } catch (error: any) {
    console.error('Error updating estatus vehiculo:', error);

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
      { error: 'Error al actualizar estatus' },
      { status: 500 }
    );
  }
}

// DELETE /api/estatus-vehiculos/[id] - Eliminar estatus
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingEstatus = await prisma.estatusVehiculo.findUnique({
      where: { id: params.id },
    });

    if (!existingEstatus) {
      return NextResponse.json(
        { error: 'Estatus no encontrado' },
        { status: 404 }
      );
    }

    // Marcar como inactivo en lugar de eliminar
    const updated = await prisma.estatusVehiculo.update({
      where: { id: params.id },
      data: { activo: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Estatus marcado como inactivo',
      estatus: updated,
    });
  } catch (error: any) {
    console.error('Error deleting estatus vehiculo:', error);

    if (error.code?.startsWith('P')) {
      return NextResponse.json(
        { error: handlePrismaError(error) },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al eliminar estatus' },
      { status: 500 }
    );
  }
}
```

---

### 6. Crear API Route para Estadísticas de Estatus

**Archivo:** `src/app/api/estatus-vehiculos/stats/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/estatus-vehiculos/stats - Estadísticas de estatus
export async function GET(request: NextRequest) {
  try {
    const [total, activos, inactivos] = await Promise.all([
      prisma.estatusVehiculo.count(),
      prisma.estatusVehiculo.count({ where: { activo: true } }),
      prisma.estatusVehiculo.count({ where: { activo: false } }),
    ]);

    return NextResponse.json({
      total,
      activos,
      inactivos,
      porcentajeActivos: total > 0 ? ((activos / total) * 100).toFixed(1) : '0',
    });
  } catch (error) {
    console.error('Error fetching estatus vehiculo stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
```

---

## Pruebas de Verificación

### Test 1: Crear Solicitud de Parada

```bash
curl -X POST http://localhost:9002/api/solicitudes-parada \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "clx...",
    "paradaId": "clx...",
    "rutaId": "clx...",
    "estado": "Pendiente",
    "notificado": false
  }'
```

### Test 2: Actualizar Estado de Solicitud

```bash
curl -X PATCH http://localhost:9002/api/solicitudes-parada/clx... \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "Confirmado",
    "notificado": true
  }'
```

### Test 3: Filtrar Solicitudes Pendientes

```bash
curl "http://localhost:9002/api/solicitudes-parada?estado=Pendiente"
```

### Test 4: Estadísticas de Solicitudes

```bash
curl http://localhost:9002/api/solicitudes-parada/stats
```

### Test 5: Crear Estatus de Vehículo

```bash
curl -X POST http://localhost:9002/api/estatus-vehiculos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "En Ruta",
    "color": "#10b981",
    "descripcion": "Vehículo realizando recorrido",
    "activo": true
  }'
```

### Test 6: Listar Estatus Activos

```bash
curl "http://localhost:9002/api/estatus-vehiculos?activo=true"
```

### Test 7: Actualizar Estatus

```bash
curl -X PATCH http://localhost:9002/api/estatus-vehiculos/clx... \
  -H "Content-Type: application/json" \
  -d '{
    "color": "#3b82f6",
    "descripcion": "Actualizada"
  }'
```

### Test 8: Estadísticas de Estatus

```bash
curl http://localhost:9002/api/estatus-vehiculos/stats
```

---

## Troubleshooting

### Error: "Transición de estado inválida"

**Solución:**
```typescript
// Transiciones válidas de estado:
const transiciones = {
  Pendiente: ['Confirmado', 'Cancelado'],
  Confirmado: ['NoRecogido', 'Cancelado'],
  NoRecogido: ['Pendiente'],
  Cancelado: ['Pendiente'],
};
```

### Error: "Ya existe una solicitud pendiente para esta parada hoy"

**Solución:**
```bash
# Verificar solicitudes existentes del usuario
curl "http://localhost:9002/api/solicitudes-parada?usuarioId=clx...&estado=Pendiente"

# Cancelar solicitud existente o cambiar de parada
```

### Error: "La parada no pertenece a la ruta especificada"

**Solución:**
```bash
# Verificar que la parada pertenece a la ruta correcta
curl http://localhost:9002/api/paradas/clx...

# Usar la rutaId correcta de la parada
```

---

## Criterios de Aceptación

- [x] GET /api/solicitudes-parada retorna lista con filtros
- [x] POST /api/solicitudes-parada crea solicitud
- [x] PATCH actualiza con validación de transiciones
- [x] DELETE elimina solo si está cancelada
- [x] GET /api/solicitudes-parada/stats funciona
- [x] GET /api/estatus-vehiculos retorna lista
- [x] POST /api/estatus-vehiculos crea estatus
- [x] PATCH /api/estatus-vehiculos actualiza
- [x] DELETE marca como inactivo
- [x] Gestión de colores hexadecimales
- [x] Sistema de notificaciones incluido

---

## Archivos Creados

```
src/app/api/
├── solicitudes-parada/
│   ├── route.ts            # GET, POST
│   ├── [id]/
│   │   └── route.ts        # GET, PATCH, DELETE
│   └── stats/
│       └── route.ts        # GET estadísticas
└── estatus-vehiculos/
    ├── route.ts            # GET, POST
    ├── [id]/
    │   └── route.ts        # GET, PATCH, DELETE
    └── stats/
        └── route.ts        # GET estadísticas
```

---

## Siguiente Historia

Una vez completada esta historia, continuar con:
**[Historia 13: Componentes UI - Dashboard y Módulos](./HISTORIA-13-componentes-ui.md)**

---

**Fecha de creación:** 2025-02-10
**Última actualización:** 2025-02-10
