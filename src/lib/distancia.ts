// Utilidades geográficas compartidas entre el endpoint GPS y el de vehículos
// del usuario, para no duplicar la fórmula de Haversine ni el cálculo de la
// próxima parada.

/** Distancia en km entre dos coordenadas (fórmula de Haversine). */
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface ParadaCoord {
  nombre: string;
  latitud: number;
  longitud: number;
  orden: number;
}

/**
 * Dado un vehículo (lat/lng/velocidad) y la lista ordenada de paradas, calcula
 * la próxima parada (la siguiente en orden tras la más cercana) y el tiempo
 * estimado en minutos. Devuelve nulls si faltan datos.
 */
export function calcularProximaParada(
  vehiculo: { latitud: number | null; longitud: number | null; velocidad?: number | null },
  paradas: ParadaCoord[]
): { proximaParada: string | null; tiempoEstimado: number | null } {
  const velocidad = vehiculo.velocidad ?? 0;

  if (vehiculo.latitud == null || vehiculo.longitud == null || paradas.length === 0) {
    return { proximaParada: null, tiempoEstimado: null };
  }

  // Parada más cercana a la posición actual del bus
  let paradaMasCercana = paradas[0];
  let distanciaMinima = Infinity;
  for (const parada of paradas) {
    const dist = haversineDistance(
      vehiculo.latitud, vehiculo.longitud,
      parada.latitud, parada.longitud
    );
    if (dist < distanciaMinima) {
      distanciaMinima = dist;
      paradaMasCercana = parada;
    }
  }

  // La próxima es la siguiente en orden (ruta circular)
  const indiceMasCercana = paradas.findIndex((p) => p.orden === paradaMasCercana.orden);
  const proximaParada =
    indiceMasCercana < paradas.length - 1 ? paradas[indiceMasCercana + 1] : paradas[0];

  const distanciaProxima = haversineDistance(
    vehiculo.latitud, vehiculo.longitud,
    proximaParada.latitud, proximaParada.longitud
  );

  const velocidadCalculo = Math.max(velocidad, 20); // mínimo 20 km/h
  const tiempoEstimadoMinutos = Math.round((distanciaProxima / velocidadCalculo) * 60);

  return {
    proximaParada: proximaParada.nombre,
    tiempoEstimado: Math.max(1, tiempoEstimadoMinutos),
  };
}
