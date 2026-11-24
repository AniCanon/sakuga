import { useId } from 'react';

/* An id for aria relations, stable for the life of the component; a given id wins. */
export function useUid(prefix: string, given?: string): string {
  const id = useId();
  return given || `${prefix}-${id.replace(/:/g, '')}`;
}
