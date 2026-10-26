import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import type { AssumptionSet, TransportComparison, TransportMode } from '@/types';
import { MODE_METADATA } from '@/data/transport';
import { calculateEmissions, formatEmissions, formatEnergy } from '@/services/emissions';

interface WhatIfLabProps {
  assumptions: AssumptionSet;
  onChange: (assumptions: AssumptionSet) => void;
  comparisons: TransportComparison[];
  selectedMode: TransportMode;
  passengers: number;
  onPassengersChange: (p: number) => void;
}

const DEFAULTS: AssumptionSet = {
  petrolConsumption: 7.5,
  dieselConsumption: 6.0,
  evConsumption: 15.0,
  motorcycleConsumption: 2.5,
  petrolPrice: 105,
  dieselPrice: 92,
  electricityPrice: 8,
  petrolEmissionFactor: 2.31,
  dieselEmissionFactor: 2.68,
  electricityEmissionFactor: 0.71,
  busEmissionFactor: 0.027,
  trainEmissionFactor: 0.0064,
  carOccupancy: 2,
  busOccupancy: 30,
  trainOccupancy: 500,
  motorcycleEmissionFactor: 2.31,
};

function NumberField({
  label, value, onChange, unit, step, min, max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit: string;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="block text-xs text-warm-gray mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full px-2 py-1.5 bg-parchment border border-sage/40 rounded text-sm font-mono text-bark focus:border-olive focus:ring-1 focus:ring-olive/30"
        />
        <span className="text-xs text-warm-gray whitespace-nowrap">{unit}</span>
      </div>
    </div>
  );
}

