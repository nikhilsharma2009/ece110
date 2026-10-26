import { useState } from 'react';
import { HelpCircle, X, ExternalLink } from 'lucide-react';
import { DATA_SOURCES } from '@/data/transport';

interface MethodologyDrawerProps {
  open: boolean;
  onClose: () => void;
  topic?: string | null;
}

interface MethodEntry {
  title: string;
  formula: string;
  unit: string;
  source: string;
  sourceUrl: string;
  lastUpdated: string;
  assumptions: string[];
  limitations: string[];
}

const METHODS: Record<string, MethodEntry> = {
  'combustion-emissions': {
    title: 'Combustion Vehicle Emissions',
    formula: 'CO₂ (kg) = Fuel consumed (L) × Fuel emission factor (kg CO₂/L)',
    unit: 'kg CO₂',
    source: 'IPCC Guidelines for National Greenhouse Gas Inventories (2006)',
    sourceUrl: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/',
    lastUpdated: '2024-01-15',
    assumptions: [
      'Petrol emission factor: 2.31 kg CO₂/L',
      'Diesel emission factor: 2.68 kg CO₂/L',
      'Fuel consumption rates are ARAI typical defaults, editable by the user',
      'Per-passenger emissions = total ÷ number of passengers',
    ],
    limitations: [
      'Covers operational (tailpipe) CO₂ only — not lifecycle emissions',
      'Does not account for vehicle age, load, terrain, or driving style',
      'Real-world fuel consumption may vary ±20% from defaults',
    ],
  },
  'ev-emissions': {
    title: 'Electric Vehicle Emissions',
    formula: 'CO₂e (kg) = Energy consumed (kWh) × Grid emission factor (kg CO₂e/kWh)',
    unit: 'kg CO₂e',
    source: 'Central Electricity Authority, India — CO2 Baseline Database',
    sourceUrl: 'https://cea.nic.in/co2-baseline-database/',
    lastUpdated: '2024-01-15',
    assumptions: [
      'India grid average emission factor: 0.71 kg CO₂e/kWh',
      'EV energy consumption: 15 kWh/100km (editable)',
      'No tailpipe emissions — electricity-related emissions only',
      'Actual grid mix varies by region and time of day',
    ],
    limitations: [
      'Regional grid emission factors vary across India',
      'Charging losses not included',
      'Battery manufacturing emissions not included (lifecycle)',
    ],
  },
  'public-transport': {
    title: 'Public Transport Emissions',
    formula: 'CO₂e (kg) = Distance (km) × Passenger-km emission factor (kg CO₂e/passenger-km)',
    unit: 'kg CO₂e per passenger',
    source: 'UK BEIS + Indian Railways sustainability reports',
    sourceUrl: 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023',
    lastUpdated: '2024-01-15',
    assumptions: [
      'Bus: 0.027 kg CO₂e per passenger-km',
      'Train: 0.0064 kg CO₂e per passenger-km',
      'These are per-passenger estimates, not total vehicle emissions',
      'Factors assume average occupancy — actual occupancy varies',
    ],
    limitations: [
      'Factors derived from international data adapted for Indian conditions',
      'Do not reflect actual occupancy on any specific departure',
      'Bus factor varies by bus type (ordinary, AC, electric)',
      'Train distance is a straight-line approximation',
    ],
  },
  'fuel-consumption': {
    title: 'Fuel Consumption',
    formula: 'Fuel (L) = Distance (km) × Consumption rate (L/100km) ÷ 100',
    unit: 'Liters',
    source: 'ARAI typical vehicle fuel efficiency ratings',
    sourceUrl: 'https://www.araiindia.com/',
    lastUpdated: '2024-01-15',
    assumptions: [
      'Petrol car default: 7.5 L/100km',
      'Diesel car default: 6.0 L/100km',
      'Motorcycle default: 2.5 L/100km',
      'All rates are user-editable in the What-if Travel Lab',
    ],
    limitations: [
      'Actual consumption depends on traffic, terrain, AC use, and driving style',
      'Highway vs. city consumption can differ significantly',
    ],
  },
  'savings': {
    title: 'Environmental Savings',
    formula: 'Emissions saved = Baseline emissions − Selected option emissions',
    unit: 'kg CO₂e',
    source: 'Derived from the same emission factors used throughout TERRA',
    sourceUrl: '',
    lastUpdated: '2024-01-15',
    assumptions: [
      'Default baseline: petrol car with selected occupancy',
      'Percentage reduction only shown when baseline > 0',
      'Negative savings are reported as increases, not hidden',
    ],
    limitations: [
      'Comparisons across different accounting boundaries (tailpipe vs. per-passenger) should be interpreted carefully',
      'Walking and cycling show zero operational emissions',
    ],
  },
  'distance': {
    title: 'Route Distance',
    formula: 'Distance = Sum of route segment lengths from routing provider',
    unit: 'Kilometers',
    source: 'Project OSRM (Open Source Routing Machine)',
    sourceUrl: 'https://project-osrm.org/',
    lastUpdated: '2024-01-15',
    assumptions: [
      'Road modes use OSRM driving profile',
      'Walking uses OSRM foot profile',
      'Cycling uses OSRM cycling profile',
      'Train distance is a straight-line × 1.2 approximation',
    ],
    limitations: [
      'OSRM uses OpenStreetMap data which may have gaps',
      'Train approximation does not reflect actual rail route distance',
      'Route alternatives depend on available OSM data',
    ],
  },
};

