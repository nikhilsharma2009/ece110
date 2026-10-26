import { useState, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { MethodologyDrawer } from '@/components/MethodologyDrawer';
import { HomePage } from '@/pages/HomePage';
import { ResultsPage } from '@/pages/ResultsPage';
import { MethodologyPage } from '@/pages/MethodologyPage';
import { SavedJourneysPage } from '@/pages/SavedJourneysPage';
import type {
  View, GeoLocation, TransportMode, TransportComparison,
  AssumptionSet, SavedJourney,
} from '@/types';
import { DEFAULT_ASSUMPTIONS } from '@/data/transport';
import { routeAllModes } from '@/services/comparison';

function App() {
  const [view, setView] = useState<View>('home');
  const [loading, setLoading] = useState(false);
  const [comparisons, setComparisons] = useState<TransportComparison[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchOrigin, setSearchOrigin] = useState<GeoLocation | null>(null);
  const [searchDestination, setSearchDestination] = useState<GeoLocation | null>(null);
  const [searchPassengers, setSearchPassengers] = useState(2);
  const [assumptions, setAssumptions] = useState<AssumptionSet>({ ...DEFAULT_ASSUMPTIONS });
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [methodologyTopic, setMethodologyTopic] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(
    async (
      origin: GeoLocation,
      destination: GeoLocation,
      passengers: number,
      modes: TransportMode[]
    ) => {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const results = await routeAllModes(
          origin,
          destination,
          modes,
          passengers,
          assumptions
        );
        setComparisons(results);
        setSearchOrigin(origin);
        setSearchDestination(destination);
        setSearchPassengers(passengers);
        setView('results');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong while routing.';
        setError(message);
        setComparisons(null);
      } finally {
        setLoading(false);
      }
    },
    [assumptions]
  );

  const handleNavigate = (newView: View) => {
    if (newView === 'results' && (!comparisons || !searchOrigin || !searchDestination)) {
      setView('home');
      return;
    }
    setView(newView);
  };

  const handleOpenMethodology = (topic: string) => {
    setMethodologyTopic(topic);
    setMethodologyOpen(true);
  };

  const handleLoadJourney = (journey: SavedJourney) => {
    setComparisons(journey.comparisons);
    setSearchOrigin(journey.search.origin);
    setSearchDestination(journey.search.destination);
    setSearchPassengers(journey.search.passengers);
    setAssumptions(journey.assumptions);
    setHasSearched(true);
    setView('results');
  };

  return (
    <div className="min-h-screen flex flex-col bg-parchment">
      <Navigation currentView={view} onNavigate={handleNavigate} />

      <main className="flex-1">
        {view === 'home' && (
          <HomePage
            onSearch={handleSearch}
            loading={loading}
            comparisons={comparisons}
            hasSearched={hasSearched}
            initialOrigin={searchOrigin}
            initialDestination={searchDestination}
            initialPassengers={searchPassengers}
          />
        )}

        {view === 'results' && searchOrigin && searchDestination && comparisons && (
          <ResultsPage
            origin={searchOrigin}
            destination={searchDestination}
            comparisons={comparisons}
            passengers={searchPassengers}
            assumptions={assumptions}
            onAssumptionsChange={setAssumptions}
            onPassengersChange={setSearchPassengers}
            onBack={() => setView('home')}
            onOpenMethodology={handleOpenMethodology}
          />
        )}

        {view === 'results' && (!comparisons || !searchOrigin || !searchDestination) && (
          <div className="max-w-2xl mx-auto px-4 py-20 text-center">
            <p className="text-warm-gray text-sm mb-4">
              No journey to compare yet. Search for a route first.
            </p>
            <button
              onClick={() => setView('home')}
              className="text-sm text-olive hover:text-olive-dark font-medium"
            >
              Plan a journey →
            </button>
          </div>
        )}

        {view === 'methodology' && <MethodologyPage />}

        {view === 'saved' && (
          <SavedJourneysPage
            onLoadJourney={handleLoadJourney}
            onNavigate={handleNavigate}
          />
        )}

        {/* Error banner */}
        {error && view === 'home' && (
          <div className="max-w-2xl mx-auto px-4 pb-4">
            <div className="bg-terracotta/15 border border-terracotta/40 rounded-xl p-4">
              <p className="text-sm text-terracotta">
                {error} Please try again in a moment, or try different locations.
              </p>
              <button
                onClick={() => setError(null)}
                className="text-xs text-terracotta mt-2 hover:underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <MethodologyDrawer
        open={methodologyOpen}
        onClose={() => setMethodologyOpen(false)}
        topic={methodologyTopic}
      />
    </div>
  );
}

export default App;
