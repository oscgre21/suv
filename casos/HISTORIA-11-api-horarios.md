# Historia 11: API Routes - Horarios

**Prioridad:** ALTA
**Dependencias:** Historia 01, Historia 03, Historia 05, Historia 06, Historia 08
**Estimación:** 3-4 horas
**Estado:** Pendiente

---

## Objetivo

Implementar todas las API Routes para el módulo de Horarios, incluyendo gestión de relaciones con conductores y rutas, validación de rangos de tiempo, manejo de días de semana, detección de conflictos de horarios, y control de horarios activos/inactivos.

---

## Pre-requisitos

- ✅ Prisma configurado (Historia 01)
- ✅ Schema Horario en base de datos
- ✅ Zod schemas creados (Historia 03)
- ✅ Hook useApi implementado (Historia 05)
- ✅ API de Conductores implementada (Historia 06)
- ✅ API de Rutas implementada (Historia 08)

---

## Tareas Detalladas

### 1. Crear API Route Principal - Horarios

**Archivo:** `src/app/api/horarios/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { horarioSchema } from '@/lib/validations';
import { handlePrismaError } from '@/lib/api-utils';
import { z } from 'zod';

// GET /api/horarios - Listar todos los horarios con filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const rutaId = searchParams.get('rutaId');
    const conductorId = searchParams.get('conductorId');
    const activo = searchParams.get('activo');
    const diaSemana = searchParams.get('diaSemana');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const where: any = {};

    if (rutaId) {
      where.rutaId = rutaId;
    }

    if (conductorId) {
      where.conductorId = conductorId;
    }

    if (activo !== null) {
      where.activo = activo === 'true';
    }

    if (diaSemana) {
      where.diasSemana = {
        has: diaSemana,
      };
    }

    const horarios = await prisma.horario.findMany({
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
      orderBy: [
        { horaInicio: 'asc' },
      ],
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) }),
    });

    return NextResponse.json(horarios);
  } catch (error) {
    console.error('Error fetching horarios:', error);
    return NextResponse.json(
      { error: 'Error al obtener horarios' },
      { status: 500 }
    );
  }
}

// POST /api/horarios - Crear nuevo horario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar con Zod
    const validatedData = horarioSchema.parse(body);

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

    // Verificar que el conductor existe y está activo
    const conductor = await prisma.conductor.findUnique({
      where: { id: validatedData.conductorId },
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

    // Verificar conflictos de horarios para el conductor
    const conflictos = await prisma.horario.findMany({
      where: {
        conductorId: validatedData.conductorId,
        activo: true,
        diasSemana: {
          hasSome: validatedData.diasSemana,
        },
      },
    });

    for (const conflicto of conflictos) {
      // Convertir horas a minutos para comparación
      const [horaInicioH, horaInicioM] = validatedData.horaInicio.split(':').map(Number);
      const [horaFinH, horaFinM] = validatedData.horaFin.split(':').map(Number);
      const inicioMinutos = horaInicioH * 60 + horaInicioM;
      const finMinutos = horaFinH * 60 + horaFinM;

      const [confInicioH, confInicioM] = conflicto.horaInicio.split(':').map(Number);
      const [confFinH, confFinM] = conflicto.horaFin.split(':').map(Number);
      const confInicioMinutos = confInicioH * 60 + confInicioM;
      const confFinMinutos = confFinH * 60 + confFinM;

      // Detectar solapamiento de horarios
      const haySolapamiento =
        (inicioMinutos >= confInicioMinutos && inicioMinutos < confFinMinutos) ||
        (finMinutos > confInicioMinutos && finMinutos <= confFinMinutos) ||
        (inicioMinutos <= confInicioMinutos && finMinutos >= confFinMinutos);

      if (haySolapamiento) {
        return NextResponse.json(
          {
            error: 'Conflicto de horarios detectado',
            details: {
              conflictoId: conflicto.id,
              horarioExistente: `${conflicto.horaInicio} - ${conflicto.horaFin}`,
              diasConflicto: conflicto.diasSemana.filter(d =>
                validatedData.diasSemana.includes(d)
              ),
            },
          },
          { status: 400 }
        );
      }
    }

    // Crear horario
    const horario = await prisma.horario.create({
      data: {
        horaInicio: validatedData.horaInicio,
        horaFin: validatedData.horaFin,
        diasSemana: validatedData.diasSemana,
        activo: validatedData.activo,
        ruta: {
          connect: { id: validatedData.rutaId },
        },
        conductor: {
          connect: { id: validatedData.conductorId },
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
        conductor: {
          select: {
            id: true,
            nombre: true,
            cedula: true,
            turno: true,
          },
        },
      },
    });

    return NextResponse.json(horario, { status: 201 });
  } catch (error: any) {
    console.error('Error creating horario:', error);

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
      { error: 'Error al crear horario' },
      { status: 500 }
    );
  }
}
```

