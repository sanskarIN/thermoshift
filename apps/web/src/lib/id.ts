interface RandomIdSource {
  randomUUID?: () => string;
  getRandomValues: (array: Uint8Array) => void;
}

const byteAt = (bytes: Uint8Array, index: number): number => {
  const value = bytes[index];
  if (value === undefined) throw new Error(`Random byte ${index} was not generated.`);
  return value;
};

const toHex = (value: number): string => value.toString(16).padStart(2, '0');

export const createId = (source: RandomIdSource = crypto): string => {
  if (typeof source.randomUUID === 'function') return source.randomUUID();

  const bytes = new Uint8Array(16);
  source.getRandomValues(bytes);
  bytes[6] = (byteAt(bytes, 6) & 0x0f) | 0x40;
  bytes[8] = (byteAt(bytes, 8) & 0x3f) | 0x80;

  return `${toHex(byteAt(bytes, 0))}${toHex(byteAt(bytes, 1))}${toHex(byteAt(bytes, 2))}${toHex(byteAt(bytes, 3))}-${toHex(byteAt(bytes, 4))}${toHex(byteAt(bytes, 5))}-${toHex(byteAt(bytes, 6))}${toHex(byteAt(bytes, 7))}-${toHex(byteAt(bytes, 8))}${toHex(byteAt(bytes, 9))}-${toHex(byteAt(bytes, 10))}${toHex(byteAt(bytes, 11))}${toHex(byteAt(bytes, 12))}${toHex(byteAt(bytes, 13))}${toHex(byteAt(bytes, 14))}${toHex(byteAt(bytes, 15))}`;
};
