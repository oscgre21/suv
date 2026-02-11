import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

async function testDirectConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
  });

  try {
    console.log('🔍 Probando conexión directa con pg...\n');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);

    const client = await pool.connect();
    console.log('✅ Conexión exitosa!\n');

    // Verificar base de datos actual
    const result = await client.query('SELECT current_database()');
    console.log('📊 Base de datos actual:', result.rows[0].current_database);

    // Listar tablas
    const tables = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log('\n📋 Tablas en la base de datos:');
    tables.rows.forEach((row) => {
      console.log(`  - ${row.tablename}`);
    });

    client.release();
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testDirectConnection();
