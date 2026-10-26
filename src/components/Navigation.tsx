import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { LeafAndCompass } from '@/components/Decorations';
import type { View } from '@/types';

interface NavigationProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const NAV_ITEMS: { label: string; view: View }[] = [
  { label: 'Plan a Journey', view: 'home' },
  { label: 'Compare Routes', view: 'results' },
  { label: 'Our Methodology', view: 'methodology' },
  { label: 'Saved Journeys', view: 'saved' },
];

export function Navigation({ currentView, onNavigate }: NavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleClick = (view: View) => {
    onNavigate(view);
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-parchment/95 backdrop-blur-sm border-b border-sage/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleClick('home')}
            className="flex items-center gap-3 group"
            aria-label="TERRA home"
          >
            <LeafAndCompass size={24} />
            <span className="font-serif text-xl tracking-wide text-bark group-hover:text-olive transition-colors">
              TERRA
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.view}
                onClick={() => handleClick(item.view)}
                className={`text-sm font-medium transition-colors ${
                  currentView === item.view
                    ? 'text-olive border-b border-olive pb-1'
                    : 'text-warm-gray hover:text-olive'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-bark"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col gap-3">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.view}
                  onClick={() => handleClick(item.view)}
                  className={`text-left text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                    currentView === item.view
                      ? 'bg-moss/40 text-olive'
                      : 'text-warm-gray hover:bg-oat/60'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
