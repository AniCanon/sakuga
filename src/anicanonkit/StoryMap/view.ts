import type { StoryMapArc, StoryMapBounds, StoryMapEvent, StoryMapGroup, StoryMapHub, StoryMapLink } from './StoryMap';

/** A map as the view math reads it: its hubs and events where they are drawn, its links and its arcs' frames. */
export interface StoryMapShape {
  /** Characters and places, where they are drawn. */
  hubs?: StoryMapHub[];
  /** The events, where they are drawn. */
  events?: StoryMapEvent[];
  /** The links drawn. */
  links?: StoryMapLink[];
  /** The arcs' frames. */
  groups?: StoryMapGroup[];
  /** The causes and conflicts drawn between events. */
  arcs?: StoryMapArc[];
}

/** A pane's size in px. */
export interface StoryMapSize {
  /** Its width. */
  w: number;
  /** Its height. */
  h: number;
}

/** A view: the canvas's offset and zoom. */
export interface StoryMapViewAt {
  /** The canvas's offset across. */
  x: number;
  /** The canvas's offset down. */
  y: number;
  /** Its zoom. */
  k: number;
}

/** What the pane holds besides the map, and how the map opens. */
export interface StoryMapViewOptions {
  /** The room the pane's own controls take at each edge. */
  chrome?: { top?: number; right?: number; bottom?: number; left?: number };
  /** The minimap's corner, or false. */
  overview?: { w: number; h: number } | false;
  /** The selection's chip in the top left: true, or its width. */
  chip?: boolean | number;
  /** The least zoom a fit or an opening goes to. Default 0.8, where a card reads. */
  minZoom?: number;
  /** The moment's stretch, by id. */
  frame?: string[];
  /** The moment's event, kept whole. */
  moment?: string;
  /** The zoom a frame opens at. */
  zoom?: number;
}

/** One held name: where it stands at the pane's edge, what it says, and the point it brings into view. */
export interface StoryMapHeldName {
  /** The edge it stands on. */
  key: string;
  /** The node's name, or how many ("3 more"). */
  name: string;
  /** How many it holds. */
  count: number;
  /** The ids it holds. */
  ids: string[];
  /** Their names. */
  names: string[];
  /** The way to them. */
  direction: 'left' | 'right' | 'up' | 'down';
  /** Where it stands, in the pane. */
  x: number;
  /** Where it stands, in the pane. */
  y: number;
  /** Its translate on x, from the point it stands at. */
  gx: string;
  /** Its translate on y, from the point it stands at. */
  gy: string;
  /** The middle of what it holds, in canvas units. */
  to: { x: number; y: number };
}

type Node = (StoryMapHub | StoryMapEvent) & { kind?: 'character' | 'place' };
type Chrome = { top: number; right: number; bottom: number; left: number };

const MAP_ZOOM = [0.25, 2.5];
/* Each node's size on the canvas, as its CSS draws it: the edges leave and arrive at its sides */
const MAP_NODE = { character: [184, 56], place: [220, 56], event: [204, 56] } as const;
const STORY_MAP_CHROME: Chrome = { top: 32, right: 32, bottom: 32, left: 72 };
const STORY_MAP_CHIP = { top: 64, width: 240 };
const STORY_MAP_OVERVIEW = { w: 232, h: 160 };
const STORY_MAP_READABLE = 0.8, STORY_MAP_FIT_MAX = 1.25, STORY_MAP_OPEN_MAX = 1, STORY_MAP_EDGE = 2, STORY_MAP_CLEAR = 4, STORY_MAP_NUDGE = 120, STORY_MAP_ZOOM_STEP = 0.02;

const mapClamp = (k: number) => Math.min(MAP_ZOOM[1], Math.max(MAP_ZOOM[0], k));
const nodesOf = (m: StoryMapShape): Node[] => ([] as Node[]).concat(m.hubs || [], m.events || []);
const sizeOf = (n: Node) => { const s = MAP_NODE[n.kind || 'event'] || MAP_NODE.event; return { w: s[0], h: s[1] }; };
const boxOf = (n: Node): StoryMapBounds => { const s = sizeOf(n); return { x0: n.x - s.w / 2, y0: n.y - s.h / 2, x1: n.x + s.w / 2, y1: n.y + s.h / 2 }; };
function cover(list: StoryMapBounds[]): StoryMapBounds | null {
  let b: StoryMapBounds | null = null;
  list.forEach((q) => { b = b ? { x0: Math.min(b.x0, q.x0), y0: Math.min(b.y0, q.y0), x1: Math.max(b.x1, q.x1), y1: Math.max(b.y1, q.y1) } : { x0: q.x0, y0: q.y0, x1: q.x1, y1: q.y1 }; });
  return b;
}
function chromeOf(o?: StoryMapViewOptions): Chrome {
  const c = { ...STORY_MAP_CHROME, ...(o && o.chrome) } as Chrome;
  if (o && o.chip && !(o.chrome && o.chrome.top !== undefined)) c.top = STORY_MAP_CHIP.top;
  return c;
}
const overviewOf = (o?: StoryMapViewOptions) => (o && o.overview === false ? null : { ...STORY_MAP_OVERVIEW, ...(o && typeof o.overview === 'object' ? o.overview : null) });
const chipWidth = (o?: StoryMapViewOptions) => (o && o.chip ? (typeof o.chip === 'number' ? o.chip : STORY_MAP_CHIP.width) : 0);
const floorOf = (o?: StoryMapViewOptions) => (o && o.minZoom !== undefined ? o.minZoom : STORY_MAP_READABLE);

