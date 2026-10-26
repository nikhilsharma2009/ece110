import { useState, useMemo } from 'react';
import { ArrowLeft, MapPin, Save, FileText, ChevronDown } from 'lucide-react';
import type {
  GeoLocation, TransportMode, TransportComparison, AssumptionSet,
  SortKey, PriorityKey, SavedJourney,
} from '@/types';
import { RouteMap } from '@/components/RouteMap';
import { TransportCard } from '@/components/TransportCard';
import { EmissionsChart } from '@/components/EmissionsChart';
import { FootprintCompass } from '@/components/FootprintCompass';
import { WhatIfLab } from '@/components/WhatIfLab';
import { JourneyFingerprint } from '@/components/JourneyFingerprint';
import { EcoTripReport } from '@/components/EcoTripReport';
import { MethodologyLink } from '@/components/MethodologyDrawer';
import { MODE_METADATA, DEFAULT_ASSUMPTIONS } from '@/data/transport';
import { sortComparisons, findBest, calculateSavings } from '@/services/comparison';
import { calculateEmissions, calculateCost, formatEmissions, formatDistance } from '@/services/emissions';
import { saveJourney, generateJourneyId } from '@/services/storage';

interface ResultsPageProps {
  origin: GeoLocation;
  destination: GeoLocation;
  comparisons: TransportComparison[];
  passengers: number;
  assumptions: AssumptionSet;
  onAssumptionsChange: (a: AssumptionSet) => void;
  onPassengersChange: (p: number) => void;
  onBack: () => void;
  onOpenMethodology: (topic: string) => void;
}

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'emissions', label: 'Lowest Emissions' },
  { key: 'distance', label: 'Shortest Distance' },
  { key: 'duration', label: 'Fastest Journey' },
  { key: 'cost', label: 'Lowest Cost' },
  { key: 'energy', label: 'Lowest Energy' },
];

