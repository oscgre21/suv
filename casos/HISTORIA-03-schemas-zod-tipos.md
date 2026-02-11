# Historia 03: Schemas Zod y Tipos TypeScript

**Prioridad:** ALTA
**Dependencias:** Historia 01 (Prisma setup)
**Estimación:** 2-3 horas
**Estado:** Pendiente

---

## Objetivo

Crear todos los schemas de validación con Zod para los formularios del sistema y definir tipos TypeScript extendidos con relaciones de Prisma para mejorar el type-safety en todo el proyecto.

---

## Pre-requisitos

- ✅ Historia 01 completada (Prisma instalado)
- ✅ Prisma Client generado
- ✅ Zod instalado (ya viene en package.json)

---

## Tareas Detalladas

### 1. Verificar Instalación de Zod

**Comando:**
```bash
npm list zod @hookform/resolvers
```

**Resultado esperado:**
```
zod@3.24.2
@hookform/resolvers@4.1.3
```

Si no está instalado:
```bash
npm install zod @hookform/resolvers
```

---

### 2. Crear Schemas de Validación

**Archivo:** `src/lib/validations.ts`

```typescript
import { z } from 'zod';

// ==================== VALIDACIONES COMUNES ====================

// Expresiones regulares para República Dominicana
const cedulaDominicanaRegex = /^\d{3}-\d{7}-\d{1}$/;
const telefonoDominicanoRegex = /^\d{3}-\d{3}-\d{4}$/;
const placaVehicularRegex = /^[A-Z]\d{6}$/;
const colorHexRegex = /^#[0-9A-F]{6}$/i;
const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// ==================== CONDUCTOR ====================

export const conductorSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),

  cedula: z.string()
    .regex(cedulaDominicanaRegex, 'Formato de cédula inválido (Ej: 001-1234567-8)')
    .trim(),

  licencia: z.string()
    .min(1, 'La licencia es requerida')
    .max(50, 'La licencia no puede exceder 50 caracteres')
    .trim(),

  telefono: z.string()
    .regex(telefonoDominicanoRegex, 'Formato de teléfono inválido (Ej: 809-555-0101)')
    .trim(),

  email: z.string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),

  turno: z.enum(['Matutino', 'Vespertino', 'Nocturno'], {
    errorMap: () => ({ message: 'Selecciona un turno válido' })
  }),

  estado: z.enum(['Activo', 'Vacaciones', 'Inactivo'], {
    errorMap: () => ({ message: 'Selecciona un estado válido' })
  }),

  vehiculoId: z.string().optional().nullable(),
});

export type ConductorFormData = z.infer<typeof conductorSchema>;

// ==================== VEHICULO ====================

export const vehiculoSchema = z.object({
  ficha: z.string()
    .min(1, 'La ficha es requerida')
    .max(50, 'La ficha no puede exceder 50 caracteres')
    .trim(),

  modelo: z.string()
    .min(2, 'El modelo debe tener al menos 2 caracteres')
    .max(100, 'El modelo no puede exceder 100 caracteres')
    .trim(),

  placa: z.string()
    .regex(placaVehicularRegex, 'Formato de placa inválido (Ej: I098765)')
    .trim(),

  capacidad: z.coerce.number()
    .int('La capacidad debe ser un número entero')
    .min(10, 'La capacidad mínima es 10 pasajeros')
    .max(100, 'La capacidad máxima es 100 pasajeros'),

  estado: z.enum(['Operativo', 'EnTaller', 'FueraDeServicio'], {
    errorMap: () => ({ message: 'Selecciona un estado válido' })
  }),

  rutaAsignada: z.string().optional().nullable(),
});

export type VehiculoFormData = z.infer<typeof vehiculoSchema>;

// ==================== RUTA ====================

export const rutaSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres')
    .trim(),

  descripcion: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),

  color: z.string()
    .regex(colorHexRegex, 'Formato de color inválido (Ej: #3b82f6)')
    .default('#3b82f6'),

  activa: z.boolean().default(true),

  esEspecial: z.boolean().default(false),
});

export type RutaFormData = z.infer<typeof rutaSchema>;

// ==================== PARADA ====================

export const paradaSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres')
    .trim(),

  direccion: z.string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(300, 'La dirección no puede exceder 300 caracteres')
    .trim(),

  latitud: z.coerce.number()
    .min(-90, 'Latitud debe estar entre -90 y 90')
    .max(90, 'Latitud debe estar entre -90 y 90')
    .refine((val) => !isNaN(val), 'Latitud debe ser un número válido'),

  longitud: z.coerce.number()
    .min(-180, 'Longitud debe estar entre -180 y 180')
    .max(180, 'Longitud debe estar entre -180 y 180')
    .refine((val) => !isNaN(val), 'Longitud debe ser un número válido'),

  orden: z.coerce.number()
    .int('El orden debe ser un número entero')
    .min(1, 'El orden debe ser al menos 1')
    .max(999, 'El orden no puede exceder 999'),

  rutaId: z.string().min(1, 'La ruta es requerida'),

  activa: z.boolean().default(true),
});

export type ParadaFormData = z.infer<typeof paradaSchema>;

// ==================== USUARIO ====================

export const usuarioSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),

  cedula: z.string()
    .regex(cedulaDominicanaRegex, 'Formato de cédula inválido (Ej: 002-1234567-9)')
    .trim(),

  email: z.string()
    .email('Email inválido')
    .trim(),

  telefono: z.string()
    .regex(telefonoDominicanoRegex, 'Formato de teléfono inválido (Ej: 809-555-1001)')
    .optional()
    .or(z.literal('')),

  direccion: z.string()
    .max(300, 'La dirección no puede exceder 300 caracteres')
    .optional()
    .or(z.literal('')),

  rutaAsignada: z.string()
    .min(1, 'La ruta es requerida')
    .optional()
    .nullable(),

  estado: z.enum(['Activo', 'Inactivo'], {
    errorMap: () => ({ message: 'Selecciona un estado válido' })
  }).default('Activo'),
});

export type UsuarioFormData = z.infer<typeof usuarioSchema>;

// ==================== HORARIO ====================

export const horarioSchema = z.object({
  rutaId: z.string().min(1, 'La ruta es requerida'),

  conductorId: z.string().min(1, 'El conductor es requerido'),

  horaInicio: z.string()
    .regex(horaRegex, 'Formato de hora inválido (Ej: 06:00)'),

  horaFin: z.string()
    .regex(horaRegex, 'Formato de hora inválido (Ej: 07:30)'),

  diasSemana: z.array(z.string())
    .min(1, 'Selecciona al menos un día')
    .refine(
      (dias) => dias.every(d =>
        ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].includes(d)
      ),
      'Día de semana inválido'
    ),

  activo: z.boolean().default(true),
}).refine(
  (data) => {
    // Validar que horaFin > horaInicio
    const [horaInicioH, horaInicioM] = data.horaInicio.split(':').map(Number);
    const [horaFinH, horaFinM] = data.horaFin.split(':').map(Number);
    const inicioMinutos = horaInicioH * 60 + horaInicioM;
    const finMinutos = horaFinH * 60 + horaFinM;
    return finMinutos > inicioMinutos;
  },
  {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['horaFin'],
  }
);

export type HorarioFormData = z.infer<typeof horarioSchema>;

// ==================== SOLICITUD PARADA ====================

export const solicitudParadaSchema = z.object({
  usuarioId: z.string().min(1, 'El usuario es requerido'),

  paradaId: z.string().min(1, 'La parada es requerida'),

  rutaId: z.string().min(1, 'La ruta es requerida'),

  estado: z.enum(['Pendiente', 'Confirmado', 'NoRecogido', 'Cancelado'], {
    errorMap: () => ({ message: 'Estado inválido' })
  }).default('Pendiente'),

  notificado: z.boolean().default(false),
});

export type SolicitudParadaFormData = z.infer<typeof solicitudParadaSchema>;

// ==================== HISTORIAL VIAJE ====================

export const historialViajeSchema = z.object({
  rutaId: z.string().min(1, 'La ruta es requerida'),

  vehiculoId: z.string().min(1, 'El vehículo es requerido'),

  conductorId: z.string().min(1, 'El conductor es requerido'),

  usuarioId: z.string().optional().nullable(),

  fechaInicio: z.coerce.date({
    required_error: 'La fecha de inicio es requerida',
    invalid_type_error: 'Fecha inválida',
  }),

  fechaFin: z.coerce.date().optional().nullable(),

  duracionMinutos: z.coerce.number()
    .int('La duración debe ser un número entero')
    .min(0, 'La duración no puede ser negativa')
    .optional()
    .nullable(),

  pasajeros: z.coerce.number()
    .int('El número de pasajeros debe ser entero')
    .min(0, 'No puede ser negativo')
    .default(0),

  paradasConfirmadas: z.coerce.number()
    .int('Las paradas confirmadas deben ser entero')
    .min(0, 'No puede ser negativo')
    .default(0),

  estado: z.enum(['Completado', 'EnCurso', 'Cancelado'], {
    errorMap: () => ({ message: 'Estado inválido' })
  }),

  calificacion: z.coerce.number()
    .int('La calificación debe ser un número entero')
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5')
    .optional()
    .nullable(),

  comentarios: z.string()
    .max(500, 'Los comentarios no pueden exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
});

export type HistorialViajeFormData = z.infer<typeof historialViajeSchema>;

// ==================== ESTATUS VEHICULO ====================

export const estatusVehiculoSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim(),

  color: z.string()
    .regex(colorHexRegex, 'Formato de color inválido (Ej: #10b981)'),

  descripcion: z.string()
    .max(200, 'La descripción no puede exceder 200 caracteres')
    .optional()
    .or(z.literal('')),

  activo: z.boolean().default(true),
});

export type EstatusVehiculoFormData = z.infer<typeof estatusVehiculoSchema>;

// ==================== HELPERS DE VALIDACIÓN ====================

/**
 * Valida si una cédula dominicana es válida
 */
export function isValidCedula(cedula: string): boolean {
  return cedulaDominicanaRegex.test(cedula);
}

/**
 * Valida si un teléfono dominicano es válido
 */
export function isValidTelefono(telefono: string): boolean {
  return telefonoDominicanoRegex.test(telefono);
}

/**
 * Valida si una placa vehicular es válida
 */
export function isValidPlaca(placa: string): boolean {
  return placaVehicularRegex.test(placa);
}

/**
 * Formatea una cédula agregando guiones si no los tiene
 */
export function formatCedula(cedula: string): string {
  const cleaned = cedula.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 10)}-${cleaned.slice(10)}`;
  }
  return cedula;
}

