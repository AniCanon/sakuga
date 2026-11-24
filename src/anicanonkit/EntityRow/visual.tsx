import type { ReactNode } from 'react';
import { Icon, type IconName } from '@anicanon/sakuga/ui';
import { EventGlyph, type EventType } from '../EventGlyph/EventGlyph';
import '../../base.css';
import './EntityRow.css';

/** The picture a row starts with: a portrait, a bond, a place's art, an object, an event's mark, a question's track, an icon or Maki. */
export type Visual =
  | {
      /** A portrait. */
      kind: 'avatar';
      /** The face; without it, `initial`. */
      image?: string;
      /** Shown in the circle until there is a face. */
      initial?: string;
      /** The circle's size in px. */
      size?: number;
    }
  | {
      /** Two overlapping portraits, for a bond between two characters. */
      kind: 'pair';
      /** The two faces. */
      images: string[];
    }
  | {
      /** A place's art. */
      kind: 'place';
      /** The place's picture. */
      image?: string;
      /** Its width in px. */
      width?: number;
      /** Its height in px. */
      height?: number;
    }
  | {
      /** An event's shape. */
      kind: 'event';
      /** Which kind of event, drawn as its EventGlyph. */
      type: EventType;
    }
  | {
      /** An object's picture, square on the canvas colour; the thing glyph until it has one. */
      kind: 'object';
      /** The object's picture. */
      image?: string;
    }
  | {
      /** A question's three-step track: planted, raised, answered. */
      kind: 'question';
      /** How far it has come, 1 to 3. */
      stage: 1 | 2 | 3;
    }
  | {
      /** An icon from the outline set. */
      kind: 'icon';
      /** Which icon. */
      icon: IconName;
    }
  | {
      /** Maki, for something Maki raised. */
      kind: 'maki';
      /** Maki's face. */
      image: string;
    };

/* The picture an EntityRow, a ProposalCard or a QuestionRow starts with; not public in Version 215 */
export function EntityVisual({ visual }: { visual?: Visual }) {
  const v = visual;
  if (!v) return null;
  if (v.kind === 'avatar') {
    const size = v.size || 32;
    return v.image ? <img className="sk-ev sk-ev--avatar" src={v.image} alt="" style={{ width: size, height: size }} />
      : <span className="sk-ev sk-ev--avatar sk-ev--initial" aria-hidden="true" style={{ width: size, height: size }}>{v.initial || '?'}</span>;
  }
  if (v.kind === 'pair') return <span className="sk-ev sk-ev--pair">{(v.images || []).map((src, i) => <img key={i} src={src} alt="" />)}</span>;
  if (v.kind === 'place') return v.image ? <img className="sk-ev sk-ev--place" src={v.image} alt="" style={{ width: v.width || 44, height: v.height || 28 }} />
    : <span className="sk-ev sk-ev--place sk-ev--empty" style={{ width: v.width || 44, height: v.height || 28 }}><Icon name="backdrops" size="var(--entity-visual-place-icon-size)" /></span>;
  if (v.kind === 'event') return <span className="sk-ev sk-ev--slot"><EventGlyph type={v.type} size={16} /></span>;
  if (v.kind === 'object') return v.image ? <img className="sk-ev sk-ev--object" src={v.image} alt="" />
    : <span className="sk-ev sk-ev--slot sk-ev--icon"><Icon name="thing" size="var(--entity-visual-slot-icon-size)" /></span>;
  if (v.kind === 'question') {
    const pips: ReactNode[] = [];
    for (let k = 0; k < 3; k++) {
      pips.push(<i key={'p' + k} className={k < (v.stage || 1) ? 'is-on' : ''} />);
      if (k < 2) pips.push(<b key={'l' + k} className={k + 1 < (v.stage || 1) ? 'is-on' : ''} />);
    }
    return <span className="sk-ev sk-ev--slot sk-ev--question" aria-hidden="true">{pips}</span>;
  }
  if (v.kind === 'icon') return <span className="sk-ev sk-ev--slot sk-ev--icon"><Icon name={v.icon} size="var(--entity-visual-slot-icon-size)" /></span>;
  if (v.kind === 'maki') return <img className="sk-ev sk-ev--slot sk-ev--maki" src={v.image} alt="" />;
  return null;
}
