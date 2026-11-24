import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StoryMapHeldNames } from './StoryMap';
import { storyMapView, type StoryMapShape } from './view';

afterEach(cleanup);

/* 24 events in six columns of four, two characters above, a place below */
const events = Array.from({ length: 24 }, (_, i) => ({ id: 'e' + i, x: 118 + Math.floor(i / 4) * 260, y: 200 + (i % 4) * 76, type: 'event' as const, label: 'Event ' + i }));
const map = (sel?: string): StoryMapShape => ({
  hubs: [{ id: 'mio', kind: 'character', x: 118, y: 40, label: 'Mio', state: sel === 'mio' ? 'focus' : undefined }, { id: 'ken', kind: 'character', x: 1418, y: 40, label: 'Ken' },
    { id: 'harbor', kind: 'place', x: 700, y: 600, label: 'Low Harbor' }],
  events,
  links: [{ from: 'mio', to: 'e0' }, { from: 'mio', to: 'e23' }, { from: 'e23', to: 'harbor' }, { from: 'ken', to: 'e23' }],
});
const size = { w: 812, h: 580 };

describe('storyMapView', () => {
  it('fit shows all of a map that reads at 0.8; a bigger one stops at 0.8 on the moment’s stretch', () => {
    const small = { hubs: [], events: events.slice(0, 4) };
    expect(storyMapView.fit(small, size).k).toBeGreaterThanOrEqual(0.8);
    const stretch = ['e20', 'e21', 'e22', 'e23'];
    const v = storyMapView.fit(map(), size, { frame: stretch });
    expect(v).toEqual(storyMapView.frame(map(), stretch, size, { frame: stretch }, 1));
  });

  it('focus takes the selection and every event a drawn link joins to it, never below 0.8, the selection kept whole', () => {
    const v = storyMapView.focus(map('mio'), size, { chip: true })!;
    expect(v.k).toBeGreaterThanOrEqual(0.8);
    const x0 = (118 - 92) * v.k + v.x, y0 = (40 - 28) * v.k + v.y;
    expect(x0).toBeGreaterThanOrEqual(72 - 0.5);
    expect(y0).toBeGreaterThanOrEqual(64 - 0.5);
    expect(storyMapView.focus(map(), size)).toBeNull();
  });

  it('held: one name per edge; several out of view the same way are one label, "N more"', () => {
    const view = { x: -500, y: 0, k: 1 };
    const held = storyMapView.held(map(), view, size, { overview: false }, (n) => n + ' more');
    for (const side of ['left', 'right', 'up', 'down']) expect(held.filter((h) => h.key === side).length).toBeLessThanOrEqual(1);
    const named = held.flatMap((h) => h.names);
    expect(new Set(named).size).toBe(named.length);
  });
  it('held: a name on the right edge is never held below the chip\'s row, so it finds the clear place above a column of cards', () => {
    const column = Array.from({ length: 7 }, (_, i) => ({ id: 'c' + i, type: 'event' as const, label: 'Event ' + i, x: 716, y: 90 + i * 60 }));
    const m: StoryMapShape = {
      hubs: [{ id: 'h', kind: 'character', label: 'Mio', x: 100, y: 300 }],
      events: [...column, { id: 'far', type: 'event', label: 'Far', x: 1500, y: 300 }],
      links: [{ from: 'h', to: 'far' }],
    };
    const size = { w: 820, h: 524 };
    const [held] = storyMapView.held(m, { x: 0, y: 0, k: 1 }, size, { overview: false, chip: true });
    expect(held.direction).toBe('right');
    const w = held.name.length * 7.5 + 44, top = held.gy === '0%' ? held.y : held.gy === '-100%' ? held.y - 32 : held.y - 16;
    const box = { l: held.x - w, t: top, r: held.x, b: top + 32 };
    for (const c of column) expect(box.t < c.y + 28 && c.y - 28 < box.b && box.l < c.x + 102 && c.x - 102 < box.r).toBe(false);
  });
  it('route: a hub with five or more shown links to events below runs them as a trunk, a bus and a branch into each card\'s left side', () => {
    const events = Array.from({ length: 6 }, (_, i) => ({ id: 'e' + i, type: 'event' as const, label: 'Event ' + i, x: 300 + (i % 2) * 260, y: 300 + Math.floor(i / 2) * 80 }));
    const m: StoryMapShape = {
      hubs: [{ id: 'mio', kind: 'character', label: 'Mio', x: 400, y: 80 }, { id: 'sen', kind: 'character', label: 'Sen', x: 700, y: 80 }],
      events,
      links: [...events.map((e) => ({ from: 'mio', to: e.id })), { from: 'sen', to: 'e1' }, { from: 'mio', to: 'e2', quiet: true }],
    };
    const routes = storyMapView.route(m);
    expect(routes).toHaveLength(8);
    // Mio's six run as a tree: out of its foot, into each card's left side, all down the same trunk
    for (const r of routes.slice(0, 6)) {
      expect(r.out).toBe('bottom');
      expect(r.into).toBe('left');
      expect(r.d.startsWith('M400 108')).toBe(true);
    }
    // Branches end on the card's left edge, level with its middle
    expect(routes[0].d.endsWith('L198 300')).toBe(true);
    // Sen's one link and a quiet one keep their curves
    expect(routes[6]).toMatchObject({ out: 'bottom', into: 'top' });
    expect(routes[6].d).toContain(' C');
    expect(routes[7].d).toContain(' C');
  });
  it('held: a name keeps clear of a frame\'s label as it does a card', () => {
    const m: StoryMapShape = {
      hubs: [{ id: 'h', kind: 'character', label: 'Mio', x: 100, y: 300 }],
      events: [{ id: 'far', type: 'event', label: 'Far', x: 1500, y: 300 }],
      links: [{ from: 'h', to: 'far' }],
      groups: [{ label: 'Events 19–22', x0: 700, y0: 290, x1: 818, y1: 480 }],
    };
    const [held] = storyMapView.held(m, { x: 0, y: 0, k: 1 }, { w: 820, h: 524 }, { overview: false });
    const w = held.name.length * 7.5 + 44, top = held.gy === '0%' ? held.y : held.gy === '-100%' ? held.y - 32 : held.y - 16;
    const label = { l: 700, t: 290, r: 700 + 'Events 19–22'.length * 6.5 + 32, b: 322 };
    expect(top < label.b && label.t < top + 32 && held.x - w < label.r && label.l < held.x).toBe(false);
  });
  it('held: two held names never cover each other, as near the top-left corner', () => {
    const m: StoryMapShape = {
      hubs: [{ id: 'a', kind: 'character', label: 'Mio', x: 400, y: 300 }],
      events: [
        { id: 'l', type: 'event', label: 'Lower Harbour Town', x: -3000, y: -2000 },
        { id: 'u', type: 'event', label: 'Upper Harbour Town', x: -3000, y: -3800 },
      ],
      links: [{ from: 'a', to: 'l' }, { from: 'a', to: 'u' }],
    };
    const held = storyMapView.held(m, { x: 0, y: 0, k: 1 }, { w: 820, h: 524 }, { overview: false });
    expect(held.map((h) => h.direction).sort()).toEqual(['left', 'up']);
    const box = (h: (typeof held)[number]) => {
      const w = h.name.length * 7.5 + 44, l = h.gx === '0%' ? h.x : h.gx === '-100%' ? h.x - w : h.x - w / 2, t = h.gy === '0%' ? h.y : h.gy === '-100%' ? h.y - 32 : h.y - 16;
      return { l, t, r: l + w, b: t + 32 };
    };
    const [p, q] = held.map(box);
    expect(p.l < q.r && q.l < p.r && p.t < q.b && q.t < p.b).toBe(false);
  });
  it('held: when one edge has no clear place, the names around the corner make room, so none covers a card, a frame\'s label or another name', () => {
    // A column of cards down the left edge to the tools' row, its frame's label above it: the left name's only clear place is the corner,
    // which the up name takes when it is placed first, so the up name must slide along the top instead
    const column = [120, 196, 272, 348].map((y, i) => ({ id: 'c' + i, type: 'event' as const, label: 'Event ' + i, x: 150, y }));
    const m: StoryMapShape = {
      hubs: [],
      events: [{ id: 'a', type: 'event', label: 'Anchor', x: 400, y: 300 }, ...column,
        { id: 'u', type: 'event', label: 'Upper Town', x: -3590, y: -3700 }, { id: 'l', type: 'event', label: 'Low Harbor', x: -3000, y: 250 }],
      links: [{ from: 'a', to: 'u' }, { from: 'a', to: 'l' }],
      groups: [{ label: 'Events 15–18', x0: 44, y0: 60, x1: 256, y1: 400 }],
    };
    const held = storyMapView.held(m, { x: 0, y: 0, k: 1 }, { w: 820, h: 524 }, { overview: false });
    expect(held.map((h) => h.direction).sort()).toEqual(['left', 'up']);
    const box = (h: (typeof held)[number]) => {
      const w = h.name.length * 7.5 + 44, l = h.gx === '0%' ? h.x : h.gx === '-100%' ? h.x - w : h.x - w / 2, t = h.gy === '0%' ? h.y : h.gy === '-100%' ? h.y - 32 : h.y - 16;
      return { l, t, r: l + w, b: t + 32 };
    };
    const meet = (p: { l: number; t: number; r: number; b: number }, q: { l: number; t: number; r: number; b: number }) => p.l < q.r && q.l < p.r && p.t < q.b && q.t < p.b;
    const obstacles = [...column.map((c) => ({ l: c.x - 102, t: c.y - 28, r: c.x + 102, b: c.y + 28 })), { l: 44, t: 60, r: 44 + 'Events 15–18'.length * 6.5 + 32, b: 92 }];
    const [p, q] = held.map(box);
    for (const r of [p, q]) for (const o of obstacles) expect(meet(r, o)).toBe(false);
    expect(meet(p, q)).toBe(false);
  });
});

