import { afterEach, describe, expect, it } from 'vitest';
import { THEME_KEY } from './theme';

afterEach(() => { localStorage.clear(); document.documentElement.removeAttribute('data-theme'); });

describe('theme', () => {
  it('does nothing on import: the stored theme waits for <Sakuga>', async () => {
    localStorage.setItem(THEME_KEY, 'light');
    await import('./index');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });
});
