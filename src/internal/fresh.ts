import { useRef } from 'react';

/* A mark that has just changed state, for the length of that state: what was already there when the component appeared is not
   fresh, so nothing moves on arrival. Keyed by state, so each change mounts a new mark that settles in once. */
export function useFresh(): (key: string, state: unknown) => boolean {
  const seen = useRef<Record<string, { state: unknown; fresh: boolean }>>({});
  return (key, state) => {
    const was = seen.current[key];
    const fresh = was ? was.state !== state || was.fresh : false;
    seen.current[key] = { state, fresh };
    return fresh;
  };
}
