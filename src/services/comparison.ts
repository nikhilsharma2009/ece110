import type {
  GeoLocation,
  TransportMode,
  RouteOption,
  TransportComparison,
  AssumptionSet,
  SortKey,
} from '@/types';
import { getRoute, haversineDistance } from '@/services/routing';
import { calculateEmissions, calculateCost } from '@/services/emissions';
import { MODE_METADATA } from '@/data/transport';

// Route all modes for a given origin/destination
// Road modes use OSRM driving profile; walking/cycling use OSRM foot/cycling profiles
// Train uses straight-line approximation (no rail routing API available)
// Bus uses road route distance (same as car)

async function routeSingleMode(
  origin: GeoLocation,
  destination: GeoLocation,
  mode: TransportMode,
  signal?: AbortSignal
): Promise<RouteOption> {
  const meta = MODE_METADATA[mode];

  if (mode === 'train') {
    // No rail routing API; use straight-line with road correction factor
    const straightLine = haversineDistance(
      origin.lat, origin.lon,
      destination.lat, destination.lon
    );
    // Rail routes are typically ~1.2x straight-line; label as approximation
    const approxDistance = straightLine * 1.2;
    // Rough speed: 60 km/h for express train including stops
    const approxDuration = (approxDistance / 1000 / 60) * 3600;
    return {
      mode,
      routeGeometry: null,
      distance: approxDistance,
      duration: approxDuration,
      available: true,
      isApproximation: true,
      approximationLabel: 'Straight-line approximation (no rail routing data available). Actual rail route may differ.',
    };
  }

  try {
    const result = await getRoute(
      origin.lat, origin.lon,
      destination.lat, destination.lon,
      mode,
      signal,
      false
    );

    return {
      mode,
      routeGeometry: result.geometry,
      distance: result.geometry.distance,
      duration: result.geometry.duration,
      available: true,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Routing failed.';
    // For walking/cycling, long distances are impractical
    if ((mode === 'walking' || mode === 'cycling') && message.includes('No route')) {
      return {
        mode,
        routeGeometry: null,
        distance: null,
        duration: null,
        available: false,
        unavailableReason: `No ${mode} route found. The distance may be too long for ${mode === 'walking' ? 'walking' : 'cycling'}.`,
      };
    }
    return {
      mode,
      routeGeometry: null,
      distance: null,
      duration: null,
      available: false,
      unavailableReason: message,
    };
  }
}

export async function routeAllModes(
  origin: GeoLocation,
  destination: GeoLocation,
  modes: TransportMode[],
  passengers: number,
  assumptions: AssumptionSet,
  signal?: AbortSignal
): Promise<TransportComparison[]> {
  // Group modes by routing profile to minimize API calls
  // All road modes (driving) share the same OSRM route
  // Walking and cycling get their own routes
  // Train uses approximation

  const roadModes = modes.filter((m) =>
    ['petrol-car', 'diesel-car', 'electric-car', 'motorcycle', 'bus'].includes(m)
  );
  const otherModes = modes.filter((m) => ['walking', 'cycling', 'train'].includes(m));

  // Route road modes with a single driving request
  let roadRoute: RouteOption | null = null;
  if (roadModes.length > 0) {
    try {
      const result = await getRoute(
        origin.lat, origin.lon,
        destination.lat, destination.lon,
        'petrol-car', // use driving profile
        signal,
        true // request alternatives
      );
      roadRoute = {
        mode: 'petrol-car',
        routeGeometry: result.geometry,
        distance: result.geometry.distance,
        duration: result.geometry.duration,
        available: true,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Road routing failed.';
      roadRoute = {
        mode: 'petrol-car',
        routeGeometry: null,
        distance: null,
        duration: null,
        available: false,
        unavailableReason: message,
      };
    }
  }

  // Route walking/cycling individually
  const otherRoutes: Record<TransportMode, RouteOption> = {} as Record<TransportMode, RouteOption>;
  for (const mode of otherModes) {
    otherRoutes[mode] = await routeSingleMode(origin, destination, mode, signal);
  }

  // Build comparisons
  const comparisons: TransportComparison[] = modes.map((mode) => {
    let route: RouteOption;
    if (roadModes.includes(mode) && roadRoute) {
      route = { ...roadRoute, mode };
    } else if (otherModes.includes(mode)) {
      route = otherRoutes[mode];
    } else {
      route = {
        mode,
        routeGeometry: null,
        distance: null,
        duration: null,
        available: false,
        unavailableReason: 'No routing attempted for this mode.',
      };
    }

    const emissions = calculateEmissions(mode, route, passengers, assumptions);
    const cost = calculateCost(mode, route, passengers, assumptions);

    return {
      mode,
      route,
      emissions,
      cost,
      distance: route.distance,
      duration: route.duration,
      passengers,
    };
  });

  return comparisons;
}

export function sortComparisons(
  comparisons: TransportComparison[],
  sortKey: SortKey
): TransportComparison[] {
  const available = comparisons.filter((c) => c.route.available);
  const unavailable = comparisons.filter((c) => !c.route.available);

  const sorted = [...available].sort((a, b) => {
    switch (sortKey) {
      case 'emissions':
        return (
          (a.emissions.perPassengerEmissions ?? Infinity) -
          (b.emissions.perPassengerEmissions ?? Infinity)
        );
      case 'distance':
        return (a.distance ?? Infinity) - (b.distance ?? Infinity);
      case 'duration':
        return (a.duration ?? Infinity) - (b.duration ?? Infinity);
      case 'cost':
        return (a.cost.amount ?? Infinity) - (b.cost.amount ?? Infinity);
      case 'energy':
        return (a.emissions.energyConsumed ?? Infinity) - (b.emissions.energyConsumed ?? Infinity);
      default:
        return 0;
    }
  });

  return [...sorted, ...unavailable];
}

export function findBest(
  comparisons: TransportComparison[],
  key: 'emissions' | 'distance' | 'duration'
): TransportMode | null {
  const available = comparisons.filter((c) => c.route.available);
  if (available.length === 0) return null;

  let best: TransportComparison | null = null;
  for (const c of available) {
    if (key === 'emissions') {
      if (best == null || (c.emissions.perPassengerEmissions ?? Infinity) < (best.emissions.perPassengerEmissions ?? Infinity)) {
        best = c;
      }
    } else if (key === 'distance') {
      if (best == null || (c.distance ?? Infinity) < (best.distance ?? Infinity)) {
        best = c;
      }
    } else if (key === 'duration') {
      if (best == null || (c.duration ?? Infinity) < (best.duration ?? Infinity)) {
        best = c;
      }
    }
  }
  return best?.mode ?? null;
}

export function calculateSavings(
  baseline: TransportComparison | undefined,
  selected: TransportComparison | undefined
): { saved: number | null; percentage: number | null; increased: boolean } {
  if (!baseline || !selected) return { saved: null, percentage: null, increased: false };
  const baselineEmissions = baseline.emissions.perPassengerEmissions;
  const selectedEmissions = selected.emissions.perPassengerEmissions;
  if (baselineEmissions == null || selectedEmissions == null) {
    return { saved: null, percentage: null, increased: false };
  }
  const saved = baselineEmissions - selectedEmissions;
  if (baselineEmissions === 0) return { saved, percentage: null, increased: saved < 0 };
  const percentage = (saved / baselineEmissions) * 100;
  return { saved, percentage, increased: saved < 0 };
}
