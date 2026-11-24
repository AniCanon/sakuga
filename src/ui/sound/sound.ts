/* Sound: the animator's desk answering a touch (README · Sound). Off until a product turns it on; a person's choice is kept like
   the theme. One listener on the document gives every control of a kind the same answer: a press as the pointer goes down or the
   key is pressed, on and off and choices as the selected state changes right after a person's gesture, surfaces as they arrive and
   start to leave. Moments are the product's to call: sound('ready').
   Nothing here runs on import. <Sakuga> restores a person's choice; the files load the first time sound wakes. */

export const SOUND_KEY = 'sakuga-sound';

type SoundName = 'press' | 'on' | 'off' | 'choose' | 'open' | 'close' | SoundMoment;
export type SoundMoment = 'ready' | 'failed' | 'published' | 'fragments' | 'maki';

const SOUND_LEVEL: Record<SoundName, 'touch' | 'surface' | 'moment'> = {
  press: 'touch', on: 'touch', off: 'touch', choose: 'touch', open: 'surface', close: 'surface',
  ready: 'moment', failed: 'moment', published: 'moment', fragments: 'moment', maki: 'moment',
};
const SOUND_MOMENTS: readonly string[] = ['ready', 'failed', 'published', 'fragments', 'maki'];
const PRESSABLE = '.sk-btn, .sk-ib, .sk-chip, a.sk-listrow, .sk-listrow[role="link"], .sk-panelrow, .sk-props__row, button.sk-thumb, .sk-tlink, .sk-audio__play';
/* A chooser's own buttons (its arrows too) answer with the choice, never a press as well */
const CHOOSERS = '.sk-pages, .sk-seg, .sk-tiles, .sk-swatches, .sk-voices';
/* On phones the platform's haptics answer these */
const PHONE_ONLY = '.sk-sheet, .sk-sheet-scrim, .sk-tabbar';
const CHOSEN: Record<string, string> = {
  'aria-pressed': '.sk-seg button',
  'aria-current': '.sk-pages__n',
  'aria-checked': '.sk-tile[role="radio"], .sk-swatch, .sk-voice',
  'aria-selected': '.sk-picker__opt, .sk-select__option',
};
const TOGGLES = '.sk-switch, .sk-check';
const SURFACES = '.sk-dialog-scrim, .sk-popover, .sk-select__menu';

const snd = {
  on: false,
  ctx: null as AudioContext | null,
  out: null as GainNode | null,
  bufs: {} as Partial<Record<SoundName, Promise<AudioBuffer>>>,
  loading: null as Promise<void> | null,
  touched: 0,
  gesture: 0,
  chose: 0,
  volume: 1,
  watch: null as MutationObserver | null,
};

function soundToken(name: string, fallback: number): number {
  try {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    return isNaN(v) ? fallback : v;
  } catch {
    return fallback;
  }
}

/* Browsers start audio only from a gesture: the first press after on() wakes it and decodes the files */
function soundWake(): AudioContext | null {
  if (!snd.ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    const ctx = new AC();
    snd.ctx = ctx;
    snd.out = ctx.createGain();
    snd.out.gain.value = snd.volume;
    snd.out.connect(ctx.destination);
    snd.loading = import('./files').then(({ SOUND_FILES }) => {
      for (const [n, uri] of Object.entries(SOUND_FILES)) {
        const bin = atob(uri.split(',')[1]), bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        snd.bufs[n as SoundName] = new Promise((ok, no) => ctx.decodeAudioData(bytes.buffer, ok, no));
      }
    }, () => undefined);
  }
  if (snd.ctx.state === 'suspended') void snd.ctx.resume();
  return snd.ctx;
}

/* Never over the work: any video or audio playing with its sound up silences Sakuga */
function soundQuiet(): boolean {
  return Array.from(document.querySelectorAll<HTMLMediaElement>('video, audio')).some((m) => !m.paused && !m.ended && !m.muted && m.volume > 0);
}

function soundPlay(name: SoundName): void {
  if (!snd.on || soundQuiet()) return;
  const level = SOUND_LEVEL[name], now = Date.now();
  if (level === 'touch') {
    if (now - snd.touched < soundToken('--sound-interval', 100)) return;
    snd.touched = now;
  }
  const ctx = soundWake();
  if (!ctx || !snd.loading) return;
  const gain = Math.pow(10, soundToken('--sound-' + level + '-level', 0) / 20);
  void snd.loading.then(() => snd.bufs[name]?.then((b) => {
    const s = ctx.createBufferSource(), g = ctx.createGain();
    g.gain.value = gain;
    s.buffer = b;
    s.connect(g);
    g.connect(snd.out!);
    s.start();
  }, () => undefined));
}

