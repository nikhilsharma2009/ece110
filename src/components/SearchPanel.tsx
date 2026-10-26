import { useState, useEffect } from 'react';
import { ArrowUpDown, Users, Calendar, Search, Loader2 } from 'lucide-react';
import type { GeoLocation, TransportMode } from '@/types';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';
import { ALL_MODES, MODE_METADATA, EXAMPLE_JOURNEYS } from '@/data/transport';

interface SearchPanelProps {
  onSearch: (
    origin: GeoLocation,
    destination: GeoLocation,
    passengers: number,
    modes: TransportMode[],
    date?: string
  ) => void;
  loading?: boolean;
  compact?: boolean;
  initialOrigin?: GeoLocation | null;
  initialDestination?: GeoLocation | null;
  initialPassengers?: number;
  initialModes?: TransportMode[];
}

export function SearchPanel({
  onSearch,
  loading = false,
  compact = false,
  initialOrigin = null,
  initialDestination = null,
  initialPassengers = 2,
  initialModes,
}: SearchPanelProps) {
  const [origin, setOrigin] = useState<GeoLocation | null>(initialOrigin);
  const [destination, setDestination] = useState<GeoLocation | null>(initialDestination);
  const [passengers, setPassengers] = useState(initialPassengers);
  const [date, setDate] = useState('');
  const [selectedModes, setSelectedModes] = useState<TransportMode[]>(
    initialModes || ['petrol-car', 'diesel-car', 'electric-car', 'motorcycle', 'bus', 'train']
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(initialOrigin);
  }, [initialOrigin]);

  useEffect(() => {
    setDestination(initialDestination);
  }, [initialDestination]);

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const toggleMode = (mode: TransportMode) => {
    setSelectedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) {
      setError('Please select both an origin and a destination from the search results.');
      return;
    }
    if (origin.lat === destination.lat && origin.lon === destination.lon) {
      setError('Origin and destination are the same location.');
      return;
    }
    if (selectedModes.length === 0) {
      setError('Select at least one transport mode to compare.');
      return;
    }
    setError(null);
    onSearch(origin, destination, passengers, selectedModes, date || undefined);
  };

  const fillExample = (ex: typeof EXAMPLE_JOURNEYS[0]) => {
    // Trigger search by setting the query fields — user can then search
    // Actually, we'll just set the display names and let the user confirm
    // For better UX, we'll trigger geocoding + search automatically
    const event = new CustomEvent('terra-example-search', {
      detail: { origin: ex.origin, destination: ex.destination, passengers, modes: selectedModes }
    });
    window.dispatchEvent(event);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-parchment/90 backdrop-blur-sm border border-sage/30 rounded-2xl ${compact ? 'p-4' : 'p-6 md:p-7'} shadow-sm paper-texture`}
    >
      <div className="space-y-4">
        {/* Origin / Destination with swap */}
        <div className="relative z-20 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
          <LocationAutocomplete
            id="origin"
            label="From"
            value={origin}
            onSelect={setOrigin}
            placeholder="Origin city, district, or state"
          />

          <div className="flex justify-center pb-1">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2 rounded-full border border-sage/40 text-olive hover:bg-moss/30 transition-colors"
              aria-label="Swap origin and destination"
              title="Swap origin and destination"
            >
              <ArrowUpDown size={16} />
            </button>
          </div>

          <LocationAutocomplete
            id="destination"
            label="To"
            value={destination}
            onSelect={setDestination}
            placeholder="Destination city, district, or state"
          />
        </div>

        {/* Date / Passengers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="date" className="block text-xs font-medium text-warm-gray mb-1.5 uppercase tracking-wider">
              Departure Date (optional)
            </label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage pointer-events-none" />
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-parchment border border-sage/40 rounded-lg text-sm text-bark focus:border-olive focus:ring-1 focus:ring-olive/30 transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="passengers" className="block text-xs font-medium text-warm-gray mb-1.5 uppercase tracking-wider">
              Travelers
            </label>
            <div className="relative">
              <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage pointer-events-none" />
              <input
                id="passengers"
                type="number"
                min={1}
                max={20}
                value={passengers}
                onChange={(e) => setPassengers(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                className="w-full pl-9 pr-3 py-2.5 bg-parchment border border-sage/40 rounded-lg text-sm text-bark focus:border-olive focus:ring-1 focus:ring-olive/30 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Transport modes */}
        <div>
          <label className="block text-xs font-medium text-warm-gray mb-2 uppercase tracking-wider">
            Transport Modes to Compare
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_MODES.map((mode) => {
              const meta = MODE_METADATA[mode];
              const selected = selectedModes.includes(mode);
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => toggleMode(mode)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selected
                      ? 'border-olive bg-moss/40 text-olive'
                      : 'border-sage/30 bg-parchment text-warm-gray hover:border-sage/60'
                  }`}
                  aria-pressed={selected}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-terracotta bg-terracotta/10 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-olive text-parchment rounded-xl font-medium text-sm hover:bg-olive-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Finding routes...
            </>
          ) : (
            <>
              <Search size={18} />
              Find My Greener Route
            </>
          )}
        </button>

        {/* Examples */}
        {!compact && (
          <div className="pt-2 border-t border-sage/20">
            <p className="text-xs text-warm-gray mb-2">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_JOURNEYS.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => fillExample(ex)}
                  className="text-xs px-2.5 py-1 rounded-full border border-sage/30 text-warm-gray hover:border-olive hover:text-olive transition-colors"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
