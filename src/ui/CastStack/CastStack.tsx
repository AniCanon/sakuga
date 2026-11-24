import { cx } from '../../internal/cx';
import { useWords } from '../../internal/words';
import '../../base.css';
import './CastStack.css';

export interface CastStackProps {
  /** Everyone in it, in order: a picture, or an initial until there is one. */
  people: { name: string; image?: string; initial?: string }[];
  /** Faces shown before +N. Default 4. */
  max?: number;
  /** Each face, in px. Default 24. */
  size?: number;
  /** Read by screen readers; the names by default. */
  label?: string;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * Who is in a take, at a glance: their faces overlapping, up to four, then +N for the rest. Each face is ringed in the ground
 * it sits on, so the overlap reads; screen readers hear the names.
 *
 * Not for one person with their name and role (`CastAvatar`); choosing who is in something (`CastAvatar` with `selected`); who
 * or what a prompt binds, with its note (`MentionChip`).
 *
 * Accessibility: Not focusable; read as one image named by `label`, or by every person's name joined ("Aiko, Ren and Mio"),
 * including those past `max`. The faces and the "+N" are hidden behind that name.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function CastStack(props: CastStackProps) {
  const tx = useWords();
  const people = props.people || [], max = props.max || 4, size = props.size || 24;
  const shown = people.slice(0, max), rest = people.length - shown.length;
  const names = people.map((p) => p.name);
  const label = props.label || tx.list(names);
  const dim = { width: size, height: size, fontSize: Math.round(size * .42) };
  return (
    <span className={cx('sk-caststack', props.className)} role="img" aria-label={label}>
      {shown.map((p, i) => (
        <span key={i} className="sk-caststack__face" style={dim}>{p.image ? <img src={p.image} alt="" /> : (p.initial || String(p.name || '').charAt(0))}</span>
      ))}
      {rest > 0 && <span className="sk-caststack__face sk-caststack__more" style={dim}>{'+' + rest}</span>}
    </span>
  );
}
