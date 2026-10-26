import type { TransportComparison } from '@/types';
import { MODE_METADATA } from '@/data/transport';

// Generates a visual fingerprint from route geometry and comparison data
// Displayed as a decorative topographic-style illustration

interface JourneyFingerprintProps {
  comparisons: TransportComparison[];
  originName: string;
  destinationName: string;
}

export function JourneyFingerprint({ comparisons, originName, destinationName }: JourneyFingerprintProps) {
  // Generate a deterministic seed from the journey
  const seed = (originName + destinationName).split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  // Get the primary (selected) route coordinates, or first available
  const available = comparisons.filter((c) => c.route.routeGeometry && c.route.routeGeometry.coordinates.length > 0);
  const primaryRoute = available[0]?.route.routeGeometry;

  // Simplify coordinates for the fingerprint
  let points: [number, number][] = [];
  if (primaryRoute) {
    const coords = primaryRoute.coordinates;
    const step = Math.max(1, Math.floor(coords.length / 40));
    for (let i = 0; i < coords.length; i += step) {
      // Convert [lon, lat] to SVG x, y (normalize)
      points.push([coords[i][0], coords[i][1]]);
    }
    // Always include last point
    if (coords.length > 0) {
      points.push([coords[coords.length - 1][0], coords[coords.length - 1][1]]);
    }
  }

  // Normalize points to SVG viewBox
  let pathD = '';
  if (points.length > 1) {
    const lons = points.map((p) => p[0]);
    const lats = points.map((p) => p[1]);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const lonRange = maxLon - minLon || 1;
    const latRange = maxLat - minLat || 1;

    // Scale to fit in 100x60 viewBox with padding
    const pad = 8;
    const w = 100 - pad * 2;
    const h = 60 - pad * 2;

    pathD = points
      .map((p, i) => {
        const x = pad + ((p[0] - minLon) / lonRange) * w;
        // Flip y because SVG y increases downward
        const y = pad + (1 - (p[1] - minLat) / latRange) * h;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }

  // Generate contour rings from the seed
  const contours = [];
  for (let i = 0; i < 5; i++) {
    const r = 10 + i * 7;
    const cx = 50 + Math.sin(seed + i) * 15;
    const cy = 30 + Math.cos(seed + i * 2) * 10;
    contours.push(
      <ellipse
        key={i}
        cx={cx}
        cy={cy}
        rx={r}
        ry={r * 0.7}
        fill="none"
        stroke="#52634A"
        strokeWidth="0.3"
        opacity={0.08 + i * 0.01}
      />
    );
  }

  return (
    <div className="bg-oat/40 border border-sage/25 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-warm-gray uppercase tracking-wider">Journey Fingerprint</p>
        <span className="text-[10px] text-warm-gray/50 font-mono">#{seed.toString(36).slice(-6)}</span>
      </div>
      <svg viewBox="0 0 100 60" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Contour background */}
        {contours}

        {/* Route path */}
        {pathD && (
          <>
            <path
              d={pathD}
              fill="none"
              stroke="#52634A"
              strokeWidth="0.8"
              strokeDasharray="1.5 1"
              opacity="0.5"
              className="animate-draw"
            />
            {/* Origin marker */}
            <circle
              cx={parseFloat(pathD.split(' ')[1])}
              cy={parseFloat(pathD.split(' ')[2])}
              r="1.5"
              fill="#52634A"
            />
            {/* Destination marker */}
            <circle
              cx={parseFloat(pathD.split(' ').slice(-2, -1)[0])}
              cy={parseFloat(pathD.split(' ').slice(-1)[0])}
              r="1.5"
              fill="#C78668"
            />
          </>
        )}

        {/* Mode dots along bottom */}
        {comparisons.filter((c) => c.route.available).map((c, i) => {
          const meta = MODE_METADATA[c.mode];
          return (
            <circle
              key={c.mode}
              cx={10 + i * 12}
              cy={55}
              r="1.2"
              fill={meta.color}
              opacity="0.7"
            />
          );
        })}
      </svg>
      <p className="text-[10px] text-warm-gray/60 italic mt-1 text-center">
        A unique visual signature of this journey's route and transport mix.
      </p>
    </div>
  );
}
