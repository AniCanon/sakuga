import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/* The audio is a recorder: the nth buffer decoded is the nth sound of files.ts, and every buffer started is noted */
const NAMES = ['press', 'on', 'off', 'choose', 'open', 'close', 'ready', 'failed', 'published', 'fragments', 'maki'];
let played: string[] = [];
class RecordingContext {
  state = 'running';
  destination = {};
  n = 0;
  createGain() { return { gain: { value: 1 }, connect() {} }; }
  resume() { return Promise.resolve(); }
  decodeAudioData(_: ArrayBuffer, ok: (b: unknown) => void) { ok({ tag: NAMES[this.n++] }); }
  createBufferSource() {
    const s = { buffer: null as { tag: string } | null, connect() {}, start() { played.push(s.buffer!.tag); } };
    return s;
  }
}

/* Each test gets a fresh engine; the one it used is switched off after, so its document listeners don't hear the next test */
let current: typeof import('./sound') | null = null;
async function fresh() {
  vi.resetModules();
  current = await import('./sound');
  return current;
}
/* The files load on first wake; a test waits for them, so a sound from one test can't land in the next */
const settle = async () => { await import('./files'); await new Promise((r) => setTimeout(r, 50)); };
function pressOn(el: Element) {
  el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
}

beforeEach(() => {
  played = [];
  Object.assign(window, { AudioContext: RecordingContext });
  document.body.innerHTML = '';
  localStorage.clear();
});
afterEach(() => { current?.soundSet(false); current = null; });

describe('sound', () => {
  it('is off until a product turns it on: a press plays nothing', async () => {
    await fresh();
    document.body.innerHTML = '<button class="sk-btn">Play</button>';
    pressOn(document.querySelector('.sk-btn')!);
    await settle();
    expect(played).toEqual([]);
  });

  it('keeps a person\'s choice', async () => {
    const { sound, SOUND_KEY } = await fresh();
    sound.on();
    expect(localStorage.getItem(SOUND_KEY)).toBe('on');
    expect(sound.isOn()).toBe(true);
    sound.off();
    expect(localStorage.getItem(SOUND_KEY)).toBe('off');
  });

  it('answers a press on a pressable control with the press sound', async () => {
    const { sound } = await fresh();
    sound.on();
    document.body.innerHTML = '<button class="sk-btn">Play</button>';
    pressOn(document.querySelector('.sk-btn')!);
    await vi.waitFor(() => expect(played).toEqual(['press']));
  });

  it('stays silent for a disabled control and under a phone-only surface', async () => {
    const { sound } = await fresh();
    sound.on();
    document.body.innerHTML = '<button class="sk-btn" disabled>Off</button><div class="sk-sheet"><button class="sk-btn">In a sheet</button></div>';
    pressOn(document.querySelector('.sk-btn[disabled]')!);
    pressOn(document.querySelector('.sk-sheet .sk-btn')!);
    await settle();
    expect(played).toEqual([]);
  });

  it('plays a moment only when it is one of the moments', async () => {
    const { sound } = await fresh();
    sound.on();
    pressOn(document.body);
    await settle();
    sound('ready');
    sound('press' as never);
    await vi.waitFor(() => expect(played).toEqual(['ready']));
    await settle();
    expect(played).toEqual(['ready']);
  });

  it('keeps the volume between 0 and 1', async () => {
    const { sound } = await fresh();
    expect(sound.volume(2)).toBe(1);
    expect(sound.volume(-1)).toBe(0);
  });
});
