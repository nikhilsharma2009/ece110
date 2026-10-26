// Core domain types for TERRA

export interface GeoLocation {
  name: string;
  displayName: string;
  state: string;
  district?: string;
  lat: number;
  lon: number;
  type: 'state' | 'district' | 'city' | 'town' | 'village' | 'landmark';
}

export interface RouteGeometry {
  coordinates: [number, number][];
  distance: number; // meters
  duration: number; // seconds
}

export type TransportMode =
  | 'petrol-car'
  | 'diesel-car'
  | 'electric-car'
  | 'motorcycle'
  | 'bus'
  | 'train'
  | 'walking'
  | 'cycling';

export interface RouteOption {
  mode: TransportMode;
  routeGeometry: RouteGeometry | null;
  distance: number | null; // meters
  duration: number | null; // seconds
  available: boolean;
  unavailableReason?: string;
  isApproximation?: boolean;
  approximationLabel?: string;
}

export interface EmissionResult {
  totalEmissions: number | null; // kg CO2e
  perPassengerEmissions: number | null; // kg CO2e per passenger
  energyConsumed: number | null; // L fuel or kWh electricity
  energyUnit: 'L' | 'kWh' | '—';
  fuelType: string;
  isPerPassenger: boolean;
  dataConfidence: 'high' | 'medium' | 'low' | 'unavailable';
  notes: string[];
}

export interface CostResult {
  amount: number | null;
  currency: string;
  notes: string[];
}

export interface TransportComparison {
  mode: TransportMode;
  route: RouteOption;
  emissions: EmissionResult;
  cost: CostResult;
  distance: number | null;
  duration: number | null;
  passengers: number;
}

export interface JourneySearch {
  origin: GeoLocation;
  destination: GeoLocation;
  date?: string;
  passengers: number;
  preferredModes: TransportMode[];
}

export interface SavedJourney {
  id: string;
  search: JourneySearch;
  comparisons: TransportComparison[];
  selectedMode: TransportMode;
  baselineMode: TransportMode;
  assumptions: AssumptionSet;
  timestamp: number;
}

export interface AssumptionSet {
  petrolConsumption: number; // L/100km
  dieselConsumption: number; // L/100km
  evConsumption: number; // kWh/100km
  motorcycleConsumption: number; // L/100km
  petrolPrice: number; // INR/L
  dieselPrice: number; // INR/L
  electricityPrice: number; // INR/kWh
  petrolEmissionFactor: number; // kg CO2/L
  dieselEmissionFactor: number; // kg CO2/L
  electricityEmissionFactor: number; // kg CO2e/kWh (India grid average)
  busEmissionFactor: number; // kg CO2e per passenger-km
  trainEmissionFactor: number; // kg CO2e per passenger-km
  carOccupancy: number;
  busOccupancy: number;
  trainOccupancy: number;
  motorcycleEmissionFactor: number; // kg CO2/L (same as petrol)
}

export type View = 'home' | 'results' | 'methodology' | 'saved';

export type SortKey = 'emissions' | 'distance' | 'duration' | 'cost' | 'energy';

export type PriorityKey = 'emissions' | 'time' | 'cost' | 'compromise';
