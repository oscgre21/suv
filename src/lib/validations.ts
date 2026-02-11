import { z } from 'zod';

// ==================== VALIDACIONES COMUNES ====================

// Formato de cédula dominicana: 001-1234567-8
const cedulaDominicanaRegex = /^\d{3}-\d{7}-\d{1}$/;

// Formato de teléfono dominicano: 809-555-0101
const telefonoDominicanoRegex = /^\d{3}-\d{3}-\d{4}$/;

// Formato de placa vehicular dominicana: I098765 (letra + 6 dígitos)
const placaVehicularRegex = /^[A-Z]\d{6}$/;

// Formato de hora: HH:MM (24 horas)
const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Formato de color hexadecimal: #3b82f6
const colorHexRegex = /^#[0-9A-F]{6}$/i;

// ==================== CONDUCTOR ====================

export const conductorSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),

  cedula: z.string()
    .regex(cedulaDominicanaRegex, 'Formato de cédula inválido (ejemplo: 001-1234567-8)'),

  licencia: z.string()
    .min(1, 'La licencia es requerida')
    .max(50, 'La licencia no puede exceder 50 caracteres')
    .trim(),

  telefono: z.string()
    .regex(telefonoDominicanoRegex, 'Formato de teléfono inválido (ejemplo: 809-555-0101)'),

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
    .regex(placaVehicularRegex, 'Formato de placa inválido (ejemplo: I098765)'),

  capacidad: z.number()
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
    .regex(colorHexRegex, 'Formato de color inválido (ejemplo: #3b82f6)')
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

  latitud: z.number()
    .min(-90, 'Latitud debe estar entre -90 y 90')
    .max(90, 'Latitud debe estar entre -90 y 90'),

  longitud: z.number()
    .min(-180, 'Longitud debe estar entre -180 y 180')
    .max(180, 'Longitud debe estar entre -180 y 180'),

  orden: z.number()
    .int('El orden debe ser un número entero')
    .min(1, 'El orden debe ser al menos 1'),

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
    .regex(cedulaDominicanaRegex, 'Formato de cédula inválido (ejemplo: 001-1234567-8)'),

  email: z.string()
    .email('Email inválido'),

  telefono: z.string()
    .regex(telefonoDominicanoRegex, 'Formato de teléfono inválido (ejemplo: 809-555-0101)')
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
    .regex(horaRegex, 'Formato de hora inválido (ejemplo: 06:00)'),

  horaFin: z.string()
    .regex(horaRegex, 'Formato de hora inválido (ejemplo: 18:00)'),

  diasSemana: z.array(z.string())
    .min(1, 'Selecciona al menos un día')
    .refine(
      (dias) => dias.every(d => ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].includes(d)),
      'Día de semana inválido'
    ),

  activo: z.boolean().default(true),
}).refine(
  (data) => {
    // Validar que horaFin sea mayor que horaInicio
    const [horaInicioH, horaInicioM] = data.horaInicio.split(':').map(Number);
    const [horaFinH, horaFinM] = data.horaFin.split(':').map(Number);
    const minutosInicio = horaInicioH * 60 + horaInicioM;
    const minutosFin = horaFinH * 60 + horaFinM;
    return minutosFin > minutosInicio;
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

// ==================== ESTATUS VEHICULO ====================

export const estatusVehiculoSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .trim(),

  color: z.string()
    .regex(colorHexRegex, 'Formato de color inválido (ejemplo: #10b981)'),

  descripcion: z.string()
    .max(200, 'La descripción no puede exceder 200 caracteres')
    .optional()
    .or(z.literal('')),

  activo: z.boolean().default(true),
});

export type EstatusVehiculoFormData = z.infer<typeof estatusVehiculoSchema>;

// ==================== HELPERS DE FORMATEO ====================

/**
 * Formatea una cédula dominicana agregando guiones
 * Ejemplo: "00112345678" -> "001-1234567-8"
 */
export function formatCedula(cedula: string): string {
  const digits = cedula.replace(/\D/g, '');
  if (digits.length !== 11) return cedula;
  return `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`;
}

/**
 * Formatea un teléfono dominicano agregando guiones
 * Ejemplo: "8095550101" -> "809-555-0101"
 */
export function formatTelefono(telefono: string): string {
  const digits = telefono.replace(/\D/g, '');
  if (digits.length !== 10) return telefono;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Formatea una placa vehicular en mayúsculas
 * Ejemplo: "i098765" -> "I098765"
 */
export function formatPlaca(placa: string): string {
  return placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

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
 * Valida si una placa vehicular dominicana es válida
 */
export function isValidPlaca(placa: string): boolean {
  return placaVehicularRegex.test(placa);
}

// ==================== CONSTANTES ====================

export const EstadoConductor = {
  ACTIVO: 'Activo',
  VACACIONES: 'Vacaciones',
  INACTIVO: 'Inactivo',
} as const;

export const TurnoConductor = {
  MATUTINO: 'Matutino',
  VESPERTINO: 'Vespertino',
  NOCTURNO: 'Nocturno',
} as const;

export const EstadoVehiculo = {
  OPERATIVO: 'Operativo',
  EN_TALLER: 'EnTaller',
  FUERA_DE_SERVICIO: 'FueraDeServicio',
} as const;

export const EstadoUsuario = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
} as const;

export const EstadoSolicitud = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  NO_RECOGIDO: 'NoRecogido',
  CANCELADO: 'Cancelado',
} as const;

export const DiasSemanaa = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;

export type DiaSemana = typeof DiasSemanaa[number];
