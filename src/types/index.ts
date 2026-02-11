import {
  Usuario,
  Conductor,
  Vehiculo,
  Ruta,
  Parada,
  Horario,
  SolicitudParada,
  HistorialViaje,
  EstatusVehiculo
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

// ==================== TIPOS DE FILTROS ====================

export type ConductorFilters = {
  estado?: 'Activo' | 'Vacaciones' | 'Inactivo';
  turno?: 'Matutino' | 'Vespertino' | 'Nocturno';
  search?: string;
  conVehiculo?: boolean;
};

export type VehiculoFilters = {
  estado?: 'Operativo' | 'EnTaller' | 'FueraDeServicio';
  rutaId?: string;
  conConductor?: boolean;
  search?: string;
};

export type RutaFilters = {
  activa?: boolean;
  esEspecial?: boolean;
  search?: string;
};

export type ParadaFilters = {
  rutaId?: string;
  activa?: boolean;
  search?: string;
};

export type UsuarioFilters = {
  estado?: 'Activo' | 'Inactivo';
  rutaId?: string;
  search?: string;
};

export type HorarioFilters = {
  rutaId?: string;
  conductorId?: string;
  diaSemana?: string;
  activo?: boolean;
};

export type SolicitudParadaFilters = {
  usuarioId?: string;
  paradaId?: string;
  rutaId?: string;
  estado?: 'Pendiente' | 'Confirmado' | 'NoRecogido' | 'Cancelado';
  notificado?: boolean;
  fechaDesde?: Date;
  fechaHasta?: Date;
};

// ==================== TIPOS DE ESTADÍSTICAS ====================

export type ConductorStats = {
  total: number;
  porEstado: {
    activos: number;
    vacaciones: number;
    inactivos: number;
  };
  porTurno: Record<string, number>;
  asignacion: {
    conVehiculo: number;
    sinVehiculo: number;
    porcentajeAsignado: string;
  };
};

export type VehiculoStats = {
  total: number;
  porEstado: {
    operativos: number;
    enTaller: number;
    fueraDeServicio: number;
  };
  asignacion: {
    conConductor: number;
    sinConductor: number;
    porcentajeAsignado: string;
  };
  porRuta: Array<{
    rutaId: string;
    rutaNombre: string;
    cantidad: number;
  }>;
  capacidad: {
    promedio: number;
    total: number;
  };
};

export type RutaStats = {
  total: number;
  activas: number;
  inactivas: number;
  especiales: number;
  porRuta: Array<{
    rutaId: string;
    rutaNombre: string;
    totalParadas: number;
    totalVehiculos: number;
    totalUsuarios: number;
  }>;
};

export type SolicitudStats = {
  total: number;
  porEstado: {
    pendientes: number;
    confirmados: number;
    noRecogidos: number;
    cancelados: number;
  };
  porRuta: Array<{
    rutaId: string;
    rutaNombre: string;
    cantidad: number;
  }>;
  tendencia: Array<{
    fecha: string;
    cantidad: number;
  }>;
};

// ==================== TIPOS DE RESPUESTA API ====================

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type ApiListResponse<T> = ApiResponse<T[]> & {
  total?: number;
  page?: number;
  limit?: number;
};

export type ApiErrorResponse = {
  success: false;
  error: string;
  details?: any;
};

// ==================== TIPOS DE FORMULARIOS ====================

export type FormMode = 'create' | 'edit' | 'view';

export type FormState = {
  isSubmitting: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
};

// ==================== TIPOS DE PAGINACIÓN ====================

export type PaginationParams = {
  page?: number;
  limit?: number;
  offset?: number;
};

export type SortParams = {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type QueryParams = PaginationParams & SortParams;

// ==================== TIPOS DE NOTIFICACIONES ====================

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
};

// ==================== TIPOS DE PERMISOS ====================

export type UserRole = 'admin' | 'conductor' | 'usuario';

export type Permission =
  | 'conductores.read'
  | 'conductores.write'
  | 'conductores.delete'
  | 'vehiculos.read'
  | 'vehiculos.write'
  | 'vehiculos.delete'
  | 'rutas.read'
  | 'rutas.write'
  | 'rutas.delete'
  | 'usuarios.read'
  | 'usuarios.write'
  | 'usuarios.delete'
  | 'solicitudes.read'
  | 'solicitudes.write'
  | 'solicitudes.approve';

// ==================== TIPOS PARA CALENDARIO ====================

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
  color?: string;
};

export type HorarioCalendarEvent = CalendarEvent & {
  horario: Horario;
  conductor: Conductor;
  ruta: Ruta;
};

// ==================== TIPOS PARA REPORTES ====================

export type ReportePeriodo = 'dia' | 'semana' | 'mes' | 'año';

export type ReporteViajes = {
  periodo: ReportePeriodo;
  fechaInicio: Date;
  fechaFin: Date;
  totalViajes: number;
  totalPasajeros: number;
  promedioCalificacion: number;
  viajesPorRuta: Array<{
    rutaId: string;
    rutaNombre: string;
    cantidad: number;
  }>;
  viajesPorConductor: Array<{
    conductorId: string;
    conductorNombre: string;
    cantidad: number;
  }>;
};

// ==================== RE-EXPORTAR TIPOS DE PRISMA ====================

export type {
  Usuario,
  Conductor,
  Vehiculo,
  Ruta,
  Parada,
  Horario,
  SolicitudParada,
  HistorialViaje,
  EstatusVehiculo
} from '@prisma/client';