/* A choice a component makes without a state of its own changing (a Picker hands its option over and closes) */
export function soundChose(): void {
  const now = Date.now();
  if (now - snd.gesture > 1000) return;
  snd.chose = now;
  soundPlay('choose');
}

/* A surface that arrives as a whole page (a takeover rising, or dropping back), within a second of the gesture that asked for it */
export function soundSurface(leaving: boolean): void {
  if (Date.now() - snd.gesture > 1000) return;
  soundPlay(leaving ? 'close' : 'open');
}

function soundAvailable(el: Element | null): el is Element {
  return !!el && !el.closest(PHONE_ONLY) && !el.matches(':disabled, [aria-disabled="true"]');
}
function soundPress(el: EventTarget | null) {
  const p = el instanceof Element ? el.closest(PRESSABLE) : null;
  if (p && !p.closest(CHOOSERS) && soundAvailable(p)) soundPlay('press');
}
function soundPointer(e: PointerEvent) { snd.gesture = Date.now(); soundWake(); soundPress(e.target); }
function soundKey(e: KeyboardEvent) {
  snd.gesture = Date.now();
  soundWake();
  if (!e.repeat && (e.key === 'Enter' || e.key === ' ')) soundPress(e.target);
}

/* What changed in answer to a person, within a second of their gesture: a choice or a toggle first, then surfaces. Choosing in a
   menu also closes it; the choice is the answer. */
function soundChanges(records: MutationRecord[]) {
  const now = Date.now();
  if (now - snd.gesture > 1000) return;
  for (const r of records) {
    const el = r.target as Element;
    if (r.type !== 'attributes' || !el.matches || !soundAvailable(el)) continue;
    const v = el.getAttribute(r.attributeName!);
    if (r.attributeName === 'aria-checked' && el.matches(TOGGLES)) { if (v !== r.oldValue) soundPlay(v === 'false' ? 'off' : 'on'); continue; }
    const sel = CHOSEN[r.attributeName!];
    if (sel && el.matches(sel) && (v === 'true' || v === 'page') && r.oldValue !== v) { snd.chose = now; soundPlay('choose'); }
  }
  for (const r of records) {
    if (r.type === 'childList') {
      r.addedNodes.forEach((n) => {
        if (n instanceof Element && soundAvailable(n) && (n.matches(SURFACES) || n.querySelector(SURFACES))) soundPlay('open');
      });
    } else if (r.attributeName === 'class' && r.target instanceof Element && r.target.matches(SURFACES) && soundAvailable(r.target)) {
      const leaving = r.target.classList.contains('is-leaving'), was = (r.oldValue || '').split(' ').includes('is-leaving');
      if (leaving && !was && now - snd.chose > soundToken('--sound-interval', 100)) soundPlay('close');
    }
  }
}

function soundListen(on: boolean) {
  if (on && !snd.watch) {
    document.addEventListener('pointerdown', soundPointer, true);
    document.addEventListener('keydown', soundKey, true);
    snd.watch = new MutationObserver(soundChanges);
    snd.watch.observe(document.documentElement, {
      subtree: true, childList: true, attributes: true, attributeOldValue: true,
      attributeFilter: ['aria-checked', 'aria-pressed', 'aria-current', 'aria-selected', 'class'],
    });
  } else if (!on && snd.watch) {
    document.removeEventListener('pointerdown', soundPointer, true);
    document.removeEventListener('keydown', soundKey, true);
    snd.watch.disconnect();
    snd.watch = null;
  }
}

export function soundSet(on: boolean): void {
  snd.on = on;
  soundListen(on);
}

function store(v: 'on' | 'off') {
  try { localStorage.setItem(SOUND_KEY, v); } catch { /* Storage blocked: the switch holds for this page */ }
}

interface Sound {
  (moment: SoundMoment): void;
  on(): void;
  off(): void;
  isOn(): boolean;
  /** 0 to 1; returns the volume now. */
  volume(v?: number): number;
}

/* sound('ready') plays a moment; sound.on(), .off(), .isOn() and .volume(0 to 1) are the switch a product's settings give a person */
/**
 * Plays a moment, `sound('ready')`; `.on()`, `.off()`, `.isOn()` and `.volume(0–1)` are the switch a product's settings give a
 * person.
 */
export const sound: Sound = Object.assign(
  (moment: SoundMoment) => { if (SOUND_MOMENTS.includes(moment)) soundPlay(moment); },
  {
    on() { store('on'); soundSet(true); },
    off() { store('off'); soundSet(false); },
    isOn() { return snd.on; },
    volume(v?: number) {
      if (typeof v === 'number') {
        snd.volume = Math.max(0, Math.min(1, v));
        if (snd.out) snd.out.gain.value = snd.volume;
      }
      return snd.volume;
    },
  },
);
