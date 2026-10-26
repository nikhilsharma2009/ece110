import { ExternalLink, BookOpen } from 'lucide-react';
import { DATA_SOURCES, DEFAULT_ASSUMPTIONS } from '@/data/transport';

export function MethodologyPage() {
  return (
    <div className="min-h-screen bg-parchment paper-texture">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={22} className="text-olive" />
            <span className="text-xs font-mono uppercase tracking-widest text-olive">Methodology</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-bark mb-4">
            How TERRA calculates emissions
          </h1>
          <p className="text-base text-warm-gray leading-relaxed max-w-2xl">
            Every number TERRA shows is a modeled estimate built from published emission factors
            and routing data. This page documents every formula, source, and assumption so you
            can trust — and verify — what you see.
          </p>
        </div>

        {/* Emission factors table */}
        <section className="mb-10">
          <h2 className="font-serif text-xl text-bark mb-4">Emission Factors & Defaults</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-sage/30 rounded-lg overflow-hidden">
              <thead className="bg-oat/60">
                <tr className="text-left text-warm-gray">
                  <th className="px-4 py-3 font-medium">Parameter</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                  <th className="px-4 py-3 font-medium">Unit</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(DATA_SOURCES).map(([key, ds]) => (
                  <tr key={key} className="border-t border-sage/20">
                    <td className="px-4 py-3 text-bark font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}</td>
                    <td className="px-4 py-3 font-mono text-bark">{ds.value}</td>
                    <td className="px-4 py-3 font-mono text-warm-gray">{ds.unit}</td>
                    <td className="px-4 py-3 text-warm-gray text-xs">
                      {ds.source}
                      {ds.url && (
                        <a href={ds.url} target="_blank" rel="noopener noreferrer" className="text-olive hover:text-olive-dark inline-flex items-center gap-0.5 ml-1">
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Formulas */}
        <section className="mb-10">
          <h2 className="font-serif text-xl text-bark mb-4">Formulas</h2>
          <div className="space-y-4">
            <div className="bg-oat/50 rounded-lg p-4 border border-sage/20">
              <h3 className="font-medium text-bark mb-2">Combustion Vehicle Emissions</h3>
              <p className="font-mono text-sm text-olive bg-parchment px-3 py-2 rounded">
                CO₂ (kg) = Fuel consumed (L) × Fuel emission factor (kg CO₂/L)
              </p>
              <p className="font-mono text-xs text-warm-gray bg-parchment px-3 py-2 rounded mt-2">
                Fuel consumed (L) = Distance (km) × Consumption rate (L/100km) ÷ 100
              </p>
              <p className="text-sm text-warm-gray mt-2">
                Per-passenger emissions = total vehicle emissions ÷ number of passengers.
                This covers operational (tailpipe) CO₂ only, not lifecycle emissions.
              </p>
            </div>

            <div className="bg-oat/50 rounded-lg p-4 border border-sage/20">
              <h3 className="font-medium text-bark mb-2">Electric Vehicle Emissions</h3>
              <p className="font-mono text-sm text-olive bg-parchment px-3 py-2 rounded">
                CO₂e (kg) = Energy consumed (kWh) × Grid emission factor (kg CO₂e/kWh)
              </p>
              <p className="font-mono text-xs text-warm-gray bg-parchment px-3 py-2 rounded mt-2">
                Energy consumed (kWh) = Distance (km) × EV efficiency (kWh/100km) ÷ 100
              </p>
              <p className="text-sm text-warm-gray mt-2">
                No tailpipe emissions. Uses India grid average of 0.71 kg CO₂e/kWh.
                Regional grids vary. Battery manufacturing emissions not included.
              </p>
            </div>

            <div className="bg-oat/50 rounded-lg p-4 border border-sage/20">
              <h3 className="font-medium text-bark mb-2">Public Transport (Bus & Train)</h3>
              <p className="font-mono text-sm text-olive bg-parchment px-3 py-2 rounded">
                CO₂e (kg) = Distance (km) × Passenger-km emission factor
              </p>
              <p className="text-sm text-warm-gray mt-2">
                These are per-passenger estimates using published passenger-kilometer factors.
                They reflect average occupancy, not actual occupancy for any specific departure.
                Bus: 0.027 kg CO₂e/pax-km. Train: 0.0064 kg CO₂e/pax-km.
              </p>
            </div>

            <div className="bg-oat/50 rounded-lg p-4 border border-sage/20">
              <h3 className="font-medium text-bark mb-2">Environmental Savings</h3>
              <p className="font-mono text-sm text-olive bg-parchment px-3 py-2 rounded">
                Emissions saved = Baseline emissions − Selected option emissions
              </p>
              <p className="text-sm text-warm-gray mt-2">
                Percentage reduction shown only when baseline is greater than 0. Negative savings are
                reported as increases. Default baseline: petrol car with selected occupancy.
              </p>
            </div>
          </div>
        </section>

        {/* Routing */}
        <section className="mb-10">
          <h2 className="font-serif text-xl text-bark mb-4">Routing & Geographic Data</h2>
          <div className="space-y-3 text-sm text-warm-gray leading-relaxed">
            <p>
              <strong className="text-bark">Geocoding:</strong> Nominatim (OpenStreetMap).
              Searches are restricted to India and return disambiguated results with state
              and district information. Requests are debounced at 350ms.
            </p>
            <p>
              <strong className="text-bark">Routing:</strong> Project OSRM
              (router.project-osrm.org). Road modes (car, motorcycle, bus) share a single
              driving-profile route. Walking uses the OSRM foot profile. Cycling uses the
              cycling profile. Route alternatives are requested when available.
            </p>
            <p>
              <strong className="text-bark">Train approximation:</strong> No free rail routing
              API covers India. Train distance is estimated as straight-line × 1.2 and is
              clearly labeled as an approximation. Actual rail routes may differ significantly.
            </p>
            <p>
              <strong className="text-bark">Maps:</strong> Leaflet with OpenStreetMap tiles.
              Attribution is displayed on every map.
            </p>
          </div>
        </section>

        {/* Limitations */}
        <section className="mb-10">
          <h2 className="font-serif text-xl text-bark mb-4">Known Limitations</h2>
          <ul className="space-y-2 text-sm text-warm-gray">
            <li className="flex items-start gap-2"><span className="text-terracotta mt-0.5">!</span> Emission factors are national averages — actual results vary by vehicle, terrain, traffic, and driving style.</li>
            <li className="flex items-start gap-2"><span className="text-terracotta mt-0.5">!</span> Fuel consumption defaults are ARAI typical values, not specific vehicle specifications.</li>
            <li className="flex items-start gap-2"><span className="text-terracotta mt-0.5">!</span> India's grid emission factor varies by region and time of day; 0.71 kg CO₂e/kWh is a national average.</li>
            <li className="flex items-start gap-2"><span className="text-terracotta mt-0.5">!</span> Bus and train factors assume average occupancy, not actual departure-level data.</li>
            <li className="flex items-start gap-2"><span className="text-terracotta mt-0.5">!</span> Train distances are approximations — no rail routing API is used.</li>
            <li className="flex items-start gap-2"><span className="text-terracotta mt-0.5">!</span> This tool does not retrieve live transit schedules, fares, or seat availability.</li>
            <li className="flex items-start gap-2"><span className="text-terracotta mt-0.5">!</span> Battery manufacturing and fuel lifecycle emissions are not included.</li>
            <li className="flex items-start gap-2"><span className="text-terracotta mt-0.5">!</span> OSRM uses OpenStreetMap data, which may have gaps in rural areas.</li>
          </ul>
        </section>

        {/* Privacy */}
        <section>
          <h2 className="font-serif text-xl text-bark mb-4">Privacy & Data Storage</h2>
          <div className="space-y-2 text-sm text-warm-gray leading-relaxed">
            <p>Saved journeys are stored in your browser's local storage — not on a server, and not tied to an account.</p>
            <p>TERRA does not collect precise location data unless you explicitly search for a location.</p>
            <p>No tracking, no cookies, no analytics. Your searches go directly to Nominatim and OSRM.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
