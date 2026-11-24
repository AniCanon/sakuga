import type { ReactNode } from 'react';
import { Icon } from '@anicanon/sakuga/ui';
import { slots } from '../../internal/slots';
import '../../base.css';
import '../../ui/IconButton/IconButton.css';
import '../EditorShell/EditorShell.css';

export interface EditorHeaderProps {
  /** The production's name. */
  title: string;
  /** Where the playhead is in the whole cut. */
  timecode?: string;
  /** e.g. "Rebuilds exactly" */
  status?: string;
  /** The status's longer note, on hover and focus. */
  statusHint?: string;
  /** The actions. */
  children?: ReactNode;
}

/**
 * EditorHeader is the editor's top bar: what is being edited, its timecode, whether it rebuilds exactly, and the editor's
 * actions.
 *
 * Not for a production view outside the editor (`ViewHeader`); a full-screen flow that makes one thing step by step
 * (`FlowHeader`).
 *
 * Accessibility: The title is a level-1 heading; the timecode and status are read as text, the status's check is hidden, and
 * the actions are their own buttons in order.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function EditorHeader({ title, timecode, status, statusHint, children }: EditorHeaderProps) {
  const sl = slots(children);
  return (
    <div className="sk-editor__head">
      <b role="heading" aria-level={1}>{title}</b>
      {timecode && <span className="sk-editor__tc">{timecode}</span>}
      {status && <span className="sk-editor__status" title={statusHint}><Icon name="check" size="var(--editor-status-icon-size)" />{status}</span>}
      <span className="sk-editor__fill" />
      {sl.body}
    </div>
  );
}
