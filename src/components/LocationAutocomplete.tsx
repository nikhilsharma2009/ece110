import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import type { GeoLocation } from '@/types';
import { searchLocations } from '@/services/geocoding';

interface LocationAutocompleteProps {
  label: string;
  value: GeoLocation | null;
  onSelect: (location: GeoLocation | null) => void;
  placeholder?: string;
  id: string;
}

export function LocationAutocomplete({
  label,
  value,
  onSelect,
  placeholder,
  id,
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value?.displayName || '');
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update display when value changes externally
  useEffect(() => {
    if (!isOpen) {
      setQuery(value ? value.displayName : '');
    }
  }, [value, isOpen]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const doSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setHighlightedIndex(-1);
      setError(null);
      return;
    }

    // Cancel previous request
    if (abortRef.current) abortRef.current.abort();

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);

    try {
      const locations = await searchLocations(searchQuery, controller.signal);
      setResults(locations);
      setHighlightedIndex(locations.length > 0 ? 0 : -1);
      if (locations.length === 0) {
        setError('No locations found. Try a different spelling or add a state name.');
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
        setResults([]);
        setHighlightedIndex(-1);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);

    // Clear any previously selected location when the user edits the text
    onSelect(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 350);
  };

  const handleSelect = (location: GeoLocation) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    onSelect(location);
    setQuery(location.displayName);
    setIsOpen(false);
    setResults([]);
    setHighlightedIndex(-1);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'ArrowDown' && query.trim().length >= 2) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && results[highlightedIndex]) {
        e.preventDefault();
        e.stopPropagation();
        handleSelect(results[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // If focus moved within container, don't close
    if (containerRef.current && e.relatedTarget && containerRef.current.contains(e.relatedTarget as Node)) {
      return;
    }
    // Delay closing slightly to allow any pending interactions
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    blurTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    if (results.length > 0) {
      setIsOpen(true);
    } else if (query.trim().length >= 2 && !value) {
      doSearch(query);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${isOpen ? 'z-40' : 'z-10'}`}>
      <label htmlFor={id} className="block text-xs font-medium text-warm-gray mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <MapPin
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-sage pointer-events-none"
        />
        <input
          id={id}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder || 'Search for a city, district, or state...'}
          className="w-full pl-9 pr-9 py-2.5 bg-parchment border border-sage/40 rounded-lg text-sm text-bark placeholder:text-warm-gray/50 focus:border-olive focus:ring-1 focus:ring-olive/30 transition-colors"
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={`${id}-listbox`}
          aria-autocomplete="list"
        />
        {loading && (
          <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-sage animate-spin" />
        )}
      </div>

      {isOpen && (results.length > 0 || error) && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-50 mt-1 w-full bg-parchment border border-sage/40 rounded-lg shadow-lg max-h-64 overflow-y-auto animate-fade-in"
        >
          {error && results.length === 0 && (
            <li className="px-3 py-3 text-sm text-terracotta flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </li>
          )}
          {results.map((loc, index) => (
            <li
              key={`${loc.lat}-${loc.lon}-${index}`}
              role="option"
              aria-selected={index === highlightedIndex}
            >
              <button
                type="button"
                onMouseDown={(e) => {
                  // Prevent input from losing focus before selection is recorded
                  e.preventDefault();
                  handleSelect(loc);
                }}
                onClick={() => handleSelect(loc)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-start gap-2 ${
                  index === highlightedIndex ? 'bg-moss/40 text-olive' : 'text-bark hover:bg-oat/50'
                }`}
              >
                <MapPin size={14} className="mt-0.5 flex-shrink-0 text-sage" />
                <div className="min-w-0">
                  <div className="font-medium truncate">{loc.name}</div>
                  <div className="text-xs text-warm-gray truncate">{loc.displayName}</div>
                  <div className="text-[10px] text-warm-gray/60 mt-0.5 font-mono">
                    {loc.lat.toFixed(4)}, {loc.lon.toFixed(4)}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
