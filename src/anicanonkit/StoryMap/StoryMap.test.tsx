import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { StoryMap, StoryMapNode, type StoryMapProps } from './StoryMap';

afterEach(cleanup);

/* jsdom has no PointerEvent: a mouse event with an id stands in, so a press carries where it was */
beforeAll(() => {
  class PointerEventLike extends MouseEvent {
    pointerId: number;
    constructor(type: string, init: PointerEventInit = {}) { super(type, init); this.pointerId = init.pointerId ?? 0; }
  }
  if (!('PointerEvent' in window)) Object.assign(window, { PointerEvent: PointerEventLike });
  if (!HTMLElement.prototype.setPointerCapture) HTMLElement.prototype.setPointerCapture = () => {};
});

const data: Pick<StoryMapProps, 'hubs' | 'events' | 'edges' | 'arcs'> = {
  hubs: [
    { id: 'a', kind: 'character', x: 120, y: 140, size: 56, initial: 'S', label: 'Smith', state: 'focus' },
    { id: 'b', kind: 'place', x: 620, y: 140, label: 'Sé station', badge: { label: 'Burning', variant: 'alert', icon: 'trait-fierce' } },
    { id: 'c', kind: 'character', x: 120, y: 40, image: 'k.jpg', label: 'Kiko', state: 'dim' },
  ],
  events: [
    { id: 'e', x: 360, y: 40, type: 'event', label: 'Fire at Sé', state: 'focus' },
    { id: 'f', x: 360, y: 160, type: 'twist', label: 'The doors close', state: 'proposed', unplaced: true },
    { id: 'g', x: 360, y: 260, type: 'clue', label: 'A ticket', state: 'new', badge: { label: 'New', variant: 'new' } },
  ],
  edges: [{ x1: 360, y1: 40, x2: 120, y2: 140, tone: 'accent' }, { x1: 360, y1: 40, x2: 620, y2: 140, dim: true, dashed: true }],
  arcs: [{ x1: 0, y1: 0, x2: 100, y2: 100, dashed: true, bend: 10 }],
};

