import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MonitorBar } from './MonitorBar';

afterEach(cleanup);

describe('MonitorBar', () => {
  it('a row with no role of its own: transport, the timecode, the edit buttons, then the end, the separator hidden', () => {
    const { container } = render(
      <MonitorBar timecode="2:41 + 04f">
        <button type="button">Split</button>
        <span slot="end"><button type="button">Fit</button></span>
        <span slot="transport"><button type="button">Play</button></span>
        <button type="button">Trim</button>
      </MonitorBar>,
    );
    const root = container.firstElementChild!;
    expect(root.className).toBe('sk-monitorbar');
    expect(root.getAttribute('role')).toBeNull();
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Play', 'Split', 'Trim', 'Fit']);
    expect(root.querySelector('.sk-monitorbar__tc')!.textContent).toBe('2:41 + 04f');
    expect(root.querySelector('.sk-monitorbar__sep')!.getAttribute('aria-hidden')).toBe('true');
    expect(root.querySelector('.sk-editor__fill')).toBeTruthy();
  });

  it('without a timecode it shows none', () => {
    const { container } = render(<MonitorBar />);
    expect(container.querySelector('.sk-monitorbar__tc')).toBeNull();
  });
});