---

### 2. Crear API Route por ID - Horarios

**Archivo:** `src/app/api/horarios/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { horarioSchema } from '@/lib/validations';
import { handlePrismaError } from '@/lib/api-utils';
import { z } from 'zod';

// GET /api/horarios/[id] - Obtener horario por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const horario = await prisma.horario.findUnique({
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
              },
            },
          },
        },
        conductor: {
          include: {
            vehiculo: {
              select: {
                id: true,
                ficha: true,
                modelo: true,
                placa: true,
                estado: true,
              },
            },
          },
        },
      },
    });

    if (!horario) {
      return NextResponse.json(
        { error: 'Horario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(horario);
  } catch (error) {
    console.error('Error fetching horario:', error);
    return NextResponse.json(
      { error: 'Error al obtener horario' },
      { status: 500 }
    );
  }
}

// PATCH /api/horarios/[id] - Actualizar horario
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validación parcial
    const partialSchema = horarioSchema.partial();
    const validatedData = partialSchema.parse(body);

    // Verificar que el horario existe
    const existingHorario = await prisma.horario.findUnique({
      where: { id: params.id },
    });

    if (!existingHorario) {
      return NextResponse.json(
        { error: 'Horario no encontrado' },
        { status: 404 }
      );
    }

    // Si se actualiza conductor, verificar que existe y está activo
    if (validatedData.conductorId) {
      const conductor = await prisma.conductor.findUnique({
        where: { id: validatedData.conductorId },
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
    }

    // Si se actualizan horarios o días, verificar conflictos
    if (validatedData.horaInicio || validatedData.horaFin || validatedData.diasSemana) {
      const horaInicio = validatedData.horaInicio || existingHorario.horaInicio;
      const horaFin = validatedData.horaFin || existingHorario.horaFin;
      const diasSemana = validatedData.diasSemana || existingHorario.diasSemana;
      const conductorId = validatedData.conductorId || existingHorario.conductorId;

      const conflictos = await prisma.horario.findMany({
        where: {
          conductorId: conductorId,
          activo: true,
          id: { not: params.id },
          diasSemana: {
            hasSome: diasSemana,
          },
        },
      });

      for (const conflicto of conflictos) {
        const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number);
        const [horaFinH, horaFinM] = horaFin.split(':').map(Number);
        const inicioMinutos = horaInicioH * 60 + horaInicioM;
        const finMinutos = horaFinH * 60 + horaFinM;

        const [confInicioH, confInicioM] = conflicto.horaInicio.split(':').map(Number);
        const [confFinH, confFinM] = conflicto.horaFin.split(':').map(Number);
        const confInicioMinutos = confInicioH * 60 + confInicioM;
        const confFinMinutos = confFinH * 60 + confFinM;

        const haySolapamiento =
          (inicioMinutos >= confInicioMinutos && inicioMinutos < confFinMinutos) ||
          (finMinutos > confInicioMinutos && finMinutos <= confFinMinutos) ||
          (inicioMinutos <= confInicioMinutos && finMinutos >= confFinMinutos);

        if (haySolapamiento) {
          return NextResponse.json(
            {
              error: 'Conflicto de horarios detectado',
              details: {
                conflictoId: conflicto.id,
                horarioExistente: `${conflicto.horaInicio} - ${conflicto.horaFin}`,
                diasConflicto: conflicto.diasSemana.filter(d => diasSemana.includes(d)),
              },
            },
            { status: 400 }
          );
        }
      }
    }

    // Actualizar horario
    const horario = await prisma.horario.update({
      where: { id: params.id },
      data: {
        ...(validatedData.horaInicio && { horaInicio: validatedData.horaInicio }),
        ...(validatedData.horaFin && { horaFin: validatedData.horaFin }),
        ...(validatedData.diasSemana && { diasSemana: validatedData.diasSemana }),
        ...(validatedData.activo !== undefined && { activo: validatedData.activo }),
        ...(validatedData.rutaId && { rutaId: validatedData.rutaId }),
        ...(validatedData.conductorId && { conductorId: validatedData.conductorId }),
      },
      include: {
        ruta: {
          select: {
            id: true,
            nombre: true,
            color: true,
          },
        },
        conductor: {
          select: {
            id: true,
            nombre: true,
            cedula: true,
            turno: true,
          },
        },
      },
    });

    return NextResponse.json(horario);
  } catch (error: any) {
    console.error('Error updating horario:', error);

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
      { error: 'Error al actualizar horario' },
      { status: 500 }
    );
  }
}

// DELETE /api/horarios/[id] - Eliminar horario
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar que el horario existe
    const existingHorario = await prisma.horario.findUnique({
      where: { id: params.id },
    });

    if (!existingHorario) {
      return NextResponse.json(
        { error: 'Horario no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar horario
    await prisma.horario.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Horario eliminado exitosamente',
    });
  } catch (error: any) {
    console.error('Error deleting horario:', error);

    if (error.code?.startsWith('P')) {
      return NextResponse.json(
        { error: handlePrismaError(error) },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al eliminar horario' },
      { status: 500 }
    );
  }
}
```

