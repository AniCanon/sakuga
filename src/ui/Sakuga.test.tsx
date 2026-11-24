import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Icon } from './Icon/Icon';
import { Button } from './Button/Button';
import { DropZone } from './DropZone/DropZone';
import { Sakuga, useTheme } from './Sakuga';
import { Thumb } from './Thumb/Thumb';
import { VideoPlayer } from './VideoPlayer/VideoPlayer';
import { THEME_KEY } from './theme';

afterEach(() => { cleanup(); localStorage.clear(); document.documentElement.removeAttribute('data-theme'); vi.useRealTimers(); });

function Shows() {
  const { theme, setTheme } = useTheme();
  return <button type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme}</button>;
}

describe('Sakuga', () => {
  it('is dark until a person chooses', () => {
    render(<Sakuga icons=""><Shows /></Sakuga>);
    expect(screen.getByRole('button').textContent).toBe('dark');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('knows a stored choice on its first render and restores it before paint', () => {
    localStorage.setItem(THEME_KEY, 'light');
    const seen: string[] = [];
    function First() { seen.push(useTheme().theme); return null; }
    render(<Sakuga icons=""><First /></Sakuga>);
    expect(seen[0]).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('switches, keeps the choice, and re-renders what reads it', () => {
    render(<Sakuga icons=""><Shows /></Sakuga>);
    act(() => { screen.getByRole('button').click(); });
    expect(screen.getByRole('button').textContent).toBe('light');
    expect(localStorage.getItem(THEME_KEY)).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('follows a choice made in another tab', () => {
    render(<Sakuga icons=""><Shows /></Sakuga>);
    act(() => { window.dispatchEvent(new StorageEvent('storage', { key: THEME_KEY, newValue: 'light' })); });
    expect(screen.getByRole('button').textContent).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('stops following other tabs once unmounted', () => {
    const { unmount } = render(<Sakuga icons=""><Shows /></Sakuga>);
    unmount();
    window.dispatchEvent(new StorageEvent('storage', { key: THEME_KEY, newValue: 'light' }));
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('points every icon at the sprite it is given', () => {
    const { container } = render(<Sakuga icons="/assets/icons.svg"><Icon name="plus" /></Sakuga>);
    expect(container.querySelector('use')!.getAttribute('href')).toBe('/assets/icons.svg#plus');
  });

  it('makes the live region before any child renders, so a Loader that speaks as it mounts is heard', async () => {
    vi.resetModules();
    const fresh = await import('./Sakuga');
    document.querySelectorAll('[aria-live]').forEach((n) => n.remove());
    let ready = false;
    function Child() { ready = document.querySelectorAll('[aria-live="polite"]').length === 1; return null; }
    render(<fresh.Sakuga icons=""><Child /></fresh.Sakuga>);
    expect(ready).toBe(true);
  });

  it('says plainly when useTheme has no Sakuga around it', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Shows />)).toThrow('useTheme() needs <Sakuga> around the app');
  });

  it('every core part that waits draws the app\'s loader, and Sakuga\'s own without one', () => {
    vi.useFakeTimers();
    const Mark = ({ label }: { size?: number | string; label?: string }) => <i className="app-mark" aria-label={label} />;
    const parts = <>
      <Button busy>Save</Button>
      <DropZone state="busy" title="Reading the picture" />
      <VideoPlayer name="Clip" playing loading />
      <Thumb placeholder="Drawing the banner" drawing />
    </>;
    const { container, unmount } = render(<Sakuga icons="" loader={Mark}>{parts}</Sakuga>);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(container.querySelectorAll('.app-mark')).toHaveLength(4);
    expect(container.querySelector('.sk-load')).toBeNull();
    unmount();
    const plain = render(<Sakuga icons="">{parts}</Sakuga>);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(plain.container.querySelector('.app-mark')).toBeNull();
    vi.useRealTimers();
  });
});
