import { useState } from 'react';
import { FileText, Printer, Download, X } from 'lucide-react';
import type { SavedJourney } from '@/types';
import { MODE_METADATA } from '@/data/transport';
import { formatEmissions, formatDistance, formatDuration, formatCost, formatEnergy } from '@/services/emissions';

interface EcoTripReportProps {
  journey: SavedJourney;
  open: boolean;
  onClose: () => void;
}

export function EcoTripReport({ journey, open, onClose }: EcoTripReportProps) {
  if (!open) return null;

  const { search, comparisons, selectedMode, baselineMode, assumptions } = journey;
  const selected = comparisons.find((c) => c.mode === selectedMode);
  const baseline = comparisons.find((c) => c.mode === baselineMode);
  const selectedMeta = MODE_METADATA[selectedMode];
  const baselineMeta = MODE_METADATA[baselineMode];

  const savings = baseline && selected
    ? (baseline.emissions.perPassengerEmissions ?? 0) - (selected.emissions.perPassengerEmissions ?? 0)
    : null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const rows: string[] = [];
    rows.push('TERRA Eco-Trip Report');
    rows.push(`Origin,${search.origin.displayName}`);
    rows.push(`Destination,${search.destination.displayName}`);
    rows.push(`Date,${search.date || 'Not specified'}`);
    rows.push(`Passengers,${search.passengers}`);
    rows.push('');
    rows.push('Mode,Distance (km),Duration,Emissions/Pax (kg CO2e),Energy,Cost (INR),Confidence');
    comparisons.forEach((c) => {
      const meta = MODE_METADATA[c.mode];
      rows.push([
        meta.label,
        c.distance ? (c.distance / 1000).toFixed(1) : 'N/A',
        c.duration ? `${Math.floor(c.duration / 3600)}h ${Math.round((c.duration % 3600) / 60)}m` : 'N/A',
        c.emissions.perPassengerEmissions?.toFixed(2) || 'N/A',
        c.emissions.energyConsumed ? `${c.emissions.energyConsumed.toFixed(1)} ${c.emissions.energyUnit}` : 'N/A',
        c.cost.amount?.toFixed(0) || 'N/A',
        c.emissions.dataConfidence,
      ].join(','));
    });
    rows.push('');
    rows.push(`Selected Mode,${selectedMeta.label}`);
    rows.push(`Baseline,${baselineMeta.label}`);
    rows.push(`Savings vs Baseline,${savings?.toFixed(2) || 'N/A'} kg CO2e`);
    rows.push('');
    rows.push('Assumptions');
    Object.entries(assumptions).forEach(([k, v]) => {
      rows.push(`${k},${v}`);
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terra-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bark/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative bg-parchment rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="sticky top-0 bg-parchment border-b border-sage/30 px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-olive" />
            <h3 className="font-serif text-lg text-bark">Eco-Trip Report</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="text-xs px-3 py-1.5 border border-sage/40 rounded-lg text-olive hover:bg-moss/30 transition-colors flex items-center gap-1.5"
            >
              <Download size={12} /> CSV
            </button>
            <button
              onClick={handlePrint}
              className="text-xs px-3 py-1.5 border border-sage/40 rounded-lg text-olive hover:bg-moss/30 transition-colors flex items-center gap-1.5"
            >
              <Printer size={12} /> Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-warm-gray hover:text-bark transition-colors"
              aria-label="Close report"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Report content */}
        <div className="p-6 print:p-8">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="font-serif text-2xl text-bark">TERRA Eco-Trip Report</h1>
            <p className="text-xs text-warm-gray mt-1">All values are modeled estimates — see methodology</p>
          </div>

          {/* Journey summary */}
          <div className="bg-oat/50 rounded-lg p-4 mb-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-warm-gray uppercase tracking-wider">From</p>
                <p className="text-bark font-medium">{search.origin.displayName}</p>
              </div>
              <div>
                <p className="text-xs text-warm-gray uppercase tracking-wider">To</p>
                <p className="text-bark font-medium">{search.destination.displayName}</p>
              </div>
              <div>
                <p className="text-xs text-warm-gray uppercase tracking-wider">Passengers</p>
                <p className="text-bark font-mono">{search.passengers}</p>
              </div>
              <div>
                <p className="text-xs text-warm-gray uppercase tracking-wider">Date</p>
                <p className="text-bark font-mono">{search.date || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Selected option */}
          {selected && (
            <div className="mb-5">
              <h2 className="font-serif text-base text-bark mb-2">Selected Mode: {selectedMeta.label}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-xs text-warm-gray">Distance</p>
                  <p className="font-mono text-bark">{formatDistance(selected.distance)}</p>
                </div>
                <div>
                  <p className="text-xs text-warm-gray">Duration</p>
                  <p className="font-mono text-bark">{formatDuration(selected.duration)}</p>
                </div>
                <div>
                  <p className="text-xs text-warm-gray">Emissions/Pax</p>
                  <p className="font-mono text-olive">{formatEmissions(selected.emissions.perPassengerEmissions)}</p>
                </div>
                <div>
                  <p className="text-xs text-warm-gray">Cost</p>
                  <p className="font-mono text-bark">{formatCost(selected.cost.amount)}</p>
                </div>
              </div>
            </div>
          )}

          {/* All alternatives */}
          <div className="mb-5">
            <h2 className="font-serif text-base text-bark mb-3">All Transport Alternatives</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-sage/30 text-warm-gray">
                  <th className="text-left py-2">Mode</th>
                  <th className="text-right py-2">Distance</th>
                  <th className="text-right py-2">Time</th>
                  <th className="text-right py-2">CO₂e/Pax</th>
                  <th className="text-right py-2">Cost</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((c) => {
                  const meta = MODE_METADATA[c.mode];
                  const isSel = c.mode === selectedMode;
                  return (
                    <tr key={c.mode} className={`border-b border-sage/15 ${isSel ? 'bg-moss/20' : ''}`}>
                      <td className="py-2 text-bark">
                        {meta.label}
                        {isSel && <span className="text-olive ml-1">★</span>}
                      </td>
                      <td className="text-right py-2 font-mono text-bark">{formatDistance(c.distance)}</td>
                      <td className="text-right py-2 font-mono text-bark">{formatDuration(c.duration)}</td>
                      <td className="text-right py-2 font-mono text-bark">
                        {formatEmissions(c.emissions.perPassengerEmissions)}
                      </td>
                      <td className="text-right py-2 font-mono text-bark">{formatCost(c.cost.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Baseline comparison */}
          {baseline && selected && savings != null && (
            <div className="mb-5">
              <h2 className="font-serif text-base text-bark mb-2">Baseline Comparison</h2>
              <p className="text-sm text-bark">
                Compared to {baselineMeta.label} ({formatEmissions(baseline.emissions.perPassengerEmissions)}/pax),
                choosing {selectedMeta.label}{' '}
                {savings > 0 ? (
                  <span className="text-olive font-medium">saves {savings.toFixed(2)} kg CO₂e</span>
                ) : savings < 0 ? (
                  <span className="text-terracotta font-medium">
                    produces {Math.abs(savings).toFixed(2)} kg more CO₂e
                  </span>
                ) : (
                  <span className="text-warm-gray">produces the same emissions</span>
                )}
                {' '}per passenger.
              </p>
            </div>
          )}

          {/* Assumptions */}
          <div className="mb-5">
            <h2 className="font-serif text-base text-bark mb-2">Key Assumptions</h2>
            <ul className="text-xs text-warm-gray space-y-1">
              <li>Petrol car: {assumptions.petrolConsumption} L/100km, {assumptions.petrolEmissionFactor} kg CO₂/L, ₹{assumptions.petrolPrice}/L</li>
              <li>Diesel car: {assumptions.dieselConsumption} L/100km, {assumptions.dieselEmissionFactor} kg CO₂/L, ₹{assumptions.dieselPrice}/L</li>
              <li>Electric car: {assumptions.evConsumption} kWh/100km, {assumptions.electricityEmissionFactor} kg CO₂e/kWh, ₹{assumptions.electricityPrice}/kWh</li>
              <li>Bus: {assumptions.busEmissionFactor} kg CO₂e/passenger-km</li>
              <li>Train: {assumptions.trainEmissionFactor} kg CO₂e/passenger-km</li>
              <li>Routing: OSRM (OpenStreetMap). Geocoding: Nominatim (OpenStreetMap)</li>
            </ul>
          </div>

          <div className="text-center text-xs text-warm-gray/60 border-t border-sage/20 pt-4">
            Generated by TERRA — Travel Lightly. Leave Less. · All outputs are modeled estimates.
          </div>
        </div>
      </div>
    </div>
  );
}