/**
 * Formatea un teléfono agregando guiones si no los tiene
 */
export function formatTelefono(telefono: string): string {
  const cleaned = telefono.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return telefono;
}
```

---

### 3. Crear Tipos TypeScript Extendidos

**Archivo:** `src/types/index.ts`

```typescript
import {
  Usuario,
  Conductor,
  Vehiculo,
  Ruta,
  Parada,
  Horario,
  SolicitudParada,
  HistorialViaje,
  EstatusVehiculo,
} from '@prisma/client';

// ==================== TIPOS CON RELACIONES ====================

export type ConductorWithRelations = Conductor & {
  vehiculo?: Vehiculo | null;
  horarios?: (Horario & { ruta: Ruta })[];
  historialViajes?: HistorialViaje[];
};

export type VehiculoWithRelations = Vehiculo & {
  ruta?: Ruta | null;
  conductor?: Conductor | null;
  historialViajes?: HistorialViaje[];
};

export type RutaWithRelations = Ruta & {
  paradas?: Parada[];
  horarios?: (Horario & { conductor: Conductor })[];
  vehiculos?: Vehiculo[];
  usuarios?: Usuario[];
};

export type ParadaWithRelations = Parada & {
  ruta: Ruta;
  solicitudes?: SolicitudParada[];
};

