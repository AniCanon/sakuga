import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StoryScrubber, type StoryScrubberProps } from './StoryScrubber';

afterEach(cleanup);

const base: StoryScrubberProps = {
  events: [{ type: 'event', title: 'Arthur taken', inside: true, told: ['play'] }, { type: 'twist', inside: true, told: ['manga', 'play'], mark: true }, { type: 'revelation', told: ['shorts'] }],
  arcs: [{ name: 'Arc 1', count: 2, on: true }, { name: 'Arc 2', count: 1 }],
  handles: [{ at: 2, label: 'After Arthur taken' }],
  fill: [0, 2],
};

describe('StoryScrubber', () => {
  it('is a slider Tab reaches, named and read as the first handle’s label; read-only without onChange', () => {
    render(<StoryScrubber {...base} filter={false} />);
    const s = screen.getByRole('slider', { name: 'Show the world at a moment in the story' });
    expect(s.tabIndex).toBe(0);
    expect(s.getAttribute('aria-valuetext')).toBe('After Arthur taken');
    expect([s.getAttribute('aria-valuemin'), s.getAttribute('aria-valuemax'), s.getAttribute('aria-valuenow')]).toEqual(['0', '3', '2']);
    expect(s.getAttribute('aria-readonly')).toBe('true');
  });

  it('with a second handle it reads the place compared with it', () => {
    const { rerender } = render(<StoryScrubber {...base} handles={[{ at: 2, label: 'After Arthur taken' }, { at: 3, label: 'Now' }]} filter={false} />);
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('After Arthur taken, compared with Now');
    rerender(<StoryScrubber {...base} handles={[{ at: 2, label: 'After Arthur taken' }, { at: 3, label: 'Now' }]} valueText="Episode 2" filter={false} />);
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('Episode 2, compared with Now');
  });

  it('Page Up and Page Down move a tenth of the events, at least one', () => {
    const onChange = vi.fn();
    const many: StoryScrubberProps['events'] = Array.from({ length: 40 }, () => ({ type: 'event' }));
    const { rerender } = render(<StoryScrubber {...base} events={many} handles={[{ at: 20, label: 'Now' }]} fill={[0, 20]} onChange={onChange} filter={false} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'PageUp' });
    expect(onChange).toHaveBeenLastCalledWith(24);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'PageDown' });
    expect(onChange).toHaveBeenLastCalledWith(16);
    rerender(<StoryScrubber {...base} onChange={onChange} filter={false} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'PageDown' });
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it('valueText wins; with no handle it reads "After event n of N"', () => {
    const { rerender } = render(<StoryScrubber {...base} valueText="Now" filter={false} />);
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('Now');
    rerender(<StoryScrubber {...base} handles={[]} fill={[0, 3]} filter={false} />);
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('After event 3 of 3');
  });

  it('with onChange arrows move it an event, Home and End to either end', () => {
    const onChange = vi.fn();
    render(<StoryScrubber {...base} onChange={onChange} filter={false} />);
    const s = screen.getByRole('slider');
    expect(s.getAttribute('aria-readonly')).toBeNull();
    fireEvent.keyDown(s, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(3);
    fireEvent.keyDown(s, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith(1);
    fireEvent.keyDown(s, { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith(0);
    fireEvent.keyDown(s, { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith(3);
  });

  it('screen readers get the events in story order and the arcs as lists', () => {
    render(<StoryScrubber {...base} filter={false} />);
    expect(screen.getAllByRole('listitem').length).toBe(5);
    const ev = screen.getByRole('list', { name: 'Events in story order' });
    expect([...ev.children].map((l) => l.textContent)).toEqual([
      'Event: Arthur taken, told in Episode, in the moment shown',
      'Twist, told in Manga and Episode, in the moment shown, marked',
      'Revelation, told in Short',
    ]);
    expect([...screen.getByRole('list', { name: 'Arcs' }).children].map((l) => l.textContent)).toEqual(['Arc 1, 2 events, in the moment shown', 'Arc 2, 1 event']);
  });

  it('below it a group "Show events told by" holds filter buttons, pressed on the current one, that run onFilter', () => {
    const onFilter = vi.fn();
    render(<StoryScrubber {...base} filter="manga" onFilter={onFilter} />);
    const g = screen.getByRole('group', { name: 'Show events told by' });
    expect(g).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Manga' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'All' }).getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: 'Shorts' }));
    expect(onFilter).toHaveBeenLastCalledWith('shorts');
  });

  it('Not placed is one more column past a hairline, named with its count, and nothing at all when none waits', () => {
    const { container, rerender } = render(<StoryScrubber {...base} unplaced={{ state: 'none' }} filter={false} />);
    expect(container.querySelector('.sk-scrub2__unplaced')).toBeNull();
    rerender(<StoryScrubber {...base} filter={false} />);
    expect(container.querySelector('.sk-scrub2__unplaced')).toBeNull();
    rerender(<StoryScrubber {...base} unplaced={{ on: true, icon: 'manga' }} filter={false} />);
    expect(container.querySelector('.sk-scrub2__unplaced')!.className).toBe('sk-scrub2__unplaced is-in');
    expect(container.querySelector('.sk-scrub2__unplaced')!.textContent).toBe('Not placed, in the moment shown');
    expect(container.querySelector('.sk-scrub2__ucol .sk-scrub2__node.is-unplaced')).toBeTruthy();
    rerender(<StoryScrubber {...base} unplaced={{ count: 3 }} filter={false} />);
    expect(container.querySelector('.sk-scrub2__unplaced')!.className).toBe('sk-scrub2__unplaced is-out');
    expect(container.querySelector('.sk-scrub2__unplaced')!.textContent).toBe('Not placed · 3');
  });

  it('the handle names the moment; at the end its pill is marked', () => {
    const { container } = render(<StoryScrubber {...base} handles={[{ at: 1, label: 'After Arthur taken' }, { at: 3, label: 'Now' }]} filter={false} />);
    const pills = [...container.querySelectorAll<HTMLElement>('.sk-scrub2__pill')];
    expect(pills.map((p) => p.className)).toEqual(['sk-scrub2__pill', 'sk-scrub2__pill is-end']);
    expect(pills[1].style.left).toBe('100%');
  });
});

describe('StoryScrubber 1.2, a long story', () => {
  it('scrolls rather than squeezes: past the space, the track scrolls with Earlier and Later events at its ends, and a column is 36 px wide at least', () => {
    const width = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get() { return 200; } });
    try {
      const events = Array.from({ length: 20 }, () => ({ type: 'event' as const, inside: true }));
      const { container } = render(<StoryScrubber events={events} arcs={[]} handles={[{ at: 20, label: 'Now' }]} fill={[0, 20]} filter={false} />);
      expect(container.querySelector('.sk-scrub2__scroll')!.className).toContain('is-over');
      expect(screen.getByRole('button', { name: 'Earlier events' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Later events' })).toBeTruthy();
      expect((container.querySelector('.sk-scrub2__track') as HTMLElement).style.minWidth).toBe('calc(20 * var(--scrub-col-width))');
    } finally {
      if (width) Object.defineProperty(HTMLElement.prototype, 'clientWidth', width);
    }
  });

  it('while the events fit, nothing scrolls and no chevron is drawn', () => {
    const width = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get() { return 800; } });
    try {
      const { container } = render(<StoryScrubber events={[{ type: 'event' }, { type: 'twist' }]} arcs={[]} handles={[{ at: 2, label: 'Now' }]} fill={[0, 2]} filter={false} />);
      expect(container.querySelector('.sk-scrub2__scroll')!.className).not.toContain('is-over');
      expect(screen.queryByRole('button', { name: 'Earlier events' })).toBeNull();
    } finally {
      if (width) Object.defineProperty(HTMLElement.prototype, 'clientWidth', width);
    }
  });
});

describe('StoryScrubber 1.4', () => {
  it('with onChange, a press on an event moves the moment through it', () => {
    const onChange = vi.fn();
    const { container } = render(<StoryScrubber {...base} onChange={onChange} filter={false} />);
    const scroll = container.querySelector('.sk-scrub2__scroll')!;
    expect(scroll.className).toContain('is-live');
    const lane = container.querySelector('.sk-scrub2__lane')!;
    lane.getBoundingClientRect = () => ({ left: 0, width: 300, top: 0, right: 300, bottom: 20, height: 20, x: 0, y: 0, toJSON: () => ({}) });
    /* jsdom has no PointerEvent: a MouseEvent carries the pointer's place under the same names */
    const at = (type: string) => new MouseEvent(type, { bubbles: true, clientX: 150, clientY: 10, button: 0 });
    fireEvent(scroll, at('pointerdown'));
    fireEvent(scroll, at('pointerup'));
    expect(onChange).toHaveBeenCalledWith(2);
  });
});

describe('StoryScrubber told marks with labels', () => {
  it('a mark with its label is said and shown by it ("told in Episode 2"), a bare icon by its kind word', () => {
    const { container } = render(<StoryScrubber {...base} filter={false} events={[{ type: 'event', title: 'Arthur taken', told: [{ icon: 'play', label: 'Episode 2' }, 'shorts'] }]} />);
    expect(screen.getByText(/Arthur taken, told in Episode 2 and Short/)).toBeTruthy();
    expect(container.querySelector('.sk-scrub2__mark')!.getAttribute('title')).toBe('Episode 2');
  });

  it('events at the same moment share one column: every mark on its node (two, then +n), all their told marks, named together', () => {
    const together: StoryScrubberProps = {
      ...base,
      events: [
        { type: 'event', title: 'The call', inside: true, told: ['play'], with: [{ type: 'twist', title: "Kiko's offer", told: ['manga', 'play'] }, { type: 'clue', title: 'The watch' }] },
        { type: 'revelation', told: ['shorts'] },
      ],
      arcs: [{ name: 'Arc 1', count: 2 }],
    };
    const { container } = render(<StoryScrubber {...together} filter={false} />);
    const cols = container.querySelectorAll('.sk-scrub2__col');
    expect(cols).toHaveLength(2);
    expect(cols[0].getAttribute('title')).toBe("The call, at the same time as Kiko's offer and The watch");
    const node = cols[0].querySelector('.sk-scrub2__node')!;
    expect(node.classList.contains('is-together')).toBe(true);
    expect(node.querySelector('.sk-scrub2__more')!.textContent).toBe('+1');
    expect(cols[0].querySelectorAll('.sk-scrub2__mark')).toHaveLength(2);
    expect(cols[1].querySelector('.sk-scrub2__node')!.classList.contains('is-together')).toBe(false);
    expect(screen.getByRole('list', { name: 'Events in story order' }).firstElementChild!.textContent).toContain("at the same time as Kiko's offer and The watch");
  });
});
