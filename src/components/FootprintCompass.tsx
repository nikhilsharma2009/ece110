import { Gauge, Leaf, Clock, IndianRupee, Scale, type LucideIcon } from 'lucide-react';
import type { TransportComparison, TransportMode, PriorityKey } from '@/types';
import { MODE_METADATA } from '@/data/transport';
import { formatEmissions, formatDistance, formatDuration, formatCost } from '@/services/emissions';

interface FootprintCompassProps {
  comparisons: TransportComparison[];
  selectedMode: TransportMode;
  onPriorityChange: (priority: PriorityKey) => void;
  priority: PriorityKey;
}

const PRIORITIES: { key: PriorityKey; label: string; description: string; icon: LucideIcon }[] = [
  { key: 'emissions', label: 'Lowest Emissions', description: 'I want the lowest possible emissions.', icon: Leaf },
  { key: 'time', label: 'Fastest Journey', description: 'I need to arrive quickly.', icon: Clock },
  { key: 'cost', label: 'On a Budget', description: 'I am travelling on a budget.', icon: IndianRupee },
  { key: 'compromise', label: 'Best Compromise', description: 'Show me the best balance.', icon: Scale },
];

// Normalize a value to 0-100 scale (lower = better)
function normalize(values: (number | null)[]): number[] {
  const valid = values.filter((v): v is number => v != null);
  if (valid.length === 0) return values.map(() => 50);
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const range = max - min;
  return values.map((v) => {
    if (v == null) return 100;
    if (range === 0) return 50;
    return ((v - min) / range) * 100;
  });
}

