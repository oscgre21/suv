import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiCache } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Check cache first (5 minute TTL)
    const cacheKey = `dashboard:route-usage:${days}`;
    const cached = apiCache.get(cacheKey);

    if (cached) {
      return NextResponse.json(cached);
    }

    const desde = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const viajes = await prisma.historialViaje.groupBy({
      by: ['rutaId'],
      where: {
        fechaInicio: { gte: desde },
      },
      _count: { id: true },
    });

    // Obtener nombres y colores de rutas
    const rutasIds = viajes.map((v) => v.rutaId);
    const rutas = await prisma.ruta.findMany({
      where: { id: { in: rutasIds } },
      select: { id: true, nombre: true, color: true },
    });

    // Mapear datos
    const resultado = viajes
      .map((v) => {
        const ruta = rutas.find((r) => r.id === v.rutaId);
        return {
          route: ruta?.nombre || 'Sin ruta',
          viajes: v._count.id,
          color: ruta?.color || '#3b82f6',
        };
      })
      .sort((a, b) => b.viajes - a.viajes);

    // Cache the result for 5 minutes (300000ms)
    apiCache.set(cacheKey, resultado, 300000);

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error fetching route usage:', error);
    return NextResponse.json(
      { error: 'Error al obtener frecuencia de uso de rutas' },
      { status: 500 }
    );
  }
}
