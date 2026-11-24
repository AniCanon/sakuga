import type { CSSProperties } from 'react';

/* A size given as a token ('var(--button-icon-size)') is set as style, where CSS resolves it; a number stays an attribute. */
export function sized(size: number | string): { width?: number; height?: number; style?: CSSProperties } {
  return typeof size === 'string' ? { style: { width: size, height: size } } : { width: size, height: size };
}

/* A length token a component needs as a number (MediaCard's corner switch), read from the root. */
export function tokenPx(name: string, fallback: number): number {
  try {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    return v > 0 ? v : fallback;
  } catch {
    return fallback;
  }
}
