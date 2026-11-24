// Every story runs on Sakuga as an app would: tokens.css, then fonts.css, then <Sakuga> pointing at the sprite. Ladle's theme
// switch drives Sakuga's own theme, so a story is seen exactly as it is in a product.
import { useEffect, useState, type ReactNode } from 'react';
import type { GlobalProvider } from '@ladle/react';
import '../check/.generated/tokens.css';
import '../src/fonts/fonts.css';
import icons from '../src/icons/icons.svg?url';
import { applyTheme } from '../src/ui/theme';
import { Sakuga } from '../src/ui/Sakuga';
import { sound, type SoundMoment } from '../src/ui/sound/sound';

const MOMENTS: SoundMoment[] = ['ready', 'failed', 'published', 'fragments', 'maki'];

/* Sound is off in every product until a person turns it on, so the workbench has the same switch: on, every control answers as
   the design says, and the moments can be played by hand. It sits outside the story, and the story tests hide it. */
function SoundDesk() {
  const [on, setOn] = useState(sound.isOn());
  return (
    <div data-sk-sound-desk style={{ position: 'fixed', right: 12, bottom: 12, display: 'flex', gap: 8, alignItems: 'center', font: '12px/16px var(--font-sans)', color: 'var(--text-secondary)', zIndex: 10 }}>
      <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input type="checkbox" checked={on} onChange={(e) => { (e.target.checked ? sound.on : sound.off)(); setOn(e.target.checked); }} />
        Sound
      </label>
      {on && MOMENTS.map((m) => <button key={m} type="button" onClick={() => sound(m)} style={{ font: 'inherit' }}>{m}</button>)}
    </div>
  );
}

function Stage({ theme, children }: { theme: string; children: ReactNode }) {
  useEffect(() => { applyTheme(theme === 'light' ? 'light' : 'dark'); }, [theme]);
  return <div style={{ padding: 24, minHeight: '100vh', boxSizing: 'border-box', background: 'var(--bg-canvas)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
    <div data-sk-story style={{ display: 'flow-root' }}>{children}</div>
    <SoundDesk />
  </div>;
}

/* Ladle's switch sets the theme straight, without Sakuga's fade or keeping it, so a story's screenshot never catches a fade */
export const Provider: GlobalProvider = ({ children, globalState }) => <Sakuga icons={icons}><Stage theme={globalState.theme}>{children}</Stage></Sakuga>;
