import { useState, useEffect } from 'react';
import { Hero } from '@/components/Hero';
import { SearchPanel } from '@/components/SearchPanel';
import { InsightPanel } from '@/components/InsightPanel';
import { ContourPattern, BotanicalBranch } from '@/components/Decorations';
import type { GeoLocation, TransportMode } from '@/types';
import { searchLocations } from '@/services/geocoding';

interface HomePageProps {
  onSearch: (
    origin: GeoLocation,
    destination: GeoLocation,
    passengers: number,
    modes: TransportMode[],
    date?: string
  ) => void;
  loading: boolean;
  comparisons: import('@/types').TransportComparison[] | null;
  hasSearched: boolean;
  initialOrigin?: GeoLocation | null;
  initialDestination?: GeoLocation | null;
  initialPassengers?: number;
}

export function HomePage({
  onSearch,
  loading,
  comparisons,
  hasSearched,
  initialOrigin = null,
  initialDestination = null,
  initialPassengers = 2,
}: HomePageProps) {
  const [origin, setOrigin] = useState<GeoLocation | null>(initialOrigin);
  const [destination, setDestination] = useState<GeoLocation | null>(initialDestination);
  const [passengers, setPassengers] = useState(initialPassengers);
  const [modes, setModes] = useState<TransportMode[]>([
    'petrol-car', 'diesel-car', 'electric-car', 'motorcycle', 'bus', 'train',
  ]);

  useEffect(() => {
    setOrigin(initialOrigin);
  }, [initialOrigin]);

  useEffect(() => {
    setDestination(initialDestination);
  }, [initialDestination]);

  useEffect(() => {
    setPassengers(initialPassengers);
  }, [initialPassengers]);

  // Handle example journey clicks from SearchPanel
  useEffect(() => {
    const handleExample = async (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        origin: string; destination: string; passengers: number; modes: TransportMode[];
      };
      setPassengers(detail.passengers);
      setModes(detail.modes);

      try {
        const [originResults, destResults] = await Promise.all([
          searchLocations(detail.origin),
          searchLocations(detail.destination),
        ]);
        if (originResults.length > 0 && destResults.length > 0) {
          setOrigin(originResults[0]);
          setDestination(destResults[0]);
          onSearch(originResults[0], destResults[0], detail.passengers, detail.modes);
        }
      } catch {
        // user can search manually
      }
    };

    window.addEventListener('terra-example-search', handleExample);
    return () => window.removeEventListener('terra-example-search', handleExample);
  }, [onSearch]);

  return (
    <div className="relative">
      <Hero />

      {/* Search panel overlaid on hero */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 md:-mt-12 pb-8">
        <div className="max-w-2xl mx-auto">
          <SearchPanel
            onSearch={onSearch}
            loading={loading}
            initialOrigin={origin}
            initialDestination={destination}
            initialPassengers={passengers}
            initialModes={modes}
          />
        </div>
      </div>

      {/* Insight panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-2xl mx-auto">
          <InsightPanel comparisons={comparisons || undefined} hasSearched={hasSearched} />
        </div>
      </div>

      {/* Feature highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-oat/40 border border-sage/30 rounded-xl p-6 paper-texture">
            <div className="w-10 h-10 rounded-full bg-moss/30 flex items-center justify-center mb-3">
              <BotanicalBranch className="w-5 h-8 opacity-80" />
            </div>
            <h3 className="font-serif text-base text-bark mb-2">Real Geographic Data</h3>
            <p className="text-sm text-warm-gray leading-relaxed">
              Powered by OpenStreetMap, Nominatim geocoding, and OSRM routing. Every distance
              comes from an actual road, foot, or cycling route — never fabricated.
            </p>
          </div>

          <div className="bg-oat/40 border border-sage/30 rounded-xl p-6 paper-texture">
            <div className="w-10 h-10 rounded-full bg-sky/20 flex items-center justify-center mb-3">
              <ContourPattern className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-base text-bark mb-2">Transparent Calculations</h3>
            <p className="text-sm text-warm-gray leading-relaxed">
              Every emission factor, fuel efficiency default, and formula is documented with
              its source. Adjust any assumption in the What-if Travel Lab and see results
              update instantly.
            </p>
          </div>

          <div className="bg-oat/40 border border-sage/30 rounded-xl p-6 paper-texture">
            <div className="w-10 h-10 rounded-full bg-butter/30 flex items-center justify-center mb-3">
              <BotanicalBranch className="w-5 h-8 opacity-80" />
            </div>
            <h3 className="font-serif text-base text-bark mb-2">Honest Comparisons</h3>
            <p className="text-sm text-warm-gray leading-relaxed">
              When data is unavailable, we say so — clearly. No invented numbers, no fake
              scores. Walking and cycling show zero emissions. Train distances are labeled
              as approximations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