/* Cards never overlap: pairs closer than their boxes and MAP_GAP are pushed apart, each half the way, along the axis that needs the
   smaller move (cards are wide, so mostly up and down), until none touch */
const MAP_GAP = 12;
export function mapSpread(nodes: Node[], p: Record<string, { x: number; y: number }>): Record<string, { x: number; y: number }> {
  for (let it = 0; it < 80; it++) {
    let moved = false;
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = p[nodes[i].id], b = p[nodes[j].id], sa = sizeOf(nodes[i]), sb = sizeOf(nodes[j]);
      const ox = (sa.w + sb.w) / 2 + MAP_GAP - Math.abs(a.x - b.x), oy = (sa.h + sb.h) / 2 + MAP_GAP - Math.abs(a.y - b.y);
      if (ox <= 0 || oy <= 0) continue;
      moved = true;
      if (oy <= ox) { const dy = oy / 2 * (a.y < b.y || (a.y === b.y && i < j) ? -1 : 1); a.y += dy; b.y -= dy; }
      else { const dx = ox / 2 * (a.x < b.x ? -1 : 1); a.x += dx; b.x -= dx; }
    }
    if (!moved) break;
  }
  return p;
}
/* The map with its cards pushed apart so none overlap (mapSpread), for a canvas that places them itself */
function spread<M extends StoryMapShape>(map: M): M {
  const hubs = map.hubs || [], events = map.events || [], all: Node[] = ([] as Node[]).concat(hubs, events), p: Record<string, { x: number; y: number }> = {};
  all.forEach((n) => { p[n.id] = { x: n.x, y: n.y }; }); mapSpread(all, p);
  const put = <T extends { id: string }>(n: T): T => ({ ...n, ...p[n.id] });
  return { ...map, hubs: hubs.map(put), events: events.map(put) };
}
/* What everything on the canvas covers: each node at its size, and the arcs' frames */
function bounds(m: StoryMapShape): StoryMapBounds { return cover(nodesOf(m).map(boxOf).concat(m.groups || [])) || { x0: 0, y0: 0, x1: 0, y1: 0 }; }
/* The pane less its chrome; `foot` is the room kept at the bottom (the overview's, when part of the map is out of view) */
function room(size: StoryMapSize, o: StoryMapViewOptions | undefined, foot: number) { const c = chromeOf(o); return { x0: c.left, y0: c.top, x1: Math.max(c.left + 1, size.w - c.right), y1: Math.max(c.top + 1, size.h - foot) }; }

type Span = { y0: number; y1: number };
/* How far to move a view down (or up) so nothing stands cut under the chip's row: each node offers two moves, below the row or
   above the pane; the one taken keeps `anchor` whole, then leaves fewest cut, then spills least of `keep`, then moves least */
function clearOfChip(m: StoryMapShape, o: StoryMapViewOptions | undefined, k: number, x: number, y: number, keep: Span, bottom: number, anchor?: Span): number {
  const cw = chipWidth(o), top = chromeOf(o).top;
  if (!cw) return 0;
  const ys: Span[] = [];
  nodesOf(m).forEach((n) => { const b = boxOf(n); if (b.x0 * k + x >= cw) return; ys.push({ y0: b.y0 * k + y, y1: b.y1 * k + y }); });
  if (!ys.length) return 0;
  const cut = (dy: number) => ys.filter((n) => n.y1 + dy > 0 && n.y0 + dy < top).length;
  const out = (b: Span, dy: number) => Math.max(0, top - (b.y0 + y + dy)) + Math.max(0, b.y1 + y + dy - bottom);
  const lost = (dy: number) => (anchor ? out(anchor, dy) : 0);
  const moves = [0];
  ys.forEach((n) => { moves.push(top - n.y0, -n.y1); });
  return moves.reduce((best, dy) => {
    const order = lost(dy) - lost(best) || cut(dy) - cut(best) || out(keep, dy) - out(keep, best) || Math.abs(dy) - Math.abs(best);
    return order < 0 ? dy : best;
  }, 0);
}
/* The nodes a view leaves partly in the pane: seen, but not whole; touching an edge counts */
/* A box's `w` is how much its cut counts (a node the selection is linked to counts three) */
function cutBy(boxes: (StoryMapBounds & { w?: number })[], at: { x: number; y: number }, size: StoryMapSize): number {
  const E = STORY_MAP_EDGE;
  return boxes.filter((b) => {
    const x0 = b.x0 + at.x, x1 = b.x1 + at.x, y0 = b.y0 + at.y, y1 = b.y1 + at.y;
    return x1 > -E && x0 < size.w + E && y1 > -E && y0 < size.h + E && !(x0 >= E && x1 <= size.w - E && y0 >= E && y1 <= size.h - E);
  }).reduce((sum, b) => sum + (b.w || 1), 0);
}
/* A nudge, never a new view: each cut node is brought fully in or pushed fully out along one axis, whichever leaves fewest cut
   and moves least, while `keep` stays whole and the view moves no further than the nudge; a few passes */
