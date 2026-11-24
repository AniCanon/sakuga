import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent as ReactMouseEvent, type MouseEventHandler, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { Badge, Chip, Icon, IconButton, type IconName } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { pressProps } from '../../internal/press';
import { useRoving } from '../../internal/roving';
import { EventGlyph, EVENT_WORD, GLYPH_TYPES, type EventType } from '../EventGlyph/EventGlyph';
import { useWords, type WordKey } from '../../internal/words';
import { words as ownWords } from './words';
import { mapSpread, storyMapView, type StoryMapShape, type StoryMapSize, type StoryMapViewAt, type StoryMapViewOptions } from './view';
import '../../base.css';
import './StoryMap.css';

export type BadgeSpec = { label: string; variant?: 'new' | 'alert' | 'warning'; icon?: IconName };

export interface StoryMapHub {
  /** Its id, for links, arcs, onSelect and onMove. */
  id: string;
  /** A character or a place. */
  kind: 'character' | 'place';
  /** Its centre on the canvas, in px. */
  x: number;
  /** Its centre on the canvas, in px. */
  y: number;
  /** Kept for maps drawn before 2.0; a node has a fixed size. */
  size?: number;
  /** The portrait, or the place's art. */
  image?: string;
  /** Kept for maps drawn before 2.0; a character with no portrait shows `figure`. */
  initial?: string;
  /** The age figure drawn until there is a portrait (default `age-adult`). */
  figure?: IconName;
  /** Its name: one line, cut with an ellipsis, whole in its tip. */
  label: string;
  /** The node's quiet line (Heros, Place). */
  sub?: string;
  /** A state (Dead, Held, Burning), opening the second line. */
  badge?: BadgeSpec;
  /** `focus`: in the selection; `dim`: not at this moment. */
  state?: 'focus' | 'dim';
  /** Dead or gone at this moment: the portrait greys, the words stay readable. */
  muted?: boolean;
}
export interface StoryMapEvent {
  /** Its id, for links, arcs, onSelect and onMove. */
  id: string;
  /** Its centre on the canvas, in px. */
  x: number;
  /** Its centre on the canvas, in px. */
  y: number;
  /** Its kind, drawn as its shape. */
  type: EventType;
  /** Its title. */
  label: string;
  /** `focus` selected, `dim` or `ghost` not at this moment, `proposed` being added, `new` just added. */
  state?: 'focus' | 'dim' | 'ghost' | 'proposed' | 'new';
  /** It has no place in the story yet. */
  unplaced?: boolean;
  /** A state, opening the second line. */
  badge?: BadgeSpec;
  /** After its type on the quiet line: what told it. */
  sub?: string;
  /** First on the quiet line, never shortened: what tells it from an event of the same title ("Event 9"). Also in its name. */
  lead?: string;
}
export interface StoryMapLink {
  /** The id it leaves. */
  from: string;
  /** The id it reaches. */
  to: string;
  /** `accent`: part of the selection. `warning`: drawn in amber, and each end reads "a link with a warning". */
  tone?: 'accent' | 'warning';
  /** Not part of the selection. */
  dim?: boolean;
  /** Drawn dashed. */
  dashed?: boolean;
  /** Drawn faint until it matters. */
  quiet?: boolean;
}
export interface StoryMapEdge {
  /** Where it starts, in px. */
  x1: number;
  /** Where it starts, in px. */
  y1: number;
  /** Where it ends, in px. */
  x2: number;
  /** Where it ends, in px. */
  y2: number;
  /** `accent`: part of the selection. `warning`: drawn in amber. */
  tone?: 'accent' | 'warning';
  /** Not part of the selection. */
  dim?: boolean;
  /** Drawn dashed. */
  dashed?: boolean;
}
export interface StoryMapArc {
  /** Where it starts, in px, when not joining ids. */
  x1?: number;
  /** Where it starts, in px, when not joining ids. */
  y1?: number;
  /** Where it ends, in px, when not joining ids. */
  x2?: number;
  /** Where it ends, in px, when not joining ids. */
  y2?: number;
  /** The event it leaves. */
  from?: string;
  /** The event it reaches. */
  to?: string;
  /** `warning`: drawn in amber with its arrowhead, over the rest, and both events read "a link with a warning". */
  tone?: 'warning';
  /** A conflict, not a cause. */
  dashed?: boolean;
  /** How far it bows, in px. */
  bend?: number;
}
export interface StoryMapGroup {
  /** The arc's name, in its corner. */
  label: string;
  /** Its left edge, in px. */
  x0: number;
  /** Its top edge, in px. */
  y0: number;
  /** Its right edge, in px. */
  x1: number;
  /** Its bottom edge, in px. */
  y1: number;
  /** Drawn dashed: Not placed. */
  dashed?: boolean;
}
export type StoryMapFlow = 'down' | 'right';
export interface StoryMapView {
  /** The canvas's offset from the pane's left, in px. */
  x: number;
  /** The canvas's offset from the pane's top, in px. */
  y: number;
  /** Its zoom, 0.25 to 2.5. */
  k: number;
}
export interface StoryMapBounds {
  /** The left edge, in px. */
  x0: number;
  /** The top edge, in px. */
  y0: number;
  /** The right edge, in px. */
  x1: number;
  /** The bottom edge, in px. */
  y1: number;
}

