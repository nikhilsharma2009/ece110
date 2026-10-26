import { useState } from 'react';
import { Bookmark, Trash2, FileText, MapPin, Clock } from 'lucide-react';
import type { SavedJourney, TransportMode, View } from '@/types';
import { getSavedJourneys, deleteJourney } from '@/services/storage';
import { MODE_METADATA } from '@/data/transport';
import { formatEmissions, formatDistance, formatDuration } from '@/services/emissions';

interface SavedJourneysPageProps {
  onLoadJourney: (journey: SavedJourney) => void;
  onNavigate: (view: View) => void;
}

export function SavedJourneysPage({ onLoadJourney, onNavigate }: SavedJourneysPageProps) {
  const [journeys, setJourneys] = useState<SavedJourney[]>(getSavedJourneys());

  const handleDelete = (id: string) => {
    deleteJourney(id);
    setJourneys(getSavedJourneys());
  };

  const handleLoad = (journey: SavedJourney) => {
    onLoadJourney(journey);
  };

  return (
    <div className="min-h-screen bg-parchment paper-texture">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Bookmark size={22} className="text-olive" />
            <span className="text-xs font-mono uppercase tracking-widest text-olive">Journey Notebook</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-bark mb-3">Saved Journeys</h1>
          <p className="text-sm text-warm-gray leading-relaxed">
            Your saved journeys are stored locally in your browser. No account required.
            Click any journey to reload its full comparison.
          </p>
        </div>

        {journeys.length === 0 ? (
          <div className="bg-oat/40 border border-sage/30 rounded-xl p-12 text-center">
            <Bookmark size={40} className="text-sage mx-auto mb-4" />
            <h3 className="font-serif text-lg text-bark mb-2">No saved journeys yet</h3>
            <p className="text-sm text-warm-gray mb-4">
              Search for a route and click "Save Journey" on the results page to keep it here.
            </p>
            <button
              onClick={() => onNavigate('home')}
              className="text-sm text-olive hover:text-olive-dark font-medium"
            >
              Plan a journey →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {journeys.map((journey) => {
              const selectedMeta = MODE_METADATA[journey.selectedMode];
              const selected = journey.comparisons.find((c) => c.mode === journey.selectedMode);

              return (
                <div
                  key={journey.id}
                  className="bg-oat/40 border border-sage/30 rounded-xl p-5 hover:border-sage/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Route */}
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <MapPin size={14} className="text-olive flex-shrink-0" />
                        <span className="text-bark font-medium truncate">
                          {journey.search.origin.name}
                        </span>
                        <span className="text-warm-gray">→</span>
                        <span className="text-bark font-medium truncate">
                          {journey.search.destination.name}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap gap-3 text-xs text-warm-gray">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(journey.timestamp).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                        <span>{journey.search.passengers} travelers</span>
                        <span>Selected: {selectedMeta.label}</span>
                        {selected && (
                          <>
                            <span className="font-mono">
                              {formatEmissions(selected.emissions.perPassengerEmissions)}
                            </span>
                            <span className="font-mono">
                              {formatDistance(selected.distance)}
                            </span>
                            <span className="font-mono">
                              {formatDuration(selected.duration)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleLoad(journey)}
                        className="text-xs px-3 py-1.5 border border-sage/40 rounded-lg text-olive hover:bg-moss/30 transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDelete(journey.id)}
                        className="p-1.5 text-warm-gray hover:text-terracotta transition-colors"
                        aria-label="Delete journey"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
