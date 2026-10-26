import { LeafIcon } from '@/components/Decorations';
import type { TransportComparison } from '@/types';
import { MODE_METADATA } from '@/data/transport';
import { formatEmissions, formatDistance } from '@/services/emissions';

interface InsightPanelProps {
  comparisons?: TransportComparison[];
  hasSearched: boolean;
}

export function InsightPanel({ comparisons, hasSearched }: InsightPanelProps) {
  if (!hasSearched || !comparisons || comparisons.length === 0) {
    return (
      <div className="bg-oat/60 border border-sage/30 rounded-2xl p-6 paper-texture">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-moss/40 flex items-center justify-center">
            <LeafIcon size={20} className="text-olive" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-bark mb-1">A lighter footprint awaits</h3>
            <p className="text-sm text-warm-gray leading-relaxed">
              Your next journey could have a lighter footprint. Search for a route above and
              compare the available alternatives to find out which mode of transport leaves
              the least behind.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Find the lowest emission option
  const available = comparisons.filter((c) => c.route.available);
  if (available.length === 0) {
    return (
      <div className="bg-clay/20 border border-terracotta/30 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-terracotta/20 flex items-center justify-center">
            <LeafIcon size={20} className="text-terracotta" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-bark mb-1">No routes available</h3>
            <p className="text-sm text-warm-gray leading-relaxed">
              We couldn't find routing data for the selected modes. Try different locations or
              transport modes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const lowest = available.reduce((min, c) =>
    (c.emissions.perPassengerEmissions ?? Infinity) < (min.emissions.perPassengerEmissions ?? Infinity)
      ? c : min
  );
  const highest = available.reduce((max, c) =>
    (c.emissions.perPassengerEmissions ?? -Infinity) > (max.emissions.perPassengerEmissions ?? -Infinity)
      ? c : max
  );

  const lowestEmissions = lowest.emissions.perPassengerEmissions;
  const highestEmissions = highest.emissions.perPassengerEmissions;
  const potentialSaving = lowestEmissions != null && highestEmissions != null
    ? highestEmissions - lowestEmissions
    : null;

  const lowestMeta = MODE_METADATA[lowest.mode];

  return (
    <div className="bg-moss/30 border border-sage/40 rounded-2xl p-6 paper-texture">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-sage/40 flex items-center justify-center">
          <LeafIcon size={20} className="text-olive" />
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-lg text-bark mb-1">
            Choosing {lowestMeta.label.toLowerCase()} could save {potentialSaving != null ? formatEmissions(potentialSaving) : 'significant emissions'} per passenger
          </h3>
          <p className="text-sm text-warm-gray leading-relaxed">
            {lowestMeta.label} produces the lowest estimated emissions for this journey at{' '}
            <span className="font-mono text-olive">{formatEmissions(lowestEmissions)}</span> per passenger
            over <span className="font-mono text-olive">{formatDistance(lowest.distance)}</span>.
            Compare all options below to find your best balance of cost, time, and footprint.
          </p>
        </div>
      </div>
    </div>
  );
}
