import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export const usePersistentState = <T>(
  load: () => T,
  save: (value: T) => void,
): [T, Dispatch<SetStateAction<T>>] => {
  const [state, setState] = useState<T>(load);
  useEffect(() => save(state), [save, state]);
  return [state, setState];
};