export interface StoryMapProps {
  /** The canvas's height in px. */
  height?: number;
  /** The canvas's width in px. */
  width?: number;
  /** Names the map for screen readers. */
  label?: string;
  /** Used for the key's id. */
  id?: string;
  /** A removable chip at the top: what the map is narrowed to. */
  chip?: string;
  /** `false` hides the controls. */
  tools?: boolean;
  /** `false` hides the key. */
  legend?: boolean;
  /** A canvas you move: drag a hub or an event, drag the ground to pan, the wheel or a pinch to zoom; Shift and an arrow moves the one in focus. */
  interactive?: boolean;
  /** `down`: characters on top, events in their arcs, places below; handles top and bottom. Default `right`. */
  flow?: StoryMapFlow;
  /** Arcs as groups: a named frame on the canvas under the events in it. */
  groups?: StoryMapGroup[];
  /** Opens fitted to everything on it; `focus`: to what is selected (all when nothing is), never below `minZoom`. */
  fit?: boolean | 'focus';
  /** The nodes the map opens on, centred at `zoom` (1 when left out), the map's edge held at the pane's: on a long story, the events of the moment's stretch. */
  frame?: string[];
  /** A node a drawn link runs to, out of view, is held at the pane's edge, named, with an arrow towards it; pressing it brings it into view. */
  held?: boolean;
  /** The moment's event: an opening on its stretch keeps it whole. */
  moment?: string;
  /** The lowest zoom `fit` opens at. */
  minZoom?: number;
  /** Opening zoom, 0.25 to 2.5 (default 1), centred. */
  zoom?: number;
  /** Opening view: the canvas's offset and zoom. */
  view?: { x: number; y: number; zoom: number };
  /** The minimap in the bottom corner, shown while part of the map is out of view. */
  overview?: boolean;
  /** Opens with the key shown. */
  keyOpen?: boolean;
  /** A hub or an event drawn mid-drag. */
  dragging?: string;
  /** Makes each hub and event a button, all one Tab stop. */
  onSelect?: (id: string, kind: 'hub' | 'event') => void;
  /** A hub or an event placed somewhere new. */
  onMove?: (id: string, x: number, y: number) => void;
  /** Called after Zoom in. */
  onZoomIn?: () => void;
  /** Called after Fit the map. */
  onFit?: MouseEventHandler;
  /** The chip's close. */
  onChipRemove?: MouseEventHandler;
  /** Characters and places, placed in px, with their badges and states. */
  hubs: StoryMapHub[];
  /** The events, with their types and states. */
  events: StoryMapEvent[];
  /** Links by id, following their ends as they move. */
  links?: StoryMapLink[];
  /** Fixed lines, for a map that does not move. */
  edges?: StoryMapEdge[];
  /** The selection's causes and conflicts; `dashed` marks a conflict. */
  arcs?: StoryMapArc[];
  /** Drawn on the canvas, after the events, in its own coordinates. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

type Point = { x: number; y: number };
type MapNode = (StoryMapHub | StoryMapEvent) & { kind?: 'character' | 'place' };

/* Hubs and events are one Tab stop, arrows moving through them in the order they are drawn; with onSelect(id, kind) each is a
   button. What only the drawing shows (an event's type, a dimmed or proposed one) is said in words. */
const MAP_STATE: Record<string, WordKey> = { dim: 'notAtThisMoment', ghost: 'notAtThisMoment', proposed: 'mapProposed', new: 'mapNew' };
const MAP_ZOOM = [0.25, 2.5], MAP_NUDGE = 12;
/** Each node's size on the canvas, as its CSS draws it: the edges leave and arrive at its sides. */
export const STORY_MAP_NODE = { character: [184, 56], place: [220, 56], event: [204, 56] } as const;
const mapClamp = (k: number) => Math.min(MAP_ZOOM[1], Math.max(MAP_ZOOM[0], k));
const sizeOf = (n: { kind?: 'character' | 'place' }) => { const s = STORY_MAP_NODE[n.kind || 'event']; return { w: s[0], h: s[1] }; };

function MapMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <path d="M52 17a33 33 0 1 0 0.01 0Z M58 31a22 22 0 1 1 -0.01 0Z" fillRule="evenodd" /><circle cx={67} cy={62} r={5} />
    </svg>
  );
}

/** The path of an edge between two points, curving out level from each as React Flow draws a bezier. */
export function storyMapCurve(sx: number, sy: number, tx: number, ty: number, flow?: StoryMapFlow): string {
  if (flow === 'down') { const e = Math.max(36, Math.abs(ty - sy) / 2) * (ty >= sy ? 1 : -1); return 'M' + sx + ' ' + sy + ' C' + sx + ' ' + (sy + e) + ' ' + tx + ' ' + (ty - e) + ' ' + tx + ' ' + ty; }
  const d = Math.max(36, Math.abs(tx - sx) / 2) * (tx >= sx ? 1 : -1);
  return 'M' + sx + ' ' + sy + ' C' + (sx + d) + ' ' + sy + ' ' + (tx - d) + ' ' + ty + ' ' + tx + ' ' + ty;
}

/** Where a node's handles stand: on the sides a drawn link lands (`in`, `out`), or the sides routed links name (`sides`). */
export interface StoryMapPorts {
  /** A drawn link arrives. */
  in?: boolean;
  /** A drawn link leaves. */
  out?: boolean;
  /** The sides routed links meet it by, from storyMapView.route's `out` and `into`. */
  sides?: ('top' | 'bottom' | 'left' | 'right')[];
}

/* Handles only where edges attach, as React Flow draws a source and a target. Given `ports`, only where a drawn link lands: on a long
   story most links are not drawn, and a ring on every node would be noise. Without, a character gives, a place receives, an event both */
function handles(kind: 'character' | 'place' | 'event', flow?: StoryMapFlow, ports?: StoryMapPorts) {
  const into = flow === 'down' ? 'top' : 'left', out = flow === 'down' ? 'bottom' : 'right';
  /* Routed links (storyMapView.route) name the sides they meet a node by: a routed card's handle stands on its left */
  const s = ports && ports.sides ? ports.sides : ports ? [ports.in && into, ports.out && out].filter((x): x is string => !!x) : kind === 'character' ? [out] : kind === 'place' ? [into] : [into, out];
  return s.map((side) => <i key={side} className={'sk-map__handle is-' + side} aria-hidden="true" />);
}
/* A lead ("Event 9") tells same-named events apart, so it is never the part cut: the words after it give way */
function second(b: BadgeSpec | undefined, words: string | undefined, lead?: string) {
  return (
    <span className="sk-map__meta">{b && <Badge variant={b.variant || 'neutral'} icon={b.icon}>{b.label}</Badge>}
      {lead ? <small className="is-led"><span className="sk-map__lead">{lead + (words ? '\u00a0·\u00a0' : '')}</span>{words && <span className="sk-map__rest">{words}</span>}</small> : words && <small>{words}</small>}
    </span>
  );
}

