import type { ReactElement } from 'react';
import type { WordKey } from '../../internal/words';
import { cx } from '../../internal/cx';
import '../../base.css';
import './EventGlyph.css';

export type EventType = 'event' | 'twist' | 'revelation' | 'clue' | 'goal';

export const GLYPH_TYPES: EventType[] = ['event', 'twist', 'revelation', 'clue', 'goal'];
/** Each event type's word, by key */
export const EVENT_WORD: Record<EventType, WordKey> = { event: 'eventEvent', twist: 'eventTwist', revelation: 'eventRevelation', clue: 'eventClue', goal: 'eventGoal' };

/* One mark per event type on the Icon set's 24 grid (stroke 2, round caps and joins). `small` is the cut drawn at 12 px and under,
   where a 2/24 stroke falls to a pixel: fewer parts, so the silhouette alone says the type. */
const EVENT_MARKS: Record<EventType, { svg: ReactElement; small?: ReactElement }> = {
  event: {
    svg: <><circle cx="12" cy="12" r="3" /><path d="M3 12h6M15 12h6" /></>,
    small: <><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" /><path d="M3 12h6M15 12h6" /></>,
  },
  twist: { svg: <><path d="M3 19h6c4.5 0 7-3.5 7-9.5V4" /><path d="M11.5 8.5L16 4l4.5 4.5" /><path d="M17 19h4" /></> },
  revelation: { svg: <><path d="M3 4h18" /><path d="M4 4v16h2.5c0-2.5-1-5-2.5-7 3-1.5 4.5-4 4.5-9" /><path d="M20 4v16h-2.5c0-2.5 1-5 2.5-7-3-1.5-4.5-4-4.5-9" /></> },
  clue: { svg: <path d="M4 9h5.5a3 3 0 115 0H20v2.5a3 3 0 100 5V20H4z" /> },
  goal: { svg: <path d="M6 21V3h13l-3.5 4.5L19 12H6" /> },
};

export interface EventGlyphProps {
  /** Which mark: event (a node on the story line), twist (the path swerves off), revelation (curtains tied back), clue (a puzzle piece), goal (a flag). */
  type: EventType;
  /** Its size in px; at 12 and under, event draws its small cut. */
  size?: number;
  /** `auto` paints a plain event in the text colour and the other four in the accent; `muted` for events outside the moment. */
  tone?: 'auto' | 'primary' | 'accent' | 'muted';
  /** Extra class on the root element. */
  className?: string;
}

/**
 * EventGlyph is the mark of an event type, the same everywhere a story event appears: map, scrubber, rows, mentions, pickers.
 *
 * Not for a glyph from the outline set (`Icon`); an event as a row with its state (`EntityRow`).
 *
 * Accessibility: Decorative: hidden from screen readers, so the event type it draws is not announced.
 *
 * @version 2.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function EventGlyph({ type, size, tone = 'auto', className }: EventGlyphProps) {
  const t: EventType = EVENT_MARKS[type] ? type : 'event', s = size || 12;
  const cls = cx('sk-glyph', 'sk-glyph--' + (tone === 'auto' ? (t === 'event' ? 'primary' : 'accent') : tone), className);
  const mark = EVENT_MARKS[t];
  return (
    <svg className={cls} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {s <= 12 && mark.small ? mark.small : mark.svg}
    </svg>
  );
}
