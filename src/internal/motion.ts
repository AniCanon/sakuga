export type MotionName = 'instant' | 'fast' | 'base' | 'slow' | 'slower';

const MOTION_MS: Record<MotionName, number> = { instant: 100, fast: 160, base: 240, slow: 360, slower: 560 };

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* Motion timing read from the motion tokens, so the components and tokens.css agree. Reduced motion: every move is a
   motion-instant fade. A name starting with -- is a component's own animation token: its moment lasts the first time in it. */
export function motionMs(name: MotionName | `--${string}`): number {
  try {
    if (prefersReducedMotion()) name = 'instant';
    const rootStyle = getComputedStyle(document.documentElement);
    if (name.startsWith('--')) {
      const t = rootStyle.getPropertyValue(name).match(/(\d*\.?\d+)(ms|s)\b/);
      if (t) return t[2] === 'ms' ? parseFloat(t[1]) : parseFloat(t[1]) * 1000;
      return MOTION_MS.base;
    }
    const raw = rootStyle.getPropertyValue('--motion-' + name).trim();
    const v = parseFloat(raw);
    if (v > 0) return /ms$/.test(raw) ? v : v * 1000;
  } catch {
    /* No document (server rendering): the scale's own value */
  }
  return MOTION_MS[name as MotionName] ?? MOTION_MS.base;
}