export interface StoryMapNodeProps {
  /** A hub (character or place) or an event. */
  node: { hub: StoryMapHub } | { event: StoryMapEvent };
  /** Where it sits on the canvas; left out, the node is not placed by itself. */
  at?: Point;
  /** Which sides its handles are on. */
  flow?: StoryMapFlow;
  /** Where drawn links land: a handle only on those sides. Left out, a character gives, a place receives, an event both. */
  ports?: StoryMapPorts;
  /** Lifts it with a shadow while it moves. */
  dragging?: boolean;
  /** Reads it as movable. */
  movable?: boolean;
  /** Makes it a button. */
  onSelect?: (id: string, kind: 'hub' | 'event') => void;
  /** A link or arc with a warning touches it: read "a link with a warning" after its name, as StoryMap reads its own. */
  warned?: boolean;
}

/**
 * One hub or event of StoryMap, as the map draws it: a flat panel with its picture, its name, its quiet line and its handles.
 * StoryMap draws these; a page that mounts the map on React Flow draws its custom nodes with it, inside an `sk-map` root.
 *
 * Accessibility: Read with what the drawing shows (an event's type, its lead and what told it, "proposed", "new", "not at this
 * moment", "not placed", "a link with a warning"), and as
 * "movable" when it is; with `onSelect` it is a button.
 *
 * @version 2.4
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function StoryMapNode({ node, at, flow, ports, dragging, movable, onSelect, warned }: StoryMapNodeProps) {
  const tx = useWords(ownWords);
  function item(id: string, kind: 'hub' | 'event', name: string) {
    const pick = onSelect ? () => onSelect(id, kind) : null;
    return { 'data-map-item': kind, 'data-map-id': id, ...(pick ? pressProps(pick) : { tabIndex: -1 }), ...(pick || movable ? { 'aria-label': name } : null),
      ...(movable ? { 'aria-roledescription': tx('mapMovable') } : null) };
  }
  const style = at ? { left: at.x, top: at.y } : undefined;
  if ('hub' in node) {
    const hb = node.hub, place = hb.kind === 'place';
    /* No picture yet: a place shows AniCanon's mark on the canvas colour, a character their age figure */
    const art = place
      ? (hb.image ? <img className="sk-map__art" src={hb.image} alt="" draggable={false} /> : <span className="sk-map__art sk-map__art--empty"><MapMark className="sk-map__mark" /></span>)
      : (hb.image ? <img className="sk-map__face" src={hb.image} alt="" draggable={false} />
        : <span className="sk-map__face sk-map__face--empty" aria-hidden="true"><Icon name={hb.figure || 'age-adult'} size={22} /></span>);
    const word = [MAP_STATE[hb.state as string] && tx(MAP_STATE[hb.state as string]), warned && tx('mapWarning')].filter(Boolean).join(', ');
    return (
      <div className={cx('sk-map__node', 'sk-map__hub', 'sk-map__hub--' + (hb.kind || 'character'), hb.state === 'focus' && 'is-focus', hb.state === 'dim' && 'is-dim', hb.muted && 'is-muted', dragging && 'is-dragging')}
        style={style} aria-current={hb.state === 'focus' ? 'true' : undefined} {...item(hb.id, 'hub', [hb.label, hb.badge && hb.badge.label, word].filter(Boolean).join(', '))}>
        {art}<span className="sk-map__text"><b title={hb.label}>{hb.label}</b>{second(hb.badge, hb.sub || tx(place ? 'mapPlace' : 'character'))}</span>
        {handles(hb.kind || 'character', flow, ports)}{word && <span className="sk-sr">{', ' + word}</span>}
      </div>
    );
  }
  const ev = node.event, type = ev.type || 'event', kind = EVENT_WORD[type as EventType] ? tx(EVENT_WORD[type as EventType]) : type;
  const words = [MAP_STATE[ev.state as string] && tx(MAP_STATE[ev.state as string]), ev.unplaced && tx('notPlaced'), warned && tx('mapWarning')].filter(Boolean).join(', ');
  return (
    <div className={cx('sk-map__node', 'sk-map__event', ev.state && 'is-' + ev.state, ev.unplaced && 'is-unplaced', dragging && 'is-dragging')} style={style}
      aria-current={ev.state === 'focus' ? 'true' : undefined} {...item(ev.id, 'event', [tx('eventTitled', { type: kind, title: ev.label }), ev.lead, ev.sub, ev.badge && ev.badge.label, words].filter(Boolean).join(', '))}>
      <span className="sk-map__glyph"><EventGlyph type={ev.type} size={20} tone={(ev.state === 'focus' || ev.state === 'proposed' || ev.state === 'new') ? 'accent' : 'auto'} /></span>
      <span className="sk-map__text"><b title={ev.label}><span className="sk-sr">{kind + ': '}</span>{ev.label}</b>{second(ev.badge, [type !== 'event' && kind, ev.sub].filter(Boolean).join(' · '), ev.lead)}</span>
      {handles('event', flow, ports)}{words && <span className="sk-sr">{', ' + words}</span>}
    </div>
  );
}

export interface StoryMapGroupFrameProps {
  /** The arc: its name and the frame it covers on the canvas. */
  group: StoryMapGroup;
}

/**
 * An arc as a group on StoryMap's canvas: a frame under the events in it, named in its corner.
 *
 * Accessibility: Hidden from screen readers; the arcs are said by StoryScrubber.
 *
 * @version 2.4
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function StoryMapGroupFrame({ group: g }: StoryMapGroupFrameProps) {
  return <div className={cx('sk-map__group', g.dashed && 'is-dashed')} aria-hidden="true" style={{ left: g.x0, top: g.y0, width: g.x1 - g.x0, height: g.y1 - g.y0 }}><span>{g.label}</span></div>;
}

export interface StoryMapToolsProps {
  /** Zoom in. */
  onZoomIn: () => void;
  /** Zoom out. */
  onZoomOut: () => void;
  /** Fit the map. */
  onFit: MouseEventHandler;
  /** `false` leaves out the key's button. */
  legend?: boolean;
  /** Whether the key is shown. */
  keyOpen: boolean;
  /** The key's button. */
  onKey: () => void;
}

