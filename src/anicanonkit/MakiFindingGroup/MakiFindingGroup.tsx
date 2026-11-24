import type { ReactNode } from 'react';
import '../../base.css';
import './MakiFindingGroup.css';

export interface MakiFindingGroupProps {
  /** What the group holds ("Conflicts"). */
  label: string;
  /** How many, after a middle dot ("Conflicts · 2"). */
  count?: number | string;
  /** A quiet line under the label ("Each reopens by itself…"). */
  note?: string;
  /** Its MakiFindings. */
  children: ReactNode;
}

/* A group of what Review found, inside Maki's reply: its words ("Conflicts · 2") and its findings. */
/**
 * MakiFindingGroup is one group of what Review found, inside Maki's reply: its label and count ("Conflicts · 2"), an optional quiet
 * note, then its MakiFindings. Groups follow in order: Conflicts, Warnings, Kept on purpose.
 *
 * Not for a section of a side area (`PanelSection`); a section of a page (`SectionHeader`).
 *
 * Accessibility: Its findings are a list named by its label.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function MakiFindingGroup({ label, count, note, children }: MakiFindingGroupProps) {
  return (
    <div className="sk-mk-group">
      <p className="sk-mk-group__label">{label}{count !== undefined && <span>{' · ' + count}</span>}</p>
      {note && <p className="sk-mk-group__note">{note}</p>}
      <div role="list" aria-label={label}>{children}</div>
    </div>
  );
}