export function WhatIfLab({
  assumptions, onChange, comparisons, selectedMode, passengers, onPassengersChange,
}: WhatIfLabProps) {
  const [expanded, setExpanded] = useState(false);
  const selected = comparisons.find((c) => c.mode === selectedMode);
  const meta = MODE_METADATA[selectedMode];

  // Recalculate for selected mode with current assumptions
  const liveEmissions = selected
    ? calculateEmissions(selectedMode, selected.route, passengers, assumptions)
    : null;

  const reset = () => onChange({ ...DEFAULTS });

  return (
    <div className="bg-oat/40 border border-sage/30 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-oat/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-olive" />
          <h3 className="font-serif text-base text-bark">What-if Travel Lab</h3>
        </div>
        <span className="text-xs text-warm-gray">
          {expanded ? 'Collapse' : 'Adjust assumptions'}
        </span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-5 animate-fade-in">
          {/* Passenger count */}
          <div className="border-b border-sage/20 pb-4">
            <NumberField
              label="Number of passengers"
              value={passengers}
              onChange={onPassengersChange}
              unit="travelers"
              step={1}
              min={1}
              max={20}
            />
            {liveEmissions && !liveEmissions.isPerPassenger && (
              <p className="text-[11px] text-olive mt-2">
                {meta.label}: {formatEmissions(liveEmissions.totalEmissions)} total →{' '}
                {formatEmissions(liveEmissions.perPassengerEmissions)} per passenger
                (split across {Math.max(1, passengers)})
              </p>
            )}
          </div>

          {/* Fuel consumption rates */}
          <div>
            <h4 className="text-xs font-medium text-warm-gray uppercase tracking-wider mb-3">Vehicle Efficiency</h4>
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Petrol car"
                value={assumptions.petrolConsumption}
                onChange={(v) => onChange({ ...assumptions, petrolConsumption: v })}
                unit="L/100km"
                step={0.5}
                min={3}
                max={20}
              />
              <NumberField
                label="Diesel car"
                value={assumptions.dieselConsumption}
                onChange={(v) => onChange({ ...assumptions, dieselConsumption: v })}
                unit="L/100km"
                step={0.5}
                min={3}
                max={20}
              />
              <NumberField
                label="Electric car"
                value={assumptions.evConsumption}
                onChange={(v) => onChange({ ...assumptions, evConsumption: v })}
                unit="kWh/100km"
                step={1}
                min={8}
                max={30}
              />
              <NumberField
                label="Motorcycle"
                value={assumptions.motorcycleConsumption}
                onChange={(v) => onChange({ ...assumptions, motorcycleConsumption: v })}
                unit="L/100km"
                step={0.5}
                min={1}
                max={8}
              />
            </div>
          </div>

          {/* Fuel/electricity prices */}
          <div>
            <h4 className="text-xs font-medium text-warm-gray uppercase tracking-wider mb-3">Prices</h4>
            <div className="grid grid-cols-3 gap-3">
              <NumberField
                label="Petrol"
                value={assumptions.petrolPrice}
                onChange={(v) => onChange({ ...assumptions, petrolPrice: v })}
                unit="₹/L"
                step={1}
                min={50}
                max={200}
              />
              <NumberField
                label="Diesel"
                value={assumptions.dieselPrice}
                onChange={(v) => onChange({ ...assumptions, dieselPrice: v })}
                unit="₹/L"
                step={1}
                min={50}
                max={200}
              />
              <NumberField
                label="Electricity"
                value={assumptions.electricityPrice}
                onChange={(v) => onChange({ ...assumptions, electricityPrice: v })}
                unit="₹/kWh"
                step={0.5}
                min={2}
                max={15}
              />
            </div>
          </div>

          {/* Emission factors */}
          <div>
            <h4 className="text-xs font-medium text-warm-gray uppercase tracking-wider mb-3">Emission Factors</h4>
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Petrol"
                value={assumptions.petrolEmissionFactor}
                onChange={(v) => onChange({ ...assumptions, petrolEmissionFactor: v })}
                unit="kg CO₂/L"
                step={0.01}
                min={2}
                max={3}
              />
              <NumberField
                label="Diesel"
                value={assumptions.dieselEmissionFactor}
                onChange={(v) => onChange({ ...assumptions, dieselEmissionFactor: v })}
                unit="kg CO₂/L"
                step={0.01}
                min={2}
                max={3}
              />
              <NumberField
                label="Electricity (India grid)"
                value={assumptions.electricityEmissionFactor}
                onChange={(v) => onChange({ ...assumptions, electricityEmissionFactor: v })}
                unit="kg CO₂e/kWh"
                step={0.01}
                min={0.1}
                max={1.5}
              />
              <NumberField
                label="Bus (per pax-km)"
                value={assumptions.busEmissionFactor}
                onChange={(v) => onChange({ ...assumptions, busEmissionFactor: v })}
                unit="kg CO₂e"
                step={0.001}
                min={0.005}
                max={0.1}
              />
              <NumberField
                label="Train (per pax-km)"
                value={assumptions.trainEmissionFactor}
                onChange={(v) => onChange({ ...assumptions, trainEmissionFactor: v })}
                unit="kg CO₂e"
                step={0.001}
                min={0.001}
                max={0.05}
              />
            </div>
          </div>

          {/* Live preview */}
          {liveEmissions && (
            <div className="bg-moss/20 border border-sage/30 rounded-lg p-4">
              <p className="text-xs text-warm-gray uppercase tracking-wider mb-2">
                Live preview — {meta.label}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-warm-gray text-xs">Total emissions: </span>
                  <span className="font-mono text-bark font-medium">
                    {formatEmissions(liveEmissions.totalEmissions)}
                  </span>
                </div>
                <div>
                  <span className="text-warm-gray text-xs">Per passenger: </span>
                  <span className="font-mono text-olive font-medium">
                    {formatEmissions(liveEmissions.perPassengerEmissions)}
                  </span>
                </div>
                <div>
                  <span className="text-warm-gray text-xs">Energy: </span>
                  <span className="font-mono text-bark font-medium">
                    {formatEnergy(liveEmissions.energyConsumed, liveEmissions.energyUnit)}
                  </span>
                </div>
                <div>
                  <span className="text-warm-gray text-xs">Confidence: </span>
                  <span className="text-bark text-xs">{liveEmissions.dataConfidence}</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={reset}
            className="text-xs text-warm-gray hover:text-terracotta flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw size={12} /> Reset to defaults
          </button>
        </div>
      )}
    </div>
  );
}