/**
 * StoryMap's controls, as React Flow's, stacked in the bottom corner: zoom in, zoom out, Fit and the key.
 *
 * Accessibility: A group named "Zoom" holding "Zoom in", "Zoom out", "Fit the map" and "Key", a toggle that says whether the key
 * is expanded.
 *
 * @version 2.4
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function StoryMapTools({ onZoomIn, onZoomOut, onFit, legend, keyOpen, onKey }: StoryMapToolsProps) {
  const tx = useWords(ownWords);
  return (
    <div className="sk-map__tools" role="group" aria-label={tx('mapZoom')}>
      <IconButton variant="plain" icon="plus" label={tx('zoomIn')} onClick={onZoomIn} />
      <IconButton variant="plain" icon="minus" label={tx('zoomOut')} onClick={onZoomOut} />
      <IconButton variant="plain" icon="fullscreen" label={tx('fitMap')} onClick={onFit} />
      {legend !== false && <IconButton variant="plain" icon="info" label={tx('mapKey')} pressed={keyOpen} aria-expanded={keyOpen ? 'true' : 'false'} onClick={onKey} />}
    </div>
  );
}

export interface StoryMapKeyProps {
  /** Shows it. */
  open: boolean;
  /** Its id. */
  id?: string;
}

/**
 * StoryMap's key, opening beside the controls: each event type's shape and its name, and what the hubs are.
 *
 * Accessibility: Text; hidden until it is open.
 *
 * @version 2.4
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function StoryMapKey({ open, id }: StoryMapKeyProps) {
  const tx = useWords(ownWords);
  return (
    <div className="sk-map__key" id={id} hidden={!open}>
      {GLYPH_TYPES.map((t) => <span key={t}><EventGlyph type={t} size={11} />{tx(EVENT_WORD[t])}</span>)}
      <span className="is-muted">{tx('mapHubs')}</span>
    </div>
  );
}

export interface StoryMapOverviewProps {
  /** Every hub and event, where it sits now. */
  nodes: { id: string; x: number; y: number; kind?: 'character' | 'place'; state?: string }[];
  /** What everything on the canvas covers. */
  bounds: StoryMapBounds;
  /** The canvas's offset and zoom. */
  view: StoryMapView;
  /** The pane's size. */
  size: { w: number; h: number };
  /** A press or a drag here: the view, centred on that place. */
  onView: (view: StoryMapView) => void;
}

/**
 * StoryMap's minimap, as React Flow's: every hub and event as a block and the part out of view shaded; a press or a drag there
 * moves the view to it.
 *
 * Accessibility: A picture named "The whole map, with the part in view framed"; the arrows and Fit reach everything it does.
 *
 * @version 2.4
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function StoryMapOverview({ nodes, bounds: ob, view: v, size: s, onView }: StoryMapOverviewProps) {
  const tx = useWords(ownWords);
  const vx0 = -v.x / v.k, vy0 = -v.y / v.k, vx1 = vx0 + s.w / v.k, vy1 = vy0 + s.h / v.k;
  const ux0 = Math.min(ob.x0, vx0), uy0 = Math.min(ob.y0, vy0), ux1 = Math.max(ob.x1, vx1), uy1 = Math.max(ob.y1, vy1);
  const OW = 184, OH = 124, os = Math.min(OW / (ux1 - ux0), OH / (uy1 - uy0)), ox = (OW - (ux1 - ux0) * os) / 2, oy = (OH - (uy1 - uy0) * os) / 2;
  const mx = (x: number) => ox + (x - ux0) * os, my = (y: number) => oy + (y - uy0) * os;
  const goTo = (e: ReactPointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), wx = ux0 + (e.clientX - r.left - ox) / os, wy = uy0 + (e.clientY - r.top - oy) / os;
    onView({ x: s.w / 2 - wx * v.k, y: s.h / 2 - wy * v.k, k: v.k });
  };
  const fx = mx(vx0), fy = my(vy0), fw = (vx1 - vx0) * os, fh = (vy1 - vy0) * os;
  return (
    <div className="sk-map__overview" role="img" aria-label={tx('mapOverview')}>
      <svg width={OW} height={OH} viewBox={'0 0 ' + OW + ' ' + OH}
        onPointerDown={(e) => { if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId); goTo(e); }} onPointerMove={(e) => { if (e.buttons) goTo(e); }}>
        {nodes.map((n) => { const b2 = sizeOf(n); return <rect key={n.id} x={mx(n.x - b2.w / 2)} y={my(n.y - b2.h / 2)} width={b2.w * os} height={b2.h * os} rx={1.5} className={cx('sk-map__ovnode', n.state === 'focus' && 'is-focus')} />; })}
        <path className="sk-map__ovshade" fillRule="evenodd" d={'M0 0H' + OW + 'V' + OH + 'H0Z M' + fx + ' ' + fy + 'h' + fw + 'v' + fh + 'h' + (-fw) + 'Z'} />
        <rect className="sk-map__ovview" x={fx} y={fy} width={fw} height={fh} />
      </svg>
    </div>
  );
}

export interface StoryMapHeldProps {
  /** The node's name, or how many ("3 more"). */
  name: string;
  /** The way to it. */
  direction?: 'left' | 'right' | 'up' | 'down';
  /** What a screen reader hears, when not "Show {name}". */
  label?: string;
  /** Where it stands at the pane's edge. */
  style?: CSSProperties;
  /** Brings it into view. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Extra class on the root element. */
  className?: string;
}

/* A node a drawn link runs to, out of view: held at the pane's edge, named, its arrow pointing the way; pressing it brings the node
   into view. A press never starts a pan of the ground under it. */
