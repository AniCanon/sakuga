import { useEffect, type RefObject } from 'react';

/* One live region for the page. <Sakuga> makes it as soon as there is a body, so it is already listening when the first
   message comes (a region that arrives with its text is often not read). The same message within a second is said once. */
let liveBox: HTMLDivElement | null = null;
let liveLast = { text: '', at: 0 };

export function liveRegion(): HTMLDivElement | null {
  if (liveBox || typeof document === 'undefined' || !document.body) return liveBox;
  liveBox = document.createElement('div');
  liveBox.className = 'sk-sr';
  liveBox.setAttribute('role', 'status');
  liveBox.setAttribute('aria-live', 'polite');
  liveBox.setAttribute('aria-atomic', 'true');
  document.body.appendChild(liveBox);
  return liveBox;
}

export function announce(text: string): void {
  const box = liveRegion(), now = Date.now();
  if (!box || !text || (text === liveLast.text && now - liveLast.at < 1000)) return;
  liveLast = { text, at: now };
  box.textContent = '';
  setTimeout(() => { box.textContent = text; }, 60);
}

/* Words a status says, from its title and text when they are words */
export function statusWords(...parts: unknown[]): string {
  return parts.filter((s): s is string => typeof s === 'string' && !!s).join(' ');
}

/* A loader says what is loading once, when it appears; inside a control or a card it stays quiet, since what holds it says so */
const QUIET = 'button,a,[role="button"],[role="link"],.sk-card,.sk-castcard,.sk-placecard,.sk-plate,.sk-ccard';

export function useLoadingVoice(ref: RefObject<HTMLElement>, label: string): void {
  useEffect(() => {
    const up = ref.current?.parentElement;
    if (ref.current && !(up && up.closest(QUIET))) announce(label);
  }, []);
}
