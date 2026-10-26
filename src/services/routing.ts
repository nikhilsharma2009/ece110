import type { RouteGeometry, TransportMode } from '@/types';

// OSRM routing service (public demo server)
// For production, self-host OSRM or use a routed backend proxy

const OSRM_URL = 'https://router.project-osrm.org';

type OSRMProfile = 'driving' | 'foot' | 'cycling';

function getProfile(mode: TransportMode): OSRMProfile {
  switch (mode) {
    case 'walking':
      return 'foot';
    case 'cycling':
      return 'cycling';
    default:
      return 'driving';
  }
}

interface OSRMResponse {
  code: string;
  routes?: {
    geometry: {
      coordinates: [number, number][];
      type: string;
    };
    distance: number;
    duration: number;
  }[];
  message?: string;
}

export interface RoutingResult {
  geometry: RouteGeometry;
  alternatives: RouteGeometry[];
}

export async function getRoute(
  originLat: number,
  originLon: number,
  destLat: number,
  destLon: number,
  mode: TransportMode,
  signal?: AbortSignal,
  alternatives = false
): Promise<RoutingResult> {
  const profile = getProfile(mode);
  const coords = `${originLon},${originLat};${destLon},${destLat}`;
  const params = new URLSearchParams({
    overview: 'full',
    geometries: 'geojson',
    ...(alternatives ? { alternatives: 'true', steps: 'false' } : {}),
  });

  const url = `${OSRM_URL}/route/v1/${profile}/${coords}?${params.toString()}`;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    if (response.status === 429) throw new Error('Routing service rate limit exceeded.');
    throw new Error(`Routing service returned ${response.status}`);
  }

  const data: OSRMResponse = await response.json();
  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error(data.message || 'No route found between these locations.');
  }

  const routes = data.routes.map((r) => ({
    coordinates: r.geometry.coordinates as [number, number][],
    distance: r.distance,
    duration: r.duration,
  }));

  return {
    geometry: routes[0],
    alternatives: routes.slice(1),
  };
}

// Haversine straight-line distance (meters) — used for train approximation and fallback display
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