function snap(start: { x: number; y: number }, boxes: (StoryMapBounds & { w?: number })[], keep: StoryMapBounds, size: StoryMapSize) {
  const C = STORY_MAP_CLEAR;
  const whole = (q: { x: number; y: number }) => keep.x0 + q.x >= 0 && keep.x1 + q.x <= size.w && keep.y0 + q.y >= 0 && keep.y1 + q.y <= size.h && Math.abs(q.x - start.x) <= STORY_MAP_NUDGE && Math.abs(q.y - start.y) <= STORY_MAP_NUDGE;
  let at = start;
  for (let pass = 0; pass < 4; pass++) {
    const from = at, moves = [at];
    boxes.forEach((b) => {
      if (!cutBy([b], from, size)) return;
      const x0 = b.x0 + from.x, x1 = b.x1 + from.x, y0 = b.y0 + from.y, y1 = b.y1 + from.y;
      [-x0 + C, -x1 - C, size.w - x1 - C, size.w - x0 + C].forEach((dx) => { moves.push({ x: from.x + dx, y: from.y }); });
      [-y0 + C, -y1 - C, size.h - y1 - C, size.h - y0 + C].forEach((dy) => { moves.push({ x: from.x, y: from.y + dy }); });
    });
    at = moves.filter(whole).sort((p, q) => cutBy(boxes, p, size) - cutBy(boxes, q, size) || (Math.abs(p.x - from.x) + Math.abs(p.y - from.y)) - (Math.abs(q.x - from.x) + Math.abs(q.y - from.y)))[0] || at;
  }
  return at;
}

/* What is selected and every event a drawn link joins to it, at the zoom that shows them all, never below the readable zoom
   nor above Fit's most; when they don't all fit, centred with the selection itself kept whole. Null when nothing is selected. */
function focus(m: StoryMapShape, size: StoryMapSize, o?: StoryMapViewOptions): StoryMapViewAt | null {
  const all = nodesOf(m), sel = all.filter((n) => n.state === 'focus' || n.state === 'proposed' || n.state === 'new');
  if (!sel.length) return null;
  const on: Record<string, boolean> = {};
  sel.forEach((n) => { on[n.id] = true; });
  const lit: Record<string, boolean> = {};
  (m.links || []).forEach((l) => { if (on[l.from]) lit[l.to] = true; if (on[l.to]) lit[l.from] = true; });
  const b = cover(all.filter((n) => on[n.id] || lit[n.id]).map(boxOf))!, own = cover(sel.map(boxOf))!;
  const ov = overviewOf(o), r = room(size, o, ov ? ov.h : chromeOf(o).bottom), rw = r.x1 - r.x0, rh = r.y1 - r.y0;
  const k = mapClamp(Math.min(STORY_MAP_FIT_MAX, Math.max(floorOf(o), Math.min(rw / Math.max(1, b.x1 - b.x0), rh / Math.max(1, b.y1 - b.y0)))));
  const hold = (c: number, lo: number, hi: number, a0: number, a1: number) => { const v = (a0 + a1) / 2 - c * k; return Math.max(a0 - lo * k, Math.min(a1 - hi * k, v)); };
  const x = hold((b.x0 + b.x1) / 2, own.x0, own.x1, r.x0, r.x1), y = hold((b.y0 + b.y1) / 2, own.y0, own.y1, r.y0, r.y1);
  return { x, y: y + clearOfChip(m, o, k, x, y, { y0: b.y0 * k, y1: b.y1 * k }, r.y1, { y0: own.y0 * k, y1: own.y1 * k }), k };
}
/* A stretch the map opens on (`frame`, the ids named): centred at `zoom` (1), the map's own edge held at the pane's edge rather
   than empty ground beyond it; a map that fits across or down at that zoom is centred that way. `o.moment` stays whole. */
