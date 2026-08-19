import type { UnitId } from '../types';

type WasmModule = {
  default: () => Promise<unknown>;
  convert_temperature: (value: number, from: string, to: string) => number;
  absolute_zero_for: (unit: string) => number;
  engine_version: () => string;
};

export interface TemperatureEngine {
  convert(value: number, from: UnitId, to: UnitId): number;
  absoluteZero(unit: UnitId): number;
  version(): string;
}

let enginePromise: Promise<TemperatureEngine> | undefined;

export const getTemperatureEngine = (): Promise<TemperatureEngine> => {
  enginePromise ??= import('../generated/thermoshift_wasm/thermoshift_wasm.js')
    .then(async (module: WasmModule) => {
      await module.default();
      return {
        convert: (value, from, to) => module.convert_temperature(value, from, to),
        absoluteZero: (unit) => module.absolute_zero_for(unit),
        version: () => module.engine_version(),
      } satisfies TemperatureEngine;
    })
    .catch((error: unknown) => {
      enginePromise = undefined;
      throw error;
    });

  return enginePromise;
};
