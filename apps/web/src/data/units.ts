import type { UnitDefinition, UnitId } from '../types';

export const UNITS: readonly UnitDefinition[] = [
  { id: 'celsius', name: 'Celsius', symbol: '°C', description: 'Metric scale anchored to water freezing and boiling points.' },
  { id: 'fahrenheit', name: 'Fahrenheit', symbol: '°F', description: 'Common everyday scale in the United States.' },
  { id: 'kelvin', name: 'Kelvin', symbol: 'K', description: 'SI thermodynamic temperature scale beginning at absolute zero.' },
  { id: 'rankine', name: 'Rankine', symbol: '°R', description: 'Absolute thermodynamic scale using Fahrenheit-sized degrees.' },
  { id: 'reaumur', name: 'Réaumur', symbol: '°Ré', description: 'Historic scale with water boiling at 80 degrees.' },
  { id: 'delisle', name: 'Delisle', symbol: '°De', description: 'Historic reversed scale that decreases as temperature rises.' },
  { id: 'newton', name: 'Newton', symbol: '°N', description: 'Historic scale proposed by Isaac Newton.' },
  { id: 'romer', name: 'Rømer', symbol: '°Rø', description: 'Historic scale proposed by Ole Rømer.' },
] as const;

export const UNIT_IDS = new Set<UnitId>(UNITS.map((unit) => unit.id));

export const unitById = (id: UnitId): UnitDefinition => {
  const unit = UNITS.find((candidate) => candidate.id === id);
  if (!unit) throw new Error(`Unknown unit: ${id}`);
  return unit;
};