function frame(m: StoryMapShape, ids: string[], size: StoryMapSize, o?: StoryMapViewOptions, zoom?: number): StoryMapViewAt | null {
  const named: Record<string, boolean> = {};
  (ids || []).forEach((id) => { named[id] = true; });
  const b = cover(nodesOf(m).filter((n) => named[n.id]).map(boxOf));
  if (!b) return null;
  const k = mapClamp(zoom || (o && o.zoom) || 1), all = bounds(m), c = chromeOf(o), ov = overviewOf(o), pad = 32;
  const place = (ctr: number, len: number, lo: number, hi: number, before: number, after: number) => {
    if ((hi - lo) * k + before + after <= len) return before + (len - before - after) / 2 - (lo + hi) / 2 * k;
    const want = before + (len - before - after) / 2 - ctr * k;
    return Math.min(before - lo * k, Math.max(len - after - hi * k, want));
  };
  const x = place((b.x0 + b.x1) / 2, size.w, all.x0, all.x1, Math.max(pad, c.left), pad);
  const foot = ov && b.x1 * k + x > size.w - ov.w ? ov.h : c.bottom;
  const y = place((b.y0 + b.y1) / 2, size.h, all.y0, all.y1, c.top, foot);
  const ev = o && o.moment ? (m.events || []).filter((e) => e.id === o.moment)[0] : null;
  const anchor = ev ? { y0: boxOf(ev).y0 * k, y1: boxOf(ev).y1 * k } : undefined;
  return { x, y: y + clearOfChip(m, o, k, x, y, { y0: b.y0 * k, y1: b.y1 * k }, size.h - foot, anchor), k };
}
/* Fit: all of the map when it reads whole at the readable zoom or more; otherwise what matters, readable: the selection and its
   events, else the moment's stretch (`o.frame`), else the story's start; the overview carries the rest */
function fit(m: StoryMapShape, size: StoryMapSize, o?: StoryMapViewOptions): StoryMapViewAt {
  const r = room(size, o, chromeOf(o).bottom), b = bounds(m);
  const k = Math.min(STORY_MAP_FIT_MAX, (r.x1 - r.x0) / Math.max(1, b.x1 - b.x0), (r.y1 - r.y0) / Math.max(1, b.y1 - b.y0));
  if (k >= floorOf(o)) return { x: (r.x0 + r.x1) / 2 - (b.x0 + b.x1) / 2 * k, y: (r.y0 + r.y1) / 2 - (b.y0 + b.y1) / 2 * k, k: mapClamp(k) };
  const f = floorOf(o);
  return focus(m, size, o) || (o && o.frame && o.frame.length && frame(m, o.frame, size, o, 1)) || { x: r.x0 - b.x0 * f, y: r.y0 - b.y0 * f, k: mapClamp(f) };
}
/* Where the map opens: all of it when all of it reads at the readable zoom; else on what is selected and its events, or on the moment
   (`o.moment`) framed with its whole column and the characters in it, at the readable zoom to 1 and from the top. Then nudged so
   no node opens cut by the pane's edge, and clear of the chip's row. */
