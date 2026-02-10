import { useMemo, useEffect, useRef } from 'react';
import { isEqual } from 'lodash';

export const useMemoFirebase = <T>(value: T): T => {
  const ref = useRef<T>(value);

  useEffect(() => {
    if (!isEqual(value, ref.current)) {
      ref.current = value;
    }
  }, [value]);

  return ref.current;
};
