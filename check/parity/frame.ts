// One side of a pair: the component's own preview from the design system, run against the reference bundle or the port.
// The preview's code is the design system's, unchanged; only what window.Sakuga and window.AniCanonKit hold differs.
import React from 'react';
import { createPortal } from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import '../.generated/tokens.css';
import '../../src/fonts/fonts.css';

const params = new URLSearchParams(location.search);
const name = params.get('c')!;
/* Both sides restore the stored theme as they start, so the pair's theme is stored, not set */
try { localStorage.setItem('sakuga-theme', params.get('theme') === 'light' ? 'light' : 'dark'); } catch { /* the default, dark */ }
/* The design canvas loads React DOM's UMD build, which holds createRoot and createPortal both; a part that opens in the page's
   root (FieldHelp's examples) reaches for window.ReactDOM.createPortal */
Object.assign(window, { React, ReactDOM: { ...ReactDOMClient, createPortal } });

/* A pair compares the rest state. A picture that develops in is rasterized while it scales, and Chromium may keep that tile, so
   from run to run it lands a colour level apart. Both sides play every animation and transition in no time: each picture is drawn
   once, at rest. Sound tests (record) keep real timing. */
if (!params.get('record')) {
  const still = document.createElement('style');
  still.textContent = '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important}';
  document.head.append(still);
}

/* With record, the page's audio is a recorder: a decoded buffer is named by its bytes, which are the same eleven MP3s on both
   sides (press, on, off, choose, open, close, ready, failed, published, fragments, maki), so a side may decode them in any order
   or only when asked; every buffer started is written to window.__sounds. Links don't navigate, so a pair can be pressed end to end. */
if (params.get('record')) {
  const played: string[] = [];
  const key = (bytes: Uint8Array) => {
    let h = 2166136261;
    for (let i = 0; i < bytes.length; i++) h = Math.imul(h ^ bytes[i], 16777619);
    return bytes.length + ':' + (h >>> 0);
  };
  const named = import('../../src/ui/sound/files').then(({ SOUND_FILES }) => new Map(Object.entries(SOUND_FILES).map(([n, uri]) =>
    [key(Uint8Array.from(atob(uri.split(',')[1]), (c) => c.charCodeAt(0))), n])));
  class RecordingContext {
    state = 'running';
    destination = {};
    createGain() { return { gain: { value: 1 }, connect() {} }; }
    resume() { return Promise.resolve(); }
    decodeAudioData(data: ArrayBuffer, ok?: (b: unknown) => void) {
      const k = key(new Uint8Array(data));
      return named.then((m) => {
        const b = { tag: m.get(k) ?? 'unknown sound ' + k };
        if (ok) setTimeout(() => ok(b));
        return b;
      });
    }
    createBufferSource() {
      const s = { buffer: null as { tag: string } | null, connect() {}, start() { if (s.buffer) played.push(s.buffer.tag); } };
      return s;
    }
  }
  Object.assign(window, { AudioContext: RecordingContext, webkitAudioContext: RecordingContext, __sounds: played });
  document.addEventListener('click', (e) => { if ((e.target as Element).closest?.('a[href]')) e.preventDefault(); }, true);
}

const previews = import.meta.glob('../../.design/previews/*.html', { query: '?raw', import: 'default' });

async function run() {
  if (params.get('side') === 'ref') {
    await import('../../.design/bundle.css');
    const bundle = (await import('../../.design/bundle.js?raw')).default;
    new Function(bundle)();
  } else {
    const [ui, kit, icons, setup, sprite] = await Promise.all([
      import('../../src/ui/index'),
      import('../../src/anicanonkit/index'),
      import('../../src/icons/icons.svg?url'),
      import('../../src/ui/install'),
      import('../../src/ui/Icon/sprite'),
    ]);
    /* The previews call the bundle's globals outside React, so the port's side runs what <Sakuga> runs, directly */
    sprite.setIconSprite(icons.default);
    setup.install();
    /* What is not ported yet draws as a labelled gap, so a preview that uses it still runs */
    const missing = (lib: string) => (n: string) => (p: { children?: unknown }) =>
      React.createElement('span', { style: { outline: '1px dashed #d33', color: '#d33', font: '12px monospace', padding: 2 } }, `${lib}.${n} not ported`, p?.children as never);
    const space = (mod: object, lib: string) => new Proxy(mod, { get: (t, k: string) => (k in t ? (t as Record<string, unknown>)[k] : missing(lib)(k)) });
    Object.assign(window, { Sakuga: space(ui, 'Sakuga'), AniCanonKit: space(kit, 'AniCanonKit') });
  }
  /* Both sides draw with the fonts already in, so neither measures text in the fallback first (a glide placed then keeps its width) */
  await Promise.all([...document.fonts].map((f) => f.load().catch(() => undefined)));
  const html = (await previews[`../../.design/previews/${name}.html`]?.()) as string | undefined;
  if (!html) { document.body.textContent = `No preview for ${name}`; return; }
  const holder = document.createElement('div');
  holder.innerHTML = html.replace(/<script>[\s\S]*<\/script>/, '');
  document.body.append(...holder.childNodes);
  const code = html.match(/<script>([\s\S]*)<\/script>/)?.[1] ?? '';
  new Function(code)();
}
run().catch((e) => { document.body.textContent = String(e?.stack || e); });