function open(m: StoryMapShape, size: StoryMapSize, o?: StoryMapViewOptions): StoryMapViewAt {
  const all = nodesOf(m), c = chromeOf(o), ov = overviewOf(o);
  const pad = { top: c.top, left: c.left, right: c.right, bottom: ov ? ov.h : c.bottom };
  const rm = { w: Math.max(1, size.w - pad.left - pad.right), h: Math.max(1, size.h - pad.top - pad.bottom) };
  const sel = all.filter((n) => n.state === 'focus');
  const moment = o && o.moment ? (m.events || []).filter((e) => e.id === o.moment)[0] : null;
  const whole = bounds(m), wholeK = Math.min(rm.w / Math.max(1, whole.x1 - whole.x0), rm.h / Math.max(1, whole.y1 - whole.y0));
  const floor = floorOf(o);
  let fr: Node[] = [];
  /* With something selected, it opens as focus does: the selection and every event joined to it, the selection kept whole */
  if (wholeK < floor && sel.length) {
    const fv = focus(m, size, o)!, own = cover(sel.map(boxOf))!;
    const on: Record<string, boolean> = {}, lit: Record<string, boolean> = {};
    sel.forEach((n) => { on[n.id] = true; });
    (m.links || []).forEach((l) => { if (on[l.from]) lit[l.to] = true; if (on[l.to]) lit[l.from] = true; });
    /* The cut falls on what the selection isn't linked to: a linked card, or the selection, counts three */
    const bxs = all.map((n) => { const q = boxOf(n); return { x0: q.x0 * fv.k, y0: q.y0 * fv.k, x1: q.x1 * fv.k, y1: q.y1 * fv.k, w: on[n.id] || lit[n.id] ? 3 : 1 }; });
    const at0 = snap({ x: fv.x, y: fv.y }, bxs, { x0: own.x0 * fv.k, y0: own.y0 * fv.k, x1: own.x1 * fv.k, y1: own.y1 * fv.k }, size);
    return { x: at0.x, y: at0.y, k: fv.k };
  }
  if (wholeK < floor) {
    fr = sel;
    if (!fr.length && moment) {
      const column = (m.events || []).filter((e) => Math.abs(e.x - moment.x) < 1), inCol: Record<string, boolean> = {};
      column.forEach((e) => { inCol[e.id] = true; });
      const people = (m.hubs || []).filter((hb) => hb.kind === 'character' && (m.links || []).some((l) => l.from === hb.id && inCol[l.to]));
      fr = ([] as Node[]).concat(column, people);
    }
  }
  const focused = fr.length > 0, b = focused ? cover(fr.map(boxOf))! : whole;
  const span = { w: Math.max(1, b.x1 - b.x0), h: Math.max(1, b.y1 - b.y0) };
  const lo = focused ? floor : MAP_ZOOM[0], hi = STORY_MAP_OPEN_MAX;
  const fitK = Math.min(hi, Math.max(lo, Math.min(rm.w / span.w, rm.h / span.h)));
  const anchor: Node | null = focused ? (sel[0] || moment) : null, half = MAP_NODE.event.map((q) => q / 2);
  const boxesAt = (k: number) => all.map((n) => { const q = boxOf(n); return { x0: q.x0 * k, y0: q.y0 * k, x1: q.x1 * k, y1: q.y1 * k }; });
  const placeAt = (k: number) => {
    const x = span.w * k <= rm.w ? pad.left + (rm.w - span.w * k) / 2 - b.x0 * k : size.w / 2 - (anchor ? anchor.x : (b.x0 + b.x1) / 2) * k;
    const y = focused || span.h * k > rm.h ? pad.top - b.y0 * k : pad.top + (rm.h - span.h * k) / 2 - b.y0 * k;
    const keep = span.w * k <= size.w && span.h * k <= size.h ? { x0: b.x0 * k, y0: b.y0 * k, x1: b.x1 * k, y1: b.y1 * k }
      : anchor ? { x0: (anchor.x - half[0]) * k, y0: (anchor.y - half[1]) * k, x1: (anchor.x + half[0]) * k, y1: (anchor.y + half[1]) * k }
        : { x0: b.x0 * k, y0: b.y0 * k, x1: b.x1 * k, y1: b.y1 * k };
    const boxes = boxesAt(k), at = snap({ x, y }, boxes, keep, size);
    return { x: at.x, y: at.y, k, cut: cutBy(boxes, at, size) };
  };
  let best = placeAt(fitK);
  for (let k = fitK - STORY_MAP_ZOOM_STEP; best.cut > 0 && k >= lo - 1e-6; k -= STORY_MAP_ZOOM_STEP) { const nx = placeAt(k); if (nx.cut < best.cut) best = nx; }
  return { x: best.x, y: best.y + clearOfChip(m, o, best.k, best.x, best.y, { y0: b.y0 * best.k, y1: b.y1 * best.k }, size.h - pad.bottom), k: mapClamp(best.k) };
}
/* Where held names stand. A node a drawn link runs to, out of view, is named at the pane's edge the link leaves by; each edge
   holds one: the node's name when it is the only one that way, else how many ("3 more"). Each stays inside the pane, below the
   chip's row, above the tools and the minimap, and slides along its edge to the nearest place clear of every card. `words`
   turns a count into the label (tx('heldMore')). */