---

### 3. Crear API Route para Verificar Conflictos

**Archivo:** `src/app/api/horarios/verificar-conflictos/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const verificarSchema = z.object({
  conductorId: z.string().min(1),
  horaInicio: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  horaFin: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  diasSemana: z.array(z.string()).min(1),
  excluirHorarioId: z.string().optional(),
});

// POST /api/horarios/verificar-conflictos - Verificar conflictos de horarios
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = verificarSchema.parse(body);

    // Buscar horarios del conductor en los días especificados
    const horarios = await prisma.horario.findMany({
      where: {
        conductorId: validatedData.conductorId,
        activo: true,
        diasSemana: {
          hasSome: validatedData.diasSemana,
        },
        ...(validatedData.excluirHorarioId && {
          id: { not: validatedData.excluirHorarioId },
        }),
      },
      include: {
        ruta: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    const [horaInicioH, horaInicioM] = validatedData.horaInicio.split(':').map(Number);
    const [horaFinH, horaFinM] = validatedData.horaFin.split(':').map(Number);
    const inicioMinutos = horaInicioH * 60 + horaInicioM;
    const finMinutos = horaFinH * 60 + horaFinM;

    const conflictos = horarios
      .map(horario => {
        const [confInicioH, confInicioM] = horario.horaInicio.split(':').map(Number);
        const [confFinH, confFinM] = horario.horaFin.split(':').map(Number);
        const confInicioMinutos = confInicioH * 60 + confInicioM;
        const confFinMinutos = confFinH * 60 + confFinM;

        const haySolapamiento =
          (inicioMinutos >= confInicioMinutos && inicioMinutos < confFinMinutos) ||
          (finMinutos > confInicioMinutos && finMinutos <= confFinMinutos) ||
          (inicioMinutos <= confInicioMinutos && finMinutos >= confFinMinutos);

        if (haySolapamiento) {
          return {
            horarioId: horario.id,
            ruta: horario.ruta.nombre,
            horaInicio: horario.horaInicio,
            horaFin: horario.horaFin,
            diasConflicto: horario.diasSemana.filter(d =>
              validatedData.diasSemana.includes(d)
            ),
          };
        }
        return null;
      })
      .filter(c => c !== null);

    return NextResponse.json({
      tieneConflictos: conflictos.length > 0,
      conflictos,
    });
  } catch (error: any) {
    console.error('Error verificando conflictos:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de validación inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al verificar conflictos' },
      { status: 500 }
    );
  }
}
```

---

### 4. Crear API Route para Estadísticas