export function FootprintCompass({
  comparisons, selectedMode, onPriorityChange, priority,
}: FootprintCompassProps) {
  const available = comparisons.filter((c) => c.route.available);

  if (available.length === 0) {
    return (
      <div className="bg-oat/40 border border-sage/30 rounded-xl p-6 text-center">
        <Gauge size={32} className="text-sage mx-auto mb-2" />
        <p className="text-sm text-warm-gray">
          The Footprint Compass needs at least one available route to provide guidance.
        </p>
      </div>
    );
  }

  // Compute scores for each mode
  const emissionsScores = normalize(
    available.map((c) => c.emissions.perPassengerEmissions)
  );
  const timeScores = normalize(available.map((c) => c.duration));
  const costScores = normalize(available.map((c) => c.cost.amount));
  // For compromise, average the three normalized scores
  const compromiseScores = emissionsScores.map((_, i) =>
    (emissionsScores[i] + timeScores[i] + costScores[i]) / 3
  );

  const getScores = (key: PriorityKey) => {
    if (key === 'emissions') return emissionsScores;
    if (key === 'time') return timeScores;
    if (key === 'cost') return costScores;
    return compromiseScores;
  };

  const scores = getScores(priority);

  // Find recommended option (lowest score = best for the chosen priority)
  let bestIndex = 0;
  let bestScore = scores[0];
  scores.forEach((s, i) => {
    if (s < bestScore) {
      bestScore = s;
      bestIndex = i;
    }
  });

  const recommended = available[bestIndex];
  const recommendedMeta = MODE_METADATA[recommended.mode];
  const selected = available.find((c) => c.mode === selectedMode);
  const selectedMeta = selected ? MODE_METADATA[selected.mode] : null;

  // Build trade-off description
  const tradeOffs: string[] = [];
  if (priority === 'emissions' && selected) {
    if (recommended.mode !== selectedMode) {
      tradeOffs.push(
        `${recommendedMeta.label} has the lowest emissions at ${formatEmissions(recommended.emissions.perPassengerEmissions)} per passenger.`
      );
      if (selected.duration != null && recommended.duration != null && selected.duration < recommended.duration) {
        tradeOffs.push(
          `Your selected ${selectedMeta?.label} is faster by ${formatDuration(recommended.duration - selected.duration)}.`
        );
      }
    } else {
      tradeOffs.push(`Your selected option is already the lowest-emission choice.`);
    }
  } else if (priority === 'time' && selected) {
    if (recommended.mode !== selectedMode) {
      tradeOffs.push(
        `${recommendedMeta.label} is the fastest at ${formatDuration(recommended.duration)}.`
      );
      if (recommended.emissions.perPassengerEmissions != null && selected.emissions.perPassengerEmissions != null) {
        const diff = recommended.emissions.perPassengerEmissions - selected.emissions.perPassengerEmissions;
        if (diff > 0.01) {
          tradeOffs.push(`It produces ${diff.toFixed(2)} kg more CO₂e per passenger than your selected ${selectedMeta?.label}.`);
        }
      }
    } else {
      tradeOffs.push(`Your selected option is already the fastest.`);
    }
  } else if (priority === 'compromise') {
    tradeOffs.push(
      `${recommendedMeta.label} offers the best balance of emissions, time, and cost.`
    );
    tradeOffs.push(`This is not objectively "best" — it is a weighted average of three normalized dimensions.`);
  }

  // Check if train recommendation
  if (recommended.mode === 'train') {
    tradeOffs.push(`Actual train schedules and availability have not been checked.`);
  }

  return (
    <div className="bg-oat/50 border border-sage/30 rounded-xl p-5 paper-texture">
      <div className="flex items-center gap-2 mb-4">
        <Gauge size={20} className="text-olive" />
        <h3 className="font-serif text-base text-bark">Footprint Compass</h3>
      </div>

      {/* Priority selector */}
      <div className="mb-4">
        <p className="text-xs text-warm-gray mb-2 uppercase tracking-wider">What matters most?</p>
        <div className="grid grid-cols-2 gap-2">
          {PRIORITIES.map((p) => {
            const Icon = p.icon;
            const isActive = priority === p.key;
            return (
              <button
                key={p.key}
                onClick={() => onPriorityChange(p.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                  isActive
                    ? 'border-olive bg-moss/30 text-olive'
                    : 'border-sage/30 bg-parchment text-warm-gray hover:border-sage/60'
                }`}
                aria-pressed={isActive}
              >
                <Icon size={14} className={isActive ? 'text-olive' : 'text-sage'} />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-warm-gray/70 italic mt-2">
          {PRIORITIES.find((p) => p.key === priority)?.description}
        </p>
      </div>

      {/* Recommendation */}
      <div className="bg-moss/20 border border-sage/30 rounded-lg p-4 mb-3">
        <p className="text-[10px] uppercase tracking-wider text-warm-gray mb-1">Recommended for your priority</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-serif text-lg text-bark">{recommendedMeta.label}</span>
            <div className="flex gap-3 mt-1 text-xs text-warm-gray font-mono">
              <span>{formatEmissions(recommended.emissions.perPassengerEmissions)}</span>
              <span>·</span>
              <span>{formatDuration(recommended.duration)}</span>
              <span>·</span>
              <span>{formatCost(recommended.cost.amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trade-offs */}
      <div className="space-y-1.5">
        {tradeOffs.map((t, i) => (
          <p key={i} className="text-xs text-warm-gray leading-relaxed flex items-start gap-1.5">
            <span className="text-olive mt-0.5">›</span>
            <span>{t}</span>
          </p>
        ))}
      </div>

      {/* Score visualization */}
      <div className="mt-4 pt-3 border-t border-sage/20">
        <p className="text-[10px] uppercase tracking-wider text-warm-gray mb-2">All options scored (lower = better for your priority)</p>
        <div className="space-y-1.5">
          {available.map((c, i) => {
            const meta = MODE_METADATA[c.mode];
            const score = scores[i];
            const isBest = i === bestIndex;
            const isSel = c.mode === selectedMode;
            return (
              <div key={c.mode} className="flex items-center gap-2 text-xs">
                <span className={`w-20 truncate ${isSel ? 'text-olive font-medium' : 'text-warm-gray'}`}>
                  {meta.shortLabel}
                </span>
                <div className="flex-1 h-3 bg-parchment rounded-full overflow-hidden border border-sage/15">
                  <div
                    className="h-full rounded-full bar-grow"
                    style={{
                      width: `${100 - score}%`,
                      backgroundColor: isBest ? '#52634A' : meta.color,
                      opacity: isBest ? 1 : 0.5,
                    }}
                  />
                </div>
                <span className="font-mono text-warm-gray text-[10px] w-10 text-right">
                  {(100 - score).toFixed(0)}/100
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
