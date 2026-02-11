import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a la base de datos...\n');

    // Test: Contar registros en cada tabla
    const tables = [
      { name: 'Usuarios', model: prisma.usuario },
      { name: 'Conductores', model: prisma.conductor },
      { name: 'Vehículos', model: prisma.vehiculo },
      { name: 'Rutas', model: prisma.ruta },
      { name: 'Paradas', model: prisma.parada },
      { name: 'Horarios', model: prisma.horario },
      { name: 'Solicitudes de Paradas', model: prisma.solicitudParada },
      { name: 'Historial de Viajes', model: prisma.historialViaje },
      { name: 'Estatus de Vehículos', model: prisma.estatusVehiculo },
    ];

    console.log('📊 Contando registros en cada tabla:\n');

    for (const table of tables) {
      const count = await table.model.count();
      console.log(`  ✅ ${table.name.padEnd(25)} ${count} registros`);
    }

    console.log('\n✅ ¡Conexión exitosa! Todas las tablas están accesibles.\n');
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
