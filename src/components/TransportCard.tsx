import {
  Car, Zap, Bike, Bus, TrainFront, Footprints, Check, AlertCircle,
  MapPin, Clock, Leaf, Fuel, IndianRupee, Eye,
  type LucideIcon,
} from 'lucide-react';
import type { TransportComparison, TransportMode } from '@/types';
import { MODE_METADATA } from '@/data/transport';
import {
  formatEmissions, formatDistance, formatDuration, formatEnergy, formatCost,
} from '@/services/emissions';

const ICONS: Record<string, LucideIcon> = {
  Car, Zap, Bike, Bus, TrainFront, Footprints,
};

const CONFIDENCE_LABELS: Record<string, { label: string; color: string }> = {
  high: { label: 'High confidence', color: 'text-olive' },
  medium: { label: 'Medium confidence', color: 'text-butter' },
  low: { label: 'Low confidence', color: 'text-terracotta' },
  unavailable: { label: 'Unavailable', color: 'text-terracotta' },
};

interface TransportCardProps {
  comparison: TransportComparison;
  selected: boolean;
  isBaseline: boolean;
  onSelect: (mode: TransportMode) => void;
  onViewRoute: (mode: TransportMode) => void;
  badge?: string;
}

export function TransportCard({
  comparison, selected, isBaseline, onSelect, onViewRoute, badge,
}: TransportCardProps) {
  const meta = MODE_METADATA[comparison.mode];
  const Icon = ICONS[meta.icon] || Car;
  const route = comparison.route;
  const em = comparison.emissions;
  const confidence = CONFIDENCE_LABELS[em.dataConfidence];

  if (!route.available) {
    return (
      <div className="border border-sage/20 rounded-xl p-4 bg-oat/30 opacity-70">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-sage/20 flex items-center justify-center">
            <Icon size={20} className="text-warm-gray" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-medium text-bark text-sm">{meta.label}</h4>
              <span className="text-xs text-terracotta flex items-center gap-1">
                <AlertCircle size={12} /> Unavailable
              </span>
            </div>
            <p className="text-xs text-warm-gray mt-1">
              {route.unavailableReason || 'Route data unavailable for this mode.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative border rounded-xl p-4 transition-all cursor-pointer ${
        selected
          ? 'border-olive bg-moss/20 shadow-sm'
          : 'border-sage/30 bg-parchment hover:border-sage/60 hover:shadow-sm'
      }`}
      onClick={() => onSelect(comparison.mode)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(comparison.mode);
        }
      }}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-olive text-parchment text-[10px] font-medium rounded-full uppercase tracking-wider">
          {badge}
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${meta.color}30` }}
        >
          <Icon size={20} style={{ color: meta.color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-bark text-sm">{meta.label}</h4>
              {isBaseline && (
                <span className="text-[10px] px-1.5 py-0.5 bg-clay/30 text-bark rounded font-medium">
                  Baseline
                </span>
              )}
              {route.isApproximation && (
                <span className="text-[10px] px-1.5 py-0.5 bg-butter/40 text-bark rounded">
                  Approx.
                </span>
              )}
            </div>
            {selected && (
              <Check size={16} className="text-olive flex-shrink-0" />
            )}
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            {/* Distance */}
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-sage flex-shrink-0" />
              <span className="text-warm-gray">Distance:</span>
              <span className="font-mono text-bark font-medium">
                {formatDistance(route.distance)}
              </span>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-sky-dark flex-shrink-0" />
              <span className="text-warm-gray">Time:</span>
              <span className="font-mono text-bark font-medium">
                {formatDuration(route.duration)}
              </span>
            </div>

            {/* Emissions */}
            <div className="flex items-center gap-1.5">
              <Leaf size={12} className="text-olive flex-shrink-0" />
              <span className="text-warm-gray">CO₂e/pax:</span>
              <span className={`font-mono font-medium ${
                em.perPassengerEmissions === 0 ? 'text-olive' :
                em.perPassengerEmissions != null && em.perPassengerEmissions < 5 ? 'text-olive' :
                em.perPassengerEmissions != null && em.perPassengerEmissions < 15 ? 'text-bark' :
                'text-terracotta'
              }`}>
                {formatEmissions(em.perPassengerEmissions)}
              </span>
            </div>

            {/* Energy/Fuel */}
            <div className="flex items-center gap-1.5">
              <Fuel size={12} className="text-clay flex-shrink-0" />
              <span className="text-warm-gray">{em.energyUnit === 'kWh' ? 'Energy:' : 'Fuel:'}</span>
              <span className="font-mono text-bark font-medium">
                {formatEnergy(em.energyConsumed, em.energyUnit)}
              </span>
            </div>

            {/* Cost */}
            <div className="flex items-center gap-1.5">
              <IndianRupee size={12} className="text-sage flex-shrink-0" />
              <span className="text-warm-gray">Cost:</span>
              <span className="font-mono text-bark font-medium">
                {formatCost(comparison.cost.amount)}
              </span>
            </div>

            {/* Confidence */}
            <div className="flex items-center gap-1.5">
              <span className="text-warm-gray">Data:</span>
              <span className={`text-[11px] ${confidence.color}`}>
                {confidence.label}
              </span>
            </div>
          </div>

          {/* Notes */}
          {route.approximationLabel && (
            <p className="text-[11px] text-warm-gray/70 mt-2 italic">
              {route.approximationLabel}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-sage/15">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewRoute(comparison.mode);
              }}
              className="text-xs text-olive hover:text-olive-dark font-medium flex items-center gap-1 transition-colors"
            >
              <Eye size={12} /> View Route
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(comparison.mode);
              }}
              className={`text-xs font-medium flex items-center gap-1 transition-colors ${
                selected ? 'text-olive' : 'text-warm-gray hover:text-olive'
              }`}
            >
              <Check size={12} /> {selected ? 'Selected' : 'Use This Option'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
