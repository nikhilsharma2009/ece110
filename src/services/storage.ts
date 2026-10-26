import type { SavedJourney } from '@/types';

const STORAGE_KEY = 'terra_saved_journeys';
const MAX_SAVED = 50;

export function getSavedJourneys(): SavedJourney[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveJourney(journey: SavedJourney): void {
  const existing = getSavedJourneys().filter((j) => j.id !== journey.id);
  existing.unshift(journey);
  // Cap at MAX_SAVED
  const capped = existing.slice(0, MAX_SAVED);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
  } catch {
    // Storage might be full; try saving fewer
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(capped.slice(0, 10)));
    } catch {
      // give up silently
    }
  }
}

export function deleteJourney(id: string): void {
  const existing = getSavedJourneys().filter((j) => j.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function generateJourneyId(): string {
  return `journey_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