function held(m: StoryMapShape, view: StoryMapViewAt, size: StoryMapSize, o?: StoryMapViewOptions, words?: (count: number) => string): StoryMapHeldName[] {
  const all = nodesOf(m), byId: Record<string, Node> = {};
  all.forEach((n) => { byId[n.id] = n; });
  const scr = (n: Node) => ({ x: n.x * view.k + view.x, y: n.y * view.k + view.y });
  const inView = (q: { x: number; y: number }) => q.x >= 0 && q.x <= size.w && q.y >= 0 && q.y <= size.h;
  const HM = 40, IN = 12, FOOT = 160, TOOLS = 96, ov = overviewOf(o), cw = chipWidth(o), top = chromeOf(o).top, seen: Record<string, boolean> = {};
  const sides: Record<string, { id: string; x: number; y: number; d: number }[]> = {};
  (m.links || []).forEach((l) => {
    [[l.from, l.to], [l.to, l.from]].forEach((pr) => {
      const na = byId[pr[0]], nb = byId[pr[1]];
      if (!na || !nb || seen[nb.id]) return;
      const a = scr(na), b = scr(nb);
      if (!inView(a) || inView(b)) return;
      seen[nb.id] = true;
      let t = 1;
      [[b.x - a.x, HM - a.x, size.w - HM - a.x], [b.y - a.y, HM - a.y, size.h - HM - a.y]].forEach((ax) => { if (ax[0] < 0) t = Math.min(t, ax[1] / ax[0]); else if (ax[0] > 0) t = Math.min(t, ax[2] / ax[0]); });
      const dx = b.x - a.x, dy = b.y - a.y, side = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
      (sides[side] = sides[side] || []).push({ id: nb.id, x: a.x + dx * t, y: a.y + dy * t, d: Math.abs(dx) + Math.abs(dy) });
    });
  });
  const cards = all.map((n) => { const q = boxOf(n); return { l: q.x0 * view.k + view.x, t: q.y0 * view.k + view.y, r: q.x1 * view.k + view.x, b: q.y1 * view.k + view.y }; });
  /* A frame's label is kept clear as a card is */
  (m.groups || []).forEach((g) => { if (!g.label) return; const l = g.x0 * view.k + view.x, t = g.y0 * view.k + view.y; cards.push({ l, t, r: l + (String(g.label).length * 6.5 + 32) * view.k, b: t + 32 * view.k }); });
  type Box = { l: number; t: number; r: number; b: number };
  const area = (p: Box, q: Box) => Math.max(0, Math.min(p.r, q.r) - Math.max(p.l, q.l)) * Math.max(0, Math.min(p.b, q.b) - Math.max(p.t, q.t));
  /* One edge's name, placed clear of what is in the way: where it lands, the box it takes, and how much it still covers (0 when clear) */
  const place = (side: string, inWay: Box[]) => {
    const g = sides[side].slice().sort((p, q) => p.d - q.d), one = g.length === 1;
    const name = one ? byId[g[0].id].label : (words ? words(g.length) : g.length + ' more');
    let x = g.reduce((s, p) => s + p.x, 0) / g.length, y = g.reduce((s, p) => s + p.y, 0) / g.length, gx = '-50%', gy = '-50%';
    if (side === 'left') { x = IN; gx = '0%'; } else if (side === 'right') { x = size.w - IN; gx = '-100%'; } else if (side === 'up') { y = IN; gy = '0%'; } else { y = size.h - IN; gy = '-100%'; }
    const lw = name.length * 7.5 + 44, lh = 32;
    const rect = (px: number, py: number): Box => { const l = gx === '0%' ? px : gx === '-100%' ? px - lw : px - lw / 2, tt = gy === '0%' ? py : gy === '-100%' ? py - lh : py - lh / 2; return { l, t: tt, r: l + lw, b: tt + lh }; };
    /* The chip stands in the top left: only a name on the left edge keeps below its row */
    const along = side === 'left' || side === 'right';
    const lo = along ? Math.max(IN, cw && side === 'left' ? top : IN) : IN + lw / 2, hi = along ? size.h - FOOT : size.w - IN - lw / 2;
    if (along) y = Math.max(lo + lh / 2, Math.min(hi, y)); else x = Math.max(lo, Math.min(hi, x));
    if (!along && side === 'up' && cw && x - lw / 2 < cw) { y = top; gy = '0%'; }
    if ((x < TOOLS || (ov && x > size.w - (ov.w - 16))) && y > size.h - FOOT) { y = size.h - FOOT; gy = '-100%'; }
    const covered = (rc: Box) => inWay.reduce((sum, c2) => sum + area(rc, c2), 0);
    /* Slides along its edge to the nearest clear place; with none, to where it covers least */
    let cost = covered(rect(x, y));
    if (cost > 0) {
      let best: number | null = null, least = cost, leastAt: number | null = null;
      for (let dd = 8; dd < Math.max(size.w, size.h) && best === null; dd += 8) {
        [-dd, dd].forEach((sg) => {
          if (best !== null) return;
          const c2 = (along ? y : x) + sg;
          if (c2 < (along ? lo + lh / 2 : lo) || c2 > hi) return;
          const c = covered(along ? rect(x, c2) : rect(c2, y));
          if (c === 0) best = c2;
          else if (c < least) { least = c; leastAt = c2; }
        });
      }
      const to = best !== null ? best : leastAt;
      if (to !== null) { if (along) y = to; else x = to; cost = best !== null ? 0 : least; }
    }
    const tx2 = g.reduce((s, p) => s + byId[p.id].x, 0) / g.length, ty2 = g.reduce((s, p) => s + byId[p.id].y, 0) / g.length;
    const item: StoryMapHeldName = { key: side, name, count: g.length, ids: g.map((p) => p.id), names: g.map((p) => byId[p.id].label), direction: side as StoryMapHeldName['direction'], x, y, gx, gy, to: { x: tx2, y: ty2 } };
    return { item, box: rect(x, y), cost };
  };
  /* A name placed is in the way of the next, as a card is. The edges are placed in every order and the arrangement that covers
     least is kept, so when one edge's only clear place is a corner, the name on the other edge slides along to make room */
  const keys = Object.keys(sides);
  const orders = (list: string[]): string[][] => (list.length <= 1 ? [list] : list.flatMap((k, i) => orders(list.filter((_, j) => j !== i)).map((rest) => [k, ...rest])));
  let bestAt: Record<string, StoryMapHeldName> | null = null, bestCost = Infinity;
  for (const order of orders(keys)) {
    const inWay = cards.slice(), at: Record<string, StoryMapHeldName> = {};
    let total = 0;
    for (const side of order) { const p = place(side, inWay); at[side] = p.item; inWay.push(p.box); total += p.cost; }
    if (total < bestCost) { bestCost = total; bestAt = at; }
    if (total === 0) break;
  }
  return keys.map((side) => bestAt![side]);
}