**Archivo:** `src/app/api/horarios/stats/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/horarios/stats - Estadísticas de horarios
export async function GET(request: NextRequest) {
  try {
    const [
      total,
      activos,
      inactivos,
      porRuta,
      porConductor,
      porDiaSemana,
    ] = await Promise.all([
      // Total de horarios
      prisma.horario.count(),

      // Por estado
      prisma.horario.count({ where: { activo: true } }),
      prisma.horario.count({ where: { activo: false } }),

      // Por ruta
      prisma.horario.groupBy({
        by: ['rutaId'],
        _count: true,
      }),

      // Por conductor
      prisma.horario.groupBy({
        by: ['conductorId'],
        _count: true,
      }),

      // Obtener todos los horarios para contar por día
      prisma.horario.findMany({
        where: { activo: true },
        select: { diasSemana: true },
      }),
    ]);

    // Contar horarios por día de semana
    const diasSemanaCounts = {
      Lunes: 0,
      Martes: 0,
      Miércoles: 0,
      Jueves: 0,
      Viernes: 0,
      Sábado: 0,
      Domingo: 0,
    };

    porDiaSemana.forEach(horario => {
      horario.diasSemana.forEach(dia => {
        if (dia in diasSemanaCounts) {
          diasSemanaCounts[dia as keyof typeof diasSemanaCounts]++;
        }
      });
    });

    // Obtener nombres de rutas y conductores
    const rutasIds = porRuta.map(r => r.rutaId);
    const conductoresIds = porConductor.map(c => c.conductorId);

    const [rutas, conductores] = await Promise.all([
      prisma.ruta.findMany({
        where: { id: { in: rutasIds } },
        select: { id: true, nombre: true },
      }),
      prisma.conductor.findMany({
        where: { id: { in: conductoresIds } },
        select: { id: true, nombre: true },
      }),
    ]);

    const rutasMap = rutas.reduce((acc, r) => {
      acc[r.id] = r.nombre;
      return acc;
    }, {} as Record<string, string>);

    const conductoresMap = conductores.reduce((acc, c) => {
      acc[c.id] = c.nombre;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      total,
      porEstado: {
        activos,
        inactivos,
        porcentajeActivos: total > 0 ? ((activos / total) * 100).toFixed(1) : '0',
      },
      porRuta: porRuta.map(r => ({
        rutaId: r.rutaId,
        rutaNombre: rutasMap[r.rutaId] || 'Desconocida',
        cantidad: r._count,
      })),
      porConductor: porConductor
        .map(c => ({
          conductorId: c.conductorId,
          conductorNombre: conductoresMap[c.conductorId] || 'Desconocido',
          cantidad: c._count,
        }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10), // Top 10 conductores
      porDiaSemana: diasSemanaCounts,
    });
  } catch (error) {
    console.error('Error fetching horario stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
```

---

## Pruebas de Verificación

### Test 1: Crear Horario

```bash
curl -X POST http://localhost:9002/api/horarios \
  -H "Content-Type: application/json" \
  -d '{
    "rutaId": "clx...",
    "conductorId": "clx...",
    "horaInicio": "06:00",
    "horaFin": "07:30",
    "diasSemana": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    "activo": true
  }'
```

**Respuesta esperada:**
```json
{
  "id": "clx...",
  "rutaId": "clx...",
  "conductorId": "clx...",
  "horaInicio": "06:00",
  "horaFin": "07:30",
  "diasSemana": ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
  "activo": true,
  "ruta": {
    "id": "clx...",
    "nombre": "Ruta Norte",
    "color": "#3b82f6"
  },
  "conductor": {
    "id": "clx...",
    "nombre": "Juan Pérez",
    "cedula": "001-1234567-8",
    "turno": "Matutino"
  },
  "createdAt": "2025-02-10T...",
  "updatedAt": "2025-02-10T..."
}
```

### Test 2: Intentar Crear Horario con Conflicto

```bash
curl -X POST http://localhost:9002/api/horarios \
  -H "Content-Type: application/json" \
  -d '{
    "rutaId": "clx...",
    "conductorId": "clx...",
    "horaInicio": "06:30",
    "horaFin": "08:00",
    "diasSemana": ["Lunes"],
    "activo": true
  }'
```

**Respuesta esperada (error):**
```json
{
  "error": "Conflicto de horarios detectado",
  "details": {
    "conflictoId": "clx...",
    "horarioExistente": "06:00 - 07:30",
    "diasConflicto": ["Lunes"]
  }
}
```

### Test 3: Listar Horarios

```bash
curl http://localhost:9002/api/horarios
```

### Test 4: Filtrar por Ruta

