import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

// Configurar Prisma con adapter
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  // ==================== LIMPIAR DATOS EXISTENTES ====================
  console.log('🗑️  Limpiando datos existentes...');

  await prisma.solicitudParada.deleteMany();
  await prisma.historialViaje.deleteMany();
  await prisma.horario.deleteMany();
  await prisma.parada.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.conductor.deleteMany();
  await prisma.vehiculo.deleteMany();
  await prisma.ruta.deleteMany();
  await prisma.estatusVehiculo.deleteMany();

  console.log('✅ Datos limpiados\n');

  // ==================== ESTATUS DE VEHÍCULOS ====================
  console.log('📊 Creando estatus de vehículos...');

  const estatusOperativo = await prisma.estatusVehiculo.create({
    data: {
      nombre: 'Operativo',
      color: '#10b981',
      descripcion: 'Vehículo en operación normal',
    },
  });

  const estatusEnTaller = await prisma.estatusVehiculo.create({
    data: {
      nombre: 'En Taller',
      color: '#f59e0b',
      descripcion: 'Vehículo en mantenimiento',
    },
  });

  const estatusFueraDeServicio = await prisma.estatusVehiculo.create({
    data: {
      nombre: 'Fuera de Servicio',
      color: '#ef4444',
      descripcion: 'Vehículo no disponible',
    },
  });

  const estatusEnEspera = await prisma.estatusVehiculo.create({
    data: {
      nombre: 'En Espera',
      color: '#6b7280',
      descripcion: 'Sin conductor asignado',
    },
  });

  console.log('✅ 4 estatus de vehículos creados\n');

  // ==================== RUTAS ====================
  console.log('🛣️  Creando rutas...');

  // Ruta 1: Charles de Gaulle
  const rutaCharles = await prisma.ruta.create({
    data: {
      nombre: 'Ruta Charles de Gaulle',
      descripcion: 'Ruta principal desde Sabana Larga hasta el centro',
      color: '#3b82f6',
      activa: true,
      esEspecial: false,
    },
  });

  // Ruta 2: Autopista Duarte
  const rutaDuarte = await prisma.ruta.create({
    data: {
      nombre: 'Ruta Autopista Duarte',
      descripcion: 'Ruta por Autopista Duarte hasta Villa Mella',
      color: '#10b981',
      activa: true,
      esEspecial: false,
    },
  });

  // Ruta 3: Independencia
  const rutaIndependencia = await prisma.ruta.create({
    data: {
      nombre: 'Ruta Independencia',
      descripcion: 'Ruta por Avenida Independencia',
      color: '#f59e0b',
      activa: true,
      esEspecial: false,
    },
  });

  // Ruta 4: Especial Nocturna
  const rutaEspecial = await prisma.ruta.create({
    data: {
      nombre: 'Ruta Especial Nocturna',
      descripcion: 'Ruta nocturna para turnos nocturnos',
      color: '#8b5cf6',
      activa: true,
      esEspecial: true,
    },
  });

  console.log('✅ 4 rutas creadas\n');

  // ==================== PARADAS ====================
  console.log('📍 Creando paradas con coordenadas GPS...');

  // Paradas Ruta Charles de Gaulle (coordenadas reales de Santo Domingo)
  await prisma.parada.createMany({
    data: [
      {
        nombre: 'Terminal Sabana Larga',
        direccion: 'Av. Sabana Larga, Santo Domingo Oeste',
        latitud: 18.4861,
        longitud: -69.9312,
        orden: 1,
        rutaId: rutaCharles.id,
        activa: true,
      },
      {
        nombre: 'Puente Juan Carlos',
        direccion: 'Puente Juan Carlos, Santo Domingo',
        latitud: 18.4901,
        longitud: -69.9401,
        orden: 2,
        rutaId: rutaCharles.id,
        activa: true,
      },
      {
        nombre: 'Estación Concepción Bona',
        direccion: 'Av. Charles de Gaulle, Santo Domingo',
        latitud: 18.4785,
        longitud: -69.9234,
        orden: 3,
        rutaId: rutaCharles.id,
        activa: true,
      },
      {
        nombre: 'Centro de los Héroes',
        direccion: 'Centro de los Héroes, Santo Domingo',
        latitud: 18.4723,
        longitud: -69.9145,
        orden: 4,
        rutaId: rutaCharles.id,
        activa: true,
      },
    ],
  });

  // Paradas Ruta Autopista Duarte
  await prisma.parada.createMany({
    data: [
      {
        nombre: 'Km 8 Autopista Duarte',
        direccion: 'Km 8, Autopista Duarte, Santo Domingo Norte',
        latitud: 18.5012,
        longitud: -69.9112,
        orden: 1,
        rutaId: rutaDuarte.id,
        activa: true,
      },
      {
        nombre: 'Villa Mella Centro',
        direccion: 'Villa Mella, Santo Domingo Norte',
        latitud: 18.5134,
        longitud: -69.9023,
        orden: 2,
        rutaId: rutaDuarte.id,
        activa: true,
      },
      {
        nombre: 'Terminal Norte',
        direccion: 'Terminal de Autobuses Norte, Santo Domingo',
        latitud: 18.5089,
        longitud: -69.8945,
        orden: 3,
        rutaId: rutaDuarte.id,
        activa: true,
      },
    ],
  });

  // Paradas Ruta Independencia
  await prisma.parada.createMany({
    data: [
      {
        nombre: 'Parque Independencia',
        direccion: 'Parque Independencia, Zona Colonial',
        latitud: 18.4678,
        longitud: -69.8834,
        orden: 1,
        rutaId: rutaIndependencia.id,
        activa: true,
      },
      {
        nombre: 'Plaza de la Cultura',
        direccion: 'Plaza de la Cultura, Santo Domingo',
        latitud: 18.4723,
        longitud: -69.9012,
        orden: 2,
        rutaId: rutaIndependencia.id,
        activa: true,
      },
    ],
  });

  // Paradas Ruta Especial Nocturna
  await prisma.parada.createMany({
    data: [
      {
        nombre: 'Zona Industrial Herrera',
        direccion: 'Herrera, Santo Domingo',
        latitud: 18.4567,
        longitud: -69.9523,
        orden: 1,
        rutaId: rutaEspecial.id,
        activa: true,
      },
      {
        nombre: 'Centro Olímpico',
        direccion: 'Centro Olímpico Juan Pablo Duarte',
        latitud: 18.4812,
        longitud: -69.9312,
        orden: 2,
        rutaId: rutaEspecial.id,
        activa: true,
      },
    ],
  });

  console.log('✅ 11 paradas creadas con coordenadas GPS reales\n');

  // ==================== CONDUCTORES ====================
  console.log('👨‍✈️ Creando conductores...');

  const conductor1 = await prisma.conductor.create({
    data: {
      nombre: 'Manuel Antonio González',
      cedula: '001-1234567-8',
      licencia: 'LIC-2020-001234',
      telefono: '809-555-0101',
      email: 'manuel.gonzalez@cesac.com',
      turno: 'Matutino',
      estado: 'Activo',
    },
  });

  const conductor2 = await prisma.conductor.create({
    data: {
      nombre: 'Ricardo José Peralta',
      cedula: '001-8765432-1',
      licencia: 'LIC-2019-005678',
      telefono: '809-555-0102',
      email: 'ricardo.peralta@cesac.com',
      turno: 'Vespertino',
      estado: 'Activo',
    },
  });

  const conductor3 = await prisma.conductor.create({
    data: {
      nombre: 'José Luis Ramírez',
      cedula: '002-3456789-0',
      licencia: 'LIC-2021-002345',
      telefono: '809-555-0103',
      email: 'jose.ramirez@cesac.com',
      turno: 'Matutino',
      estado: 'Activo',
    },
  });

  const conductor4 = await prisma.conductor.create({
    data: {
      nombre: 'Carlos Alberto Méndez',
      cedula: '002-9876543-2',
      licencia: 'LIC-2020-006789',
      telefono: '809-555-0104',
      email: 'carlos.mendez@cesac.com',
      turno: 'Nocturno',
      estado: 'Activo',
    },
  });

  const conductor5 = await prisma.conductor.create({
    data: {
      nombre: 'Pedro Antonio Sánchez',
      cedula: '003-1122334-4',
      licencia: 'LIC-2022-003456',
      telefono: '809-555-0105',
      turno: 'Vespertino',
      estado: 'Vacaciones',
    },
  });

  console.log('✅ 5 conductores creados\n');

  // ==================== VEHÍCULOS ====================
  console.log('🚌 Creando vehículos...');

  const vehiculo1 = await prisma.vehiculo.create({
    data: {
      ficha: 'Ficha 01',
      modelo: 'Toyota Coaster 2022',
      placa: 'I098765',
      capacidad: 30,
      estado: 'Operativo',
      rutaAsignada: rutaCharles.id,
    },
  });

  const vehiculo2 = await prisma.vehiculo.create({
    data: {
      ficha: 'Ficha 02',
      modelo: 'Mitsubishi Rosa 2021',
      placa: 'I098766',
      capacidad: 28,
      estado: 'Operativo',
      rutaAsignada: rutaDuarte.id,
    },
  });

  const vehiculo3 = await prisma.vehiculo.create({
    data: {
      ficha: 'Ficha 03',
      modelo: 'Hyundai County 2023',
      placa: 'I098767',
      capacidad: 32,
      estado: 'Operativo',
      rutaAsignada: rutaIndependencia.id,
    },
  });

  const vehiculo4 = await prisma.vehiculo.create({
    data: {
      ficha: 'Ficha 04',
      modelo: 'Toyota Coaster 2020',
      placa: 'I098768',
      capacidad: 30,
      estado: 'EnTaller',
      rutaAsignada: null,
    },
  });

  const vehiculo5 = await prisma.vehiculo.create({
    data: {
      ficha: 'Ficha 05',
      modelo: 'Mitsubishi Rosa 2022',
      placa: 'I098769',
      capacidad: 28,
      estado: 'Operativo',
      rutaAsignada: rutaEspecial.id,
    },
  });

  console.log('✅ 5 vehículos creados\n');

  // ==================== ASIGNAR CONDUCTORES A VEHÍCULOS ====================
  console.log('🔗 Asignando conductores a vehículos...');

  await prisma.conductor.update({
    where: { id: conductor1.id },
    data: { vehiculoId: vehiculo1.id },
  });

  await prisma.conductor.update({
    where: { id: conductor2.id },
    data: { vehiculoId: vehiculo2.id },
  });

  await prisma.conductor.update({
    where: { id: conductor3.id },
    data: { vehiculoId: vehiculo3.id },
  });

  await prisma.conductor.update({
    where: { id: conductor4.id },
    data: { vehiculoId: vehiculo5.id },
  });

  console.log('✅ 4 conductores asignados a vehículos\n');

  // ==================== USUARIOS ====================
  console.log('👥 Creando usuarios...');

  const usuario1 = await prisma.usuario.create({
    data: {
      nombre: 'Juan Carlos Pérez',
      cedula: '004-1234567-9',
      email: 'juan.perez@empresa.com',
      telefono: '809-555-1001',
      direccion: 'Sabana Larga, Santo Domingo Oeste',
      rutaAsignada: rutaCharles.id,
      estado: 'Activo',
    },
  });

  const usuario2 = await prisma.usuario.create({
    data: {
      nombre: 'María Rodríguez Santos',
      cedula: '004-9876543-2',
      email: 'maria.rodriguez@empresa.com',
      telefono: '809-555-1002',
      direccion: 'Villa Mella, Santo Domingo Norte',
      rutaAsignada: rutaDuarte.id,
      estado: 'Activo',
    },
  });

  const usuario3 = await prisma.usuario.create({
    data: {
      nombre: 'Ana María López',
      cedula: '005-2345678-0',
      email: 'ana.lopez@empresa.com',
      telefono: '809-555-1003',
      direccion: 'Independencia, Santo Domingo',
      rutaAsignada: rutaIndependencia.id,
      estado: 'Activo',
    },
  });

  const usuario4 = await prisma.usuario.create({
    data: {
      nombre: 'Roberto Martínez García',
      cedula: '005-8765432-1',
      email: 'roberto.martinez@empresa.com',
      telefono: '809-555-1004',
      direccion: 'Herrera, Santo Domingo',
      rutaAsignada: rutaCharles.id,
      estado: 'Activo',
    },
  });

  const usuario5 = await prisma.usuario.create({
    data: {
      nombre: 'Carmen Julia Fernández',
      cedula: '006-3456789-1',
      email: 'carmen.fernandez@empresa.com',
      telefono: '809-555-1005',
      direccion: 'Los Mina, Santo Domingo Este',
      rutaAsignada: rutaDuarte.id,
      estado: 'Activo',
    },
  });

  console.log('✅ 5 usuarios creados\n');

  // ==================== HORARIOS ====================
  console.log('⏰ Creando horarios...');

  // Horario 1: Conductor 1 - Ruta Charles (Matutino)
  await prisma.horario.create({
    data: {
      rutaId: rutaCharles.id,
      conductorId: conductor1.id,
      horaInicio: '06:00',
      horaFin: '14:00',
      diasSemana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      activo: true,
    },
  });

  // Horario 2: Conductor 2 - Ruta Duarte (Vespertino)
  await prisma.horario.create({
    data: {
      rutaId: rutaDuarte.id,
      conductorId: conductor2.id,
      horaInicio: '14:00',
      horaFin: '22:00',
      diasSemana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      activo: true,
    },
  });

  // Horario 3: Conductor 3 - Ruta Independencia (Matutino)
  await prisma.horario.create({
    data: {
      rutaId: rutaIndependencia.id,
      conductorId: conductor3.id,
      horaInicio: '07:00',
      horaFin: '15:00',
      diasSemana: ['Lunes', 'Miércoles', 'Viernes'],
      activo: true,
    },
  });

  // Horario 4: Conductor 4 - Ruta Especial (Nocturno)
  await prisma.horario.create({
    data: {
      rutaId: rutaEspecial.id,
      conductorId: conductor4.id,
      horaInicio: '22:00',
      horaFin: '06:00',
      diasSemana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      activo: true,
    },
  });

  console.log('✅ 4 horarios creados\n');

  // ==================== RESUMEN ====================
  console.log('📊 Resumen del seed:\n');

  const counts = await Promise.all([
    prisma.estatusVehiculo.count(),
    prisma.ruta.count(),
    prisma.parada.count(),
    prisma.conductor.count(),
    prisma.vehiculo.count(),
    prisma.usuario.count(),
    prisma.horario.count(),
  ]);

  console.log(`  ✅ Estatus de Vehículos: ${counts[0]}`);
  console.log(`  ✅ Rutas: ${counts[1]}`);
  console.log(`  ✅ Paradas: ${counts[2]}`);
  console.log(`  ✅ Conductores: ${counts[3]}`);
  console.log(`  ✅ Vehículos: ${counts[4]}`);
  console.log(`  ✅ Usuarios: ${counts[5]}`);
  console.log(`  ✅ Horarios: ${counts[6]}`);

  console.log('\n✅ ¡Seed completado exitosamente!\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
