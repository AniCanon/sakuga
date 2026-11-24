export type Theme = 'light' | 'dark';

/* View transitions are newer than TypeScript 5.5's DOM types */
type ViewTransitionDocument = Document & { startViewTransition?: (update: () => void) => { finished: Promise<void> } };

export const THEME_KEY = 'sakuga-theme';

/* No attribute is Sakuga's own default, dark */
export function applyTheme(v: string | null): void {
  const root = document.documentElement;
  if (v === 'light' || v === 'dark') root.setAttribute('data-theme', v);
  else root.removeAttribute('data-theme');
}

/* The new theme fades in over the old; under reduced motion, without view transitions, or when nothing changes, it switches at
   once. A person's choice is kept, and every open tab follows it (<Sakuga> listens). */
export function setTheme(v: Theme | null): void {
  try {
    if (v) localStorage.setItem(THEME_KEY, v);
    else localStorage.removeItem(THEME_KEY);
  } catch {
    /* Storage blocked: the theme still changes for this page */
  }
  const doc = document as ViewTransitionDocument, root = doc.documentElement, next = v === 'light' || v === 'dark' ? v : null;
  const still = !doc.startViewTransition || root.getAttribute('data-theme') === next
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) { applyTheme(v); return; }
  root.classList.add('sk-is-theming');
  const t = doc.startViewTransition!(() => applyTheme(v));
  const done = () => root.classList.remove('sk-is-theming');
  t.finished.then(done, done);
}

/* The choice a person made, read before the attribute is restored, so the first render already knows it */
export function storedTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function getTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}
