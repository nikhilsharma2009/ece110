import { LeafAndCompass, SmallLeaf } from '@/components/Decorations';

export function Footer() {
  return (
    <footer className="bg-bark text-parchment mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <LeafAndCompass size={20} />
              <span className="font-serif text-lg text-parchment">TERRA</span>
            </div>
            <p className="text-sm text-parchment/60 leading-relaxed max-w-xs">
              An environmental decision-making tool for choosing greener travel across India.
              Every estimate is transparent, every source is documented.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif text-sm text-parchment/80">Data & Attribution</h4>
            <ul className="space-y-1.5 text-xs text-parchment/50 leading-relaxed">
              <li>Geocoding: OpenStreetMap / Nominatim</li>
              <li>Routing: Project OSRM</li>
              <li>Maps: OpenStreetMap contributors</li>
              <li>Emission factors: IPCC, CEA India, UK BEIS, ARAI</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif text-sm text-parchment/80">About the Data</h4>
            <p className="text-xs text-parchment/50 leading-relaxed">
              All emissions and fuel figures are modeled estimates based on published
              factors. Actual results will vary by vehicle, driving conditions, and
              occupancy. This tool does not retrieve live transit schedules or real-time
              availability.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-parchment/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-parchment/40">
            <SmallLeaf size={12} className="text-sage" />
            <span>Travel lightly. Leave less.</span>
          </div>
          <p className="text-xs text-parchment/30">
            © {new Date().getFullYear()} TERRA. Open data, open methodology.
          </p>
        </div>
      </div>
    </footer>
  );
}
