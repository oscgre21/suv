# Historia 10: API Routes - Usuarios

**Prioridad:** ALTA
**Dependencias:** Historia 01, Historia 03, Historia 05, Historia 08
**Estimación:** 2-3 horas
**Estado:** Pendiente

---

## Objetivo

Implementar todas las API Routes para el módulo de Usuarios, incluyendo gestión de relaciones con rutas, manejo de solicitudes de paradas, validación de cédula y email únicos, y control de estados activo/inactivo.

---

## Pre-requisitos

- ✅ Prisma configurado (Historia 01)
- ✅ Schema Usuario en base de datos
- ✅ Zod schemas creados (Historia 03)
- ✅ Hook useApi implementado (Historia 05)
- ✅ API de Rutas implementada (Historia 08)

---

## Tareas Detalladas

### 1. Crear API Route Principal - Usuarios

**Archivo:** `src/app/api/usuarios/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { usuarioSchema } from '@/lib/validations';
import { handlePrismaError } from '@/lib/api-utils';
import { z } from 'zod';

// GET /api/usuarios - Listar todos los usuarios con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const estado = searchParams.get('estado');
    const rutaAsignada = searchParams.get('rutaAsignada');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const where: any = {};

    if (estado) {
      where.estado = estado;
    }

    if (rutaAsignada) {
      where.rutaAsignada = rutaAsignada;
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { cedula: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { telefono: { contains: search, mode: 'insensitive' } },
      ];
    }

    const usuarios = await prisma.usuario.findMany({
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
          include: {
            parada: {
              select: {
                id: true,
                nombre: true,
                direccion: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) }),
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Error fetching usuarios:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

// POST /api/usuarios - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar con Zod
    const validatedData = usuarioSchema.parse(body);

    // Verificar que no exista usuario con misma cédula o email
    const existingUsuario = await prisma.usuario.findFirst({
      where: {
        OR: [
          { cedula: validatedData.cedula },
          { email: validatedData.email },
        ],
      },
    });

    if (existingUsuario) {
      if (existingUsuario.cedula === validatedData.cedula) {
        return NextResponse.json(
          { error: 'Ya existe un usuario con esta cédula' },
          { status: 400 }
        );
      }
      if (existingUsuario.email === validatedData.email) {
        return NextResponse.json(
          { error: 'Ya existe un usuario con este email' },
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

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        nombre: validatedData.nombre,
        cedula: validatedData.cedula,
        email: validatedData.email,
        telefono: validatedData.telefono || null,
        direccion: validatedData.direccion || null,
        estado: validatedData.estado,
        ...(validatedData.rutaAsignada && {
          ruta: {
            connect: { id: validatedData.rutaAsignada },
          },
        }),
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

    return NextResponse.json(usuario, { status: 201 });
  } catch (error: any) {
    console.error('Error creating usuario:', error);

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
      { error: 'Error al crear usuario' },
      { status: 500 }
    );
  }
}
```

---

### 2. Crear API Route por ID - Usuarios