export function ResultsPage({
  origin, destination, comparisons, passengers, assumptions,
  onAssumptionsChange, onPassengersChange, onBack, onOpenMethodology,
}: ResultsPageProps) {
  const [selectedMode, setSelectedMode] = useState<TransportMode>('petrol-car');
  const [baselineMode, setBaselineMode] = useState<TransportMode>('petrol-car');
  const [sortKey, setSortKey] = useState<SortKey>('emissions');
  const [priority, setPriority] = useState<PriorityKey>('emissions');
  const [showMapMobile, setShowMapMobile] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  // Recompute comparisons when assumptions or passengers change
  const liveComparisons = useMemo(() => {
    return comparisons.map((c) => ({
      ...c,
      emissions: calculateEmissions(c.mode, c.route, passengers, assumptions),
      cost: calculateCost(c.mode, c.route, passengers, assumptions),
      passengers,
    }));
  }, [comparisons, passengers, assumptions]);

  const sorted = useMemo(() => sortComparisons(liveComparisons, sortKey), [liveComparisons, sortKey]);

  const bestEmissions = findBest(liveComparisons, 'emissions');
  const bestDistance = findBest(liveComparisons, 'distance');
  const bestDuration = findBest(liveComparisons, 'duration');

  const selected = liveComparisons.find((c) => c.mode === selectedMode);
  const baseline = liveComparisons.find((c) => c.mode === baselineMode);
  const savings = calculateSavings(baseline, selected);

  const handleSave = () => {
    const journey: SavedJourney = {
      id: generateJourneyId(),
      search: { origin, destination, passengers, preferredModes: comparisons.map((c) => c.mode) },
      comparisons: liveComparisons,
      selectedMode,
      baselineMode,
      assumptions,
      timestamp: Date.now(),
    };
    saveJourney(journey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-parchment paper-texture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Back button + journey summary */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-warm-gray hover:text-olive transition-colors"
          >
            <ArrowLeft size={16} /> New Search
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="text-xs px-3 py-1.5 border border-sage/40 rounded-lg text-olive hover:bg-moss/30 transition-colors flex items-center gap-1.5"
            >
              <Save size={12} /> {saved ? 'Saved!' : 'Save Journey'}
            </button>
            <button
              onClick={() => setReportOpen(true)}
              className="text-xs px-3 py-1.5 border border-sage/40 rounded-lg text-olive hover:bg-moss/30 transition-colors flex items-center gap-1.5"
            >
              <FileText size={12} /> Eco-Trip Report
            </button>
          </div>
        </div>

        {/* Journey summary bar */}
        <div className="bg-oat/60 border border-sage/30 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={14} className="text-olive" />
              <span className="text-bark font-medium">{origin.name}</span>
              <span className="text-warm-gray">→</span>
              <span className="text-bark font-medium">{destination.name}</span>
            </div>
            <div className="text-xs text-warm-gray">
              {passengers} {passengers === 1 ? 'traveler' : 'travelers'}
            </div>
            {selected && (
              <div className="ml-auto text-xs text-warm-gray">
                <span className="text-warm-gray">Selected: </span>
                <span className="text-bark font-medium">{MODE_METADATA[selectedMode].label}</span>
                {savings.saved != null && savings.saved > 0 && (
                  <span className="text-olive ml-2">
                    Saves {formatEmissions(savings.saved)} vs. baseline
                  </span>
                )}
                {savings.saved != null && savings.saved < 0 && (
                  <span className="text-terracotta ml-2">
                    +{formatEmissions(Math.abs(savings.saved))} vs. baseline
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Desktop: split view. Mobile: stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
          {/* Map */}
          <div className={`${showMapMobile ? 'block' : 'hidden'} lg:block h-[400px] lg:h-[600px] bg-oat/30 rounded-xl overflow-hidden border border-sage/30`}>
            <RouteMap
              origin={origin}
              destination={destination}
              comparisons={liveComparisons}
              selectedMode={selectedMode}
              onSelectMode={setSelectedMode}
            />
          </div>

          {/* Comparison panel */}
          <div className="space-y-3">
            {/* Mobile map toggle */}
            <button
              onClick={() => setShowMapMobile(!showMapMobile)}
              className="lg:hidden w-full text-xs px-3 py-2 bg-oat/60 border border-sage/30 rounded-lg flex items-center justify-center gap-1.5 text-warm-gray"
            >
              <MapPin size={12} />
              {showMapMobile ? 'Hide Map' : 'Show Map'}
              <ChevronDown size={12} className={showMapMobile ? 'rotate-180' : ''} />
            </button>

            {/* Best-of badges */}
            <div className="flex flex-wrap gap-2">
              {bestEmissions && (
                <div className="px-3 py-1.5 bg-moss/30 border border-sage/30 rounded-lg text-xs">
                  <span className="text-warm-gray">Lowest Emissions: </span>
                  <span className="text-olive font-medium">{MODE_METADATA[bestEmissions].label}</span>
                </div>
              )}
              {bestDistance && (
                <div className="px-3 py-1.5 bg-sky/20 border border-sky-dark/30 rounded-lg text-xs">
                  <span className="text-warm-gray">Shortest Distance: </span>
                  <span className="text-sky-dark font-medium">{MODE_METADATA[bestDistance].label}</span>
                </div>
              )}
              {bestDuration && (
                <div className="px-3 py-1.5 bg-butter/30 border border-butter/50 rounded-lg text-xs">
                  <span className="text-warm-gray">Fastest: </span>
                  <span className="text-bark font-medium">{MODE_METADATA[bestDuration].label}</span>
                </div>
              )}
            </div>

            {/* Sort controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-warm-gray">Sort by:</span>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortKey(opt.key)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    sortKey === opt.key
                      ? 'border-olive bg-moss/30 text-olive'
                      : 'border-sage/30 text-warm-gray hover:border-sage/60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Transport cards */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {sorted.map((comp) => {
                let badge: string | undefined;
                if (comp.mode === bestEmissions) badge = 'Lowest Emissions';
                else if (comp.mode === bestDistance) badge = 'Shortest';
                else if (comp.mode === bestDuration) badge = 'Fastest';

                return (
                  <TransportCard
                    key={comp.mode}
                    comparison={comp}
                    selected={comp.mode === selectedMode}
                    isBaseline={comp.mode === baselineMode}
                    onSelect={setSelectedMode}
                    onViewRoute={(m) => {
                      setSelectedMode(m);
                      if (window.innerWidth < 1024) setShowMapMobile(true);
                    }}
                    badge={badge}
                  />
                );
              })}
            </div>

            {/* Baseline selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-warm-gray">Compare against baseline:</span>
              <select
                value={baselineMode}
                onChange={(e) => setBaselineMode(e.target.value as TransportMode)}
                className="px-2 py-1 bg-parchment border border-sage/40 rounded text-sm text-bark focus:border-olive"
              >
                {liveComparisons
                  .filter((c) => c.route.available)
                  .map((c) => (
                    <option key={c.mode} value={c.mode}>
                      {MODE_METADATA[c.mode].label}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lower section: Emissions Chart + Footprint Compass + Fingerprint */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          {/* Emissions chart */}
          <div className="bg-oat/40 border border-sage/30 rounded-xl p-5">
            <EmissionsChart
              comparisons={liveComparisons}
              selectedMode={selectedMode}
              baselineMode={baselineMode}
            />
            <div className="mt-3 pt-3 border-t border-sage/20">
              <MethodologyLink topic="combustion-emissions" onOpen={onOpenMethodology}>
                How are emissions calculated?
              </MethodologyLink>
            </div>
          </div>

          {/* Footprint Compass */}
          <div>
            <FootprintCompass
              comparisons={liveComparisons}
              selectedMode={selectedMode}
              onPriorityChange={setPriority}
              priority={priority}
            />
          </div>

          {/* Journey fingerprint + savings summary */}
          <div className="space-y-4">
            <JourneyFingerprint
              comparisons={liveComparisons}
              originName={origin.name}
              destinationName={destination.name}
            />

            {/* Savings summary */}
            {selected && baseline && (
              <div className="bg-oat/40 border border-sage/30 rounded-xl p-5">
                <h4 className="font-serif text-sm text-bark mb-3">What changes if I choose this?</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-warm-gray text-xs">Baseline ({MODE_METADATA[baselineMode].label})</span>
                    <span className="font-mono text-bark">
                      {formatEmissions(baseline.emissions.perPassengerEmissions)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-warm-gray text-xs">Selected ({MODE_METADATA[selectedMode].label})</span>
                    <span className="font-mono text-bark">
                      {formatEmissions(selected.emissions.perPassengerEmissions)}
                    </span>
                  </div>
                  <div className="border-t border-sage/20 pt-2 flex items-center justify-between">
                    <span className="text-xs text-warm-gray">Difference per passenger</span>
                    <span className={`font-mono font-medium ${
                      savings.saved != null && savings.saved > 0
                        ? 'text-olive'
                        : savings.saved != null && savings.saved < 0
                        ? 'text-terracotta'
                        : 'text-warm-gray'
                    }`}>
                      {savings.saved != null
                        ? (savings.saved > 0 ? '−' : '+') + formatEmissions(Math.abs(savings.saved))
                        : 'N/A'}
                    </span>
                  </div>
                  {savings.percentage != null && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-warm-gray">Percentage change</span>
                      <span className={`font-mono text-xs ${
                        savings.percentage < 0 ? 'text-terracotta' : 'text-olive'
                      }`}>
                        {savings.percentage > 0 ? '−' : ''}{Math.abs(savings.percentage).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <MethodologyLink topic="savings" onOpen={onOpenMethodology}>
                    How are savings calculated?
                  </MethodologyLink>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* What-if lab */}
        <div className="mt-6">
          <WhatIfLab
            assumptions={assumptions}
            onChange={onAssumptionsChange}
            comparisons={liveComparisons}
            selectedMode={selectedMode}
            passengers={passengers}
            onPassengersChange={onPassengersChange}
          />
        </div>
      </div>

      {/* Eco-trip report modal */}
      {selected && (
        <EcoTripReport
          journey={{
            id: 'temp',
            search: { origin, destination, passengers, preferredModes: comparisons.map((c) => c.mode) },
            comparisons: liveComparisons,
            selectedMode,
            baselineMode,
            assumptions,
            timestamp: Date.now(),
          }}
          open={reportOpen}
          onClose={() => setReportOpen(false)}
        />
      )}
    </div>
  );
}