describe('StoryMap', () => {
  it('is a group named by label (default), the drawing hidden', () => {
    const { container, rerender } = render(<StoryMap {...data} />);
    const g = screen.getByRole('group', { name: 'Story map: characters and places as hubs, events between them' });
    expect(g.className).toBe('sk-map');
    const svg = container.querySelector('svg.sk-map__lines')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('viewBox')).toBe('0 0 812 650');
    const edges = container.querySelectorAll('path.sk-map__edge');
    expect(edges[0].getAttribute('class')).toBe('sk-map__edge is-accent');
    expect(edges[0].getAttribute('d')).toBe('M360 40 C240 40 240 140 120 140');
    expect(edges[1].getAttribute('class')).toBe('sk-map__edge is-dim is-dashed');
    expect(container.querySelector('path.sk-map__arc')!.getAttribute('d')).toBe('M0 0 Q60 10 100 100');
    rerender(<StoryMap {...data} label="Ep 3 map" width={520} height={300} />);
    expect(screen.getByRole('group', { name: 'Ep 3 map' }).style.height).toBe('300px');
  });

  it('each hub and event is read with what the drawing shows, its name one line and its state on the second', () => {
    const { container } = render(<StoryMap {...data} />);
    const [a, b, c] = [...container.querySelectorAll('.sk-map__hub')];
    expect(a.textContent).toBe('SmithCharacter');
    expect(a.getAttribute('aria-current')).toBe('true');
    expect(a.className).toBe('sk-map__node sk-map__hub sk-map__hub--character is-focus');
    expect(a.querySelector('b')!.getAttribute('title')).toBe('Smith');
    expect(b.textContent).toBe('Sé stationBurningPlace');
    expect(b.querySelector('.sk-map__meta > .sk-badge')!.textContent).toBe('Burning');
    expect(c.textContent).toBe('KikoCharacter, not at this moment');
    expect(c.className).toBe('sk-map__node sk-map__hub sk-map__hub--character is-dim');
    const [e, f, g] = [...container.querySelectorAll('.sk-map__event')];
    expect(e.textContent).toBe('Event: Fire at Sé');
    expect(f.textContent).toBe('Twist: The doors closeTwist, proposed, not placed');
    expect(f.className).toBe('sk-map__node sk-map__event is-proposed is-unplaced');
    expect(g.textContent).toBe('Clue: A ticketNewClue, new');
  });

  it('with no picture yet a character shows their age figure and a place AniCanon\'s mark, never an initial or an empty box', () => {
    const { container } = render(<StoryMap {...data} hubs={[...data.hubs, { id: 'd', kind: 'character', x: 0, y: 0, label: 'Ada', figure: 'age-child', muted: true, sub: 'Heros' }]} />);
    const [a, b, , d] = [...container.querySelectorAll('.sk-map__hub')];
    expect(a.querySelector('.sk-map__face--empty .sk-icon')).toBeTruthy();
    expect(a.textContent).not.toContain('S' + 'Smith');
    expect(b.querySelector('.sk-map__art--empty svg.sk-map__mark')).toBeTruthy();
    expect(d.className).toContain('is-muted');
    expect(d.textContent).toBe('AdaHeros');
  });

  it('handles sit only where a drawn link lands; StoryMapNode without ports draws the 2.0 handles', () => {
    const sides = (el: Element) => [...el.querySelectorAll('.sk-map__handle')].map((i) => i.className);
    const { container, rerender } = render(<StoryMap {...data} links={[{ from: 'a', to: 'e' }, { from: 'e', to: 'b' }]} />);
    const [a, b, c] = [...container.querySelectorAll('.sk-map__hub')];
    expect(sides(a)).toEqual(['sk-map__handle is-right']);
    expect(sides(b)).toEqual(['sk-map__handle is-left']);
    expect(sides(c)).toEqual([]);
    expect(sides(container.querySelector('.sk-map__event')!)).toEqual(['sk-map__handle is-left', 'sk-map__handle is-right']);
    rerender(<StoryMap {...data} flow="down" links={[{ from: 'a', to: 'e' }, { from: 'e', to: 'b' }]} />);
    // Drawn top to bottom, a handle stands on the side its link meets: Fire at Sé is above Smith and Sé station, so both leave its foot
    expect(sides(container.querySelector('.sk-map__event')!)).toEqual(['sk-map__handle is-bottom']);
    expect(sides(container.querySelectorAll('.sk-map__hub')[0])).toEqual(['sk-map__handle is-top']);
    cleanup();
    const part = render(<StoryMapNode node={{ hub: data.hubs[0] }} />).container;
    expect(sides(part.querySelector('.sk-map__hub')!)).toEqual(['sk-map__handle is-right']);
  });

  it('links join ids and arcs are groups named in their corner', () => {
    const { container } = render(<StoryMap {...data} edges={[]} flow="down" links={[{ from: 'a', to: 'e', quiet: true }, { from: 'e', to: 'zz' }]}
      groups={[{ label: 'Arc 1', x0: 0, y0: 0, x1: 300, y1: 200 }, { label: 'Not placed', x0: 0, y0: 220, x1: 300, y1: 300, dashed: true }]} />);
    const links = container.querySelectorAll('path.sk-map__edge');
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('class')).toBe('sk-map__edge is-quiet');
    expect(links[0].getAttribute('d')).toBe('M120 112 C120 76 360 104 360 68');
    const groups = [...container.querySelectorAll<HTMLElement>('.sk-map__group')];
    expect(groups.map((g) => [g.className, g.textContent, g.style.width])).toEqual([['sk-map__group', 'Arc 1', '300px'], ['sk-map__group is-dashed', 'Not placed', '300px']]);
  });

  it('hubs and events are one Tab stop the arrows move through, starting on the focus', () => {
    const { container } = render(<StoryMap {...data} />);
    const items = [...container.querySelectorAll<HTMLElement>('[data-map-item]')];
    expect(items.map((i) => i.tabIndex)).toEqual([0, -1, -1, -1, -1, -1]);
    items[0].focus();
    fireEvent.keyDown(items[0], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(items[1]);
    fireEvent.keyDown(items[1], { key: 'End' });
    expect(document.activeElement).toBe(items[5]);
    expect(items.map((i) => i.tabIndex)).toEqual([-1, -1, -1, -1, -1, 0]);
    expect(screen.queryByRole('button', { name: /Smith/ })).toBeNull();
    /* Down and Right go on, Up and Left back, wrapping at either end; Home goes to the first */
    fireEvent.keyDown(items[5], { key: 'ArrowDown' });
    expect(document.activeElement).toBe(items[0]);
    fireEvent.keyDown(items[0], { key: 'ArrowUp' });
    expect(document.activeElement).toBe(items[5]);
    fireEvent.keyDown(items[5], { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(items[4]);
    fireEvent.keyDown(items[4], { key: 'Home' });
    expect(document.activeElement).toBe(items[0]);
    fireEvent.keyDown(items[0], { key: 'ArrowDown' });
    expect(document.activeElement).toBe(items[1]);
  });

  it('with onSelect each is a button named the same way, run by click or Enter', () => {
    const onSelect = vi.fn();
    render(<StoryMap {...data} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sé station, Burning' }));
    expect(onSelect).toHaveBeenLastCalledWith('b', 'hub');
    fireEvent.keyDown(screen.getByRole('button', { name: 'Twist: The doors close, proposed, not placed' }), { key: 'Enter' });
    expect(onSelect).toHaveBeenLastCalledWith('f', 'event');
    expect(screen.getByRole('button', { name: 'Clue: A ticket, New, new' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Kiko, not at this moment' })).toBeTruthy();
  });

  it('then Tab reaches the chip ("Remove Smith", a removable chip, not a pressed toggle), the zoom group, Fit the map and the key; tools and the key can be left out', () => {
    const onZoomIn = vi.fn(), onFit = vi.fn(), onChipRemove = vi.fn();
    const { container, rerender } = render(<StoryMap {...data} chip="Smith" onZoomIn={onZoomIn} onFit={onFit} onChipRemove={onChipRemove} />);
    const chip = screen.getByRole('button', { name: 'Remove Smith' });
    expect(chip.className).toBe('sk-chip sk-chip--soft is-removable');
    expect(chip.hasAttribute('aria-pressed')).toBe(false);
    fireEvent.click(chip);
    expect(screen.getByRole('group', { name: 'Zoom' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fit the map' }));
    expect([onChipRemove, onZoomIn, onFit].map((f) => f.mock.calls.length)).toEqual([1, 1, 1]);
    const key = container.querySelector<HTMLElement>('.sk-map__key')!, keyButton = screen.getByRole('button', { name: 'Key' });
    expect(key.hidden).toBe(true);
    expect(keyButton.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(keyButton);
    expect(key.hidden).toBe(false);
    expect(keyButton.getAttribute('aria-expanded')).toBe('true');
    expect(key.textContent).toBe('EventTwistRevelationClueGoalHubs: cast and places');
    rerender(<StoryMap {...data} tools={false} legend={false} />);
    expect(container.querySelector('.sk-map__key')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Zoom in' })).toBeNull();
  });

  it('draws its lines, groups, hubs and events on a canvas it moves; the chip, tools and key stay on the box', () => {
    const { container } = render(<StoryMap {...data} chip="Smith" />);
    const map = container.querySelector('.sk-map')!, canvas = map.querySelector(':scope > .sk-map__canvas') as HTMLElement;
    expect(canvas.style.width).toBe('812px');
    expect(canvas.style.transform).toMatch(/^translate\(.*\) scale\(1\)$/);
    expect(canvas.querySelector('svg.sk-map__lines pattern#sk-map-dots')).toBeTruthy();
    expect(canvas.querySelectorAll('.sk-map__hub').length).toBe(map.querySelectorAll('.sk-map__hub').length);
    for (const c of ['.sk-map__key', '.sk-map__chip', '.sk-map__tools']) expect(map.querySelector(':scope > ' + c)).toBeTruthy();
  });

  it('interactive: a node dragged lands where it was dropped and is never also pressed; Shift and an arrow moves the one in focus', () => {
    const onMove = vi.fn(), onSelect = vi.fn();
    const { container } = render(<StoryMap {...data} interactive onMove={onMove} onSelect={onSelect} />);
    const map = container.querySelector('.sk-map')!;
    expect(map.className).toBe('sk-map is-movable');
    const smith = screen.getByRole('button', { name: 'Smith' });
    expect(smith.getAttribute('aria-roledescription')).toBe('movable');
    fireEvent.pointerDown(smith, { button: 0, pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(smith, { pointerId: 1, clientX: 130, clientY: 110 });
    expect(smith.className).toContain('is-dragging');
    fireEvent.pointerUp(smith, { pointerId: 1, clientX: 130, clientY: 110 });
    expect(onMove).toHaveBeenLastCalledWith('a', 150, 150);
    expect(smith.style.left).toBe('150px');
    fireEvent.click(smith);
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.click(smith);
    expect(onSelect).toHaveBeenLastCalledWith('a', 'hub');
    fireEvent.keyDown(smith, { key: 'ArrowRight', shiftKey: true });
    expect(onMove).toHaveBeenLastCalledWith('a', 162, 150);
  });
});

describe('StoryMap 2.10', () => {
  it('cards that overlap are pushed apart where the map opens, and an edge end on a card follows it', () => {
    const { container } = render(<StoryMap hubs={[{ id: 'a', kind: 'character', x: 300, y: 300, label: 'Smith' }]} events={[{ id: 'e', x: 310, y: 310, type: 'event', label: 'Fire' }]}
      edges={[{ x1: 310, y1: 310, x2: 300, y2: 300 }]} />);
    const hub = container.querySelector<HTMLElement>('.sk-map__hub')!, ev = container.querySelector<HTMLElement>('.sk-map__event')!;
    const ya = parseFloat(hub.style.top), ye = parseFloat(ev.style.top);
    expect(Math.abs(ya - ye)).toBeGreaterThanOrEqual(56 + 12);
    expect(container.querySelector('path.sk-map__edge')!.getAttribute('d')).toMatch(new RegExp('^M310 ' + ye + ' .* 300 ' + ya + '$'));
  });
});

describe('StoryMap 2.2', () => {
  function pane(w: number, h: number) {
    const cw = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth'), ch = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get() { return w; } });
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get() { return h; } });
    return () => { if (cw) Object.defineProperty(HTMLElement.prototype, 'clientWidth', cw); if (ch) Object.defineProperty(HTMLElement.prototype, 'clientHeight', ch); };
  }

  it('frame opens on the nodes it names at zoom 1', () => {
    const restore = pane(400, 300);
    try {
      const { container } = render(<StoryMap width={2000} height={600} hubs={[{ id: 'a', kind: 'character', x: 100, y: 100, label: 'Mio' }]} events={[{ id: 'e', x: 1500, y: 300, type: 'event', label: 'Late' }]} frame={['e']} />);
      const t = (container.querySelector('.sk-map__canvas') as HTMLElement).style.transform;
      expect(t).toContain('scale(1)');
      expect(t).toMatch(/translate\(-1/);
    } finally { restore(); }
  });

  it('held: a node a drawn link runs to, out of view, is named at the edge; pressing it brings it into view', () => {
    const restore = pane(400, 300);
    try {
      const { container } = render(<StoryMap width={2000} height={600} hubs={[{ id: 'a', kind: 'character', x: 1700, y: 300, label: 'Mio' }]}
        events={[{ id: 'e', x: 200, y: 150, type: 'event', label: 'Here' }]} links={[{ from: 'a', to: 'e' }]} view={{ x: 0, y: 0, zoom: 1 }} held />);
      const held = screen.getByRole('button', { name: 'Show Mio' });
      expect(held.className).toContain('is-right');
      fireEvent.click(held);
      expect((container.querySelector('.sk-map__canvas') as HTMLElement).style.transform).toContain('translate(-1500px,-150px)');
    } finally { restore(); }
  });

  it('a link or arc with a warning is drawn in amber over the rest, and each node it touches reads "a link with a warning"', () => {
    const events: StoryMapProps['events'] = [
      { id: 'storm', x: 120, y: 100, type: 'event', label: 'Storm' },
      { id: 'dark', x: 120, y: 200, type: 'event', label: 'The lighthouse goes dark' },
      { id: 'lamp', x: 120, y: 300, type: 'event', label: 'Mio lights the lamp' },
    ];
    const { container } = render(
      <StoryMap hubs={[]} events={events} onSelect={() => {}} links={[]} arcs={[{ from: 'dark', to: 'storm', tone: 'warning' }, { from: 'storm', to: 'lamp' }]} />,
    );
    const arcs = [...container.querySelectorAll('path.sk-map__arc')];
    // Drawn last, so on top, with its own arrowhead
    expect(arcs[arcs.length - 1].getAttribute('class')).toContain('is-warning');
    expect(arcs[arcs.length - 1].getAttribute('marker-end')).toBe('url(#sk-map-arrow-warning)');
    expect(screen.getByRole('button', { name: /The lighthouse goes dark.*a link with a warning/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Storm.*a link with a warning/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Event: Mio lights the lamp' })).toBeTruthy();
  });

  it('an event\'s lead comes first on its quiet line, in its own part that is never cut, and is read in its name', () => {
    const { container } = render(
      <StoryMap hubs={[]} onSelect={() => {}} events={[{ id: 'k', x: 120, y: 100, type: 'revelation', label: 'Ken walks out', lead: 'Event 21', sub: 'Short · video' }]} />,
    );
    const line = container.querySelector('.sk-map__event small.is-led')!;
    expect(line.querySelector('.sk-map__lead')!.textContent).toBe('Event 21\u00a0·\u00a0');
    expect(line.querySelector('.sk-map__rest')!.textContent).toBe('Revelation · Short · video');
    expect(screen.getByRole('button', { name: 'Revelation: Ken walks out, Event 21, Short · video' })).toBeTruthy();
  });

  it('StoryMapNode reads "a link with a warning" when the page says a warning line touches it', () => {
    render(<StoryMapNode node={{ event: { id: 'e', x: 0, y: 0, type: 'event', label: 'Fire' } }} warned onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: 'Event: Fire, a link with a warning' })).toBeTruthy();
  });
});

