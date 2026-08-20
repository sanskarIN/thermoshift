interface RandomIdSource {
  randomUUID?: () => string;
  getRandomValues: (array: Uint8Array) => Uint8Array;
}

const HEX = Array.from({ length: 256 }, (_, value) => value.toString(16).padStart(2, '0'));

export const createId = (source: RandomIdSource = crypto): string => {
  if (typeof source.randomUUID === 'function') return source.randomUUID();

  const bytes = source.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return `${HEX[bytes[0]]}${HEX[bytes[1]]}${HEX[bytes[2]]}${HEX[bytes[3]]}-${HEX[bytes[4]]}${HEX[bytes[5]]}-${HEX[bytes[6]]}${HEX[bytes[7]]}-${HEX[bytes[8]]}${HEX[bytes[9]]}-${HEX[bytes[10]]}${HEX[bytes[11]]}${HEX[bytes[12]]}${HEX[bytes[13]]}${HEX[bytes[14]]}${HEX[bytes[15]]}`;
};