/** How one drawn link runs: its path, and the sides of its two nodes it leaves and arrives by. */
export interface StoryMapRoute {
  /** The path, in canvas units. */
  d: string;
  /** The side it leaves its `from` node by. */
  out: 'top' | 'bottom' | 'left';
  /** The side it arrives at its `to` node by. */
  into: 'top' | 'bottom' | 'left';
}

const STORY_MAP_TRUNK = 5, STORY_MAP_GUTTER = 8, STORY_MAP_BUS = 16, STORY_MAP_BUS_STEP = 6, STORY_MAP_CORNER = 8;
type Point = { x: number; y: number };
/* Straight runs through the points, each corner rounded */
function ortho(pts: Point[]): string {
  let p = pts.filter((q, i) => i === 0 || Math.abs(q.x - pts[i - 1].x) + Math.abs(q.y - pts[i - 1].y) > 0.5);
  p = p.filter((q, i) => { if (i === 0 || i === p.length - 1) return true; const a = p[i - 1], b = p[i + 1]; return !((a.x === q.x && q.x === b.x) || (a.y === q.y && q.y === b.y)); });
  let d = 'M' + p[0].x + ' ' + p[0].y;
  for (let i = 1; i < p.length - 1; i++) {
    const a = p[i - 1], c = p[i], b = p[i + 1];
    const la = Math.abs(c.x - a.x) + Math.abs(c.y - a.y), lb = Math.abs(b.x - c.x) + Math.abs(b.y - c.y), r = Math.min(STORY_MAP_CORNER, la / 2, lb / 2);
    const ux = Math.sign(c.x - a.x), uy = Math.sign(c.y - a.y), vx = Math.sign(b.x - c.x), vy = Math.sign(b.y - c.y);
    d += ' L' + (c.x - ux * r) + ' ' + (c.y - uy * r) + ' Q' + c.x + ' ' + c.y + ' ' + (c.x + vx * r) + ' ' + (c.y + vy * r);
  }
  return d + ' L' + p[p.length - 1].x + ' ' + p[p.length - 1].y;
}
function bend(sx: number, sy: number, tx2: number, ty: number): string { const e = Math.max(36, Math.abs(ty - sy) / 2) * (ty >= sy ? 1 : -1); return 'M' + sx + ' ' + sy + ' C' + sx + ' ' + (sy + e) + ' ' + tx2 + ' ' + (ty - e) + ' ' + tx2 + ' ' + ty; }
/* How drawn links run. A hub with STORY_MAP_TRUNK or more shown links to events below it routes them as a tree: a trunk down from its
   handle to a bus over the arcs' frames, a drop per column down the gutter left of its cards, a branch into each card's left side;
   runs they share overlap exactly. Every other link curves from facing side to facing side. One per link, in order, for a map drawn
   top to bottom. */
