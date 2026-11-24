import { Fragment, useRef, type CSSProperties, type MouseEventHandler } from 'react';
import { Button, Icon, IconButton, Progress, type IconName } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { FragmentBalance } from '../FragmentBalance/FragmentBalance';
import { useFocusScope } from '../../internal/focus';
import { GoLink } from '../../internal/link';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './ActivityPanel.css';

export interface ActivityJob {
  /** The job's name: what is being made ("Tattoo", "Kiko's winter look"). */
  title: string;
  /** What it is ("Tattoo · new character") and where it stands ("Designing the look · stage 2 of 3"). */
  text?: string;
  /** The job's picture, once it has one: a character's face, a look's portrait. */
  image?: string;
  /** Drawn in place of a picture until there is one: the age figure of a character not drawn yet, as its cast card shows; for a take or a place, its kind (`image` for a still or a clip, `backdrops` for a view). */
  figure?: IconName;
  /** A take's or a place's picture: a 16:9 frame showing the whole picture, never a face's round crop. */
  shape?: 'frame';
  /** The fragments it holds while it runs ("12"), under its time with the fragment mark, its caption in the job's muted words as the time is. */
  held?: string;
  /** The last fallback, when there is neither a picture nor a figure. */
  initial?: string;
  /** How far a running job has come, 0 to 100, drawn as a bar under its words. */
  progress?: number;
  /** A running job's bar and its time so far. */
  time?: string;
  /** Where the job's screen is: a creation opens on its step, a look on its flow. Its face and words become one link. */
  href?: string;
  /** Where the job's screen is: a creation opens on its step, a look on its flow. */
  onClick?: MouseEventHandler<HTMLElement>;
  /** A button for what it waits on (Review, Retry, Resume): its own control beside the link, and the row's end. */
  action?: { label: string; primary?: boolean; onClick?: MouseEventHandler };
}

export interface ActivityPanelProps {
  /** Each group a short heading, then its jobs. */
  groups: { title: string; jobs: ActivityJob[] }[];
  /** With it, the panel takes focus while shown; Escape and Close run it. */
  onClose?: () => void;
  /** Extra class on the root element. */
  className?: string;
  /** Inline style on the root element. */
  style?: CSSProperties;
}

function row(j: ActivityJob, i: number, held: string) {
  const frame = j.shape === 'frame' && 'sk-job__av--frame';
  const who = j.image ? <img className={cx('sk-job__av', frame)} src={j.image} alt="" />
    : j.figure ? <span className={cx('sk-job__av', 'sk-job__av--figure', frame)} aria-hidden="true"><Icon name={j.figure} size="var(--activity-job-figure-size)" /></span>
    : <span className={cx('sk-job__av', frame)} aria-hidden="true">{j.initial || '?'}</span>;
  const words = <span className="sk-job__text"><b>{j.title}</b><span>{j.text}</span>{j.progress !== undefined && <Progress className="sk-job__bar" value={j.progress} label={j.title} />}</span>;
  const opens = !!(j.href || j.onClick);
  const act = j.action ? <Button variant={j.action.primary ? 'primary' : 'secondary'} size="sm" onClick={j.action.onClick}>{j.action.label}</Button> : null;
  const time = j.time || j.held ? <span className="sk-job__time">{j.time}{j.held && <FragmentBalance variant="inline" amount={j.held} caption={held} />}</span> : null;
  /* A job that goes somewhere says so with a chevron, unless its action is the row's end */
  const chev = opens && !act ? <Icon name="chevron-down" size="var(--activity-job-chevron-size)" className="sk-job__chev" /> : null;
  const end = (act || time || chev) && <span className="sk-job__end">{act || time}{chev}</span>;
  if (!opens) return <div key={i} className="sk-job">{who}{words}{end}</div>;
  return <div key={i} className="sk-job sk-job--link"><GoLink href={j.href} onClick={j.onClick} className="sk-job__main">{who}{words}</GoLink>{end}</div>;
}

/* With onClose it holds focus while shown: focus starts on the first job's action, Tab stays inside, Escape and Close run onClose */
/**
 * The work in flight and the work waiting on you, in groups: running, needs you, earlier. It opens from `ActivityRow`, over the
 * page on desktop and in place under the row on a phone.
 *
 * Not for the row that opens it (`ActivityRow`); one job's stages in order (`Stages`); a message that comes and goes (`Toast`).
 *
 * Accessibility: A dialog named "Activity". With `onClose`, focus moves to the first job's link or button, Tab and Shift+Tab
 * stay inside, and Escape or Close runs it. A job that opens its screen is a link (a button with `onClick` alone) named by its
 * title and text; its action is a separate button after it, its bar is a named progress bar, and its `held` reads after its
 * time ("12 fragments held"). The picture and figure are
 * hidden, and the chevron is too.
 *
 * @version 1.3
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function ActivityPanel({ groups, onClose, className, style }: ActivityPanelProps) {
  const tx = useWords(ownWords);
  const box = useRef<HTMLDivElement>(null);
  const keys = useFocusScope(box, { open: !!onClose, onClose, trap: true, first: (b) => b.querySelector<HTMLElement>('.sk-job button:not([disabled]), .sk-job a[href]') });
  return (
    <div ref={box} className={cx('sk-activity', className)} role="dialog" aria-label={tx('activity')} style={style} onKeyDown={keys}>
      <div className="sk-activity__head"><b>{tx('activity')}</b><IconButton variant="plain" icon="close" label={tx('closeActivity')} onClick={onClose} /></div>
      {(groups || []).map((g, gi) => <Fragment key={gi}><p className="sk-activity__group">{g.title}</p>{(g.jobs || []).map((j, i) => row(j, i, tx('jobHeld')))}</Fragment>)}
    </div>
  );
}
