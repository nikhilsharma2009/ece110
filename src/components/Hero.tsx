import { TopographicLines, ContourPattern, FlowingPath, BotanicalBranch, LeafIcon } from '@/components/Decorations';

export function Hero() {
  return (
    <div className="relative overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 topo-pattern opacity-60" />
      <ContourPattern className="absolute inset-0 w-full h-full opacity-50" />

      {/* Botanical decorations */}
      <BotanicalBranch className="absolute right-0 top-0 h-64 w-32 hidden md:block opacity-60" />
      <BotanicalBranch className="absolute left-0 bottom-0 h-48 w-24 hidden md:block opacity-40 transform scale-x-[-1]" />

      {/* Flowing path line */}
      <FlowingPath className="absolute top-1/2 left-0 w-full h-24 opacity-40" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-3xl">
          {/* Tagline */}
          <div className="flex items-center gap-2 mb-6 animate-fade-in">
            <LeafIcon size={18} className="text-olive" />
            <span className="text-xs font-mono uppercase tracking-widest text-olive">
              Eco-Route Planner for India
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-bark leading-[1.1] mb-6 animate-slide-up">
            Every journey leaves a footprint.
            <br />
            <span className="text-olive italic">Choose yours.</span>
          </h1>

          {/* Supporting text */}
          <p className="text-base sm:text-lg text-warm-gray leading-relaxed max-w-2xl mb-8 animate-slide-up">
            Compare routes, travel modes, fuel consumption, and estimated carbon emissions
            before you set off. Powered by real geographic data and transparent calculations.
          </p>

          {/* Topographic accent */}
          <div className="hidden lg:block absolute right-8 top-12 opacity-30">
            <TopographicLines className="w-72 h-54" />
          </div>
        </div>
      </div>
    </div>
  );
}
