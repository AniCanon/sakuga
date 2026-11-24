/* The colour is kept as hue, saturation and brightness, so the hue holds while the colour passes through grey, black or white.
   Outside, it is hex ("#1f6feb"). */
export interface Hsv { h: number; s: number; v: number }

export function hexOf(v: string | undefined | null): string | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(v || '').trim());
  if (!m) return null;
  const x = m[1].length === 3 ? m[1].replace(/./g, '$&$&') : m[1];
  return '#' + x.toLowerCase();
}

export function hsvOf(hex: string): Hsv {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
  let hue = 0;
  if (d) hue = 60 * (max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4);
  return { h: hue, s: max ? d / max : 0, v: max };
}

export function hexOfHsv(c: Hsv): string {
  const f = (k: number) => { const x = (k + c.h / 60) % 6; return c.v - c.v * c.s * Math.max(0, Math.min(x, 4 - x, 1)); };
  return '#' + [f(5), f(3), f(1)].map((u) => ('0' + Math.round(u * 255).toString(16)).slice(-2)).join('');
}