export function MethodologyDrawer({ open, onClose, topic }: MethodologyDrawerProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>(topic || 'combustion-emissions');

  // Update when topic prop changes
  if (topic && topic !== selectedTopic && open) {
    setSelectedTopic(topic);
  }

  const method = METHODS[selectedTopic] || METHODS['combustion-emissions'];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex justify-end">
      <div
        className="absolute inset-0 bg-bark/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-parchment shadow-2xl overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-parchment border-b border-sage/30 px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <HelpCircle size={20} className="text-olive" />
            <h3 className="font-serif text-lg text-bark">How is this calculated?</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-warm-gray hover:text-bark transition-colors"
            aria-label="Close methodology"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Topic selector */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(METHODS).map(([key, m]) => (
              <button
                key={key}
                onClick={() => setSelectedTopic(key)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  selectedTopic === key
                    ? 'border-olive bg-moss/30 text-olive'
                    : 'border-sage/30 text-warm-gray hover:border-sage/60'
                }`}
              >
                {m.title}
              </button>
            ))}
          </div>

          {/* Method detail */}
          <div className="space-y-4">
            <div>
              <h4 className="font-serif text-base text-bark mb-2">{method.title}</h4>
            </div>

            <div className="bg-oat/50 rounded-lg p-3">
              <p className="text-xs text-warm-gray uppercase tracking-wider mb-1">Formula</p>
              <p className="font-mono text-sm text-bark leading-relaxed">{method.formula}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-warm-gray uppercase tracking-wider mb-1">Unit</p>
                <p className="text-bark font-mono">{method.unit}</p>
              </div>
              <div>
                <p className="text-xs text-warm-gray uppercase tracking-wider mb-1">Last Updated</p>
                <p className="text-bark font-mono">{method.lastUpdated}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-warm-gray uppercase tracking-wider mb-1">Data Source</p>
              <p className="text-sm text-bark">{method.source}</p>
              {method.sourceUrl && (
                <a
                  href={method.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-olive hover:text-olive-dark flex items-center gap-1 mt-1"
                >
                  <ExternalLink size={12} /> {method.sourceUrl}
                </a>
              )}
            </div>

            <div>
              <p className="text-xs text-warm-gray uppercase tracking-wider mb-2">Assumptions</p>
              <ul className="space-y-1.5">
                {method.assumptions.map((a, i) => (
                  <li key={i} className="text-sm text-bark flex items-start gap-2">
                    <span className="text-olive mt-0.5">›</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs text-warm-gray uppercase tracking-wider mb-2">Known Limitations</p>
              <ul className="space-y-1.5">
                {method.limitations.map((l, i) => (
                  <li key={i} className="text-sm text-terracotta flex items-start gap-2">
                    <span className="text-terracotta mt-0.5">!</span>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MethodologyLink({
  topic, children, onOpen,
}: {
  topic: string;
  children: React.ReactNode;
  onOpen: (topic: string) => void;
}) {
  return (
    <button
      onClick={() => onOpen(topic)}
      className="text-xs text-olive hover:text-olive-dark underline underline-offset-2 decoration-sage/40 hover:decoration-olive transition-colors inline-flex items-center gap-1"
    >
      <HelpCircle size={11} />
      {children}
    </button>
  );
}

export { DATA_SOURCES };
