import { Loader } from '@googlemaps/js-api-loader';

let loader: Loader | null = null;

export function getGoogleMapsLoader() {
  if (!loader) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY no configurada en .env');
    }

    loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry', 'geocoding'],
    });
  }

  return loader;
}

/**
 * Geocoding: Convierte una dirección en coordenadas (lat, lng)
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const loader = getGoogleMapsLoader();
    const { Geocoder } = await loader.importLibrary('geocoding') as google.maps.GeocodingLibrary;
    const geocoder = new Geocoder();

    const result = await geocoder.geocode({ address });

    if (result.results.length > 0) {
      const location = result.results[0].geometry.location;
      return {
        lat: location.lat(),
        lng: location.lng(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

/**
 * Reverse Geocoding: Convierte coordenadas en una dirección
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const loader = getGoogleMapsLoader();
    const { Geocoder } = await loader.importLibrary('geocoding') as google.maps.GeocodingLibrary;
    const geocoder = new Geocoder();

    const result = await geocoder.geocode({
      location: { lat, lng }
    });

    if (result.results.length > 0) {
      return result.results[0].formatted_address;
    }

    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}

/**
 * Calcula la distancia entre dos puntos (en kilómetros)
 */
export async function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): Promise<number> {
  try {
    const loader = getGoogleMapsLoader();
    const { spherical } = await loader.importLibrary('geometry') as google.maps.GeometryLibrary;

    const distance = spherical.computeDistanceBetween(
      new google.maps.LatLng(point1.lat, point1.lng),
      new google.maps.LatLng(point2.lat, point2.lng)
    );

    // Retornar en kilómetros
    return distance / 1000;
  } catch (error) {
    console.error('Error calculating distance:', error);
    return 0;
  }
}

/**
 * Valida si unas coordenadas están dentro de República Dominicana
 */
export function isInDominicanRepublic(lat: number, lng: number): boolean {
  // Bounding box aproximado de República Dominicana
  const bounds = {
    north: 19.93,
    south: 17.47,
    east: -68.32,
    west: -72.01,
  };

  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  );
}
