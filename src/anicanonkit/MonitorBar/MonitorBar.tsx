import type { ReactNode } from 'react';
import { slots } from '../../internal/slots';
import '../../base.css';
import '../../ui/IconButton/IconButton.css';
import '../EditorShell/EditorShell.css';
import './MonitorBar.css';

export interface MonitorBarProps {
  /** Where the playhead is, after the transport. */
  timecode?: string;
  /** Slots: transport, end. Children are the edit buttons. */
  children?: ReactNode;
}

/**
 * MonitorBar is the bar under the editor's picture: the transport, the timecode, the edit buttons and what sits at the end.
 *
 * Not for a bar of tools that floats over the canvas (`FloatingToolbar`); the status line at the bottom of a view
 * (`StatusBar`).
 *
 * Accessibility: A row with no role of its own: its buttons are in order (transport, edit buttons, end), the timecode is read
 * as text and the separator is hidden.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function MonitorBar({ timecode, children }: MonitorBarProps) {
  const sl = slots(children);
  return (
    <div className="sk-monitorbar">
      {sl.get('transport')}
      {timecode && <span className="sk-monitorbar__tc">{timecode}</span>}
      <span className="sk-monitorbar__sep" aria-hidden="true" />
      {sl.body}
      <span className="sk-editor__fill" />
      {sl.get('end')}
    </div>
  );
}