**Archivo:** `src/app/api/usuarios/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { usuarioSchema } from '@/lib/validations';
import { handlePrismaError } from '@/lib/api-utils';
import { z } from 'zod';

// GET /api/usuarios/[id] - Obtener usuario por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usuario = await prisma.usuario.findUnique({
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
                direccion: true,
                latitud: true,
                longitud: true,
                orden: true,
              },
            },
          },
        },
        solicitudes: {
          include: {
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
          orderBy: {
            createdAt: 'desc',
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
            conductor: {
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

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Error fetching usuario:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}

// PATCH /api/usuarios/[id] - Actualizar usuario
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validación parcial
    const partialSchema = usuarioSchema.partial();
    const validatedData = partialSchema.parse(body);

    // Verificar que el usuario existe
    const existingUsuario = await prisma.usuario.findUnique({
      where: { id: params.id },
    });

    if (!existingUsuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Si se está actualizando cédula o email, verificar que no exista
    if (validatedData.cedula || validatedData.email) {
      const duplicate = await prisma.usuario.findFirst({
        where: {
          AND: [
            { id: { not: params.id } },
            {
              OR: [
                ...(validatedData.cedula ? [{ cedula: validatedData.cedula }] : []),
                ...(validatedData.email ? [{ email: validatedData.email }] : []),
              ],
            },
          ],
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'Cédula o email ya registrado en otro usuario' },
          { status: 400 }
        );
      }
    }

    // Si se está actualizando la ruta, verificar que existe
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

    // Actualizar usuario
    const usuario = await prisma.usuario.update({
      where: { id: params.id },
      data: {
        ...(validatedData.nombre && { nombre: validatedData.nombre }),
        ...(validatedData.cedula && { cedula: validatedData.cedula }),
        ...(validatedData.email && { email: validatedData.email }),
        ...(validatedData.telefono !== undefined && {
          telefono: validatedData.telefono || null,
        }),
        ...(validatedData.direccion !== undefined && {
          direccion: validatedData.direccion || null,
        }),
        ...(validatedData.estado && { estado: validatedData.estado }),
        ...(validatedData.rutaAsignada !== undefined && {
          rutaAsignada: validatedData.rutaAsignada,
        }),
      },
      include: {
        ruta: {
          select: {
            id: true,
            nombre: true,
            color: true,
          },
        },
        solicitudes: {
          where: {
            estado: 'Pendiente',
          },
        },
      },
    });

    return NextResponse.json(usuario);
  } catch (error: any) {
    console.error('Error updating usuario:', error);

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
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}

// DELETE /api/usuarios/[id] - Eliminar usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar que el usuario existe
    const existingUsuario = await prisma.usuario.findUnique({
      where: { id: params.id },
      include: {
        solicitudes: true,
        historialViajes: true,
      },
    });

    if (!existingUsuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Si tiene historial de viajes o solicitudes, marcar como inactivo
    if (existingUsuario.historialViajes.length > 0 || existingUsuario.solicitudes.length > 0) {
      const updated = await prisma.usuario.update({
        where: { id: params.id },
        data: { estado: 'Inactivo' },
      });

      return NextResponse.json({
        success: true,
        message: 'Usuario marcado como inactivo (tiene historial)',
        usuario: updated,
      });
    }

    // Si no tiene historial, eliminar
    await prisma.usuario.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Error deleting usuario:', error);

    if (error.code?.startsWith('P')) {
      return NextResponse.json(
        { error: handlePrismaError(error) },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}
```

---

### 3. Crear API Route para Estadísticas

**Archivo:** `src/app/api/usuarios/stats/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/usuarios/stats - Estadísticas de usuarios
export async function GET(request: NextRequest) {
  try {
    const [
      total,
      activos,
      inactivos,
      conRuta,
      sinRuta,
      porRuta,
      conSolicitudesPendientes,
    ] = await Promise.all([
      // Total de usuarios
      prisma.usuario.count(),

      // Por estado
      prisma.usuario.count({ where: { estado: 'Activo' } }),
      prisma.usuario.count({ where: { estado: 'Inactivo' } }),

      // Con/sin ruta asignada
      prisma.usuario.count({
        where: { rutaAsignada: { not: null } },
      }),
      prisma.usuario.count({
        where: { rutaAsignada: null },
      }),

      // Por ruta
      prisma.usuario.groupBy({
        by: ['rutaAsignada'],
        _count: true,
        where: { rutaAsignada: { not: null } },
      }),

      // Con solicitudes pendientes
      prisma.usuario.count({
        where: {
          solicitudes: {
            some: {
              estado: 'Pendiente',
            },
          },
        },
      }),
    ]);

    // Obtener nombres de rutas
    const rutasIds = porRuta.map(r => r.rutaAsignada!);
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
        activos,
        inactivos,
        porcentajeActivos: total > 0 ? ((activos / total) * 100).toFixed(1) : '0',
      },
      asignacion: {
        conRuta,
        sinRuta,
        porcentajeAsignados: total > 0 ? ((conRuta / total) * 100).toFixed(1) : '0',
      },
      porRuta: porRuta.map(r => ({
        rutaId: r.rutaAsignada,
        rutaNombre: rutasMap[r.rutaAsignada!] || 'Desconocida',
        cantidad: r._count,
      })),
      solicitudes: {
        conSolicitudesPendientes,
      },
    });
  } catch (error) {
    console.error('Error fetching usuario stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
```

---

## Pruebas de Verificación

### Test 1: Crear Usuario

```bash
curl -X POST http://localhost:9002/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María González",
    "cedula": "002-1234567-9",
    "email": "maria@example.com",
    "telefono": "809-555-1234",
    "direccion": "Calle Principal #45, Santo Domingo",
    "estado": "Activo"
  }'
```

**Respuesta esperada:**
```json
{
  "id": "clx...",
  "nombre": "María González",
  "cedula": "002-1234567-9",
  "email": "maria@example.com",
  "telefono": "809-555-1234",
  "direccion": "Calle Principal #45, Santo Domingo",
  "estado": "Activo",
  "rutaAsignada": null,
  "ruta": null,
  "createdAt": "2025-02-10T...",
  "updatedAt": "2025-02-10T..."
}
```

