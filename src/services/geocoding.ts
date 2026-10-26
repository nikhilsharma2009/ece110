import type { GeoLocation } from '@/types';

// Nominatim (OpenStreetMap) geocoding service
// Usage policy: max 1 request/sec, require valid User-Agent/referer
// For production, route requests through a backend proxy for caching + rate limiting

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
  address?: {
    state?: string;
    state_district?: string;
    county?: string;
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    country?: string;
    country_code?: string;
  };
  boundingbox?: string[];
  importance?: number;
}

function classifyType(result: NominatimResult): GeoLocation['type'] {
  const cls = result.class;
  const typ = result.type;
  if (cls === 'boundary' && typ === 'administrative') {
    const adminLevel = result.address?.state && !result.address?.city && !result.address?.county;
    if (adminLevel && !result.address?.county && !result.address?.state_district) return 'state';
    if (result.address?.county || result.address?.state_district) return 'district';
    return 'district';
  }
  if (cls === 'place') {
    if (typ === 'city') return 'city';
    if (typ === 'town') return 'town';
    if (typ === 'village') return 'village';
    if (typ === 'hamlet') return 'village';
  }
  if (cls === 'railway' || cls === 'aeroway' || cls === 'highway') return 'landmark';
  return 'city';
}

function buildDisplayName(result: NominatimResult): string {
  const parts: string[] = [];
  const addr = result.address;
  if (addr) {
    if (addr.city) parts.push(addr.city);
    else if (addr.town) parts.push(addr.town);
    else if (addr.village) parts.push(addr.village);
    else if (addr.suburb) parts.push(addr.suburb);

    if (addr.county) parts.push(`${addr.county} district`);
    else if (addr.state_district) parts.push(`${addr.state_district} district`);

    if (addr.state) parts.push(addr.state);
    if (addr.country) parts.push(addr.country);
  }
  if (parts.length === 0) return result.display_name;
  return parts.join(', ');
}

function parseResult(result: NominatimResult): GeoLocation {
  const addr = result.address || {};
  const name =
    addr.city || addr.town || addr.village || addr.suburb ||
    addr.county || addr.state_district || addr.state ||
    result.display_name.split(',')[0];

  return {
    name,
    displayName: buildDisplayName(result),
    state: addr.state || addr.country || '',
    district: addr.county || addr.state_district,
    lat: parseFloat(result.lat),
    lon: parseFloat(result.lon),
    type: classifyType(result),
  };
}

export async function searchLocations(
  query: string,
  signal?: AbortSignal
): Promise<GeoLocation[]> {
  if (!query || query.trim().length < 2) return [];

  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    addressdetails: '1',
    limit: '8',
    countrycodes: 'in',
    'accept-language': 'en',
  });

  try {
    const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: {
        'Accept-Language': 'en',
      },
      signal,
    });

    if (!response.ok) {
      if (response.status === 429) throw new Error('Rate limit exceeded. Please wait a moment.');
      throw new Error(`Geocoding service returned ${response.status}`);
    }

    const data: NominatimResult[] = await response.json();
    // Sort by importance descending, then deduplicate by display_name
    const seen = new Set<string>();
    return data
      .sort((a, b) => (b.importance || 0) - (a.importance || 0))
      .map(parseResult)
      .filter((loc) => {
        const key = loc.displayName;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return [];
    throw err;
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeoLocation | null> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    format: 'json',
    addressdetails: '1',
    'accept-language': 'en',
  });

  try {
    const response = await fetch(`${NOMINATIM_REVERSE_URL}?${params.toString()}`, {
      headers: { 'Accept-Language': 'en' },
    });
    if (!response.ok) return null;
    const data: NominatimResult = await response.json();
    return parseResult(data);
  } catch {
    return null;
  }
}
