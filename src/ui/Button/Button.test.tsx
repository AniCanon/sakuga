import { readFileSync } from 'node:fs';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState, type CSSProperties } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { liveRegion } from '../../internal/live';

/* jsdom joins inline parts without a browser's spaces, so names here allow either; e2e/names.spec.ts pins them exactly */
import { Button } from './Button';

afterEach(() => { cleanup(); vi.useRealTimers(); });

const css = readFileSync('src/ui/Button/Button.css', 'utf8');

describe('Button', () => {
  it('is a native button that does not submit a form unless asked', () => {
    render(<Button>Done</Button>);
    const b = screen.getByRole('button', { name: 'Done' });
    expect(b.getAttribute('type')).toBe('button');
    expect(b.className).toBe('sk-btn sk-btn--primary sk-btn--md');
  });

  it('renders a link when given href', () => {
    render(<Button href="/watch" variant="secondary">More info</Button>);
    expect(screen.getByRole('link', { name: 'More info' }).getAttribute('href')).toBe('/watch');
  });

  it('reads a trailing value after the label, with its label', () => {
    render(<Button trailing={{ value: '$4', label: 'a month' }}>Subscribe</Button>);
    expect(screen.getByRole('button', { name: /^Subscribe ?\$4 a month$/ })).toBeTruthy();
  });

  it('hides its icons from a screen reader', () => {
    render(<Button icon="plus" iconEnd="chevron-right">Add</Button>);
    const icons = screen.getByRole('button').querySelectorAll('svg.sk-icon');
    expect(icons).toHaveLength(2);
    icons.forEach((i) => expect(i.getAttribute('aria-hidden')).toBe('true'));
  });
  it('is a disabled button, out of the tab order, with href and disabled: a link cannot be disabled', () => {
    render(<Button href="/watch" disabled>Play</Button>);
    expect(screen.queryByRole('link')).toBeNull();
    const b = screen.getByRole('button', { name: 'Play' }) as HTMLButtonElement;
    expect(b.disabled).toBe(true);
    expect(b.hasAttribute('href')).toBe(false);
    expect(b.getAttribute('type')).toBe('button');
  });

  it('keeps an edge in forced colours, GrayText when disabled', () => {
    expect(css).toContain('@media (forced-colors:active){.sk-btn{border:var(--button-forced-edge-width) solid ButtonText}}');
    expect(css).toContain('@media (forced-colors:active){.sk-btn:disabled{color:GrayText;border-color:GrayText}}');
  });

  describe('busy', () => {
    /* jsdom loads no stylesheet: the delay is set on the button as the token would set it */
    const delay = { '--button-busy-delay': '560ms' } as CSSProperties;
    function Plan({ onPlan }: { onPlan: () => void }) {
      const [busy, setBusy] = useState(false);
      return (
        <>
          <Button icon="forward" style={delay} busy={busy} busyLabel="Planning the shoot…" doneLabel="Shoot planned" onClick={() => { onPlan(); setBusy(true); }}>
            Plan the shoot
          </Button>
          <button type="button" onClick={() => setBusy(false)}>answer</button>
        </>
      );
    }

    it('keeps its tab stop, is aria-disabled, and drops a second press', () => {
      vi.useFakeTimers();
      const onPlan = vi.fn();
      render(<Plan onPlan={onPlan} />);
      const b = screen.getByRole('button', { name: 'Plan the shoot' });
      fireEvent.click(b);
      fireEvent.click(b);
      expect(onPlan).toHaveBeenCalledTimes(1);
      expect(b.hasAttribute('disabled')).toBe(false);
      expect(b.getAttribute('aria-disabled')).toBe('true');
      expect(b.className).toContain('is-busy');
    });

    it('changes nothing before the delay, then shows the loader and busyLabel, and says both labels once', () => {
      vi.useFakeTimers();
      render(<Plan onPlan={() => {}} />);
      const b = screen.getByRole('button', { name: 'Plan the shoot' });
      fireEvent.click(b);
      act(() => { vi.advanceTimersByTime(500); });
      expect(b.textContent).toBe('Plan the shoot');
      expect(b.querySelector('.sk-btn__loader')).toBeNull();
      act(() => { vi.advanceTimersByTime(100); });
      expect(b.textContent).toBe('Planning the shoot…');
      expect(b.querySelector('.sk-btn__loader')?.getAttribute('aria-hidden')).toBe('true');
      act(() => { vi.advanceTimersByTime(100); });
      expect(liveRegion()!.textContent).toBe('Planning the shoot…');
      fireEvent.click(screen.getByRole('button', { name: 'answer' }));
      act(() => { vi.advanceTimersByTime(100); });
      expect(liveRegion()!.textContent).toBe('Shoot planned');
      expect(b.textContent).toBe('Plan the shoot');
      expect(b.getAttribute('aria-disabled')).toBeNull();
    });

    it('says nothing for a wait shorter than the delay', () => {
      vi.useFakeTimers();
      render(<Plan onPlan={() => {}} />);
      const before = liveRegion()?.textContent ?? '';
      fireEvent.click(screen.getByRole('button', { name: 'Plan the shoot' }));
      act(() => { vi.advanceTimersByTime(200); });
      fireEvent.click(screen.getByRole('button', { name: 'answer' }));
      act(() => { vi.advanceTimersByTime(1000); });
      expect(liveRegion()?.textContent ?? '').toBe(before);
    });

    it('without busyLabel keeps its words and is heard as working', () => {
      vi.useFakeTimers();
      render(<Button style={delay} busy>Save</Button>);
      act(() => { vi.advanceTimersByTime(700); });
      expect(screen.getByRole('button').textContent).toBe('Save');
      expect(liveRegion()!.textContent).toBe('Save, working');
    });

    it('is never busy while disabled, and its CSS keeps the press and hover still', () => {
      render(<Button disabled busy>Save</Button>);
      expect(screen.getByRole('button').className).not.toContain('is-busy');
      expect(css).toContain('.sk-btn.is-busy{cursor:progress}');
      expect(css).toContain('.sk-btn.is-busy:active{transform:none}');
    });
  });
});