/**
 * A held label: a node a drawn link runs to, out of view, named at the pane's edge with an arrow towards it; pressing it brings it
 * into view. StoryMap draws its own with `held`; a map on another canvas draws them with `StoryMapHeldNames`.
 *
 * Accessibility: A button named "Show {name}" (or `label`), reached after the map's hubs and events; the arrow is hidden.
 *
 * @version 2.4
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function StoryMapHeld({ name, direction, label, style, onClick, className }: StoryMapHeldProps) {
  const tx = useWords(ownWords);
  const dir = direction || 'right', icon = ('chevron-' + dir) as IconName;
  const arrow = <Icon name={icon} size="var(--map-held-icon-size)" />;
  return (
    <button type="button" className={cx('sk-map__held', 'is-' + dir, className)} style={style} aria-label={label || tx('showMoment', { name })}
      onPointerDown={(e) => e.stopPropagation()} onClick={onClick}>
      {(dir === 'left' || dir === 'up') && arrow}{name}{(dir === 'right' || dir === 'down') && arrow}
    </button>
  );
}

export interface StoryMapHeldNamesProps {
  /** The map as drawn: its hubs and events where they stand, its links and groups. */
  map: StoryMapShape;
  /** The canvas's offset and zoom. */
  view: StoryMapViewAt;
  /** The pane's size. */
  size: StoryMapSize;
  /** The minimap's corner, or false. */
  overview?: StoryMapViewOptions['overview'];
  /** The selection's chip in the top left: true, or its width. */
  chip?: boolean | number;
  /** The room the pane's own controls take at each edge. */
  chrome?: StoryMapViewOptions['chrome'];
  /** Brings a point (the group's middle, in canvas units) into view at the zoom shown. */
  onShow?: (x: number, y: number) => void;
}

/* The held names as a part, for a map on another canvas: give it the map, its view and size, and `onShow` to bring a point
   (the group's middle, in canvas units) into view at the zoom shown */
