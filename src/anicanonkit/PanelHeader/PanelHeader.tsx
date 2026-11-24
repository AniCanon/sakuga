import type { MouseEventHandler, ReactNode } from 'react';
import { IconButton } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { slots } from '../../internal/slots';
import { useWords } from '../../internal/words';
import '../../base.css';
import './PanelHeader.css';

/** Every side panel's and inspector's head. Slots: slot="actions" (icon buttons before close; an inspector's delete), slot="media". */
export interface PanelHeaderProps {
  /** A small line naming what the panel shows ("Event · Arc 2"). */
  eyebrow?: string;
  /** What the panel is about, as a heading. */
  title: string;
  /** Where it stands ("Ep 3 · p.14"). */
  subtitle?: string;
  /** Draws Close; `false` on the world panel and an inspector. */
  close?: boolean;
  /** Names Close (default "Close"). */
  closeLabel?: string;
  /** Runs on Close. */
  onClose?: MouseEventHandler;
  /** The title's heading level. Default 2. */
  level?: number;
  /** The picture (as slot="media"). */
  media?: ReactNode;
  /** The actions (as slot="actions"). */
  actions?: ReactNode;
  /** The actions as slot="actions" and a picture as slot="media". */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * PanelHeader opens every side panel in Story with the same grammar: a small eyebrow naming what the panel shows, the title, an
 * optional subtitle; icon actions (most common first, the rest in ⋯), then close.
 *
 * Not for the top of a production view (`ViewHeader`); opening a shelf or labelling a strip (`SectionHeader`); a labelled group
 * of rows with its count (`PanelSection`); a Studio card with its controls (`Panel`); the editor's top bar with its timecode
 * (`EditorHeader`).
 *
 * Accessibility: Read in order: the eyebrow, the title as a heading (level `level`, default 2) and the subtitle. Tab then
 * reaches the actions and a close button named by `closeLabel` (default "Close") that runs `onClose`.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function PanelHeader({ eyebrow, title, subtitle, close, closeLabel, onClose, level, media, actions, children, className }: PanelHeaderProps) {
  const tx = useWords();
  const sl = slots(children);
  const shut = close === false ? null : <IconButton variant="plain" icon="close" label={closeLabel || tx('close')} onClick={onClose} />;
  const pic = media || sl.get('media');
  return (
    <div className={cx('sk-phead', className)}>
      {pic && <span className="sk-phead__media">{pic}</span>}
      <div className="sk-phead__text">{eyebrow && <small>{eyebrow}</small>}<b role="heading" aria-level={level || 2}>{title}</b>{subtitle && <span>{subtitle}</span>}</div>
      {actions || sl.get('actions')}{shut}
    </div>
  );
}
