/* Dates are 'YYYY-MM-DD' and counted in UTC, so a day is the same day everywhere */
export function isoOf(d: Date): string { return d.toISOString().slice(0, 10); }
export function dayOf(iso: string | undefined | null): Date | null { const p = String(iso || '').split('-'); return p.length === 3 ? new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])) : null; }
export function addDays(iso: string, n: number): string { const d = dayOf(iso)!; d.setUTCDate(d.getUTCDate() + n); return isoOf(d); }
export function addMonths(iso: string, n: number): string {
  const d = dayOf(iso)!, day = d.getUTCDate(), m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
  const last = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 0)).getUTCDate();
  m.setUTCDate(Math.min(day, last));
  return isoOf(m);
}
/* A month is its first day; 'YYYY-MM' and 'YYYY-MM-DD' both name one */
export function monthOf(iso: string): string { return String(iso).slice(0, 7) + '-01'; }
export function validDay(iso: string | undefined): boolean { const s = String(iso || ''), full = s.length === 7 ? s + '-01' : s; return /^\d{4}-\d{2}-\d{2}$/.test(full) && isoOf(dayOf(full)!) === full; }
export function todayIso(): string { const n = new Date(); return isoOf(new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()))); }
export function weekStartOf(locale: string): number {
  try {
    const l = new Intl.Locale(locale) as Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };
    const w = l.getWeekInfo ? l.getWeekInfo() : l.weekInfo;
    if (w && w.firstDay) return w.firstDay % 7;
  } catch { /* An unknown locale starts the week on Monday */ }
  return 1;
}
