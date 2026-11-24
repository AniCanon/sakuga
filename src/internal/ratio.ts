/* A frame shape as a number: 16 / 9 from 1.7778, '16 / 9' or '16:9' */
export function ratioOf(r: number | string | undefined): number {
  if (typeof r === 'number') return r;
  const m = String(r || '').split(/[/:]/);
  return m.length > 1 ? parseFloat(m[0]) / parseFloat(m[1]) : parseFloat(m[0]) || 16 / 9;
}
