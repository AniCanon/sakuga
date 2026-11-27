import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { announce, liveRegion } from './live';

describe('the live region', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('says a message, then clears it 7 seconds later so a reader never comes on a stale one', () => {
    announce('Cover chosen');
    const box = liveRegion()!;
    vi.advanceTimersByTime(60);
    expect(box.textContent).toBe('Cover chosen');
    vi.advanceTimersByTime(6999);
    expect(box.textContent).toBe('Cover chosen');
    vi.advanceTimersByTime(1);
    expect(box.textContent).toBe('');
  });

  it('a new message keeps its own 7 seconds, not the time left on the one before', () => {
    announce('First');
    vi.advanceTimersByTime(5000);
    announce('Second');
    vi.advanceTimersByTime(60 + 6000);
    expect(liveRegion()!.textContent).toBe('Second');
    vi.advanceTimersByTime(1000);
    expect(liveRegion()!.textContent).toBe('');
  });

  it('clears at once when the page changes language, and says nothing for it', async () => {
    announce('Scene unlinked');
    vi.advanceTimersByTime(60);
    expect(liveRegion()!.textContent).toBe('Scene unlinked');
    document.documentElement.setAttribute('lang', 'pt-BR');
    await vi.waitFor(() => expect(liveRegion()!.textContent).toBe(''));
    vi.advanceTimersByTime(8000);
    expect(liveRegion()!.textContent).toBe('');
    // The same words, said again after the clear, are said: the clear forgot them
    announce('Scene unlinked');
    vi.advanceTimersByTime(60);
    expect(liveRegion()!.textContent).toBe('Scene unlinked');
  });
});
