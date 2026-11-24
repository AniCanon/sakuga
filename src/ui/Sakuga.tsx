import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import { liveRegion } from '../internal/live';
import { LoaderContext, type SakugaLoader } from '../internal/loader';
import { WordsContext, wordsOf, type SakugaMessages, type SakugaTranslate } from '../internal/words';
import { setIconSprite } from './Icon/sprite';
import { install } from './install';
import { setTheme as switchTheme, storedTheme, type Theme } from './theme';

export interface SakugaProps {
  /** The icon sprite's URL on the app's own origin, `import icons from '@anicanon/sakuga/icons?url'`. An empty string points
   *  each icon at an id in the page, for a page that inlines the sprite. */
  icons: string;
  /** The app's locale, a BCP 47 tag ('en', 'pt-BR'): plurals, numbers, dates and lists follow it. The page's <html lang> when left out. */
  locale?: string;
  /** The app's words for its locale, by key (README · Words); a key left out keeps its English. Changing either re-renders. */
  messages?: SakugaMessages;
  /** The app's own translator, for an app whose words live in an i18n library: `t` from react-i18next's `useTranslation('sakuga')`.
   *  It is asked first; a key it doesn't have falls to `messages`, then the English. Changing it re-renders. */
  t?: SakugaTranslate;
  /** The loader every core part that waits draws (Button busy, DropZone busy, VideoPlayer loading, Thumb drawing): AniCanon
   *  passes `AniCanonKit.Loader`. Sakuga's own `Loader` when left out. */
  loader?: SakugaLoader;
  /** The app. */
  children?: ReactNode;
}

export interface ThemeControl {
  /** The theme on screen: dark until a person chooses light. */
  theme: Theme;
  /** Fades to a theme and keeps the choice, in every open tab; `null` goes back to Sakuga's own, dark. */
  setTheme: (theme: Theme | null) => void;
}

const ThemeContext = createContext<ThemeControl | null>(null);

/* Sakuga around an app, once, at its root. Effects run children first, so what a child may need as it mounts is ready before
   it: the live region is made in the first render, before a Loader can speak, and the stored theme and sound choice are
   restored in a layout effect, before the first paint. Unmounting stops following other tabs and turns sound off. */
/**
 * Sakuga around an app, once, at its root: it sets the icon sprite, the locale and its words, the loader that core parts draw
 * while they wait, and the theme, and gives every
 * component the page's one live region. @see docs/USING.md
 */
export function Sakuga({ icons, locale, messages, t, loader, children }: SakugaProps) {
  setIconSprite(icons);
  useState(liveRegion);
  const [theme, follow] = useState<Theme>(storedTheme);
  useLayoutEffect(() => install(follow), []);
  const setTheme = useCallback((next: Theme | null) => {
    switchTheme(next);
    follow(next ?? 'dark');
  }, []);
  const control = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
  const words = useMemo(() => wordsOf(locale || (typeof document !== 'undefined' && document.documentElement.lang) || 'en', messages, t), [locale, messages, t]);
  return <ThemeContext.Provider value={control}><WordsContext.Provider value={words}><LoaderContext.Provider value={loader ?? null}>{children}</LoaderContext.Provider></WordsContext.Provider></ThemeContext.Provider>;
}

/* The theme, for a component that shows or switches it; it re-renders when the theme changes here or in another tab */
/** The theme, for a component that shows or switches it; it re-renders when the theme changes here or in another tab. */
export function useTheme(): ThemeControl {
  const control = useContext(ThemeContext);
  if (!control) throw new Error('useTheme() needs <Sakuga> around the app');
  return control;
}
