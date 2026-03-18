import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

// Distancia en km entre dos coordenadas usando fórmula de Haversine
function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    if (!session.rutaAsignada) {
      return NextResponse.json([]);
    }

    // Obtener vehículos y paradas de la ruta en paralelo
    const [vehiculos, paradas] = await Promise.all([
      prisma.vehiculo.findMany({
        where: {
          rutaAsignada: session.rutaAsignada,
          estado: {
            in: ['Operativo', 'En Ruta', 'Retrasado', 'Dañado', '911'],
          },
        },
        select: {
          id: true,
          ficha: true,
          estado: true,
          velocidad: true,
          latitud: true,
          longitud: true,
          pasajerosABordo: true,
          ultimaActualizacion: true,
          ruta: {
            select: {
              nombre: true,
              color: true,
            },
          },
        },
        orderBy: { ficha: 'asc' },
      }),
      prisma.parada.findMany({
        where: {
          rutaId: session.rutaAsignada,
          activa: true,
        },
        select: {
          nombre: true,
          latitud: true,
          longitud: true,
          orden: true,
        },
        orderBy: { orden: 'asc' },
      }),
    ]);

    const vehiculosConEstimacion = vehiculos.map(v => {
      const velocidad = v.velocidad ?? 0;

      // Si no hay coordenadas GPS del vehículo, no se puede calcular
      if (v.latitud == null || v.longitud == null || paradas.length === 0) {
        return {
          ...v,
          velocidad,
          proximaParada: null,
          tiempoEstimado: null,
        };
      }

      // Encontrar la parada más cercana que esté adelante del bus
      // Calculamos distancia a cada parada y tomamos la más cercana
      let paradaMasCercana = paradas[0];
      let distanciaMinima = Infinity;

      for (const parada of paradas) {
        const dist = haversineDistance(
          v.latitud, v.longitud,
          parada.latitud, parada.longitud
        );
        if (dist < distanciaMinima) {
          distanciaMinima = dist;
          paradaMasCercana = parada;
        }
      }

      // La próxima parada es la siguiente en orden después de la más cercana
      const indiceMasCercana = paradas.findIndex(p => p.orden === paradaMasCercana.orden);
      const proximaParada = indiceMasCercana < paradas.length - 1
        ? paradas[indiceMasCercana + 1]
        : paradas[0]; // Si está en la última, vuelve a la primera (ruta circular)

      const distanciaProxima = haversineDistance(
        v.latitud, v.longitud,
        proximaParada.latitud, proximaParada.longitud
      );

      // Calcular tiempo estimado en minutos
      // Usar velocidad del vehículo, con mínimo de 20 km/h para evitar divisiones
      // por velocidades muy bajas o cero
      const velocidadCalculo = Math.max(velocidad, 20);
      const tiempoEstimadoMinutos = Math.round((distanciaProxima / velocidadCalculo) * 60);

      return {
        ...v,
        velocidad,
        proximaParada: proximaParada.nombre,
        tiempoEstimado: Math.max(1, tiempoEstimadoMinutos), // Mínimo 1 minuto
      };
    });

    return NextResponse.json(vehiculosConEstimacion);
  } catch (error) {
    console.error('Error obteniendo vehículos:', error);
    return NextResponse.json(
      { error: 'Error al obtener vehículos' },
      { status: 500 }
    );
  }
}
