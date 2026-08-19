declare module '*thermoshift_wasm.js' {
  const init: () => Promise<unknown>;
  export default init;
  export function convert_temperature(value: number, from: string, to: string): number;
  export function absolute_zero_for(unit: string): number;
  export function engine_version(): string;
}
