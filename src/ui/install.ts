import { liveRegion } from '../internal/live';
import { SOUND_KEY, soundSet } from './sound/sound';
import { THEME_KEY, applyTheme, type Theme } from './theme';

/* What the bundle did on load, which <Sakuga> runs as it mounts: the stored theme and sound choice are restored and followed
   across tabs (onTheme hears another tab's choice), and the live region is made before the first message. Returns the undo.
   Internal: apps use <Sakuga>; the parity pages call it directly. */
export function install(onTheme?: (theme: Theme) => void): () => void {
  try {
    applyTheme(localStorage.getItem(THEME_KEY));
    soundSet(localStorage.getItem(SOUND_KEY) === 'on');
  } catch {
    /* Storage blocked: Sakuga's defaults, dark and silent */
  }
  function follow(e: StorageEvent) {
    if (e.key === THEME_KEY) { applyTheme(e.newValue); onTheme?.(e.newValue === 'light' ? 'light' : 'dark'); }
    if (e.key === SOUND_KEY) soundSet(e.newValue === 'on');
  }
  window.addEventListener('storage', follow);
  const made = () => liveRegion();
  if (document.body) made();
  else document.addEventListener('DOMContentLoaded', made, { once: true });
  return () => {
    window.removeEventListener('storage', follow);
    document.removeEventListener('DOMContentLoaded', made);
    soundSet(false);
  };
}