describe('StoryMapHeldNames', () => {
  it('draws each held name as a button "Show {name}" that brings it into view', () => {
    const onShow = vi.fn();
    render(<StoryMapHeldNames map={map()} view={{ x: -300, y: -100, k: 1 }} size={size} overview={false} onShow={onShow} />);
    const b = screen.getAllByRole('button')[0];
    expect(b.getAttribute('aria-label')).toMatch(/^Show /);
    fireEvent.click(b);
    expect(onShow).toHaveBeenCalled();
  });

  it('arcSlots: arcs meeting one card edge stand apart along it in the order of their other ends; a lone arc stays in the middle', () => {
    const events = [
      { id: 'a', x: 100, y: 100, type: 'event' as const, label: 'A' },
      { id: 'b', x: 100, y: 200, type: 'event' as const, label: 'B' },
      { id: 'c', x: 100, y: 300, type: 'event' as const, label: 'C' },
      { id: 'far', x: 400, y: 100, type: 'event' as const, label: 'Far' },
    ];
    // Two arcs leave b's right side, one up to a, one down to c: the one to a stands higher
    const slots = storyMapView.arcSlots({ events, arcs: [{ from: 'b', to: 'c' }, { from: 'b', to: 'a' }, { from: 'a', to: 'far' }] });
    expect(slots[1][0]).toBeLessThan(slots[0][0]);
    expect(slots[0][0] + slots[1][0]).toBe(0);
    // a's right side holds the arc from b (ending there) and the arc to far: they too stand apart
    expect(slots[1][1]).not.toBe(slots[2][0]);
    expect(storyMapView.arcSlots({ events, arcs: [{ from: 'a', to: 'far' }] })).toEqual([[0, 0]]);
  });
});


describe('storyMapView.spread', () => {
  it('pushes overlapping cards apart by the least move, mostly up and down, and keeps the rest of the map', () => {
    const m = { hubs: [{ id: 'a', kind: 'character' as const, x: 200, y: 100, label: 'A' }], events: [{ id: 'e', x: 210, y: 110, type: 'event' as const, label: 'E' }], links: [{ from: 'a', to: 'e' }] };
    const s = storyMapView.spread(m);
    const a = s.hubs[0], e = s.events[0];
    expect(Math.abs(a.y - e.y)).toBeGreaterThanOrEqual(56 + 12);
    expect(a.x).toBe(200);
    expect(e.x).toBe(210);
    expect(s.links).toBe(m.links);
    expect(m.hubs[0].y).toBe(100);
  });
  it('leaves cards that already stand apart where they are', () => {
    const m = { hubs: [{ id: 'a', kind: 'place' as const, x: 0, y: 0, label: 'A' }], events: [{ id: 'e', x: 400, y: 0, type: 'event' as const, label: 'E' }] };
    expect(storyMapView.spread(m)).toEqual(m);
  });
});
