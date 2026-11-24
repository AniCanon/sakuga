import type { MouseEventHandler } from 'react';
import { Icon } from '@anicanon/sakuga/ui';
import { useUid } from '../../internal/uid';
import { AniCanonLoader } from '../AniCanonLoader/AniCanonLoader';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import '../ActivityPanel/ActivityPanel.css';
import './ActivityRow.css';

export interface ActivityRowProps {
  /** How many jobs are running. */
  count: number;
  /** How many wait on you (a review, a retry), said after the running ones. */
  waiting?: number;
  /** What the latest job is doing ("Tattoo · designing the look"). */
  line?: string;
  /** Whether the activity panel it opens is open; turns the chevron. */
  expanded?: boolean;
  /** Opens and closes the activity panel. */
  onClick?: MouseEventHandler;
}

/**
 * ActivityRow is the sidebar's line for work that is running: the AniCanon loader, how many jobs are running, the latest one's
 * line, and a chevron that opens `ActivityPanel`.
 *
 * Not for one job's stages in order (`Stages`); how far one job has come where it is being made (`Progress`).
 *
 * Accessibility: A button announced as "Activity: N running" (with `waiting`, "Activity: N running, M waiting"), described by its `line`, and expanded or collapsed from
 * `expanded`; Enter or Space runs `onClick`. The loader and the chevron are hidden.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function ActivityRow({ count, waiting, line, expanded, onClick }: ActivityRowProps) {
  const tx = useWords(ownWords);
  const lineId = useUid('sk-activity') + '-line';
  const runs = count || 0, waits = waiting || 0;
  const said = waits
    ? runs ? tx('activityCounts', { running: tx('running', { count: runs }), waiting: tx('waitingCount', { count: waits }) }) : tx('activity') + ': ' + tx('waitingCount', { count: waits })
    : tx('activityRunning', { count: runs });
  return (
    <button type="button" className="sk-activity-row" aria-expanded={expanded ? 'true' : 'false'} aria-label={said} aria-describedby={line ? lineId : undefined} onClick={onClick}>
      {/* With nothing running and something waiting, a state dot stands where the loader turns */}
      {runs ? <AniCanonLoader size="var(--activity-row-loader-size)" label={tx('running', { count: runs })} /> : <span className="sk-activity-row__waits" aria-hidden="true" />}
      <span className="sk-activity-row__text">
        <b>{runs ? tx('running', { count: runs }) : tx('waitingCount', { count: waits })}{runs && waits ? <span className="sk-activity-row__waiting">{' · ' + tx('waitingCount', { count: waits })}</span> : null}</b>
        {line && <small id={lineId}>{line}</small>}
      </span>
      <Icon name="chevron-down" size="var(--activity-row-chevron-icon-size)" className="sk-activity-row__chev" />
    </button>
  );
}
