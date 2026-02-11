"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var client_1 = require("@prisma/client");
var adapter_pg_1 = require("@prisma/adapter-pg");
var pg_1 = __importDefault(require("pg"));
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var Pool = pg_1.default.Pool;
// Configurar Prisma con adapter
var pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
});
var adapter = new adapter_pg_1.PrismaPg(pool);
var prisma = new client_1.PrismaClient({ adapter: adapter });
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var estatusOperativo, estatusEnTaller, estatusFueraDeServicio, estatusEnEspera, rutaCharles, rutaDuarte, rutaIndependencia, rutaEspecial, conductor1, conductor2, conductor3, conductor4, conductor5, vehiculo1, vehiculo2, vehiculo3, vehiculo4, vehiculo5, defaultPassword, usuario1, usuario2, usuario3, usuario4, usuario5, paradasCharles, paradasDuarte, counts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🌱 Iniciando seed de la base de datos...\n');
                    // ==================== LIMPIAR DATOS EXISTENTES ====================
                    console.log('🗑️  Limpiando datos existentes...');
                    return [4 /*yield*/, prisma.solicitudParada.deleteMany()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, prisma.historialViaje.deleteMany()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, prisma.horario.deleteMany()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, prisma.parada.deleteMany()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, prisma.usuario.deleteMany()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, prisma.conductor.deleteMany()];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, prisma.vehiculo.deleteMany()];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, prisma.ruta.deleteMany()];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, prisma.estatusVehiculo.deleteMany()];
                case 9:
                    _a.sent();
                    console.log('✅ Datos limpiados\n');
                    // ==================== ESTATUS DE VEHÍCULOS ====================
                    console.log('📊 Creando estatus de vehículos...');
                    return [4 /*yield*/, prisma.estatusVehiculo.create({
                            data: {
                                nombre: 'Operativo',
                                color: '#10b981',
                                descripcion: 'Vehículo en operación normal',
                            },
                        })];
                case 10:
                    estatusOperativo = _a.sent();
                    return [4 /*yield*/, prisma.estatusVehiculo.create({
                            data: {
                                nombre: 'En Taller',
                                color: '#f59e0b',
                                descripcion: 'Vehículo en mantenimiento',
                            },
                        })];
                case 11:
                    estatusEnTaller = _a.sent();
                    return [4 /*yield*/, prisma.estatusVehiculo.create({
                            data: {
                                nombre: 'Fuera de Servicio',
                                color: '#ef4444',
                                descripcion: 'Vehículo no disponible',
                            },
                        })];
                case 12:
                    estatusFueraDeServicio = _a.sent();
                    return [4 /*yield*/, prisma.estatusVehiculo.create({
                            data: {
                                nombre: 'En Espera',
                                color: '#6b7280',
                                descripcion: 'Sin conductor asignado',
                            },
                        })];
                case 13:
                    estatusEnEspera = _a.sent();
                    console.log('✅ 4 estatus de vehículos creados\n');
                    // ==================== RUTAS ====================
                    console.log('🛣️  Creando rutas...');
                    return [4 /*yield*/, prisma.ruta.create({
                            data: {
                                nombre: 'Ruta Charles de Gaulle',
                                descripcion: 'Ruta principal desde Sabana Larga hasta el centro',
                                color: '#3b82f6',
                                activa: true,
                                esEspecial: false,
                            },
                        })];
                case 14:
                    rutaCharles = _a.sent();
                    return [4 /*yield*/, prisma.ruta.create({
                            data: {
                                nombre: 'Ruta Autopista Duarte',
                                descripcion: 'Ruta por Autopista Duarte hasta Villa Mella',
                                color: '#10b981',
                                activa: true,
                                esEspecial: false,
                            },
                        })];
                case 15:
                    rutaDuarte = _a.sent();
                    return [4 /*yield*/, prisma.ruta.create({
                            data: {
                                nombre: 'Ruta Independencia',
                                descripcion: 'Ruta por Avenida Independencia',
                                color: '#f59e0b',
                                activa: true,
                                esEspecial: false,
                            },
                        })];
                case 16:
                    rutaIndependencia = _a.sent();
                    return [4 /*yield*/, prisma.ruta.create({
                            data: {
                                nombre: 'Ruta Especial Nocturna',
                                descripcion: 'Ruta nocturna para turnos nocturnos',
                                color: '#8b5cf6',
                                activa: true,
                                esEspecial: true,
                            },
                        })];
                case 17:
                    rutaEspecial = _a.sent();
                    console.log('✅ 4 rutas creadas\n');
                    // ==================== PARADAS ====================
                    console.log('📍 Creando paradas con coordenadas GPS...');
                    // Paradas Ruta Charles de Gaulle (coordenadas reales de Santo Domingo)
                    return [4 /*yield*/, prisma.parada.createMany({
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
                        })];
                case 18:
                    // Paradas Ruta Charles de Gaulle (coordenadas reales de Santo Domingo)
                    _a.sent();
                    // Paradas Ruta Autopista Duarte
                    return [4 /*yield*/, prisma.parada.createMany({
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
                        })];
                case 19:
                    // Paradas Ruta Autopista Duarte
                    _a.sent();
                    // Paradas Ruta Independencia
                    return [4 /*yield*/, prisma.parada.createMany({
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
                        })];
                case 20:
                    // Paradas Ruta Independencia
                    _a.sent();
                    // Paradas Ruta Especial Nocturna
                    return [4 /*yield*/, prisma.parada.createMany({
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
                        })];
                case 21:
                    // Paradas Ruta Especial Nocturna
                    _a.sent();
                    console.log('✅ 11 paradas creadas con coordenadas GPS reales\n');
                    // ==================== CONDUCTORES ====================
                    console.log('👨‍✈️ Creando conductores...');
                    return [4 /*yield*/, prisma.conductor.create({
                            data: {
                                nombre: 'Manuel Antonio González',
                                cedula: '001-1234567-8',
                                licencia: 'LIC-2020-001234',
                                telefono: '809-555-0101',
                                email: 'manuel.gonzalez@cesac.com',
                                turno: 'Matutino',
                                estado: 'Activo',
                            },
                        })];
                case 22:
                    conductor1 = _a.sent();
                    return [4 /*yield*/, prisma.conductor.create({
                            data: {
                                nombre: 'Ricardo José Peralta',
                                cedula: '001-8765432-1',
                                licencia: 'LIC-2019-005678',
                                telefono: '809-555-0102',
                                email: 'ricardo.peralta@cesac.com',
                                turno: 'Vespertino',
                                estado: 'Activo',
                            },
                        })];
                case 23:
                    conductor2 = _a.sent();
                    return [4 /*yield*/, prisma.conductor.create({
                            data: {
                                nombre: 'José Luis Ramírez',
                                cedula: '002-3456789-0',
                                licencia: 'LIC-2021-002345',
                                telefono: '809-555-0103',
                                email: 'jose.ramirez@cesac.com',
                                turno: 'Matutino',
                                estado: 'Activo',
                            },
                        })];
                case 24:
                    conductor3 = _a.sent();
                    return [4 /*yield*/, prisma.conductor.create({
                            data: {
                                nombre: 'Carlos Alberto Méndez',
                                cedula: '002-9876543-2',
                                licencia: 'LIC-2020-006789',
                                telefono: '809-555-0104',
                                email: 'carlos.mendez@cesac.com',
                                turno: 'Nocturno',
                                estado: 'Activo',
                            },
                        })];
                case 25:
                    conductor4 = _a.sent();
                    return [4 /*yield*/, prisma.conductor.create({
                            data: {
                                nombre: 'Pedro Antonio Sánchez',
                                cedula: '003-1122334-4',
                                licencia: 'LIC-2022-003456',
                                telefono: '809-555-0105',
                                turno: 'Vespertino',
                                estado: 'Vacaciones',
                            },
                        })];
                case 26:
                    conductor5 = _a.sent();
                    console.log('✅ 5 conductores creados\n');
                    // ==================== VEHÍCULOS ====================
                    console.log('🚌 Creando vehículos con datos GPS...');
                    return [4 /*yield*/, prisma.vehiculo.create({
                            data: {
                                ficha: 'Ficha 01',
                                modelo: 'Toyota Coaster 2022',
                                placa: 'I098765',
                                capacidad: 30,
                                estado: 'Operativo',
                                rutaAsignada: rutaCharles.id,
                                velocidad: 45.5,
                                latitud: 18.4861,
                                longitud: -69.9312,
                                ultimaActualizacion: new Date(),
                            },
                        })];
                case 27:
                    vehiculo1 = _a.sent();
                    return [4 /*yield*/, prisma.vehiculo.create({
                            data: {
                                ficha: 'Ficha 02',
                                modelo: 'Mitsubishi Rosa 2021',
                                placa: 'I098766',
                                capacidad: 28,
                                estado: 'Operativo',
                                rutaAsignada: rutaDuarte.id,
                                velocidad: 0,
                                latitud: 18.5012,
                                longitud: -69.9112,
                                ultimaActualizacion: new Date(),
                            },
                        })];
                case 28:
                    vehiculo2 = _a.sent();
                    return [4 /*yield*/, prisma.vehiculo.create({
                            data: {
                                ficha: 'Ficha 03',
                                modelo: 'Hyundai County 2023',
                                placa: 'I098767',
                                capacidad: 32,
                                estado: 'Operativo',
                                rutaAsignada: rutaIndependencia.id,
                                velocidad: 52.3,
                                latitud: 18.4678,
                                longitud: -69.8834,
                                ultimaActualizacion: new Date(),
                            },
                        })];
                case 29:
                    vehiculo3 = _a.sent();
                    return [4 /*yield*/, prisma.vehiculo.create({
                            data: {
                                ficha: 'Ficha 04',
                                modelo: 'Toyota Coaster 2020',
                                placa: 'I098768',
                                capacidad: 30,
                                estado: 'EnTaller',
                                rutaAsignada: null,
                                velocidad: 0,
                                latitud: null,
                                longitud: null,
                                ultimaActualizacion: null,
                            },
                        })];
                case 30:
                    vehiculo4 = _a.sent();
                    return [4 /*yield*/, prisma.vehiculo.create({
                            data: {
                                ficha: 'Ficha 05',
                                modelo: 'Mitsubishi Rosa 2022',
                                placa: 'I098769',
                                capacidad: 28,
                                estado: 'Operativo',
                                rutaAsignada: rutaEspecial.id,
                                velocidad: 38.7,
                                latitud: 18.4567,
                                longitud: -69.9523,
                                ultimaActualizacion: new Date(),
                            },
                        })];
                case 31:
                    vehiculo5 = _a.sent();
                    console.log('✅ 5 vehículos creados con coordenadas GPS\n');
                    // ==================== ASIGNAR CONDUCTORES A VEHÍCULOS ====================
                    console.log('🔗 Asignando conductores a vehículos...');
                    return [4 /*yield*/, prisma.conductor.update({
                            where: { id: conductor1.id },
                            data: { vehiculoId: vehiculo1.id },
                        })];
                case 32:
                    _a.sent();
                    return [4 /*yield*/, prisma.conductor.update({
                            where: { id: conductor2.id },
                            data: { vehiculoId: vehiculo2.id },
                        })];
                case 33:
                    _a.sent();
                    return [4 /*yield*/, prisma.conductor.update({
                            where: { id: conductor3.id },
                            data: { vehiculoId: vehiculo3.id },
                        })];
                case 34:
                    _a.sent();
                    return [4 /*yield*/, prisma.conductor.update({
                            where: { id: conductor4.id },
                            data: { vehiculoId: vehiculo5.id },
                        })];
                case 35:
                    _a.sent();
                    console.log('✅ 4 conductores asignados a vehículos\n');
                    // ==================== USUARIOS ====================
                    console.log('👥 Creando usuarios con contraseñas...');
                    return [4 /*yield*/, bcryptjs_1.default.hash('password123', 10)];
                case 36:
                    defaultPassword = _a.sent();
                    return [4 /*yield*/, prisma.usuario.create({
                            data: {
                                nombre: 'Juan Carlos Pérez',
                                cedula: '004-1234567-9',
                                email: 'juan.perez@empresa.com',
                                password: defaultPassword,
                                telefono: '809-555-1001',
                                direccion: 'Sabana Larga, Santo Domingo Oeste',
                                rutaAsignada: rutaCharles.id,
                                estado: 'Activo',
                            },
                        })];
                case 37:
                    usuario1 = _a.sent();
                    return [4 /*yield*/, prisma.usuario.create({
                            data: {
                                nombre: 'María Rodríguez Santos',
                                cedula: '004-9876543-2',
                                email: 'maria.rodriguez@empresa.com',
                                password: defaultPassword,
                                telefono: '809-555-1002',
                                direccion: 'Villa Mella, Santo Domingo Norte',
                                rutaAsignada: rutaDuarte.id,
                                estado: 'Activo',
                            },
                        })];
                case 38:
                    usuario2 = _a.sent();
                    return [4 /*yield*/, prisma.usuario.create({
                            data: {
                                nombre: 'Ana María López',
                                cedula: '005-2345678-0',
                                email: 'ana.lopez@empresa.com',
                                password: defaultPassword,
                                telefono: '809-555-1003',
                                direccion: 'Independencia, Santo Domingo',
                                rutaAsignada: rutaIndependencia.id,
                                estado: 'Activo',
                            },
                        })];
                case 39:
                    usuario3 = _a.sent();
                    return [4 /*yield*/, prisma.usuario.create({
                            data: {
                                nombre: 'Roberto Martínez García',
                                cedula: '005-8765432-1',
                                email: 'roberto.martinez@empresa.com',
                                password: defaultPassword,
                                telefono: '809-555-1004',
                                direccion: 'Herrera, Santo Domingo',
                                rutaAsignada: rutaCharles.id,
                                estado: 'Activo',
                            },
                        })];
                case 40:
                    usuario4 = _a.sent();
                    return [4 /*yield*/, prisma.usuario.create({
                            data: {
                                nombre: 'Carmen Julia Fernández',
                                cedula: '006-3456789-1',
                                email: 'carmen.fernandez@empresa.com',
                                password: defaultPassword,
                                telefono: '809-555-1005',
                                direccion: 'Los Mina, Santo Domingo Este',
                                rutaAsignada: rutaDuarte.id,
                                estado: 'Activo',
                            },
                        })];
                case 41:
                    usuario5 = _a.sent();
                    console.log('✅ 5 usuarios creados (password: password123)\n');
                    // ==================== HORARIOS ====================
                    console.log('⏰ Creando horarios...');
                    // Horario 1: Conductor 1 - Ruta Charles (Matutino)
                    return [4 /*yield*/, prisma.horario.create({
                            data: {
                                rutaId: rutaCharles.id,
                                conductorId: conductor1.id,
                                horaInicio: '06:00',
                                horaFin: '14:00',
                                diasSemana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
                                activo: true,
                            },
                        })];
                case 42:
                    // Horario 1: Conductor 1 - Ruta Charles (Matutino)
                    _a.sent();
                    // Horario 2: Conductor 2 - Ruta Duarte (Vespertino)
                    return [4 /*yield*/, prisma.horario.create({
                            data: {
                                rutaId: rutaDuarte.id,
                                conductorId: conductor2.id,
                                horaInicio: '14:00',
                                horaFin: '22:00',
                                diasSemana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
                                activo: true,
                            },
                        })];
                case 43:
                    // Horario 2: Conductor 2 - Ruta Duarte (Vespertino)
                    _a.sent();
                    // Horario 3: Conductor 3 - Ruta Independencia (Matutino)
                    return [4 /*yield*/, prisma.horario.create({
                            data: {
                                rutaId: rutaIndependencia.id,
                                conductorId: conductor3.id,
                                horaInicio: '07:00',
                                horaFin: '15:00',
                                diasSemana: ['Lunes', 'Miércoles', 'Viernes'],
                                activo: true,
                            },
                        })];
                case 44:
                    // Horario 3: Conductor 3 - Ruta Independencia (Matutino)
                    _a.sent();
                    // Horario 4: Conductor 4 - Ruta Especial (Nocturno)
                    return [4 /*yield*/, prisma.horario.create({
                            data: {
                                rutaId: rutaEspecial.id,
                                conductorId: conductor4.id,
                                horaInicio: '22:00',
                                horaFin: '06:00',
                                diasSemana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
                                activo: true,
                            },
                        })];
                case 45:
                    // Horario 4: Conductor 4 - Ruta Especial (Nocturno)
                    _a.sent();
                    console.log('✅ 4 horarios creados\n');
                    // ==================== SOLICITUDES DE PARADAS ====================
                    console.log('📝 Creando solicitudes de paradas...');
                    return [4 /*yield*/, prisma.parada.findMany({
                            where: { rutaId: rutaCharles.id },
                        })];
                case 46:
                    paradasCharles = _a.sent();
                    return [4 /*yield*/, prisma.parada.findMany({
                            where: { rutaId: rutaDuarte.id },
                        })];
                case 47:
                    paradasDuarte = _a.sent();
                    // Solicitudes pendientes (últimas 24h)
                    return [4 /*yield*/, prisma.solicitudParada.createMany({
                            data: [
                                {
                                    usuarioId: usuario1.id,
                                    paradaId: paradasCharles[0].id,
                                    rutaId: rutaCharles.id,
                                    estado: 'Pendiente',
                                    horaSolicitud: new Date(Date.now() - 2 * 60 * 60 * 1000), // -2 horas
                                },
                                {
                                    usuarioId: usuario4.id,
                                    paradaId: paradasCharles[1].id,
                                    rutaId: rutaCharles.id,
                                    estado: 'Pendiente',
                                    horaSolicitud: new Date(Date.now() - 1 * 60 * 60 * 1000), // -1 hora
                                },
                                {
                                    usuarioId: usuario2.id,
                                    paradaId: paradasDuarte[0].id,
                                    rutaId: rutaDuarte.id,
                                    estado: 'Pendiente',
                                    horaSolicitud: new Date(Date.now() - 3 * 60 * 60 * 1000), // -3 horas
                                },
                            ],
                        })];
                case 48:
                    // Solicitudes pendientes (últimas 24h)
                    _a.sent();
                    // Solicitudes confirmadas y completadas (históricas)
                    return [4 /*yield*/, prisma.solicitudParada.createMany({
                            data: [
                                {
                                    usuarioId: usuario1.id,
                                    paradaId: paradasCharles[0].id,
                                    rutaId: rutaCharles.id,
                                    estado: 'Confirmado',
                                    horaSolicitud: new Date(Date.now() - 26 * 60 * 60 * 1000), // -26 horas (ayer)
                                    notificado: true,
                                },
                                {
                                    usuarioId: usuario2.id,
                                    paradaId: paradasDuarte[1].id,
                                    rutaId: rutaDuarte.id,
                                    estado: 'Confirmado',
                                    horaSolicitud: new Date(Date.now() - 48 * 60 * 60 * 1000), // -2 días
                                    notificado: true,
                                },
                                {
                                    usuarioId: usuario3.id,
                                    paradaId: paradasCharles[2].id,
                                    rutaId: rutaCharles.id,
                                    estado: 'NoRecogido',
                                    horaSolicitud: new Date(Date.now() - 50 * 60 * 60 * 1000), // -2 días
                                    notificado: true,
                                },
                            ],
                        })];
                case 49:
                    // Solicitudes confirmadas y completadas (históricas)
                    _a.sent();
                    console.log('✅ 6 solicitudes de paradas creadas\n');
                    // ==================== HISTORIAL DE VIAJES ====================
                    console.log('🚍 Creando historial de viajes...');
                    // Viajes completados (últimos 7 días)
                    return [4 /*yield*/, prisma.historialViaje.createMany({
                            data: [
                                // Hoy
                                {
                                    rutaId: rutaCharles.id,
                                    vehiculoId: vehiculo1.id,
                                    conductorId: conductor1.id,
                                    usuarioId: usuario1.id,
                                    fechaInicio: new Date(Date.now() - 2 * 60 * 60 * 1000),
                                    fechaFin: new Date(Date.now() - 1 * 60 * 60 * 1000),
                                    duracionMinutos: 60,
                                    pasajeros: 15,
                                    paradasConfirmadas: 4,
                                    estado: 'Completado',
                                    calificacion: 5,
                                },
                                {
                                    rutaId: rutaDuarte.id,
                                    vehiculoId: vehiculo2.id,
                                    conductorId: conductor2.id,
                                    usuarioId: usuario2.id,
                                    fechaInicio: new Date(Date.now() - 4 * 60 * 60 * 1000),
                                    fechaFin: new Date(Date.now() - 3 * 60 * 60 * 1000),
                                    duracionMinutos: 55,
                                    pasajeros: 12,
                                    paradasConfirmadas: 3,
                                    estado: 'Completado',
                                    calificacion: 4,
                                },
                                // Hace 1 día
                                {
                                    rutaId: rutaCharles.id,
                                    vehiculoId: vehiculo1.id,
                                    conductorId: conductor1.id,
                                    usuarioId: usuario4.id,
                                    fechaInicio: new Date(Date.now() - 26 * 60 * 60 * 1000),
                                    fechaFin: new Date(Date.now() - 25 * 60 * 60 * 1000),
                                    duracionMinutos: 58,
                                    pasajeros: 18,
                                    paradasConfirmadas: 4,
                                    estado: 'Completado',
                                    calificacion: 5,
                                },
                                {
                                    rutaId: rutaIndependencia.id,
                                    vehiculoId: vehiculo3.id,
                                    conductorId: conductor3.id,
                                    usuarioId: usuario3.id,
                                    fechaInicio: new Date(Date.now() - 27 * 60 * 60 * 1000),
                                    fechaFin: new Date(Date.now() - 26 * 60 * 60 * 1000),
                                    duracionMinutos: 45,
                                    pasajeros: 10,
                                    paradasConfirmadas: 2,
                                    estado: 'Completado',
                                    calificacion: 4,
                                },
                                // Hace 2 días
                                {
                                    rutaId: rutaDuarte.id,
                                    vehiculoId: vehiculo2.id,
                                    conductorId: conductor2.id,
                                    fechaInicio: new Date(Date.now() - 50 * 60 * 60 * 1000),
                                    fechaFin: new Date(Date.now() - 49 * 60 * 60 * 1000),
                                    duracionMinutos: 52,
                                    pasajeros: 14,
                                    paradasConfirmadas: 3,
                                    estado: 'Completado',
                                    calificacion: 5,
                                },
                                // Hace 3 días
                                {
                                    rutaId: rutaCharles.id,
                                    vehiculoId: vehiculo1.id,
                                    conductorId: conductor1.id,
                                    fechaInicio: new Date(Date.now() - 74 * 60 * 60 * 1000),
                                    fechaFin: new Date(Date.now() - 73 * 60 * 60 * 1000),
                                    duracionMinutos: 62,
                                    pasajeros: 20,
                                    paradasConfirmadas: 4,
                                    estado: 'Completado',
                                    calificacion: 5,
                                },
                                {
                                    rutaId: rutaEspecial.id,
                                    vehiculoId: vehiculo5.id,
                                    conductorId: conductor4.id,
                                    fechaInicio: new Date(Date.now() - 75 * 60 * 60 * 1000),
                                    fechaFin: new Date(Date.now() - 74 * 60 * 60 * 1000),
                                    duracionMinutos: 48,
                                    pasajeros: 8,
                                    paradasConfirmadas: 2,
                                    estado: 'Completado',
                                    calificacion: 4,
                                },
                                // Hace 5 días
                                {
                                    rutaId: rutaDuarte.id,
                                    vehiculoId: vehiculo2.id,
                                    conductorId: conductor2.id,
                                    fechaInicio: new Date(Date.now() - 122 * 60 * 60 * 1000),
                                    fechaFin: new Date(Date.now() - 121 * 60 * 60 * 1000),
                                    duracionMinutos: 50,
                                    pasajeros: 16,
                                    paradasConfirmadas: 3,
                                    estado: 'Completado',
                                    calificacion: 5,
                                },
                                // Hace 6 días
                                {
                                    rutaId: rutaIndependencia.id,
                                    vehiculoId: vehiculo3.id,
                                    conductorId: conductor3.id,
                                    fechaInicio: new Date(Date.now() - 146 * 60 * 60 * 1000),
                                    fechaFin: new Date(Date.now() - 145 * 60 * 60 * 1000),
                                    duracionMinutos: 43,
                                    pasajeros: 11,
                                    paradasConfirmadas: 2,
                                    estado: 'Completado',
                                    calificacion: 4,
                                },
                                // Hace 6 días - 1 cancelado (para testing de puntualidad)
                                {
                                    rutaId: rutaCharles.id,
                                    vehiculoId: vehiculo1.id,
                                    conductorId: conductor1.id,
                                    fechaInicio: new Date(Date.now() - 147 * 60 * 60 * 1000),
                                    fechaFin: null,
                                    duracionMinutos: null,
                                    pasajeros: 0,
                                    paradasConfirmadas: 0,
                                    estado: 'Cancelado',
                                    comentarios: 'Falla mecánica',
                                },
                                // Hace 10 días (para comparación anterior)
                                {
                                    rutaId: rutaCharles.id,
                                    vehiculoId: vehiculo1.id,
                                    conductorId: conductor1.id,
                                    fechaInicio: new Date(Date.now() - 242 * 60 * 60 * 1000),
                                    fechaFin: new Date(Date.now() - 241 * 60 * 60 * 1000),
                                    duracionMinutos: 60,
                                    pasajeros: 17,
                                    paradasConfirmadas: 4,
                                    estado: 'Completado',
                                    calificacion: 5,
                                },
                                {
                                    rutaId: rutaDuarte.id,
                                    vehiculoId: vehiculo2.id,
                                    conductorId: conductor2.id,
                                    fechaInicio: new Date(Date.now() - 266 * 60 * 60 * 1000),
                                    fechaFin: new Date(Date.now() - 265 * 60 * 60 * 1000),
                                    duracionMinutos: 54,
                                    pasajeros: 13,
                                    paradasConfirmadas: 3,
                                    estado: 'Completado',
                                    calificacion: 4,
                                },
                            ],
                        })];
                case 50:
                    // Viajes completados (últimos 7 días)
                    _a.sent();
                    console.log('✅ 12 viajes históricos creados\n');
                    // ==================== RESUMEN ====================
                    console.log('📊 Resumen del seed:\n');
                    return [4 /*yield*/, Promise.all([
                            prisma.estatusVehiculo.count(),
                            prisma.ruta.count(),
                            prisma.parada.count(),
                            prisma.conductor.count(),
                            prisma.vehiculo.count(),
                            prisma.usuario.count(),
                            prisma.horario.count(),
                            prisma.solicitudParada.count(),
                            prisma.historialViaje.count(),
                        ])];
                case 51:
                    counts = _a.sent();
                    console.log("  \u2705 Estatus de Veh\u00EDculos: ".concat(counts[0]));
                    console.log("  \u2705 Rutas: ".concat(counts[1]));
                    console.log("  \u2705 Paradas: ".concat(counts[2]));
                    console.log("  \u2705 Conductores: ".concat(counts[3]));
                    console.log("  \u2705 Veh\u00EDculos: ".concat(counts[4]));
                    console.log("  \u2705 Usuarios: ".concat(counts[5]));
                    console.log("  \u2705 Horarios: ".concat(counts[6]));
                    console.log("  \u2705 Solicitudes: ".concat(counts[7]));
                    console.log("  \u2705 Viajes: ".concat(counts[8]));
                    console.log('\n✅ ¡Seed completado exitosamente!\n');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('\n❌ Error ejecutando seed:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [4 /*yield*/, pool.end()];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
