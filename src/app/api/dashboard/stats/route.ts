import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiCache } from '@/lib/cache';
import { requireAdmin } from '@/lib/auth-guard';

export async function GET() {
  try {
    const guard = await requireAdmin();
    if (guard.response) return guard.response;

    // El desglose de alertas (Retrasado/Dañado/911) se calcula SIEMPRE fresco
    // —no se cachea— para que el admin vea las incidencias en tiempo casi real.
    const alertas = await calcularAlertas();

    // Check cache first (5 minute TTL) para las métricas históricas
    const cacheKey = 'dashboard:stats';
    const cached = apiCache.get(cacheKey);

    if (cached) {
      return NextResponse.json({ ...cached, ...alertas });
    }

    // If not in cache, fetch from database
    const ahora = new Date();
    const hace24h = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
    const hace48h = new Date(ahora.getTime() - 48 * 60 * 60 * 1000);
    const hace7dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
    const hace14dias = new Date(ahora.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 1. Buses Activos
    const [busesActivos, busesActivosAyer] = await Promise.all([
      prisma.vehiculo.count({
        where: {
          estado: 'Operativo',
          conductor: { isNot: null },
        },
      }),
      prisma.historialViaje.findMany({
        where: {
          fechaInicio: {
            gte: new Date(ahora.getTime() - 2 * 24 * 60 * 60 * 1000),
            lt: hace24h,
          },
        },
        distinct: ['vehiculoId'],
      }),
    ]);

    const busesActivosChange = busesActivos - busesActivosAyer.length;

    // 2. Rutas Operativas
    const rutasOperativas = await prisma.ruta.count({
      where: { activa: true },
    });

    // 3. Solicitudes Pendientes
    const [solicitudesHoy, solicitudesAyer] = await Promise.all([
      prisma.solicitudParada.count({
        where: {
          estado: 'Pendiente',
          horaSolicitud: { gte: hace24h },
        },
      }),
      prisma.solicitudParada.count({
        where: {
          estado: 'Pendiente',
          horaSolicitud: { gte: hace48h, lt: hace24h },
        },
      }),
    ]);

    const solicitudesPendientes = solicitudesHoy;
    const solicitudesPendientesChange = solicitudesHoy - solicitudesAyer;

    // 4. Puntualidad
    const [viajesRecientes, viajesAnteriores] = await Promise.all([
      prisma.historialViaje.findMany({
        where: { fechaInicio: { gte: hace7dias } },
        select: { estado: true },
      }),
      prisma.historialViaje.findMany({
        where: {
          fechaInicio: { gte: hace14dias, lt: hace7dias },
        },
        select: { estado: true },
      }),
    ]);

    const completados = viajesRecientes.filter((v) => v.estado === 'Completado').length;
    const puntualidad = viajesRecientes.length > 0
      ? (completados / viajesRecientes.length) * 100
      : 0;

    const completadosAnt = viajesAnteriores.filter((v) => v.estado === 'Completado').length;
    const puntualidadAnt = viajesAnteriores.length > 0
      ? (completadosAnt / viajesAnteriores.length) * 100
      : 0;

    const puntualidadChange = puntualidad - puntualidadAnt;

    const result = {
      busesActivos,
      busesActivosChange,
      rutasOperativas,
      solicitudesPendientes,
      solicitudesPendientesChange,
      puntualidad,
      puntualidadChange,
    };

    // Cache the result for 5 minutes (300000ms) — sin las alertas, que van frescas
    apiCache.set(cacheKey, result, 300000);

    return NextResponse.json({ ...result, ...alertas });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas del dashboard' },
      { status: 500 }
    );
  }
}

/**
 * Conteo de buses en estados de alerta (sin cache, siempre fresco).
 * Devuelve el total y el desglose por estado.
 */
async function calcularAlertas() {
  const ESTADOS_ALERTA = ['Retrasado', 'Dañado', '911'];

  const porEstado = await prisma.vehiculo.groupBy({
    by: ['estado'],
    where: { estado: { in: ESTADOS_ALERTA } },
    _count: { _all: true },
  });

  const desglose: Record<string, number> = { Retrasado: 0, Dañado: 0, '911': 0 };
  for (const fila of porEstado) {
    desglose[fila.estado] = fila._count._all;
  }

  const busesEnAlerta = desglose.Retrasado + desglose.Dañado + desglose['911'];

  return {
    busesEnAlerta,
    alertasDesglose: desglose, // { Retrasado, Dañado, 911 }
    hayEmergencia: desglose['911'] > 0,
  };
}
