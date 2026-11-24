import { createContext, useContext, type ComponentType } from 'react';
import { Loader } from '../ui/Loader/Loader';

/** A loader an app sets for every core part that waits: drawn at `size`, announcing `label`. */
export type SakugaLoader = ComponentType<{ size?: number | string; label?: string }>;

/* The loader the app sets for every core part that waits (Button busy, DropZone busy, VideoPlayer loading, Thumb drawing), with
   <Sakuga loader>. Without one, Loader */
export const LoaderContext = createContext<SakugaLoader | null>(null);

/** The loader a core part that waits draws: the app's, or Sakuga's own `Loader`. */
export function useLoader(): SakugaLoader {
  return useContext(LoaderContext) || Loader;
}
