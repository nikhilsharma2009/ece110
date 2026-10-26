import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { TransportComparison, TransportMode, GeoLocation } from '@/types';
import { MODE_METADATA } from '@/data/transport';

interface RouteMapProps {
  origin: GeoLocation;
  destination: GeoLocation;
  comparisons: TransportComparison[];
  selectedMode: TransportMode;
  onSelectMode: (mode: TransportMode) => void;
}

// Custom markers using SVG data URLs
function createMarkerIcon(color: string, label: string): L.DivIcon {
  return L.divIcon({
    className: 'terra-marker',
    html: `
      <div style="
        width: 28px; height: 28px; border-radius: 50% 50% 50% 0;
        background: ${color}; border: 2px solid #F5F0E6;
        transform: rotate(-45deg); box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        display: flex; align-items: center; justify-content: center;
      ">
        <span style="transform: rotate(45deg); color: #F5F0E6; font-size: 12px; font-weight: 600; font-family: 'Inter', sans-serif;">
          ${label}
        </span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

export function RouteMap({ origin, destination, comparisons, selectedMode, onSelectMode }: RouteMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [(origin.lat + destination.lat) / 2, (origin.lon + destination.lon) / 2],
      zoom: 6,
      scrollWheelZoom: false,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    layersRef.current = L.layerGroup().addTo(map);
    markersRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update routes and markers when data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !layersRef.current || !markersRef.current) return;

    layersRef.current.clearLayers();
    markersRef.current.clearLayers();

    const layers = layersRef.current;
    const markers = markersRef.current;

    // Add markers
    const originMarker = L.marker([origin.lat, origin.lon], {
      icon: createMarkerIcon('#52634A', 'A'),
    }).addTo(markersRef.current);
    originMarker.bindPopup(`<b>Origin</b><br/>${origin.displayName}`);

    const destMarker = L.marker([destination.lat, destination.lon], {
      icon: createMarkerIcon('#C78668', 'B'),
    }).addTo(markersRef.current);
    destMarker.bindPopup(`<b>Destination</b><br/>${destination.displayName}`);

    // Draw routes for all available modes
    const availableComparisons = comparisons.filter(
      (c) => c.route.available && c.route.routeGeometry
    );

    availableComparisons.forEach((comp) => {
      const meta = MODE_METADATA[comp.mode];
      const isSelected = comp.mode === selectedMode;
      const coords = comp.route.routeGeometry!.coordinates.map(
        ([lon, lat]) => [lat, lon] as [number, number]
      );

      // For train (no geometry), draw a dashed straight line
      if (comp.mode === 'train' && coords.length === 0) {
        const line = L.polyline(
          [[origin.lat, origin.lon], [destination.lat, destination.lon]],
          {
            color: meta.color,
            weight: isSelected ? 4 : 2,
            opacity: isSelected ? 0.8 : 0.4,
            dashArray: '8 6',
          }
        ).addTo(layers);
        line.bindPopup(`<b>${meta.label}</b><br/>Approximate route (straight-line)`);
        if (isSelected) line.bringToFront();
        return;
      }

      if (coords.length > 0) {
        const line = L.polyline(coords, {
          color: meta.color,
          weight: isSelected ? 5 : 2.5,
          opacity: isSelected ? 0.9 : 0.35,
          dashArray: comp.route.isApproximation ? '8 6' : undefined,
        }).addTo(layers);
        line.bindPopup(`<b>${meta.label}</b><br/>${(comp.route.distance! / 1000).toFixed(1)} km`);
        if (isSelected) line.bringToFront();

        // Click handler
        line.on('click', () => onSelectMode(comp.mode));
      }
    });

    // If selected mode has no geometry (train), draw approximate line
    const selectedComp = comparisons.find((c) => c.mode === selectedMode);
    if (selectedComp && selectedComp.mode === 'train' && !selectedComp.route.routeGeometry) {
      const line = L.polyline(
        [[origin.lat, origin.lon], [destination.lat, destination.lon]],
        {
          color: MODE_METADATA.train.color,
          weight: 4,
          opacity: 0.8,
          dashArray: '8 6',
        }
      ).addTo(layers);
      line.bindPopup(`<b>Train</b><br/>Approximate route (straight-line)`);
      line.bringToFront();
    }

    // Fit bounds to show all routes + markers
    const allCoords: [number, number][] = [
      [origin.lat, origin.lon],
      [destination.lat, destination.lon],
    ];
    availableComparisons.forEach((c) => {
      if (c.route.routeGeometry) {
        c.route.routeGeometry.coordinates.forEach(([lon, lat]) => {
          allCoords.push([lat, lon]);
        });
      }
    });

    if (allCoords.length >= 2) {
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comparisons, selectedMode, origin, destination]);

  // Invalidate size when container becomes visible
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    setTimeout(() => map.invalidateSize(), 100);
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full min-h-[300px] rounded-xl overflow-hidden" />
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-parchment/90 backdrop-blur-sm border border-sage/30 rounded-lg p-3 z-[1000] max-w-[200px]">
        <p className="text-xs font-medium text-bark mb-2">Route Legend</p>
        <div className="space-y-1.5">
          {comparisons
            .filter((c) => c.route.available)
            .map((c) => {
              const meta = MODE_METADATA[c.mode];
              return (
                <button
                  key={c.mode}
                  onClick={() => onSelectMode(c.mode)}
                  className="flex items-center gap-2 text-xs w-full text-left hover:bg-oat/50 rounded px-1 py-0.5 transition-colors"
                >
                  <span
                    className="inline-block w-4 h-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: meta.color, opacity: c.mode === selectedMode ? 1 : 0.5 }}
                  />
                  <span className={c.mode === selectedMode ? 'text-bark font-medium' : 'text-warm-gray'}>
                    {meta.shortLabel}
                  </span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}


