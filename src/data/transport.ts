import type { TransportMode } from '@/types';

export interface ModeMetadata {
  mode: TransportMode;
  label: string;
  shortLabel: string;
  icon: string; // lucide icon name
  color: string;
  roadBased: boolean;
  needsRouting: boolean;
}

export const MODE_METADATA: Record<TransportMode, ModeMetadata> = {
  'petrol-car': {
    mode: 'petrol-car',
    label: 'Petrol Car',
    shortLabel: 'Petrol',
    icon: 'Car',
    color: '#C78668',
    roadBased: true,
    needsRouting: true,
  },
  'diesel-car': {
    mode: 'diesel-car',
    label: 'Diesel Car',
    shortLabel: 'Diesel',
    icon: 'Car',
    color: '#B07A5E',
    roadBased: true,
    needsRouting: true,
  },
  'electric-car': {
    mode: 'electric-car',
    label: 'Electric Car',
    shortLabel: 'EV',
    icon: 'Zap',
    color: '#B8CBD0',
    roadBased: true,
    needsRouting: true,
  },
  motorcycle: {
    mode: 'motorcycle',
    label: 'Motorcycle',
    shortLabel: 'Bike',
    icon: 'Bike',
    color: '#D9AD91',
    roadBased: true,
    needsRouting: true,
  },
  bus: {
    mode: 'bus',
    label: 'Bus',
    shortLabel: 'Bus',
    icon: 'Bus',
    color: '#A8B5A0',
    roadBased: true,
    needsRouting: true,
  },
  train: {
    mode: 'train',
    label: 'Train',
    shortLabel: 'Train',
    icon: 'TrainFront',
    color: '#52634A',
    roadBased: false,
    needsRouting: false,
  },
  walking: {
    mode: 'walking',
    label: 'Walking',
    shortLabel: 'Walk',
    icon: 'Footprints',
    color: '#C5D0B8',
    roadBased: false,
    needsRouting: true,
  },
  cycling: {
    mode: 'cycling',
    label: 'Cycling',
    shortLabel: 'Cycle',
    icon: 'Bike',
    color: '#E7D9A5',
    roadBased: false,
    needsRouting: true,
  },
};

export const ALL_MODES: TransportMode[] = [
  'petrol-car',
  'diesel-car',
  'electric-car',
  'motorcycle',
  'bus',
  'train',
  'walking',
  'cycling',
];

// Default assumptions from published sources
// Sources documented in methodology

export const DEFAULT_ASSUMPTIONS = {
  // Vehicle fuel consumption (L/100km) — based on ICCT / ARAI typical values
  petrolConsumption: 7.5,
  dieselConsumption: 6.0,
  evConsumption: 15.0, // kWh/100km
  motorcycleConsumption: 2.5,

  // Fuel prices in India (approximate 2024, INR)
  petrolPrice: 105,
  dieselPrice: 92,
  electricityPrice: 8, // INR/kWh

  // Emission factors
  petrolEmissionFactor: 2.31, // kg CO2/L (IPCC)
  dieselEmissionFactor: 2.68, // kg CO2/L (IPCC)
  electricityEmissionFactor: 0.71, // kg CO2e/kWh (India grid avg, CEA 2023)
  busEmissionFactor: 0.027, // kg CO2e per passenger-km (UK BEIS / Indian approx)
  trainEmissionFactor: 0.0064, // kg CO2e per passenger-km (Indian Railways approx)

  // Occupancy assumptions
  carOccupancy: 2,
  busOccupancy: 30,
  trainOccupancy: 500,

  motorcycleEmissionFactor: 2.31, // same as petrol
};

export const DATA_SOURCES = {
  petrolEmissionFactor: {
    value: 2.31,
    unit: 'kg CO₂/L',
    source: 'IPCC Guidelines for National Greenhouse Gas Inventories (2006)',
    url: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/',
    lastUpdated: '2024-01-15',
  },
  dieselEmissionFactor: {
    value: 2.68,
    unit: 'kg CO₂/L',
    source: 'IPCC Guidelines for National Greenhouse Gas Inventories (2006)',
    url: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/',
    lastUpdated: '2024-01-15',
  },
  electricityEmissionFactor: {
    value: 0.71,
    unit: 'kg CO₂e/kWh',
    source: 'Central Electricity Authority, India — CO2 Baseline Database',
    url: 'https://cea.nic.in/co2-baseline-database/',
    lastUpdated: '2024-01-15',
  },
  busEmissionFactor: {
    value: 0.027,
    unit: 'kg CO₂e/passenger-km',
    source: 'UK BEIS Greenhouse Gas Reporting Factors (converted for Indian conditions)',
    url: 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023',
    lastUpdated: '2024-01-15',
  },
  trainEmissionFactor: {
    value: 0.0064,
    unit: 'kg CO₂e/passenger-km',
    source: 'Indian Railways Sustainability Reports (approximate)',
    url: 'https://indianrailways.gov.in/',
    lastUpdated: '2024-01-15',
  },
  petrolConsumption: {
    value: 7.5,
    unit: 'L/100km',
    source: 'ARAI typical petrol car fuel efficiency ratings',
    url: 'https://www.araiindia.com/',
    lastUpdated: '2024-01-15',
  },
  dieselConsumption: {
    value: 6.0,
    unit: 'L/100km',
    source: 'ARAI typical diesel car fuel efficiency ratings',
    url: 'https://www.araiindia.com/',
    lastUpdated: '2024-01-15',
  },
  evConsumption: {
    value: 15.0,
    unit: 'kWh/100km',
    source: 'ICCT India EV efficiency estimates',
    url: 'https://theicct.org/',
    lastUpdated: '2024-01-15',
  },
  motorcycleConsumption: {
    value: 2.5,
    unit: 'L/100km',
    source: 'ARAI typical motorcycle fuel efficiency ratings',
    url: 'https://www.araiindia.com/',
    lastUpdated: '2024-01-15',
  },
  petrolPrice: {
    value: 105,
    unit: 'INR/L',
    source: 'PPAC India fuel price monitoring (approximate national average)',
    url: 'https://www.ppac.gov.in/',
    lastUpdated: '2024-01-15',
  },
  dieselPrice: {
    value: 92,
    unit: 'INR/L',
    source: 'PPAC India fuel price monitoring (approximate national average)',
    url: 'https://www.ppac.gov.in/',
    lastUpdated: '2024-01-15',
  },
  electricityPrice: {
    value: 8,
    unit: 'INR/kWh',
    source: 'Average Indian domestic electricity tariff (approximate)',
    url: 'https://www.powermin.gov.in/',
    lastUpdated: '2024-01-15',
  },
};

export const EXAMPLE_JOURNEYS = [
  { label: 'Lucknow → Kanpur', origin: 'Lucknow, Uttar Pradesh', destination: 'Kanpur, Uttar Pradesh' },
  { label: 'Jaipur → Udaipur', origin: 'Jaipur, Rajasthan', destination: 'Udaipur, Rajasthan' },
  { label: 'Mumbai → Pune', origin: 'Mumbai, Maharashtra', destination: 'Pune, Maharashtra' },
  { label: 'Delhi → Dehradun', origin: 'Delhi', destination: 'Dehradun, Uttarakhand' },
  { label: 'Bengaluru → Chennai', origin: 'Bengaluru, Karnataka', destination: 'Chennai, Tamil Nadu' },
];
