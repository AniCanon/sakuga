import type { CSSProperties } from 'react';

/* A style written as a CSS string ("object-position:50% 40%;filter:...") becomes a React style object */
export function cssObj(s: string | CSSProperties | undefined): CSSProperties | undefined {
  if (!s) return undefined;
  if (typeof s !== 'string') return s;
  const o: Record<string, string> = {};
  s.split(';').forEach((d) => {
    const i = d.indexOf(':');
    if (i < 1) return;
    const k = d.slice(0, i).trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    o[k] = d.slice(i + 1).trim();
  });
  return o as CSSProperties;
}