function route(m: StoryMapShape): StoryMapRoute[] {
  const all = nodesOf(m), byId: Record<string, Node> = {};
  all.forEach((n) => { byId[n.id] = n; });
  const isEvent: Record<string, boolean> = {};
  (m.events || []).forEach((e) => { isEvent[e.id] = true; });
  const links = (m.links || []).filter((l) => byId[l.from] && byId[l.to]);
  const groupOf = (n: Node) => (m.groups || []).filter((g) => n.x >= g.x0 && n.x <= g.x1 && n.y >= g.y0 && n.y <= g.y1)[0];
  /* A shown link between a hub and an event above or below it (down: the hub stands above the event); a quiet or dimmed one keeps its curve */
  const ends = (l: StoryMapLink) => {
    if (l.quiet || l.dim) return null;
    const hub = isEvent[l.from] ? (isEvent[l.to] ? null : l.to) : (isEvent[l.to] ? l.from : null);
    if (!hub) return null;
    const ev = hub === l.from ? l.to : l.from, bh = boxOf(byId[hub]), be = boxOf(byId[ev]);
    return be.y0 > bh.y1 ? { hub, ev, down: true } : bh.y0 > be.y1 ? { hub, ev, down: false } : null;
  };
  const keyOf = (e: { hub: string; down: boolean }) => e.hub + (e.down ? 'v' : '^');
  const count: Record<string, number> = {};
  links.forEach((l) => { const e = ends(l); if (e) count[keyOf(e)] = (count[keyOf(e)] || 0) + 1; });
  const trunks = Object.keys(count).filter((k) => count[k] >= STORY_MAP_TRUNK).sort((p, q) => byId[p.slice(0, -1)].x - byId[q.slice(0, -1)].x);
  const lane: Record<string, number> = {};
  trunks.forEach((k, i) => { lane[k] = i; });
  const busOf: Record<string, number> = {};
  trunks.forEach((k) => {
    const hub = byId[k.slice(0, -1)], down = k.slice(-1) === 'v';
    let edge = down ? Infinity : -Infinity;
    links.forEach((l) => {
      const e = ends(l);
      if (!e || keyOf(e) !== k) return;
      const b = byId[e.ev], g = groupOf(b), q = boxOf(b);
      edge = down ? Math.min(edge, g ? g.y0 : q.y0) : Math.max(edge, g ? g.y1 : q.y1);
    });
    const off = STORY_MAP_BUS + lane[k] * STORY_MAP_BUS_STEP;
    busOf[k] = down ? Math.max(boxOf(hub).y1 + STORY_MAP_BUS, edge - off) : Math.min(boxOf(hub).y0 - STORY_MAP_BUS, edge + off);
  });
  return links.map((l) => {
    const a = byId[l.from], b = byId[l.to], ba = boxOf(a), bb = boxOf(b), e = ends(l);
    if (e && lane[keyOf(e)] !== undefined) {
      const k = keyOf(e), hub = byId[e.hub], ev = byId[e.ev], bh = boxOf(hub), be = boxOf(ev), gx = be.x0 - STORY_MAP_GUTTER - lane[k] * 2;
      const pts = [{ x: hub.x, y: e.down ? bh.y1 : bh.y0 }, { x: hub.x, y: busOf[k] }, { x: gx, y: busOf[k] }, { x: gx, y: ev.y }, { x: be.x0, y: ev.y }];
      const hubSide = e.down ? 'bottom' : 'top';
      return e.hub === l.from ? { d: ortho(pts), out: hubSide, into: 'left' } : { d: ortho(pts.reverse()), out: 'left', into: hubSide };
    }
    const below = b.y >= a.y;
    return { d: bend(a.x, below ? ba.y1 : ba.y0, b.x, below ? bb.y0 : bb.y1), out: below ? 'bottom' : 'top', into: below ? 'top' : 'bottom' };
  });
}

/**
 * Where each arc meets its two cards, as offsets in px along their sides from the middle: the arcs that meet one card edge stand
 * apart along it, in the order of their other ends, so no arrowhead hides another and a line leaving never starts at an arrow's
 * point. An arc not joining two drawn events stands at the middle.
 */
function arcSlots(m: StoryMapShape): [number, number][] {
  const byId: Record<string, Node> = {};
  nodesOf(m).forEach((n) => { byId[n.id] = n; });
  const arcs = m.arcs || [], slot: [number, number][] = arcs.map(() => [0, 0]), edgeUse: Record<string, { i: number; end: 0 | 1; y: number }[]> = {};
  arcs.forEach((a, i) => {
    const n1 = a.from ? byId[a.from] : undefined, n2 = a.to ? byId[a.to] : undefined;
    if (!n1 || !n2) return;
    const same = Math.abs(n1.x - n2.x) < 8, right = n2.x > n1.x;
    ([[n1.id, same || right ? 'r' : 'l', n2.y, 0], [n2.id, same || !right ? 'r' : 'l', n1.y, 1]] as [string, string, number, 0 | 1][]).forEach(([id, side, y, end]) => {
      const k = side + '|' + id; (edgeUse[k] = edgeUse[k] || []).push({ i, end, y });
    });
  });
  Object.keys(edgeUse).forEach((k) => {
    const g = edgeUse[k].sort((p, q) => p.y - q.y || p.i - q.i), half = sizeOf(byId[k.slice(2)]).h / 2 - 8;
    const step = g.length > 1 ? Math.min(12, (2 * half) / (g.length - 1)) : 0;
    g.forEach((u, j) => { slot[u.i][u.end] = (j - (g.length - 1) / 2) * step; });
  });
  return slot;
}

/**
 * The story map's view, as pure functions StoryMap itself uses, so a map mounted on another canvas (React Flow) keeps one
 * behaviour: `open`, where it opens; `fit`, the Fit button; `focus`, the selection and its events; `frame`, a stretch; `held`, where
 * held names stand; `route`, how each drawn link runs; `arcSlots`, where each arc meets its cards; `spread`, the map with its cards pushed
 * apart; `bounds`. A map is { hubs, events, links, groups }; a size { w, h }; a view { x, y, k }.
 */
export const storyMapView = {
  bounds, focus, frame, fit, open, held, route, arcSlots, spread,
  /** The room the pane's own controls take at each edge. */
  chrome: STORY_MAP_CHROME,
  /** The selection's chip: its row's height and its width along the top. */
  chip: STORY_MAP_CHIP,
  /** The minimap's corner. */
  overview: STORY_MAP_OVERVIEW,
  /** The least zoom a card reads at. */
  readable: STORY_MAP_READABLE,
};
