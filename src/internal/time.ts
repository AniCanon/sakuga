import { type Words } from './words';
/* A time in seconds as the player shows it ("3:12") */
export function fmt(s: number): string {
  s = Math.max(0, Math.round(s));
  const m = Math.floor(s / 60), r = s % 60;
  return m + ':' + (r < 10 ? '0' : '') + r;
}

/* A time in seconds as a screen reader says it ("3 minutes 12 seconds"), in the app's words */
export function spoken(s: number, tx: Words): string {
  s = Math.max(0, Math.round(s));
  const m = Math.floor(s / 60), r = s % 60, sec = tx('seconds', { count: r });
  return m ? tx('minutesSeconds', { minutes: tx('minutes', { count: m }), seconds: sec }) : sec;
}

/* A timecode as the editor shows it ("1:05"): the total is rounded first, so 59.6 s reads "1:00", never "0:60" */
export function tc(s: number): string {
  const t = Math.round(s), m = Math.floor(t / 60), r = t % 60;
  return m + ':' + (r < 10 ? '0' : '') + r;
}
