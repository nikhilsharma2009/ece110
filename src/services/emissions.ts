import type {
  TransportMode,
  EmissionResult,
  CostResult,
  AssumptionSet,
  RouteOption,
} from '@/types';

// Calculate emissions for a given transport mode, distance, passengers, and assumptions
// All formulas are transparent and documented in the methodology

export function calculateEmissions(
  mode: TransportMode,
  route: RouteOption,
  passengers: number,
  assumptions: AssumptionSet
): EmissionResult {
  if (!route.available || route.distance == null) {
    return {
      totalEmissions: null,
      perPassengerEmissions: null,
      energyConsumed: null,
      energyUnit: '—',
      fuelType: '',
      isPerPassenger: false,
      dataConfidence: 'unavailable',
      notes: ['Route data unavailable for this mode.'],
    };
  }

  const distanceKm = route.distance / 1000;
  const notes: string[] = [];

  switch (mode) {
    case 'petrol-car': {
      const fuelL = (distanceKm * assumptions.petrolConsumption) / 100;
      const totalEmissions = fuelL * assumptions.petrolEmissionFactor;
      const perPassenger = totalEmissions / Math.max(1, passengers);
      notes.push(`Fuel rate: ${assumptions.petrolConsumption} L/100km (default, editable).`);
      notes.push(`Emission factor: ${assumptions.petrolEmissionFactor} kg CO₂/L.`);
      notes.push(`Emissions split across ${Math.max(1, passengers)} passenger(s).`);
      return {
        totalEmissions,
        perPassengerEmissions: perPassenger,
        energyConsumed: fuelL,
        energyUnit: 'L',
        fuelType: 'Petrol',
        isPerPassenger: false,
        dataConfidence: 'high',
        notes,
      };
    }

    case 'diesel-car': {
      const fuelL = (distanceKm * assumptions.dieselConsumption) / 100;
      const totalEmissions = fuelL * assumptions.dieselEmissionFactor;
      const perPassenger = totalEmissions / Math.max(1, passengers);
      notes.push(`Fuel rate: ${assumptions.dieselConsumption} L/100km (default, editable).`);
      notes.push(`Emission factor: ${assumptions.dieselEmissionFactor} kg CO₂/L.`);
      notes.push(`Emissions split across ${Math.max(1, passengers)} passenger(s).`);
      return {
        totalEmissions,
        perPassengerEmissions: perPassenger,
        energyConsumed: fuelL,
        energyUnit: 'L',
        fuelType: 'Diesel',
        isPerPassenger: false,
        dataConfidence: 'high',
        notes,
      };
    }

    case 'electric-car': {
      const energyKwh = (distanceKm * assumptions.evConsumption) / 100;
      const totalEmissions = energyKwh * assumptions.electricityEmissionFactor;
      const perPassenger = totalEmissions / Math.max(1, passengers);
      notes.push(`Energy rate: ${assumptions.evConsumption} kWh/100km (default, editable).`);
      notes.push(`Grid emission factor: ${assumptions.electricityEmissionFactor} kg CO₂e/kWh (India avg).`);
      notes.push(`No tailpipe emissions — electricity-related emissions only.`);
      notes.push(`Emissions split across ${Math.max(1, passengers)} passenger(s).`);
      return {
        totalEmissions,
        perPassengerEmissions: perPassenger,
        energyConsumed: energyKwh,
        energyUnit: 'kWh',
        fuelType: 'Electricity',
        isPerPassenger: false,
        dataConfidence: 'medium',
        notes,
      };
    }

    case 'motorcycle': {
      const fuelL = (distanceKm * assumptions.motorcycleConsumption) / 100;
      const totalEmissions = fuelL * assumptions.motorcycleEmissionFactor;
      notes.push(`Fuel rate: ${assumptions.motorcycleConsumption} L/100km (default, editable).`);
      notes.push(`Emission factor: ${assumptions.motorcycleEmissionFactor} kg CO₂/L.`);
      notes.push(`Per-passenger = total (single rider assumed).`);
      return {
        totalEmissions,
        perPassengerEmissions: totalEmissions,
        energyConsumed: fuelL,
        energyUnit: 'L',
        fuelType: 'Petrol',
        isPerPassenger: false,
        dataConfidence: 'high',
        notes,
      };
    }

    case 'bus': {
      const totalEmissions = distanceKm * assumptions.busEmissionFactor;
      notes.push(`Emission factor: ${assumptions.busEmissionFactor} kg CO₂e/passenger-km.`);
      notes.push(`Per-passenger estimate — does not reflect actual occupancy for this trip.`);
      notes.push(`Total vehicle emissions are not shown; this is per-passenger only.`);
      return {
        totalEmissions,
        perPassengerEmissions: totalEmissions,
        energyConsumed: null,
        energyUnit: '—',
        fuelType: 'Diesel',
        isPerPassenger: true,
        dataConfidence: 'medium',
        notes,
      };
    }

    case 'train': {
      const totalEmissions = distanceKm * assumptions.trainEmissionFactor;
      notes.push(`Emission factor: ${assumptions.trainEmissionFactor} kg CO₂e/passenger-km.`);
      notes.push(`Per-passenger estimate based on Indian Railways average.`);
      notes.push(`Actual train schedules and availability have not been checked.`);
      if (route.isApproximation) {
        notes.push(`Distance is a straight-line approximation — actual rail route may differ.`);
      }
      return {
        totalEmissions,
        perPassengerEmissions: totalEmissions,
        energyConsumed: null,
        energyUnit: '—',
        fuelType: 'Electricity/Diesel',
        isPerPassenger: true,
        dataConfidence: 'medium',
        notes,
      };
    }

    case 'walking': {
      return {
        totalEmissions: 0,
        perPassengerEmissions: 0,
        energyConsumed: null,
        energyUnit: '—',
        fuelType: 'None',
        isPerPassenger: false,
        dataConfidence: 'high',
        notes: ['Zero operational emissions.'],
      };
    }

    case 'cycling': {
      return {
        totalEmissions: 0,
        perPassengerEmissions: 0,
        energyConsumed: null,
        energyUnit: '—',
        fuelType: 'None',
        isPerPassenger: false,
        dataConfidence: 'high',
        notes: ['Zero operational emissions.'],
      };
    }

    default:
      return {
        totalEmissions: null,
        perPassengerEmissions: null,
        energyConsumed: null,
        energyUnit: '—',
        fuelType: '',
        isPerPassenger: false,
        dataConfidence: 'unavailable',
        notes: ['Unknown transport mode.'],
      };
  }
}