### Test 2: Crear Usuario con Ruta Asignada

```bash
curl -X POST http://localhost:9002/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "cedula": "002-9876543-1",
    "email": "juan@example.com",
    "telefono": "809-555-5678",
    "rutaAsignada": "clx...",
    "estado": "Activo"
  }'
```

### Test 3: Listar Usuarios

```bash
curl http://localhost:9002/api/usuarios
```

### Test 4: Filtrar por Estado

```bash
curl "http://localhost:9002/api/usuarios?estado=Activo"
```

### Test 5: Filtrar por Ruta

```bash
curl "http://localhost:9002/api/usuarios?rutaAsignada=clx..."
```

### Test 6: Buscar por Texto

```bash
curl "http://localhost:9002/api/usuarios?search=María"
```

### Test 7: Obtener por ID

```bash
curl http://localhost:9002/api/usuarios/clx...
```

### Test 8: Actualizar Usuario

```bash
curl -X PATCH http://localhost:9002/api/usuarios/clx... \
  -H "Content-Type: application/json" \
  -d '{
    "telefono": "809-555-9999",
    "rutaAsignada": "clx..."
  }'
```

### Test 9: Eliminar Usuario

```bash
curl -X DELETE http://localhost:9002/api/usuarios/clx...
```

### Test 10: Estadísticas

```bash
curl http://localhost:9002/api/usuarios/stats
```

**Respuesta esperada:**
```json
{
  "total": 15,
  "porEstado": {
    "activos": 12,
    "inactivos": 3,
    "porcentajeActivos": "80.0"
  },
  "asignacion": {
    "conRuta": 10,
    "sinRuta": 5,
    "porcentajeAsignados": "66.7"
  },
  "porRuta": [
    {
      "rutaId": "clx1...",
      "rutaNombre": "Ruta Norte",
      "cantidad": 5
    },
    {
      "rutaId": "clx2...",
      "rutaNombre": "Ruta Sur",
      "cantidad": 5
    }
  ],
  "solicitudes": {
    "conSolicitudesPendientes": 3
  }
}
```

---

## Troubleshooting

### Error: "Ya existe un usuario con esta cédula"

**Solución:**
```sql
-- Verificar usuarios duplicados en base de datos
SELECT cedula, COUNT(*)
FROM usuarios
GROUP BY cedula
HAVING COUNT(*) > 1;
```

### Error: "Ya existe un usuario con este email"

**Solución:**
```sql
-- Verificar emails duplicados en base de datos
SELECT email, COUNT(*)
FROM usuarios
GROUP BY email
HAVING COUNT(*) > 1;
```

### Error: "Ruta no encontrada"

**Solución:**
```bash
# Verificar que la ruta existe
curl http://localhost:9002/api/rutas/clx...

# Si no existe, crear ruta primero o usar null
curl -X POST http://localhost:9002/api/usuarios \
  -d '{"rutaAsignada": null, ...}'
```

### Error: "Datos de validación inválidos"

**Solución:**
```typescript
// Verificar formato de datos según schema Zod
const testData = {
  nombre: "Nombre Válido",            // ✅ min 2 caracteres
  cedula: "002-1234567-9",            // ✅ formato correcto
  email: "correo@valido.com",         // ✅ email válido
  telefono: "809-555-1234",           // ✅ formato correcto (opcional)
  estado: "Activo",                   // ✅ enum válido
};
```

---

## Criterios de Aceptación

- [x] GET /api/usuarios retorna lista con filtros
- [x] POST /api/usuarios crea usuario con validación
- [x] GET /api/usuarios/[id] retorna usuario con relaciones
- [x] PATCH /api/usuarios/[id] actualiza usuario
- [x] DELETE /api/usuarios/[id] elimina o inactiva
- [x] GET /api/usuarios/stats retorna estadísticas
- [x] Validación Zod funciona correctamente
- [x] Manejo de errores de Prisma implementado
- [x] Validación de cédula única funciona
- [x] Validación de email único funciona
- [x] Relación con ruta funcional
- [x] Solicitudes de paradas incluidas

---

## Archivos Creados

```
src/app/api/usuarios/
├── route.ts                # GET, POST
├── [id]/
│   └── route.ts            # GET, PATCH, DELETE
└── stats/
    └── route.ts            # GET estadísticas
```

---

## Siguiente Historia

Una vez completada esta historia, continuar con:
**[Historia 11: API Routes - Horarios](./HISTORIA-11-api-horarios.md)**

---

**Fecha de creación:** 2025-02-10
**Última actualización:** 2025-02-10