```bash
curl "http://localhost:9002/api/horarios?rutaId=clx..."
```

### Test 5: Filtrar por Conductor

```bash
curl "http://localhost:9002/api/horarios?conductorId=clx..."
```

### Test 6: Filtrar por Día de Semana

```bash
curl "http://localhost:9002/api/horarios?diaSemana=Lunes"
```

### Test 7: Verificar Conflictos

```bash
curl -X POST http://localhost:9002/api/horarios/verificar-conflictos \
  -H "Content-Type: application/json" \
  -d '{
    "conductorId": "clx...",
    "horaInicio": "07:00",
    "horaFin": "08:30",
    "diasSemana": ["Lunes", "Martes"]
  }'
```

### Test 8: Obtener por ID

```bash
curl http://localhost:9002/api/horarios/clx...
```

### Test 9: Actualizar Horario

```bash
curl -X PATCH http://localhost:9002/api/horarios/clx... \
  -H "Content-Type: application/json" \
  -d '{
    "horaFin": "08:00",
    "diasSemana": ["Lunes", "Miércoles", "Viernes"]
  }'
```

### Test 10: Eliminar Horario

```bash
curl -X DELETE http://localhost:9002/api/horarios/clx...
```

### Test 11: Estadísticas

```bash
curl http://localhost:9002/api/horarios/stats
```

---

## Troubleshooting

### Error: "Conflicto de horarios detectado"

**Solución:**
```bash
# Verificar horarios existentes del conductor
curl "http://localhost:9002/api/horarios?conductorId=clx..."

# Ajustar horarios para evitar solapamiento
# Opción 1: Cambiar hora de inicio/fin
# Opción 2: Cambiar días de la semana
# Opción 3: Desactivar horario conflictivo
```

### Error: "La hora de fin debe ser posterior a la hora de inicio"

**Solución:**
```typescript
// Verificar formato de horas según schema Zod
const horariosValidos = {
  horaInicio: "06:00",  // ✅ válido
  horaFin: "07:30",     // ✅ válido (posterior a inicio)
};

const horariosInvalidos = {
  horaInicio: "08:00",  // ❌ inválido
  horaFin: "07:00",     // ❌ anterior a inicio
};
```

### Error: "Conductor está en estado: Vacaciones"

**Solución:**
```bash
# Cambiar estado del conductor a Activo
curl -X PATCH http://localhost:9002/api/conductores/clx... \
  -H "Content-Type: application/json" \
  -d '{"estado": "Activo"}'
```

### Error: "Día de semana inválido"

**Solución:**
```typescript
// Usar nombres exactos según schema Zod
const diasValidos = [
  "Lunes",
  "Martes",
  "Miércoles",  // ✅ con acento
  "Jueves",
  "Viernes",
  "Sábado",     // ✅ con acento
  "Domingo"
];

const diasInvalidos = [
  "Lun",        // ❌ abreviado
  "Miercoles",  // ❌ sin acento
  "Sabado",     // ❌ sin acento
];
```

---

## Criterios de Aceptación

- [x] GET /api/horarios retorna lista con filtros
- [x] POST /api/horarios crea horario con validación
- [x] Detección de conflictos de horarios implementada
- [x] Validación de rango de tiempo funcional
- [x] GET /api/horarios/[id] retorna horario con relaciones
- [x] PATCH /api/horarios/[id] actualiza horario
- [x] DELETE /api/horarios/[id] elimina horario
- [x] POST /api/horarios/verificar-conflictos funciona
- [x] GET /api/horarios/stats retorna estadísticas
- [x] Filtros por ruta, conductor y día operativos
- [x] Array de días de semana validado correctamente
- [x] Relaciones con conductor y ruta incluidas

---

## Archivos Creados

```
src/app/api/horarios/
├── route.ts                      # GET, POST
├── [id]/
│   └── route.ts                  # GET, PATCH, DELETE
├── verificar-conflictos/
│   └── route.ts                  # POST verificar conflictos
└── stats/
    └── route.ts                  # GET estadísticas
```

---

## Siguiente Historia

Una vez completada esta historia, continuar con:
**[Historia 12: API Routes - SolicitudParada y EstatusVehiculo](./HISTORIA-12-api-solicitudes-estatus.md)**

---

**Fecha de creación:** 2025-02-10
**Última actualización:** 2025-02-10