export function calculateCost(
  mode: TransportMode,
  route: RouteOption,
  passengers: number,
  assumptions: AssumptionSet
): CostResult {
  if (!route.available || route.distance == null) {
    return { amount: null, currency: 'INR', notes: ['Route unavailable.'] };
  }

  const distanceKm = route.distance / 1000;
  const notes: string[] = [];

  switch (mode) {
    case 'petrol-car': {
      const fuelL = (distanceKm * assumptions.petrolConsumption) / 100;
      const cost = fuelL * assumptions.petrolPrice;
      notes.push(`Fuel price: ₹${assumptions.petrolPrice}/L (editable).`);
      notes.push(`Total fuel cost for the vehicle (all passengers).`);
      return { amount: cost, currency: 'INR', notes };
    }

    case 'diesel-car': {
      const fuelL = (distanceKm * assumptions.dieselConsumption) / 100;
      const cost = fuelL * assumptions.dieselPrice;
      notes.push(`Fuel price: ₹${assumptions.dieselPrice}/L (editable).`);
      notes.push(`Total fuel cost for the vehicle (all passengers).`);
      return { amount: cost, currency: 'INR', notes };
    }

    case 'electric-car': {
      const kwh = (distanceKm * assumptions.evConsumption) / 100;
      const cost = kwh * assumptions.electricityPrice;
      notes.push(`Electricity price: ₹${assumptions.electricityPrice}/kWh (editable).`);
      notes.push(`Total charging cost for the vehicle (all passengers).`);
      return { amount: cost, currency: 'INR', notes };
    }

    case 'motorcycle': {
      const fuelL = (distanceKm * assumptions.motorcycleConsumption) / 100;
      const cost = fuelL * assumptions.petrolPrice;
      notes.push(`Fuel price: ₹${assumptions.petrolPrice}/L (editable).`);
      return { amount: cost, currency: 'INR', notes };
    }

    case 'bus': {
      // Rough bus fare estimate: ~₹1.5/km for intercity bus in India
      const cost = distanceKm * 1.5 * passengers;
      notes.push(`Rough fare estimate: ~₹1.5/km per passenger (indicative only).`);
      notes.push(`Actual fares vary by service type and operator.`);
      return { amount: cost, currency: 'INR', notes };
    }

    case 'train': {
      // Rough train fare estimate: ~₹0.5/km per passenger (sleeper class approx)
      const cost = distanceKm * 0.5 * passengers;
      notes.push(`Rough fare estimate: ~₹0.5/km per passenger (sleeper class, indicative only).`);
      notes.push(`Actual fares vary by class and train type.`);
      return { amount: cost, currency: 'INR', notes };
    }

    case 'walking':
    case 'cycling':
      return { amount: 0, currency: 'INR', notes: ['No fuel or fare cost.'] };

    default:
      return { amount: null, currency: 'INR', notes: ['Cost not available.'] };
  }
}

export function formatEmissions(kg: number | null): string {
  if (kg == null) return 'Not available';
  if (kg === 0) return '0 kg';
  if (kg < 0.01) return '<0.01 kg';
  return `${kg.toFixed(2)} kg CO₂e`;
}

export function formatEnergy(value: number | null, unit: string): string {
  if (value == null) return 'Not available';
  return `${value.toFixed(1)} ${unit}`;
}

export function formatDistance(meters: number | null): string {
  if (meters == null) return 'Not available';
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

export function formatDuration(seconds: number | null): string {
  if (seconds == null) return 'Not available';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  if (hours === 0) return `${mins} min`;
  return `${hours}h ${mins}m`;
}

export function formatCost(amount: number | null): string {
  if (amount == null) return 'Not available';
  if (amount === 0) return '₹0';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}
