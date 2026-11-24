import type { MouseEventHandler } from 'react';
import { Button } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import '../../ui/MoreWrap/MoreWrap.css';
import '../../ui/MediaCard/MediaCard.css';
import './PremiereSlot.css';

export interface PremiereSlotProps {
  /** When it premieres, as day and 24-hour time ("Premieres Friday · 21:00"). */
  when: string;
  /** What is coming ("Episode 4"). */
  title: string;
  /** Artwork for the frame; without it the frame shows the time. */
  image?: string;
  /** A line under the title. */
  subtitle?: string;
  /** The smaller slot, in sidebars and on a phone. */
  compact?: boolean;
  /** null hides Remind me. */
  onRemind?: MouseEventHandler | null;
  /** Names Remind me for screen readers; by default built from `title` ("Remind me when Episode 4 premieres"). */
  remindLabel?: string;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * PremiereSlot holds the place of something that is announced but not out yet: the next episode, the next manga issue.
 *
 * Not for an episode, short or issue that is out (`MediaCard`); a frame of a production that is not made yet (`Thumb`); a place
 * where there is nothing to show yet (`EmptyState`).
 *
 * Accessibility: When, title and subtitle read as text and the picture is hidden. Tab reaches the Remind me button, announced
 * by `remindLabel` or one built from `title` ("Remind me when Episode 4 premieres"), and Enter or Space runs `onRemind`.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function PremiereSlot({ when, title, image, subtitle, compact, onRemind, remindLabel, className }: PremiereSlotProps) {
  const tx = useWords(ownWords);
  return (
    <div className={cx('sk-prem', className)}>
      {image
        ? <div className="sk-prem__frame sk-prem__frame--img" style={compact ? { width: 104 } : undefined}><img src={image} alt="" /></div>
        : compact ? null : <div className="sk-prem__frame"><span className="sk-prem__when">{when}</span></div>}
      <div className="sk-prem__body">
        {(compact || image) && <span className="sk-prem__when">{when}</span>}
        <span className="sk-prem__title">{title}</span>
        {subtitle && <span className="sk-prem__sub">{subtitle}</span>}
      </div>
      {onRemind !== null && <Button variant="outline" shape="pill" icon={compact ? 'bell' : undefined} aria-label={remindLabel || tx('remindMeWhen', { title })} onClick={onRemind}>{tx('remindMe')}</Button>}
    </div>
  );
}
