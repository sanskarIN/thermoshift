import { unitById } from '../data/units';
import type { ConversionResult, HistoryEntry } from '../types';

const escapeCsv = (value: string | number): string => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

export const conversionsToCsv = (rows: ConversionResult[]): string => {
  const header = 'input,input_unit,output,output_unit';
  const data = rows.map((row) => [
    row.input,
    unitById(row.from).symbol,
    row.output,
    unitById(row.to).symbol,
  ].map(escapeCsv).join(','));
  return [header, ...data].join('\n');
};

export const historyToJson = (history: HistoryEntry[]): string => JSON.stringify({
  schemaVersion: 1,
  exportedAt: new Date().toISOString(),
  history,
}, null, 2);

export const downloadText = (filename: string, text: string, type: string): void => {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);

  try {
    anchor.click();
  } finally {
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
};