export type UsuarioWithRelations = Usuario & {
  ruta?: Ruta | null;
  solicitudes?: (SolicitudParada & { parada: Parada })[];
  historialViajes?: HistorialViaje[];
};

export type HorarioWithRelations = Horario & {
  ruta: Ruta;
  conductor: Conductor;
};

export type SolicitudParadaWithRelations = SolicitudParada & {
  usuario: Usuario;
  parada: Parada;
  ruta: Ruta;
};

export type HistorialViajeWithRelations = HistorialViaje & {
  ruta: Ruta;
  vehiculo: Vehiculo;
  conductor: Conductor;
  usuario?: Usuario | null;
};

// ==================== TIPOS PARA MAPAS ====================

export type MapLocation = {
  lat: number;
  lng: number;
};

export type MapMarker = MapLocation & {
  id: string;
  title: string;
  description?: string;
  type: 'bus' | 'stop' | 'user';
  icon?: string;
  color?: string;
};

export type RoutePolyline = {
  id: string;
  path: MapLocation[];
  color: string;
  strokeWeight?: number;
  strokeOpacity?: number;
};

export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

// ==================== ENUMS Y CONSTANTES ====================

export const EstadoConductor = {
  ACTIVO: 'Activo',
  VACACIONES: 'Vacaciones',
  INACTIVO: 'Inactivo',
} as const;

export type EstadoConductorType = typeof EstadoConductor[keyof typeof EstadoConductor];

export const TurnoConductor = {
  MATUTINO: 'Matutino',
  VESPERTINO: 'Vespertino',
  NOCTURNO: 'Nocturno',
} as const;

export type TurnoConductorType = typeof TurnoConductor[keyof typeof TurnoConductor];

export const EstadoVehiculo = {
  OPERATIVO: 'Operativo',
  EN_TALLER: 'EnTaller',
  FUERA_DE_SERVICIO: 'FueraDeServicio',
} as const;