/**
 * All of a map's held names, one per edge, for a map on another canvas (React Flow): a node a drawn link runs to, out of view, is
 * named at the edge the link leaves by; several out of view the same way are one label, "4 more", so held names never stack.
 *
 * Accessibility: Each is a button named "Show {name}", or "Show {count} more: {names}" for several; the arrows are hidden.
 *
 * @version 2.4
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function StoryMapHeldNames(props: StoryMapHeldNamesProps) {
  const tx = useWords(ownWords);
  if (!props.size || !props.size.w || !props.size.h || !props.view) return null;
  const list = storyMapView.held(props.map, props.view, props.size, { overview: props.overview, chip: props.chip, chrome: props.chrome }, (n) => tx('heldMore', { count: n }));
  return (
    <>
      {list.map((it) => (
        <StoryMapHeld key={it.key} name={it.name} direction={it.direction} label={it.count > 1 ? tx('showHeldMore', { count: it.count, names: tx.list(it.names) }) : undefined}
          style={{ left: it.x, top: it.y, transform: 'translate(' + it.gx + ',' + it.gy + ')' }} onClick={() => { if (props.onShow) props.onShow(it.to.x, it.to.y); }} />
      ))}
    </>
  );
}

/**
 * StoryMap draws the story on a canvas you move: characters (portraits) and places (art) are hubs; events are small shapes,
 * linked to the hubs they involve. `frame` opens a long story on the moment's stretch at 100%; `held` keeps a node a drawn link
 * runs to named at the pane's edge while it is out of view. Handles sit only where a drawn link lands.
 *
 * Not for moving through the story in story order (`StoryScrubber`); the same characters, places and events as rows in a panel
 * (`EntityRow`); the open questions the audience waits on (`QuestionRow`).
 *
 * Accessibility: A group named by `label` (default "Story map: characters and places as hubs, events between them") whose hubs
 * and events are one Tab stop the arrows move through, each read with what the drawing shows (an event's type, "proposed",
 * "new", "not at this moment", "not placed", "current" on the focus) and, when `interactive`, as "movable". Dragging has a
 * keyboard way: Shift and an arrow moves the hub or event in focus, and + and − zoom. With `onSelect` each is a button. Tab then
 * reaches the held labels ("Show Mio"), the chip, the zoom group ("Zoom in", "Zoom out"), "Fit the map" and "Key", which says whether the key is expanded. The
 * overview is a picture named "The whole map, with the part in view framed". A dimmed, ghost or muted one fades its art and
 * marks while its words stay readable.
 *
 * @version 2.10
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function StoryMap(props: StoryMapProps) {
  const tx = useWords(ownWords);
  const W = props.width || 812, H = props.height || 650, box = useRef<HTMLDivElement>(null);
  const movable = !!props.interactive, flow = props.flow;
  const nodes: MapNode[] = [...(props.hubs || []), ...(props.events || [])];
  const placed = nodes.map((n) => n.id + ':' + n.x + ',' + n.y).join('|');
  const seed = () => { const p: Record<string, Point> = {}; nodes.forEach((n) => { p[n.id] = { x: n.x, y: n.y }; }); return mapSpread(nodes, p); };
  const [pos, setPos] = useState<Record<string, Point>>(seed);
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  useEffect(() => { setPos(seed()); }, [placed]);
  const [view, setView] = useState<StoryMapView | null>(null);
  const viewRef = useRef<StoryMapView | null>(null); viewRef.current = view;
  const [dragging, setDragging] = useState<string | null>(props.dragging || null);
  const [panning, setPanning] = useState(false);
  const [keyOpen, setKeyOpen] = useState(!!props.keyOpen);
  const press = useRef<{ px: number; py: number; id: string | null; o: Point; moved: boolean; pointer: number } | null>(null), swallow = useRef(false);
  const keys = useRoving(box, { selector: '[data-map-item]', active: '[aria-current="true"]' });
  const at = (id: string) => pos[id] || { x: 0, y: 0 };
  /* What a set of nodes covers on the canvas, each at its size */
  function cover(list: MapNode[]): StoryMapBounds | null {
    let b: StoryMapBounds | null = null;
    for (const n of list) {
      const p = at(n.id), s = sizeOf(n);
      const x0 = p.x - s.w / 2, y0 = p.y - s.h / 2, x1 = p.x + s.w / 2, y1 = p.y + s.h / 2;
      b = b ? { x0: Math.min(b.x0, x0), y0: Math.min(b.y0, y0), x1: Math.max(b.x1, x1), y1: Math.max(b.y1, y1) } : { x0, y0, x1, y1 };
    }
    return b;
  }
  function bounds(): StoryMapBounds {
    const b = cover(nodes);
    if (!b) return { x0: 0, y0: 0, x1: W, y1: H };
    for (const g of props.groups || []) { b.x0 = Math.min(b.x0, g.x0); b.y0 = Math.min(b.y0, g.y0); b.x1 = Math.max(b.x1, g.x1); b.y1 = Math.max(b.y1, g.y1); }
    return b;
  }
  const size = () => { const el = box.current; return el ? { w: el.clientWidth, h: el.clientHeight } : { w: W, h: H }; };
  /* The map as drawn now (cards where they were dragged), for the view math every map shares (storyMapView) */
  function drawn(): StoryMapShape {
    const place = <T extends { id: string }>(n: T) => ({ ...n, ...at(n.id) });
    return { hubs: (props.hubs || []).map(place), events: (props.events || []).map(place), links: props.links || [], groups: props.groups || [] };
  }
  function viewOpts(): StoryMapViewOptions {
    const el = box.current, t = el && el.querySelector<HTMLElement>('.sk-map__tools');
    return { chrome: t ? { left: Math.max(storyMapView.chrome.left, t.offsetLeft + t.offsetWidth + 12) } : undefined, overview: props.overview && size().w >= 560 ? undefined : false,
      chip: !!props.chip, minZoom: props.minZoom, frame: props.frame, moment: props.moment, zoom: props.zoom };
  }
  const asView = (q: StoryMapViewAt): StoryMapView => ({ x: q.x, y: q.y, k: q.k });
  /* Fit: all of it when it reads, else the selection and its events, the moment's stretch or the start; fit="focus": the selection */
  function fitView(toFocus?: boolean): StoryMapView { const m = drawn(), sz = size(), o = viewOpts(); return asView((toFocus && storyMapView.focus(m, sz, o)) || storyMapView.fit(m, sz, o)); }
  function frameView(zoomTo?: number): StoryMapView | null { const fv = storyMapView.frame(drawn(), props.frame || [], size(), viewOpts(), zoomTo || props.zoom || 1); return fv && asView(fv); }
  /* Where the map opens: `view` as given; a frame; fit="focus" on the selection; a bare fit where every map opens (storyMapView.open) */
  function startView(): StoryMapView {
    if (props.view) return { x: props.view.x || 0, y: props.view.y || 0, k: mapClamp(props.view.zoom || 1) };
    if (props.frame && props.frame.length) { const fv = frameView(); if (fv) return fv; }
    if (props.fit === 'focus') return fitView(true);
    if (props.fit) return asView(storyMapView.open(drawn(), size(), viewOpts()));
    /* Cards spread apart past the area the map was laid out in: it opens as Fit does: all of them while they read, else where Fit would */
    const bb = bounds(); if (bb.x0 < 0 || bb.y0 < 0 || bb.x1 > W || bb.y1 > H) return fitView();
    const sz = size(), k = mapClamp(props.zoom || 1);
    return { x: (sz.w - W * k) / 2, y: Math.max(0, (sz.h - H * k) / 2), k };
  }
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  useLayoutEffect(() => { setView(startView()); }, []);
  const v = view || { x: 0, y: 0, k: 1 };
  function zoomAt(k2: number, px?: number, py?: number) {
    const c = viewRef.current || v; k2 = mapClamp(k2);
    if (px === undefined || py === undefined) { const s = size(); px = s.w / 2; py = s.h / 2; }
    setView({ x: px - (px - c.x) * (k2 / c.k), y: py - (py - c.y) * (k2 / c.k), k: k2 });
  }
  function zoomBy(f: number) { zoomAt((viewRef.current || v).k * f); if (f > 1 && props.onZoomIn) props.onZoomIn(); }
  function fit(e: ReactMouseEvent<HTMLElement>) { setView(fitView()); if (props.onFit) props.onFit(e); }
  useEffect(() => {
    const el = box.current;
    if (!movable || !el) return undefined;
    /* The wheel zooms around the pointer; a pinch on a trackpad arrives as the wheel with Ctrl held, and zooms finer. It is
       listened to directly, not through React, so it can keep the page from scrolling */
    function wheel(e: WheelEvent) {
      e.preventDefault();
      const r = el!.getBoundingClientRect(), c = viewRef.current; if (!c) return;
      zoomAt(c.k * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), e.clientX - r.left, e.clientY - r.top);
    }
    el.addEventListener('wheel', wheel, { passive: false });
    return () => { el.removeEventListener('wheel', wheel); };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [movable]);
  function down(e: ReactPointerEvent<HTMLDivElement>) {
    if (!movable || e.button !== 0 || !view) return;
    const t = e.target as HTMLElement;
    if (t.closest('.sk-map__tools,.sk-map__overview,.sk-map__chip,.sk-map__key')) return;
    const node = t.closest('[data-map-id]'), id = node && node.getAttribute('data-map-id');
    press.current = { px: e.clientX, py: e.clientY, id, o: id ? at(id) : { x: v.x, y: v.y }, moved: false, pointer: e.pointerId };
  }
  function move(e: ReactPointerEvent<HTMLDivElement>) {
    const p = press.current;
    if (!p || p.pointer !== e.pointerId) return;
    const dx = e.clientX - p.px, dy = e.clientY - p.py;
    if (!p.moved) {
      if (Math.abs(dx) + Math.abs(dy) < 5) return;
      p.moved = true;
      if (box.current && box.current.setPointerCapture) box.current.setPointerCapture(e.pointerId);
      if (p.id) setDragging(p.id); else setPanning(true);
    }
    const c = viewRef.current!;
    if (p.id) { const id = p.id; setPos((cur) => ({ ...cur, [id]: { x: p.o.x + dx / c.k, y: p.o.y + dy / c.k } })); }
    else setView({ x: p.o.x + dx, y: p.o.y + dy, k: c.k });
  }
  function up(e: ReactPointerEvent<HTMLDivElement>) {
    const p = press.current;
    press.current = null;
    if (!p || !p.moved) return;
    /* A press that moved is a drag, never a click: the click that follows is swallowed */
    swallow.current = true;
    setDragging(null); setPanning(false);
    if (p.id && props.onMove) { const c = viewRef.current!; props.onMove(p.id, Math.round(p.o.x + (e.clientX - p.px) / c.k), Math.round(p.o.y + (e.clientY - p.py) / c.k)); }
  }
  function keyDown(e: KeyboardEvent<HTMLDivElement>) {
    const arrow = ({ ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] } as Record<string, number[]>)[e.key];
    const t = e.target as HTMLElement, mine = t.closest && t.closest('[data-map-id]');
    if (movable && arrow && e.shiftKey && mine) {
      e.preventDefault();
      const id = mine.getAttribute('data-map-id')!, o = at(id), n = { x: o.x + arrow[0] * MAP_NUDGE, y: o.y + arrow[1] * MAP_NUDGE };
      setPos((cur) => ({ ...cur, [id]: n }));
      if (props.onMove) props.onMove(id, n.x, n.y);
      return;
    }
    if (movable && !t.closest('.sk-map__tools') && (e.key === '+' || e.key === '=' || e.key === '-')) { e.preventDefault(); zoomBy(e.key === '-' ? 1 / 1.25 : 1.25); return; }
    keys(e);
  }
  const byId: Record<string, MapNode> = {}; nodes.forEach((n) => { byId[n.id] = n; });
  /* An edge leaves the side of one node that faces the other and arrives at the other's facing side, curving out level as it goes */
  function joined(a: MapNode, b: MapNode) {
    const pa = at(a.id), pb = at(b.id), sa = sizeOf(a), sb = sizeOf(b);
    if (flow === 'down') { const below = pb.y >= pa.y; return storyMapCurve(pa.x, pa.y + (below ? sa.h : -sa.h) / 2, pb.x, pb.y + (below ? -sb.h : sb.h) / 2, flow); }
    const right = pb.x >= pa.x;
    return storyMapCurve(pa.x + (right ? sa.w : -sa.w) / 2, pa.y, pb.x + (right ? -sb.w : sb.w) / 2, pb.y, flow);
  }
  /* An edge's end on a card's centre follows the card wherever it was spread or dragged to */
  const centre: Record<string, string> = {}; nodes.forEach((n) => { centre[n.x + ',' + n.y] = n.id; });
  const follow = (x: number, y: number): Point => { const id = centre[x + ',' + y]; return id ? at(id) : { x, y }; };
  const edges = (props.edges || []).map((e, i) => { const e1 = follow(e.x1, e.y1), e2 = follow(e.x2, e.y2); return (
    <path key={'e' + i} d={storyMapCurve(e1.x, e1.y, e2.x, e2.y, flow)} className={cx('sk-map__edge', e.tone === 'accent' && 'is-accent', e.tone === 'warning' && 'is-warning', e.dim && 'is-dim', e.dashed && 'is-dashed')} />
  ); });
  /* Drawn top to bottom, links run as storyMapView.route says: a hub with many links as a trunk and its branches */
  const drawnLinks = (props.links || []).filter((l) => byId[l.from] && byId[l.to]);
  const routed = flow === 'down' ? storyMapView.route(drawn()) : null, sides: Record<string, Record<string, boolean>> = {};
  /* Each node's handles stand where its routed links meet it */
  if (routed) drawnLinks.forEach((l, i) => { (sides[l.from] = sides[l.from] || {})[routed[i].out] = true; (sides[l.to] = sides[l.to] || {})[routed[i].into] = true; });
  const links = drawnLinks.map((l, i) => (
    <path key={'l' + i} d={routed ? routed[i].d : joined(byId[l.from], byId[l.to])} className={cx('sk-map__edge', l.tone === 'accent' && 'is-accent', l.tone === 'warning' && 'is-warning', l.dim && 'is-dim', l.dashed && 'is-dashed', l.quiet && 'is-quiet')} />
  ));
  /* A cause or a conflict between two events: within one column it bows out past their right sides; across columns it joins their facing sides */
  /* Arcs that meet one card edge stand apart along it (storyMapView.arcSlots) */
  const slots = storyMapView.arcSlots({ ...drawn(), arcs: props.arcs || [] });
  const arcs = (props.arcs || []).map((a, i) => {
    let d: string;
    if (a.from && a.to && byId[a.from] && byId[a.to]) {
      const o = slots[i], p1 = at(a.from), p2 = at(a.to), w1 = sizeOf(byId[a.from]).w / 2, w2 = sizeOf(byId[a.to]).w / 2, y1 = p1.y + o[0], y2 = p2.y + o[1];
      if (Math.abs(p1.x - p2.x) < 8) { const bx = Math.max(p1.x + w1, p2.x + w2) + 56 + (a.bend || 0); d = 'M' + (p1.x + w1) + ' ' + y1 + ' C' + bx + ' ' + y1 + ' ' + bx + ' ' + y2 + ' ' + (p2.x + w2) + ' ' + y2; }
      else { const right = p2.x > p1.x; d = storyMapCurve(p1.x + (right ? w1 : -w1), y1, p2.x + (right ? -w2 : w2), y2, flow); }
    } else {
      const q1 = { x: a.x1 || 0, y: a.y1 || 0 }, q2 = { x: a.x2 || 0, y: a.y2 || 0 }, mx = (q1.x + q2.x) / 2 + (a.bend || 0), my = (q1.y + q2.y) / 2 - 40;
      d = 'M' + q1.x + ' ' + q1.y + ' Q' + mx + ' ' + my + ' ' + q2.x + ' ' + q2.y;
    }
    return <path key={'a' + i} d={d} className={cx('sk-map__arc', a.tone === 'warning' && 'is-warning', a.dashed && 'is-dashed')} markerEnd={a.tone === 'warning' ? 'url(#sk-map-arrow-warning)' : 'url(#sk-map-arrow)'} />;
  });
  /* An arc with a warning is drawn over the rest */
  const warnArc = (i: number) => (props.arcs || [])[i]?.tone === 'warning';
  const arcsDrawn = arcs.filter((_, i) => !warnArc(i)).concat(arcs.filter((_, i) => warnArc(i)));
  /* The lines are drawn where a screen reader does not go: each node a line with a warning touches says so after its name */
  const warned: Record<string, boolean> = {};
  ([] as { from?: string; to?: string; tone?: string }[]).concat(props.links || [], props.arcs || []).forEach((l) => {
    if (l.tone === 'warning') { if (l.from) warned[l.from] = true; if (l.to) warned[l.to] = true; }
  });
  /* A handle only where a drawn link attaches */
  const linkIn: Record<string, boolean> = {}, linkOut: Record<string, boolean> = {};
  (props.links || []).forEach((l) => { linkOut[l.from] = true; linkIn[l.to] = true; });
  const ports = (id: string): StoryMapPorts => (routed ? { sides: Object.keys(sides[id] || {}) as StoryMapPorts['sides'] } : { in: !!linkIn[id], out: !!linkOut[id] });
  /* held: a node a drawn link runs to, out of view, is held at the pane's edge where the link leaves it, named, with an arrow towards
     it; pressing it brings it into view. So the moment's cast and place are always named on the map, wherever they sit. */
  let held: ReactNode[] | null = null;
  if (props.held && view) {
    const hsz = size();
    held = storyMapView.held(drawn(), v, hsz, viewOpts(), (n) => tx('heldMore', { count: n })).map((it) => (
      <StoryMapHeld key={it.key} name={it.name} direction={it.direction} label={it.count > 1 ? tx('showHeldMore', { count: it.count, names: tx.list(it.names) }) : undefined}
        style={{ left: it.x, top: it.y, transform: 'translate(' + it.gx + ',' + it.gy + ')' }}
        onClick={() => { const c = viewRef.current || v; setView({ x: hsz.w / 2 - it.to.x * c.k, y: hsz.h / 2 - it.to.y * c.k, k: c.k }); }} />
    ));
  }
  /* As React Flow's minimap, in the bottom corner; only while part of the map is out of view, so at Fit it never covers a node */
  let overview: ReactNode = null;
  if (props.overview && view) {
    const s0 = size(), b0 = bounds();
    const allIn = b0.x0 * v.k + v.x >= 0 && b0.y0 * v.k + v.y >= 0 && b0.x1 * v.k + v.x <= s0.w && b0.y1 * v.k + v.y <= s0.h;
    if (!allIn && s0.w >= 560) overview = <StoryMapOverview nodes={nodes.map((n) => ({ id: n.id, kind: n.kind, state: n.state, ...at(n.id) }))} bounds={b0} view={v} size={s0} onView={setView} />;
  }
  return (
    <div ref={box} className={cx('sk-map', movable && 'is-movable', panning && 'is-panning', props.className)} role="group" aria-label={props.label || tx('storyMap')}
      style={{ height: props.height }} onKeyDown={keyDown} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      onClickCapture={(e) => { if (swallow.current) { swallow.current = false; e.stopPropagation(); e.preventDefault(); } }}>
      <div className="sk-map__canvas" style={{ width: W, height: H, transform: 'translate(' + v.x + 'px,' + v.y + 'px) scale(' + v.k + ')', visibility: view ? undefined : 'hidden' }}>
        <svg className="sk-map__lines" width={W} height={H} viewBox={'0 0 ' + W + ' ' + H} overflow="visible" aria-hidden="true">
          <defs>
            <pattern id="sk-map-dots" width={20} height={20} patternUnits="userSpaceOnUse"><circle cx={1} cy={1} r={1} className="sk-map__dot" /></pattern>
            <marker id="sk-map-arrow" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={7} markerHeight={7} orient="auto"><path d="M0 0 L8 4 L0 8 Z" className="sk-map__arrowhead" /></marker>
            <marker id="sk-map-arrow-warning" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={7} markerHeight={7} orient="auto"><path d="M0 0 L8 4 L0 8 Z" className="sk-map__arrowhead is-warning" /></marker>
          </defs>
          <rect x={-4000} y={-4000} width={8000 + W} height={8000 + H} fill="url(#sk-map-dots)" />{edges}{links}{arcsDrawn}
        </svg>
        {(props.groups || []).map((g, i) => <StoryMapGroupFrame key={'g' + i} group={g} />)}
        {(props.hubs || []).map((hb) => <StoryMapNode key={hb.id} node={{ hub: hb }} at={at(hb.id)} flow={flow} ports={ports(hb.id)} dragging={dragging === hb.id} movable={movable} onSelect={props.onSelect} warned={warned[hb.id]} />)}
        {(props.events || []).map((ev) => <StoryMapNode key={ev.id} node={{ event: ev }} at={at(ev.id)} flow={flow} ports={ports(ev.id)} dragging={dragging === ev.id} movable={movable} onSelect={props.onSelect} warned={warned[ev.id]} />)}
        {props.children}
      </div>
      {held}
      {props.chip && <div className="sk-map__chip"><Chip variant="soft" removable icon="close" onClick={props.onChipRemove}>{props.chip}</Chip></div>}
      {props.tools === false ? null : <StoryMapTools onZoomIn={() => zoomBy(1.25)} onZoomOut={() => zoomBy(1 / 1.25)} onFit={fit} legend={props.legend} keyOpen={keyOpen} onKey={() => setKeyOpen(!keyOpen)} />}
      {props.legend === false ? null : <StoryMapKey open={keyOpen} id={(props.id || 'sk-map') + '-key'} />}
      {overview}
    </div>
  );
}
