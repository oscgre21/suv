const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const { Pool } = pg;

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 9002;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Crear pool de conexiones PostgreSQL y adapter
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: dev ? ['query', 'error', 'warn'] : ['error'],
});

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: `http://localhost:${port}`,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send initial GPS data
    const sendGPSUpdate = async () => {
      try {
        const vehiculos = await prisma.vehiculo.findMany({
          where: {
            estado: 'Operativo',
            latitud: { not: null },
            longitud: { not: null }
          },
          select: {
            id: true,
            ficha: true,
            latitud: true,
            longitud: true,
            velocidad: true,
            estado: true,
            ultimaActualizacion: true,
            ruta: {
              select: { nombre: true, color: true }
            }
          }
        });

        const gpsData = vehiculos.map(v => ({
          ...v,
          velocidad: v.velocidad ?? 0
        }));

        socket.emit('gps-update', gpsData);
      } catch (error) {
        console.error('Error fetching GPS data:', error);
      }
    };

    // Send initial data immediately
    sendGPSUpdate();

    // Update every 5 seconds
    const interval = setInterval(sendGPSUpdate, 5000);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      clearInterval(interval);
    });

    // Allow client to request immediate update
    socket.on('request-gps-update', () => {
      sendGPSUpdate();
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO server running`);
    });
});