export type EstadoVehiculoType = typeof EstadoVehiculo[keyof typeof EstadoVehiculo];

export const EstadoSolicitud = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  NO_RECOGIDO: 'NoRecogido',
  CANCELADO: 'Cancelado',
} as const;

export type EstadoSolicitudType = typeof EstadoSolicitud[keyof typeof EstadoSolicitud];

export const EstadoViaje = {
  COMPLETADO: 'Completado',
  EN_CURSO: 'EnCurso',
  CANCELADO: 'Cancelado',
} as const;

export type EstadoViajeType = typeof EstadoViaje[keyof typeof EstadoViaje];

export const DiaSemana = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
} as const;

export type DiaSemanaTy = typeof DiaSemana[keyof typeof DiaSemana];

export const DiasSemanaArray = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;

// ==================== TIPOS DE API RESPONSES ====================

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// ==================== FILTROS Y QUERIES ====================

export type ConductorFilters = {
  estado?: EstadoConductorType;
  turno?: TurnoConductorType;
  search?: string;
};

export type VehiculoFilters = {
  estado?: EstadoVehiculoType;
  rutaAsignada?: string;
  search?: string;
};

export type RutaFilters = {
  activa?: boolean;
  esEspecial?: boolean;
  search?: string;
};

export type UsuarioFilters = {
  estado?: 'Activo' | 'Inactivo';
  rutaAsignada?: string;
  search?: string;
};

export type SolicitudFilters = {
  estado?: EstadoSolicitudType;
  rutaId?: string;
  usuarioId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
};
```

---

## Pruebas de Verificación

### Test 1: Validación de Schema Conductor

**Crear archivo:** `test-validations.ts`

```typescript
import { conductorSchema } from '@/lib/validations';

// Test 1: Datos válidos
const validData = {
  nombre: 'Juan Pérez',
  cedula: '001-1234567-8',
  licencia: 'LIC-001',
  telefono: '809-555-0101',
  email: 'juan@example.com',
  turno: 'Matutino' as const,
  estado: 'Activo' as const,
};

try {
  const result = conductorSchema.parse(validData);
  console.log('✅ Validación exitosa:', result);
} catch (error) {
  console.error('❌ Error:', error);
}

// Test 2: Cédula inválida
const invalidCedula = {
  ...validData,
  cedula: '123456789', // Sin guiones
};

try {
  conductorSchema.parse(invalidCedula);
  console.log('❌ Debería fallar');
} catch (error: any) {
  console.log('✅ Error esperado:', error.errors[0].message);
}

// Test 3: Email inválido
const invalidEmail = {
  ...validData,
  email: 'correo-invalido',
};

try {
  conductorSchema.parse(invalidEmail);
  console.log('❌ Debería fallar');
} catch (error: any) {
  console.log('✅ Error esperado:', error.errors[0].message);
}
```

**Ejecutar:**
```bash
npx tsx test-validations.ts
```

### Test 2: Tipos con Prisma

**Crear archivo:** `test-types.ts`

```typescript
import { prisma } from '@/lib/prisma';
import type { ConductorWithRelations } from '@/types';

async function testTypes() {
  // Este código debe compilar sin errores
  const conductores: ConductorWithRelations[] = await prisma.conductor.findMany({
    include: {
      vehiculo: true,
      horarios: {
        include: {
          ruta: true,
        },
      },
    },
  });

  console.log('✅ Tipos correctos');
  console.log('Conductores:', conductores.length);

  await prisma.$disconnect();
}

testTypes();
```

---

## Troubleshooting

### Error: "Cannot find module '@/types'"

**Solución:**
Verificar `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Error: "Type 'X' is not assignable to type 'Y'"

**Solución:**
Regenerar Prisma Client:

```bash
npx prisma generate
```

---

## Criterios de Aceptación

- [x] Archivo `validations.ts` creado con 9 schemas
- [x] Archivo `types/index.ts` creado con tipos extendidos
- [x] Todos los schemas compilan sin errores
- [x] Validaciones funcionan correctamente
- [x] Tipos de Prisma son type-safe
- [x] Helpers de formateo implementados
- [x] Tests de validación pasan

---

## Archivos Creados

```
src/
├── lib/
│   └── validations.ts          # 9 schemas Zod + helpers
└── types/
    └── index.ts                # Tipos TypeScript extendidos

test-validations.ts             # Tests (eliminar después)
test-types.ts                   # Tests (eliminar después)
```

---

## Siguiente Historia

Una vez completada esta historia, continuar con:
**[Historia 04: Seed de Datos Iniciales](./HISTORIA-04-seed-datos-iniciales.md)**

---

**Fecha de creación:** 2025-02-10
**Última actualización:** 2025-02-10
