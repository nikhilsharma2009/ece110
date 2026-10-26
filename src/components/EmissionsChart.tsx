import type { TransportComparison, TransportMode } from '@/types';
import { MODE_METADATA } from '@/data/transport';
import { formatEmissions } from '@/services/emissions';

interface EmissionsChartProps {
  comparisons: TransportComparison[];
  selectedMode: TransportMode;
  baselineMode: TransportMode;
}

export function EmissionsChart({ comparisons, selectedMode, baselineMode }: EmissionsChartProps) {
  const available = comparisons.filter((c) => c.route.available);
  if (available.length === 0) {
    return (
      <div className="text-center py-8 text-warm-gray text-sm">
        No emissions data to display.
      </div>
    );
  }

  // Find max emissions for scaling
  const maxEmissions = Math.max(
    ...available.map((c) => c.emissions.perPassengerEmissions ?? 0)
  );
  const scaleMax = maxEmissions > 0 ? maxEmissions * 1.15 : 1;

  const baseline = available.find((c) => c.mode === baselineMode);
  const baselineEmissions = baseline?.emissions.perPassengerEmissions ?? null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-serif text-sm text-bark">Emissions per Passenger (kg CO₂e)</h4>
        <span className="text-xs text-warm-gray font-mono">vs. baseline</span>
      </div>

      <div className="space-y-2.5">
        {available.map((comp) => {
          const meta = MODE_METADATA[comp.mode];
          const emissions = comp.emissions.perPassengerEmissions;
          const widthPct = emissions != null ? (emissions / scaleMax) * 100 : 0;
          const isSelected = comp.mode === selectedMode;
          const isBaseline = comp.mode === baselineMode;
          const diff = baselineEmissions != null && emissions != null
            ? emissions - baselineEmissions
            : null;
          const isWorse = diff != null && diff > 0.001;
          const isBetter = diff != null && diff < -0.001;

          return (
            <div key={comp.mode} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium ${isSelected ? 'text-olive' : 'text-bark'}`}
                  >
                    {meta.shortLabel}
                  </span>
                  {isBaseline && (
                    <span className="text-[10px] text-warm-gray">(baseline)</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-bark">
                    {formatEmissions(emissions)}
                  </span>
                  {!isBaseline && diff != null && (
                    <span
                      className={`text-[10px] font-mono ${
                        isWorse ? 'text-terracotta' : isBetter ? 'text-olive' : 'text-warm-gray'
                      }`}
                    >
                      {isWorse ? '+' : ''}{diff.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-5 bg-oat/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bar-grow transition-all ${
                    isSelected ? 'ring-1 ring-olive/30' : ''
                  }`}
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: meta.color,
                    opacity: isSelected ? 1 : 0.6,
                  }}
                />
                {/* Baseline marker */}
                {baselineEmissions != null && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-bark/40 z-10"
                    style={{
                      left: `${(baselineEmissions / scaleMax) * 100}%`,
                    }}
                  >
                    <div className="absolute -top-0.5 -left-1 w-2 h-2 rotate-45 bg-bark/40" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-warm-gray/70 italic pt-2">
        Bars show estimated operational emissions per passenger. Darker marker indicates the
        selected baseline. Vehicle-level vs. per-passenger emissions differ for cars
        (split by occupancy) vs. bus/train (per-passenger factors).
      </p>
    </div>
  );
}
